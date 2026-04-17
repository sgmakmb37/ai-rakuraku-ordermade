#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pytest configuration and shared fixtures for E2E testing
"""

import pytest
import pytest_asyncio
import asyncio
import os
from typing import AsyncGenerator, Generator
from dotenv import load_dotenv

# Load environment variables
load_dotenv('apps/api/.env')

from tests.utils.api_client import APITestClient
from tests.utils.db_utils import DatabaseManager
from tests.fixtures.test_data import TestDataGenerator

# Configure pytest markers
pytest_markers = [
    "e2e: marks tests as end-to-end tests",
    "integration: marks tests as integration tests",
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "training: marks tests as training pipeline tests",
    "payment: marks tests as payment flow tests",
    "error_handling: marks tests as error handling tests",
    "quality: marks tests as model quality tests",
    "frontend: marks tests as frontend E2E tests"
]

def pytest_configure(config):
    """Configure pytest with custom markers"""
    for marker in pytest_markers:
        config.addinivalue_line("markers", marker)

@pytest_asyncio.fixture(scope="session")
async def db_manager() -> AsyncGenerator[DatabaseManager, None]:
    """Database operations manager for all tests"""
    manager = DatabaseManager()
    await manager.initialize()
    yield manager
    await manager.cleanup()

@pytest_asyncio.fixture(scope="function")
async def clean_db(db_manager: DatabaseManager):
    """Clean database before and after each test"""
    await db_manager.cleanup_test_data()
    yield
    await db_manager.cleanup_test_data()

@pytest_asyncio.fixture(scope="function")
async def api_client(clean_db) -> AsyncGenerator[APITestClient, None]:
    """Authenticated API client for testing"""
    # Check if API server is running
    if not await check_api_server_health():
        pytest.skip("API server not running - start server with 'cd apps/api && uvicorn app.main:app --reload'")

    client = APITestClient()
    try:
        await client.initialize()
        yield client
    except Exception as e:
        pytest.skip(f"API client initialization failed: {e}")
    finally:
        try:
            await client.cleanup()
        except Exception:
            pass  # Cleanup failure is not critical for tests

@pytest_asyncio.fixture
async def test_user(api_client: APITestClient):
    """Create a test user for testing"""
    user_data = await api_client.create_test_user()
    yield user_data
    # Cleanup is handled by clean_db fixture

@pytest.fixture
def test_data_generator():
    """Test data generator instance"""
    return TestDataGenerator()

@pytest_asyncio.fixture
async def test_project(api_client: APITestClient, test_data_generator: TestDataGenerator):
    """Create a test project with sample data"""
    project_data = test_data_generator.customer_support_project()
    project = await api_client.create_project(project_data)
    yield project
    # Cleanup is handled by clean_db fixture

@pytest_asyncio.fixture
async def test_project_with_sources(api_client: APITestClient, test_data_generator: TestDataGenerator):
    """Create a test project with data sources"""
    project_data = test_data_generator.customer_support_project()
    project = await api_client.create_project(project_data)

    # Add test sources
    sources = test_data_generator.customer_support_data()
    for source_data in sources:
        await api_client.add_source(project["id"], source_data)

    yield project
    # Cleanup is handled by clean_db fixture

@pytest.fixture
def sample_files_dir():
    """Directory containing sample test files"""
    return os.path.join(os.path.dirname(__file__), "fixtures", "sample_files")

# Test environment configuration
@pytest.fixture(scope="session")
def test_config():
    """Test environment configuration"""
    return {
        "api_base_url": os.getenv("API_BASE_URL", "http://localhost:8000"),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "supabase_url": os.getenv("SUPABASE_URL"),
        "redis_url": os.getenv("REDIS_URL", "redis://localhost:6379"),
        "runpod_enabled": bool(os.getenv("RUNPOD_API_KEY") and os.getenv("RUNPOD_ENDPOINT_ID")),
        "stripe_enabled": bool(os.getenv("STRIPE_SECRET_KEY")),
        "gguf_export_enabled": os.getenv("ENABLE_GGUF_EXPORT", "0") == "1"
    }

# Skip conditions for optional features
def pytest_runtest_setup(item):
    """Skip tests based on environment availability"""
    markers = [mark.name for mark in item.iter_markers()]

    # Skip RunPod tests if not configured
    if "training" in markers and not os.getenv("RUNPOD_API_KEY"):
        pytest.skip("RunPod not configured - set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID")

    # Skip payment tests if Stripe not configured
    if "payment" in markers and not os.getenv("STRIPE_SECRET_KEY"):
        pytest.skip("Stripe not configured - set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET")

    # Skip quality tests if RunPod not configured
    if "quality" in markers and not os.getenv("RUNPOD_API_KEY"):
        pytest.skip("Quality tests require RunPod - set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID")

# API server health check
async def check_api_server_health():
    """Check if API server is running"""
    import httpx
    api_url = os.getenv("API_BASE_URL", "http://localhost:8000")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{api_url}/health")
            return response.status_code == 200
    except Exception:
        return False

# Test reporting configuration
def pytest_html_report_title(report):
    """Set HTML report title"""
    report.title = "AIらくらくオーダーメイド E2Eテストレポート"

def pytest_runtest_makereport(item, call):
    """Add execution time to test reports"""
    if call.when == "call":
        if hasattr(item, "user_properties"):
            item.user_properties.append(("execution_time", f"{call.duration:.2f}s"))

# Custom fixtures for specific test scenarios
@pytest_asyncio.fixture
async def mock_stripe_payment():
    """Mock Stripe payment for testing without actual charges"""
    # This would be implemented with test data
    return {
        "payment_intent_id": "pi_test_123456789",
        "session_id": "cs_test_123456789",
        "amount": 88000,  # 880円 in cents
        "currency": "jpy",
        "status": "succeeded"
    }

@pytest_asyncio.fixture
async def mock_runpod_response():
    """Mock RunPod response for testing without GPU usage"""
    return {
        "id": "test-job-123456789",
        "status": "COMPLETED",
        "output": {
            "job_id": "test-job-123456789",
            "status": "success",
            "storage_path": "projects/test-project/test-job/adapter_model.safetensors"
        }
    }