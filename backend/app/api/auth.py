from datetime import datetime, timezone
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.database import get_db
from app.models.entities import User
from app.schemas.schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRefreshRequest,
    TokenRefreshResponse,
)
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

    # Генерация токенов
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    # Декодируем срок действия для сохранения в БД
    payload = decode_token(refresh_token)
    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc).replace(tzinfo=None)

    # Сохраняем refresh_token в БД
    crud.save_refresh_token(db=db, user_id=user.id, token=refresh_token, expires_at=expires_at)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
def refresh_access_token(refresh_in: TokenRefreshRequest, db: Session = Depends(get_db)):
    """Обновление access token по действующему refresh token с валидацией отказов."""
    token_str = refresh_in.refresh_token

    # 1. Проверка структуры, подписи и срока годности токена
    try:
        payload = decode_token(token_str)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Срок действия refresh токена истёк. Пожалуйста, выполните повторный вход.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Некорректный refresh токен.",
        )

    # 2. Проверка назначения токена (должен быть именно refresh, а не access)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Переданный токен не является refresh токеном.",
        )

    # 3. Проверка статуса токена в базе данных (отозван или отсутствует)
    db_token = crud.get_refresh_token(db=db, token=token_str)
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh токен не найден в системе.",
        )

    if db_token.revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Данный refresh токен был отозван. Доступ запрещён.",
        )

    # 4. Проверка существования пользователя
    user_id = int(payload.get("sub"))
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден.",
        )

    # 5. Выпуск нового access токена
    new_access_token = create_access_token(subject=user.id)

    return TokenRefreshResponse(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
def get_current_authenticated_user(current_user: User = Depends(get_current_user)):
    """Получение профиля текущего авторизованного пользователя через access token."""
    return current_user