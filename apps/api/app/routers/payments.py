import json
import logging
import uuid
from datetime import datetime, timezone

import redis
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client

from app.config import settings
from app.deps import get_supabase, get_current_user, get_redis
from app.schemas import CheckoutRequest

logger = logging.getLogger(__name__)

PRICE_JPY = 770

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/checkout")
async def create_checkout(
    request: CheckoutRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    project_id = request.project_id

    # プロジェクト存在確認（user_idをクエリ条件に含めて認可）
    try:
        supabase.table("projects").select("id").eq("id", project_id).eq("user_id", user["id"]).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")

    # Stripe Checkout Session作成（770円税込）
    try:
        session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price_data": {
                        "currency": "jpy",
                        "product_data": {
                            "name": "AI学習 1回",
                        },
                        "unit_amount": PRICE_JPY,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{settings.frontend_url}/dashboard/{project_id}?payment=success",
            cancel_url=f"{settings.frontend_url}/dashboard/{project_id}?payment=cancel",
            metadata={
                "project_id": project_id,
                "user_id": user["id"],
            },
        )
    except stripe.error.StripeError:
        logger.exception("Stripe checkout session creation failed")
        raise HTTPException(status_code=502, detail="Payment service error")

    # paymentsテーブルにpending状態で作成
    payment_id = str(uuid.uuid4())
    supabase.table("payments").insert({
        "id": payment_id,
        "project_id": project_id,
        "user_id": user["id"],
        "stripe_payment_id": session.id,
        "amount": PRICE_JPY,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, supabase: Client = Depends(get_supabase)):
    # Stripe Webhookの署名検証
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # checkout.session.completedイベント処理
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        stripe_payment_id = session["id"]

        # 金額検証
        amount_total = session.get("amount_total")
        if amount_total != PRICE_JPY:
            logger.error("Amount mismatch: expected %d, got %s", PRICE_JPY, amount_total)
            raise HTTPException(status_code=400, detail="Amount mismatch")

        # paymentsテーブルから該当レコード取得
        payments = supabase.table("payments").select("*").eq("stripe_payment_id", stripe_payment_id).execute()
        if not payments.data:
            return {"status": "ok"}

        payment = payments.data[0]

        # べき等性チェック：既にcompleted状態なら何もしない
        if payment["status"] == "completed":
            return {"status": "ok"}

        project_id = payment["project_id"]

        # training_job作成
        job_id = str(uuid.uuid4())
        supabase.table("training_jobs").insert({
            "id": job_id,
            "project_id": project_id,
            "status": "queued",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        # ジョブ投入: RunPod Serverless or Redis
        if settings.runpod_endpoint_id and settings.runpod_api_key:
            # RunPod Serverless API経由
            try:
                import httpx
                with httpx.Client() as client:
                    resp = client.post(
                        f"https://api.runpod.ai/v2/{settings.runpod_endpoint_id}/run",
                        headers={"Authorization": f"Bearer {settings.runpod_api_key}"},
                        json={"input": {"job_id": job_id, "project_id": project_id}},
                        timeout=30.0,
                    )
                    resp.raise_for_status()
            except Exception:
                logger.exception("Failed to submit RunPod job %s", job_id)
                supabase.table("training_jobs").update(
                    {"status": "failed", "error_message": "RunPod API error"}
                ).eq("id", job_id).execute()
                raise HTTPException(status_code=502, detail="RunPod API error")
        else:
            # Redisキュー投入
            try:
                redis_client = get_redis()
                queue_data = json.dumps({"job_id": job_id, "project_id": project_id})
                redis_client.rpush(settings.redis_queue_name, queue_data)
            except redis.RedisError:
                logger.exception("Failed to enqueue training job %s", job_id)
                supabase.table("training_jobs").update(
                    {"status": "failed", "error_message": "Queue error"}
                ).eq("id", job_id).execute()
                raise HTTPException(status_code=502, detail="Queue service error")

        # paymentsステータス更新（ジョブ作成後）
        supabase.table("payments").update({
            "status": "completed",
            "job_id": job_id,
        }).eq("id", payment["id"]).execute()

    return {"status": "ok"}
