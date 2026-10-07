import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "DormLaundry API"
    
    # Параметры подключения к PostgreSQL
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5433"
    DB_NAME: str = "dorm_laundry"
    
    # Опциональная переопределяемая строка подключения к БД
    DATABASE_URL: str | None = None

    # Настройки криптографии JWT токенов
    SECRET_KEY: str = "super_secret_dorm_laundry_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    
    # Сроки действия токенов в минутах
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15          # 15 минут для access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7             # 7 дней для refresh token

    @property
    def sync_database_url(self) -> str:
        """Возвращает готовую строку подключения к БД."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()