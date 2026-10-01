from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DormLaundry API"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/dorm_laundry"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()