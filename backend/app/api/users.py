from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import UserCreate, UserUpdate, UserResponse
from app.services import crud

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    """Создать нового пользователя."""
    return crud.create_user(db=db, user_in=user_in)


@router.get("/", response_model=List[UserResponse])
def get_users_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список пользователей."""
    return crud.get_users(db=db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    """Получить пользователя по ID."""
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пользователь с id {user_id} не найден"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user_endpoint(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    """Обновить данные пользователя."""
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пользователь с id {user_id} не найден"
        )
    return crud.update_user(db=db, user=user, user_in=user_in)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    """Удалить пользователя."""
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пользователь с id {user_id} не найден"
        )
    crud.delete_user(db=db, user=user)
    return None