from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.entities import User
from app.schemas.schemas import UserResponse, UserUpdate
from app.services import crud

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Публичный список студентов (для поиска соседей по блоку)."""
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """Публичный просмотр профиля студента по ID."""
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пользователь с id={user_id} не найден"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Приватный эндпоинт: редактирование профиля с проверкой прав доступа (только своего)."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Отказано в доступе: вы не можете редактировать профиль другого пользователя"
        )

    # Проверка уникальности telegram_id при изменении
    if user_in.telegram_id and user_in.telegram_id != current_user.telegram_id:
        existing = crud.get_user_by_telegram(db, telegram_id=user_in.telegram_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Логин {user_in.telegram_id} уже занят"
            )

    return crud.update_user(db=db, user=current_user, user_in=user_in)