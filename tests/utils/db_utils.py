#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Database utilities for E2E testing
Handles test data management and cleanup operations
"""

import os
import uuid
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('apps/api/.env')

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database operations manager for testing"""

    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        self.client: Optional[Client] = None
        self.test_prefix = "test_"

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

    async def initialize(self):
        """Initialize Supabase client"""
        try:
            self.client = create_client(self.supabase_url, self.supabase_key)
            logger.info("Database manager initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database client: {e}")
            raise

    async def cleanup(self):
        """Final cleanup"""
        await self.cleanup_test_data()
        logger.info("Database manager cleanup completed")

    async def cleanup_test_data(self):
        """Clean up all test data from database"""
        if not self.client:
            logger.warning("Database client not initialized")
            return

        try:
            # Define cleanup order (respecting foreign key constraints)
            cleanup_tables = [
                "training_jobs",     # References projects
                "lora_artifacts",    # References projects
                "data_sources",      # References projects
                "payments",          # References projects
                "projects",          # Main table
            ]

            for table in cleanup_tables:
                await self._cleanup_table(table)

            logger.info("Test data cleanup completed")

        except Exception as e:
            logger.error(f"Failed to cleanup test data: {e}")
            raise

    async def _cleanup_table(self, table_name: str):
        """Clean up test data from specific table"""
        try:
            # Delete records that start with test prefix or are created in last hour (for tests)
            result = self.client.table(table_name).delete().or_(
                f"id.like.{self.test_prefix}%,"
                f"created_at.gte.{(datetime.utcnow() - timedelta(hours=1)).isoformat()}"
            ).execute()

            deleted_count = len(result.data) if result.data else 0
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} records from {table_name}")

        except Exception as e:
            # Some tables might not exist or have different schemas
            logger.debug(f"Could not cleanup {table_name}: {e}")

    async def create_test_user(self, email: str = None) -> Dict[str, Any]:
        """Create a test user in the database"""
        if not email:
            email = f"{self.test_prefix}{uuid.uuid4().hex[:8]}@example.com"

        try:
            # For testing, we'll create a user record directly
            # In production, this would go through Supabase Auth
            user_data = {
                "id": str(uuid.uuid4()),
                "email": email,
                "created_at": datetime.utcnow().isoformat(),
            }

            # Note: In real implementation, this would use Supabase Auth API
            # For testing, we might need to insert into auth.users table directly
            # or use the admin API

            logger.info(f"Created test user: {email}")
            return user_data

        except Exception as e:
            logger.error(f"Failed to create test user: {e}")
            raise

    async def create_test_project(self, user_id: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a test project"""
        try:
            project_id = str(uuid.uuid4())
            project = {
                "id": project_id,
                "user_id": user_id,
                "name": project_data.get("name", "Test Project"),
                "model_type": project_data.get("model_type", "qwen2.5-1.5b"),
                "genre": project_data.get("genre", "customer_support"),
                "description": project_data.get("description", "Test project"),
                "status": "created",
                "created_at": datetime.utcnow().isoformat(),
                "last_action_at": datetime.utcnow().isoformat(),
                "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat()
            }

            result = self.client.table("projects").insert(project).execute()

            if result.data:
                logger.info(f"Created test project: {project_id}")
                return result.data[0]
            else:
                raise RuntimeError("No data returned from project creation")

        except Exception as e:
            logger.error(f"Failed to create test project: {e}")
            raise

    async def create_test_data_source(self, project_id: str, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a test data source"""
        try:
            source_id = str(uuid.uuid4())
            source = {
                "id": source_id,
                "project_id": project_id,
                "type": source_data.get("type", "text"),
                "name": source_data.get("name", "Test Source"),
                "content": source_data.get("content", "Test content"),
                "char_count": len(source_data.get("content", "")),
                "created_at": datetime.utcnow().isoformat()
            }

            result = self.client.table("data_sources").insert(source).execute()

            if result.data:
                logger.info(f"Created test data source: {source_id}")
                return result.data[0]
            else:
                raise RuntimeError("No data returned from data source creation")

        except Exception as e:
            logger.error(f"Failed to create test data source: {e}")
            raise

    async def create_test_training_job(self, project_id: str, status: str = "queued") -> Dict[str, Any]:
        """Create a test training job"""
        try:
            job_id = str(uuid.uuid4())
            job = {
                "id": job_id,
                "project_id": project_id,
                "status": status,
                "created_at": datetime.utcnow().isoformat()
            }

            if status in ["running", "done", "failed"]:
                job["started_at"] = datetime.utcnow().isoformat()

            if status in ["done", "failed"]:
                job["finished_at"] = datetime.utcnow().isoformat()

            result = self.client.table("training_jobs").insert(job).execute()

            if result.data:
                logger.info(f"Created test training job: {job_id} with status: {status}")
                return result.data[0]
            else:
                raise RuntimeError("No data returned from training job creation")

        except Exception as e:
            logger.error(f"Failed to create test training job: {e}")
            raise

    async def create_test_payment(self, project_id: str, status: str = "pending") -> Dict[str, Any]:
        """Create a test payment record"""
        try:
            payment_id = str(uuid.uuid4())
            payment = {
                "id": payment_id,
                "project_id": project_id,
                "stripe_payment_intent_id": f"pi_test_{uuid.uuid4().hex[:16]}",
                "stripe_session_id": f"cs_test_{uuid.uuid4().hex[:16]}",
                "amount": 88000,  # 880円 in cents
                "currency": "jpy",
                "status": status,
                "created_at": datetime.utcnow().isoformat()
            }

            result = self.client.table("payments").insert(payment).execute()

            if result.data:
                logger.info(f"Created test payment: {payment_id} with status: {status}")
                return result.data[0]
            else:
                raise RuntimeError("No data returned from payment creation")

        except Exception as e:
            logger.error(f"Failed to create test payment: {e}")
            raise

    async def create_test_lora_artifact(self, project_id: str, version: int = 1) -> Dict[str, Any]:
        """Create a test LoRA artifact record"""
        try:
            artifact_id = str(uuid.uuid4())
            artifact = {
                "id": artifact_id,
                "project_id": project_id,
                "version": version,
                "storage_path": f"projects/{project_id}/job_{uuid.uuid4().hex[:8]}",
                "created_at": datetime.utcnow().isoformat()
            }

            result = self.client.table("lora_artifacts").insert(artifact).execute()

            if result.data:
                logger.info(f"Created test LoRA artifact: {artifact_id} version: {version}")
                return result.data[0]
            else:
                raise RuntimeError("No data returned from LoRA artifact creation")

        except Exception as e:
            logger.error(f"Failed to create test LoRA artifact: {e}")
            raise

    async def get_project_by_id(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project by ID"""
        try:
            result = self.client.table("projects").select("*").eq("id", project_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get project {project_id}: {e}")
            return None

    async def get_training_jobs_by_project(self, project_id: str) -> List[Dict[str, Any]]:
        """Get all training jobs for a project"""
        try:
            result = self.client.table("training_jobs").select("*").eq("project_id", project_id).order("created_at", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Failed to get training jobs for project {project_id}: {e}")
            return []

    async def get_data_sources_by_project(self, project_id: str) -> List[Dict[str, Any]]:
        """Get all data sources for a project"""
        try:
            result = self.client.table("data_sources").select("*").eq("project_id", project_id).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Failed to get data sources for project {project_id}: {e}")
            return []

    async def get_payment_by_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get payment record for a project"""
        try:
            result = self.client.table("payments").select("*").eq("project_id", project_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get payment for project {project_id}: {e}")
            return None

    async def update_project_status(self, project_id: str, status: str) -> bool:
        """Update project status"""
        try:
            result = self.client.table("projects").update({
                "status": status,
                "last_action_at": datetime.utcnow().isoformat()
            }).eq("id", project_id).execute()

            return bool(result.data)
        except Exception as e:
            logger.error(f"Failed to update project status: {e}")
            return False

    async def update_training_job_status(self, job_id: str, status: str, **kwargs) -> bool:
        """Update training job status"""
        try:
            update_data = {"status": status}

            if status == "running" and "started_at" not in kwargs:
                update_data["started_at"] = datetime.utcnow().isoformat()
            elif status in ["done", "failed"] and "finished_at" not in kwargs:
                update_data["finished_at"] = datetime.utcnow().isoformat()

            update_data.update(kwargs)

            result = self.client.table("training_jobs").update(update_data).eq("id", job_id).execute()
            return bool(result.data)
        except Exception as e:
            logger.error(f"Failed to update training job status: {e}")
            return False

    async def verify_database_state(self, project_id: str) -> Dict[str, Any]:
        """Verify the current database state for a project"""
        try:
            project = await self.get_project_by_id(project_id)
            training_jobs = await self.get_training_jobs_by_project(project_id)
            data_sources = await self.get_data_sources_by_project(project_id)
            payment = await self.get_payment_by_project(project_id)

            return {
                "project": project,
                "training_jobs": training_jobs,
                "data_sources": data_sources,
                "payment": payment,
                "total_char_count": sum(s.get("char_count", 0) for s in data_sources)
            }
        except Exception as e:
            logger.error(f"Failed to verify database state: {e}")
            return {}