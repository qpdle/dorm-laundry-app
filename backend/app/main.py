from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, get_db
from app.models.entities import User, LaundryMachine, Booking

# Импорт маршрутов
from app.api.users import router as users_router
from app.api.machines import router as machines_router
from app.api.bookings import router as bookings_router

# Создаём таблицы в базе данных (если ещё не созданы)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API для сервиса бронирования прачечной в общежитии",
    version="1.0.0"
)

# Подключение роутеров API с префиксом /api
app.include_router(users_router, prefix="/api")
app.include_router(machines_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    return {"message": "Добро пожаловать в API DormLaundry!"}


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "DormLaundry backend is running"}


@app.get("/api/db-check", tags=["Health"])
def db_check(db: Session = Depends(get_db)):
    """Проверка подключения к PostgreSQL."""
    try:
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