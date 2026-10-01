from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# 1. Создание движка подключения (Engine) к PostgreSQL
engine = create_engine(
    settings.sync_database_url,
    echo=False,  # При необходимости логирования SQL-запросов можно выставить True
    pool_pre_ping=True  # Автоматическая проверка живучести соединений в пуле
)

# 2. Фабрика сессий для работы с транзакциями
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 3. Базовый декларативный класс для будущих ORM-моделей
Base = declarative_base()


# 4. Dependency (генератор сессий) для внедрения зависимостей в эндпоинты FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()