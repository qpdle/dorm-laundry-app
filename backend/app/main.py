from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import get_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API для сервиса бронирования прачечной в общежитии",
    version="1.0.0"
)


@app.get("/", tags=["Root"])
def root():
    return {"message": "Добро пожаловать в API DormLaundry!"}


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "DormLaundry backend is running"}


@app.get("/api/db-check", tags=["Health"])
def db_check(db: Session = Depends(get_db)):
    """Проверка доступности и корректности подключения к PostgreSQL."""
    try:
        # Выполняем проверочный запрос в СУБД
        result = db.execute(text("SELECT version();")).scalar()
        return {
            "status": "connected",
            "database": settings.DB_NAME,
            "postgres_version": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка подключения к базе данных: {str(e)}"
        )