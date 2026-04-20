import logging
import uuid
from datetime import datetime, timezone

import httpx
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client

from app.config import settings
from app.deps import get_supabase, get_current_user
from app.schemas import CheckoutRequest

logger = logging.getLogger(__name__)

PRICE_JPY = 880

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/payments", tags=["payments"])


async def _submit_training_job(
    job_id: str, project_id: str, supabase: Client
) -> None:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                settings.modal_webhook_url,
                headers={"x-webhook-secret": settings.modal_webhook_secret},
                json={"job_id": job_id, "project_id": project_id},
                timeout=30.0,
            )
            resp.raise_for_status()
    except Exception:
        logger.exception("Failed to submit training job %s", job_id)
        supabase.table("training_jobs").update(
            {"status": "failed", "error_message": "Training service error"}
        ).eq("id", job_id).execute()
        raise HTTPException(status_code=502, detail="Training service error")


@router.post("/checkout")
async def create_checkout(
    request: CheckoutRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    project_id = request.project_id

    try:
        supabase.table("projects").select("id").eq("id", project_id).eq("user_id", user["id"]).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")

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
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        stripe_payment_id = session["id"]

        amount_total = session.get("amount_total")
        if amount_total != PRICE_JPY:
            raise HTTPException(status_code=400, detail="Amount mismatch")

        payments = supabase.table("payments").select("*").eq("stripe_payment_id", stripe_payment_id).execute()
        if not payments.data:
            return {"status": "ok"}

        payment = payments.data[0]

        if payment["status"] == "completed":
            return {"status": "ok"}

        # Atomic update: pending→completed (prevents race condition)
        update_result = (
            supabase.table("payments")
            .update({"status": "completed"})
            .eq("id", payment["id"])
            .eq("status", "pending")
            .execute()
        )
        if not update_result.data:
            return {"status": "ok"}

        project_id = payment["project_id"]

        # Mark project as training
        supabase.table("projects").update({"status": "training"}).eq("id", project_id).execute()

        job_id = str(uuid.uuid4())
        supabase.table("training_jobs").insert({
            "id": job_id,
            "project_id": project_id,
            "status": "queued",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        supabase.table("payments").update({"job_id": job_id}).eq("id", payment["id"]).execute()

        await _submit_training_job(job_id, project_id, supabase)

    return {"status": "ok"}
