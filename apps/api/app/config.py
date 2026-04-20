from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    redis_url: str = ""
    stripe_secret_key: str
    stripe_webhook_secret: str
    frontend_url: str
    modal_webhook_url: str = ""
    modal_webhook_secret: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
