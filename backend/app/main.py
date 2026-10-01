from fastapi import FastAPI
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API для сервиса бронирования прачечной в общежитии",
    version="1.0.0"
)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "DormLaundry backend is running"}