#!/usr/bin/env python3
"""
Payment flow E2E tests
Tests against the actual FastAPI payment endpoints (payments.py)
"""

import json

import pytest
from httpx import AsyncClient

from app.main import app

PRICE_JPY = 880


@pytest.fixture
async def client():
    from httpx import ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestCheckoutEndpoint:
    """POST /payments/checkout"""

    @pytest.mark.asyncio
    async def test_checkout_returns_url(self, client, mocker):
        mocker.patch("app.deps.get_current_user", return_value={"id": "user-1"})

        mock_supabase = mocker.MagicMock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value.data = {"id": "proj-1"}
        mocker.patch("app.deps.get_supabase", return_value=mock_supabase)

        mock_session = mocker.MagicMock()
        mock_session.id = "cs_test_123"
        mock_session.url = "https://checkout.stripe.com/pay/cs_test_123"
        mocker.patch("stripe.checkout.Session.create", return_value=mock_session)

        resp = await client.post(
            "/payments/checkout",
            json={"project_id": "proj-1"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "checkout_url" in data
        assert data["checkout_url"] == mock_session.url

    @pytest.mark.asyncio
    async def test_checkout_rejects_unknown_project(self, client, mocker):
        mocker.patch("app.deps.get_current_user", return_value={"id": "user-1"})

        mock_supabase = mocker.MagicMock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("not found")
        mocker.patch("app.deps.get_supabase", return_value=mock_supabase)

        resp = await client.post(
            "/payments/checkout",
            json={"project_id": "nonexistent"},
        )
        assert resp.status_code == 404


class TestWebhookEndpoint:
    """POST /payments/webhook"""

    def _build_webhook_event(self, session_id: str, amount: int, project_id: str) -> dict:
        return {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": session_id,
                    "amount_total": amount,
                    "metadata": {"project_id": project_id, "user_id": "user-1"},
                }
            },
        }

    @pytest.mark.asyncio
    async def test_webhook_amount_mismatch_rejected(self, client, mocker):
        mocker.patch(
            "stripe.Webhook.construct_event",
            side_effect=lambda payload, sig, secret: json.loads(payload),
        )
        mock_supabase = mocker.MagicMock()
        mocker.patch("app.deps.get_supabase", return_value=mock_supabase)

        event = self._build_webhook_event("cs_1", 999, "proj-1")
        resp = await client.post(
            "/payments/webhook",
            content=json.dumps(event),
            headers={"stripe-signature": "t=1,v1=fake"},
        )
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_webhook_idempotent_on_completed(self, client, mocker):
        mocker.patch(
            "stripe.Webhook.construct_event",
            side_effect=lambda payload, sig, secret: json.loads(payload),
        )
        mock_supabase = mocker.MagicMock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "pay-1", "status": "completed", "project_id": "proj-1"}
        ]
        mocker.patch("app.deps.get_supabase", return_value=mock_supabase)

        event = self._build_webhook_event("cs_1", PRICE_JPY, "proj-1")
        resp = await client.post(
            "/payments/webhook",
            content=json.dumps(event),
            headers={"stripe-signature": "t=1,v1=fake"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    @pytest.mark.asyncio
    async def test_webhook_invalid_signature_rejected(self, client, mocker):
        mocker.patch(
            "stripe.Webhook.construct_event",
            side_effect=Exception("Invalid signature"),
        )

        resp = await client.post(
            "/payments/webhook",
            content=b'{"type":"test"}',
            headers={"stripe-signature": "t=1,v1=bad"},
        )
        assert resp.status_code in (400, 500)
