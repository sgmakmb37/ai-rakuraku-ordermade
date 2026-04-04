import stripe
import json
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client
import redis

from app.config import settings
from app.deps import get_supabase, get_current_user

logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/checkout")
async def create_checkout(
    project_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # プロジェクト存在確認
    project = supabase.table("projects").select("*").eq("id", project_id).single().execute()
    if not project.data or project.data["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Project not found")

    # Stripe Checkout Session作成（700円、mode="payment"）
    session = stripe.checkout.Session.create(
        line_items=[
            {
                "price_data": {
                    "currency": "jpy",
                    "product_data": {
                        "name": "AI学習 1回",
                    },
                    "unit_amount": 700,
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url=f"{settings.frontend_url}/projects/{project_id}/success",
        cancel_url=f"{settings.frontend_url}/projects/{project_id}/cancel",
        metadata={
            "project_id": project_id,
            "user_id": user["id"],
        },
    )

    # paymentsテーブルにpending状態で作成
    payment_id = str(uuid.uuid4())
    supabase.table("payments").insert({
        "id": payment_id,
        "project_id": project_id,
        "user_id": user["id"],
        "stripe_payment_id": session.id,
        "amount": 700,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
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
    except ValueError as e:
        logger.error("Invalid webhook payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error("Invalid webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # checkout.session.completedイベント処理
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        stripe_payment_id = session["id"]

        # paymentsテーブルから該当レコード取得
        payments = supabase.table("payments").select("*").eq("stripe_payment_id", stripe_payment_id).execute()
        if not payments.data:
            return {"status": "ok"}

        payment = payments.data[0]

        # べき等性チェック：既にcompleted状態なら何もしない
        if payment["status"] == "completed":
            return {"status": "ok"}

        project_id = payment["project_id"]
        user_id = payment["user_id"]

        # training_job作成
        job_id = str(uuid.uuid4())
        supabase.table("training_jobs").insert({
            "id": job_id,
            "project_id": project_id,
            "status": "queued",
            "created_at": datetime.utcnow().isoformat(),
        }).execute()

        # Redisキュー投入
        redis_client = redis.from_url(settings.redis_url)
        queue_data = json.dumps({"job_id": job_id, "project_id": project_id})
        redis_client.rpush("training_jobs", queue_data)

        # paymentsステータス更新（ジョブ作成後）
        supabase.table("payments").update({
            "status": "completed",
            "job_id": job_id,
        }).eq("id", payment["id"]).execute()

    return {"status": "ok"}
