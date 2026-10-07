from passlib.context import CryptContext

# Контекст для работы с алгоритмом хеширования паролей bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Генерация стойкого криптографического хеша из пароля."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Сверка пароля в открытом виде с сохранённым хешем из базы данных."""
    return pwd_context.verify(plain_password, hashed_password)