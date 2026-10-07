from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.database import get_db
from app.schemas.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services import crud

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    """Регистрация нового пользователя со стойким bcrypt-хешированием пароля."""
    if not user_in.telegram_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Для регистрации необходимо указать Telegram аккаунт",
        )

    # Проверка уникальности telegram_id
    existing_user = crud.get_user_by_telegram(db=db, telegram_id=user_in.telegram_id)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Пользователь с логином '{user_in.telegram_id}' уже зарегистрирован",
        )

    return crud.create_registered_user(db=db, user_in=user_in)


@router.post("/login", response_model=TokenResponse)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    """Вход пользователя с выдачей двух токенов: access_token и refresh_token."""
    # Нормализуем логин (добавляем @, если пользователь не указал)
    login_id = login_in.telegram_id.strip()
    if not login_id.startswith("@"):
        login_id = f"@{login_id}"

    user = crud.authenticate_user(db=db, telegram_id=login_id, password=login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Генерируем два токена с заданными сроками жизни
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user,
    )