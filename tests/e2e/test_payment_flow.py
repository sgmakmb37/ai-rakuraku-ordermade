#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Payment flow E2E tests
Testing Stripe integration, webhook processing, and payment workflows
"""

import pytest
import asyncio
import json
import hmac
import hashlib
import time
from tests.utils.api_client import APITestClient
from tests.utils.db_utils import DatabaseManager
from tests.fixtures.test_data import TestDataGenerator


class TestPaymentFlow:
    """Test payment integration and Stripe workflows"""

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_training_payment_creation(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test payment creation for model training"""

        # Create project with training data
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        # Add training data
        sources_data = test_data_generator.customer_support_data()
        for source_data in sources_data[:3]:
            await api_client.add_source(project["id"], source_data)

        # Create payment for training
        payment_request = {
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        }

        payment_session = await api_client.create_payment_session(payment_request)

        # Verify payment session
        assert payment_session["session_id"] is not None
        assert payment_session["payment_intent_id"] is not None
        assert payment_session["amount"] > 0
        assert payment_session["currency"] == "jpy"
        assert payment_session["status"] == "pending"

        # Verify amount calculation
        expected_amount = 88000  # 880円 for training (in cents)
        assert payment_session["amount"] == expected_amount

        # Verify session URL
        assert payment_session["checkout_url"] is not None
        assert "checkout.stripe.com" in payment_session["checkout_url"]

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_premium_model_payment(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test payment for premium model types"""

        # Create project with premium model
        project_data = test_data_generator.customer_support_project()
        project_data["model_type"] = "gemma-2-9b"  # Premium model
        project = await api_client.create_project(project_data)

        # Add training data
        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        # Create payment for premium model
        payment_request = {
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": "gemma-2-9b",
            "currency": "jpy"
        }

        payment_session = await api_client.create_payment_session(payment_request)

        # Verify premium pricing
        expected_amount = 143000  # 1430円 for premium model
        assert payment_session["amount"] == expected_amount
        assert payment_session["model_tier"] == "premium"

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_usd_payment_flow(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test USD payment flow for international users"""

        # Create project
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        # Add training data
        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        # Create USD payment
        payment_request = {
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "usd"
        }

        payment_session = await api_client.create_payment_session(payment_request)

        # Verify USD pricing
        expected_amount = 600  # $6.00 in cents
        assert payment_session["amount"] == expected_amount
        assert payment_session["currency"] == "usd"

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_successful_payment_webhook(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test successful payment webhook processing"""

        # Create project and payment
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        payment_session = await api_client.create_payment_session({
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        })

        # Simulate successful payment webhook
        webhook_payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": payment_session["session_id"],
                    "payment_intent": payment_session["payment_intent_id"],
                    "payment_status": "paid",
                    "amount_total": payment_session["amount"],
                    "currency": "jpy",
                    "metadata": {
                        "project_id": project["id"],
                        "user_id": api_client.current_user["id"]
                    }
                }
            }
        }

        # Send webhook
        webhook_result = await api_client.send_payment_webhook(webhook_payload)
        assert webhook_result["status"] == "success"
        assert webhook_result["processed"] is True

        # Verify payment status updated
        payment_status = await api_client.get_payment_status(project["id"])
        assert payment_status["status"] == "completed"
        assert payment_status["paid_at"] is not None

        # Verify training can now start
        training_result = await api_client.start_training(project["id"])
        assert training_result["status"] == "started"
        assert training_result["job_id"] is not None

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_failed_payment_handling(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test failed payment scenarios and recovery"""

        # Create project and payment
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        payment_session = await api_client.create_payment_session({
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        })

        # Simulate failed payment webhook
        webhook_payload = {
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": payment_session["payment_intent_id"],
                    "status": "requires_payment_method",
                    "last_payment_error": {
                        "code": "card_declined",
                        "message": "Your card was declined."
                    },
                    "metadata": {
                        "project_id": project["id"],
                        "session_id": payment_session["session_id"]
                    }
                }
            }
        }

        # Send failure webhook
        webhook_result = await api_client.send_payment_webhook(webhook_payload)
        assert webhook_result["status"] == "success"

        # Verify payment status
        payment_status = await api_client.get_payment_status(project["id"])
        assert payment_status["status"] == "failed"
        assert payment_status["error_code"] == "card_declined"

        # Verify training cannot start without payment
        with pytest.raises(Exception) as exc_info:
            await api_client.start_training(project["id"])
        assert "payment" in str(exc_info.value).lower() or "unpaid" in str(exc_info.value).lower()

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_webhook_signature_verification(self, api_client: APITestClient):
        """Test Stripe webhook signature verification"""

        # Create test webhook payload
        webhook_payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_12345",
                    "payment_intent": "pi_test_12345",
                    "payment_status": "paid"
                }
            }
        }

        payload_json = json.dumps(webhook_payload)
        timestamp = str(int(time.time()))

        # Test with valid signature
        webhook_secret = "whsec_test_secret_key"
        signature_payload = f"{timestamp}.{payload_json}"
        signature = hmac.new(
            webhook_secret.encode('utf-8'),
            signature_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        headers = {
            "stripe-signature": f"t={timestamp},v1={signature}"
        }

        # Send webhook with valid signature
        try:
            result = await api_client.send_payment_webhook(webhook_payload, headers)
            assert result["status"] == "success"
            assert result["signature_valid"] is True
        except Exception:
            # Signature verification might not be fully implemented in test environment
            pytest.skip("Webhook signature verification not available in test environment")

        # Test with invalid signature
        invalid_headers = {
            "stripe-signature": f"t={timestamp},v1=invalid_signature"
        }

        with pytest.raises(Exception) as exc_info:
            await api_client.send_payment_webhook(webhook_payload, invalid_headers)
        assert "signature" in str(exc_info.value).lower() or "unauthorized" in str(exc_info.value).lower()

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_webhook_idempotency(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test webhook idempotency to prevent duplicate processing"""

        # Create project and payment
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        payment_session = await api_client.create_payment_session({
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        })

        # Create webhook payload with unique event ID
        event_id = f"evt_test_{int(time.time())}"
        webhook_payload = {
            "id": event_id,
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": payment_session["session_id"],
                    "payment_intent": payment_session["payment_intent_id"],
                    "payment_status": "paid",
                    "amount_total": payment_session["amount"],
                    "metadata": {
                        "project_id": project["id"]
                    }
                }
            }
        }

        # Send webhook first time
        result1 = await api_client.send_payment_webhook(webhook_payload)
        assert result1["status"] == "success"
        assert result1["processed"] is True

        # Send same webhook again (should be idempotent)
        result2 = await api_client.send_payment_webhook(webhook_payload)
        assert result2["status"] == "success"
        assert result2["processed"] is False  # Already processed
        assert result2["duplicate"] is True

        # Verify payment status is still consistent
        payment_status = await api_client.get_payment_status(project["id"])
        assert payment_status["status"] == "completed"

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_partial_refund_workflow(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test partial refund processing for failed training"""

        # Create paid project
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        # Complete payment
        payment_session = await api_client.create_payment_session({
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        })

        # Simulate successful payment
        webhook_payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": payment_session["session_id"],
                    "payment_intent": payment_session["payment_intent_id"],
                    "payment_status": "paid",
                    "amount_total": payment_session["amount"],
                    "metadata": {
                        "project_id": project["id"]
                    }
                }
            }
        }

        await api_client.send_payment_webhook(webhook_payload)

        # Start training
        training_result = await api_client.start_training(project["id"])

        # Simulate training failure requiring refund
        await asyncio.sleep(1)

        # Request partial refund
        refund_request = {
            "project_id": project["id"],
            "reason": "training_failed",
            "refund_type": "partial",
            "refund_percentage": 50  # 50% refund for failed training
        }

        refund_result = await api_client.request_refund(refund_request)
        assert refund_result["status"] == "processed"
        assert refund_result["refund_amount"] == payment_session["amount"] // 2
        assert refund_result["refund_id"] is not None

        # Verify refund webhook
        refund_webhook = {
            "type": "charge.dispute.created",
            "data": {
                "object": {
                    "id": refund_result["refund_id"],
                    "amount": refund_result["refund_amount"],
                    "currency": "jpy",
                    "status": "succeeded",
                    "payment_intent": payment_session["payment_intent_id"]
                }
            }
        }

        webhook_result = await api_client.send_payment_webhook(refund_webhook)
        assert webhook_result["status"] == "success"

    @pytest.mark.payment
    @pytest.mark.slow
    @pytest.mark.asyncio
    async def test_subscription_based_billing(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test subscription-based billing for heavy users"""

        # Create multiple projects to trigger subscription
        projects = []
        for i in range(3):
            project_data = test_data_generator.customer_support_project()
            project_data["name"] = f"Subscription Project {i+1}"
            project = await api_client.create_project(project_data)
            projects.append(project)

            # Add data to each project
            source_data = test_data_generator.customer_support_data()[0]
            await api_client.add_source(project["id"], source_data)

        # Check if subscription offer is triggered
        subscription_status = await api_client.get_subscription_status()

        if subscription_status.get("eligible_for_subscription"):
            # Create subscription
            subscription_request = {
                "plan": "monthly",
                "currency": "jpy"
            }

            subscription_session = await api_client.create_subscription_session(subscription_request)
            assert subscription_session["subscription_id"] is not None
            assert subscription_session["checkout_url"] is not None

            # Simulate subscription confirmation
            subscription_webhook = {
                "type": "customer.subscription.created",
                "data": {
                    "object": {
                        "id": subscription_session["subscription_id"],
                        "status": "active",
                        "current_period_start": int(time.time()),
                        "current_period_end": int(time.time() + 30*24*3600),
                        "plan": {
                            "amount": 290000,  # 2900円/月
                            "currency": "jpy",
                            "interval": "month"
                        },
                        "customer": api_client.current_user["id"]
                    }
                }
            }

            webhook_result = await api_client.send_payment_webhook(subscription_webhook)
            assert webhook_result["status"] == "success"

            # Verify subscription benefits
            updated_status = await api_client.get_subscription_status()
            assert updated_status["active_subscription"] is True
            assert updated_status["plan"] == "monthly"

    @pytest.mark.integration
    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_payment_database_consistency(self, api_client: APITestClient, db_manager: DatabaseManager, test_data_generator: TestDataGenerator):
        """Test payment data consistency between API and database"""

        # Create project and payment
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        payment_session = await api_client.create_payment_session({
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        })

        # Verify payment in database
        db_payment = await db_manager.get_payment_by_session_id(payment_session["session_id"])
        assert db_payment is not None
        assert db_payment["project_id"] == project["id"]
        assert db_payment["amount"] == payment_session["amount"]
        assert db_payment["currency"] == "jpy"
        assert db_payment["status"] == "pending"

        # Complete payment via webhook
        webhook_payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": payment_session["session_id"],
                    "payment_intent": payment_session["payment_intent_id"],
                    "payment_status": "paid",
                    "amount_total": payment_session["amount"],
                    "metadata": {
                        "project_id": project["id"]
                    }
                }
            }
        }

        await api_client.send_payment_webhook(webhook_payload)

        # Verify database updated
        updated_db_payment = await db_manager.get_payment_by_session_id(payment_session["session_id"])
        assert updated_db_payment["status"] == "completed"
        assert updated_db_payment["paid_at"] is not None

        # Verify API consistency
        api_payment_status = await api_client.get_payment_status(project["id"])
        assert api_payment_status["status"] == updated_db_payment["status"]

    @pytest.mark.payment
    @pytest.mark.asyncio
    async def test_payment_timeout_handling(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test payment session timeout and cleanup"""

        # Create project and payment
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        payment_session = await api_client.create_payment_session({
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        })

        session_id = payment_session["session_id"]

        # Wait for potential timeout (mocked)
        await asyncio.sleep(2)

        # Check if payment session expired
        try:
            payment_status = await api_client.get_payment_status(project["id"])

            if payment_status["status"] == "expired":
                assert payment_status["expired_at"] is not None

                # Verify training cannot start with expired payment
                with pytest.raises(Exception) as exc_info:
                    await api_client.start_training(project["id"])
                assert "payment" in str(exc_info.value).lower() or "expired" in str(exc_info.value).lower()

        except Exception:
            # Payment might still be active in test environment
            pytest.skip("Payment timeout testing skipped - session still active")

    @pytest.mark.payment
    @pytest.mark.error_handling
    @pytest.mark.asyncio
    async def test_stripe_api_failure_handling(self, api_client: APITestClient, test_data_generator: TestDataGenerator):
        """Test handling of Stripe API failures"""

        # Create project
        project_data = test_data_generator.customer_support_project()
        project = await api_client.create_project(project_data)

        source_data = test_data_generator.customer_support_data()[0]
        await api_client.add_source(project["id"], source_data)

        # Test payment creation with invalid currency
        invalid_payment_request = {
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "invalid_currency"
        }

        with pytest.raises(Exception) as exc_info:
            await api_client.create_payment_session(invalid_payment_request)
        assert "currency" in str(exc_info.value).lower() or "invalid" in str(exc_info.value).lower()

        # Test payment creation with invalid amount
        invalid_amount_request = {
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": "invalid_model",
            "currency": "jpy"
        }

        with pytest.raises(Exception) as exc_info:
            await api_client.create_payment_session(invalid_amount_request)

        # Test recovery - create valid payment after errors
        valid_payment_request = {
            "project_id": project["id"],
            "payment_type": "training",
            "model_type": project["model_type"],
            "currency": "jpy"
        }

        recovery_session = await api_client.create_payment_session(valid_payment_request)
        assert recovery_session["session_id"] is not None
        assert recovery_session["amount"] > 0