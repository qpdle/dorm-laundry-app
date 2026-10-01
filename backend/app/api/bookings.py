from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import BookingCreate, BookingUpdate, BookingResponse
from app.services import crud

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking_endpoint(booking_in: BookingCreate, db: Session = Depends(get_db)):
    """Создать новое бронирование."""
    # Проверяем, существует ли указанный пользователь
    user = crud.get_user(db=db, user_id=booking_in.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пользователь с id {booking_in.user_id} не существует"
        )

    # Проверяем, существует ли указанная машина
    machine = crud.get_machine(db=db, machine_id=booking_in.machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Оборудование с id {booking_in.machine_id} не существует"
        )

    return crud.create_booking(db=db, booking_in=booking_in)


@router.get("/", response_model=List[BookingResponse])
def get_bookings_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список всех бронирований."""
    return crud.get_bookings(db=db, skip=skip, limit=limit)


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_endpoint(booking_id: int, db: Session = Depends(get_db)):
    """Получить бронирование по ID."""
    booking = crud.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Бронирование с id {booking_id} не найдено"
        )
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_endpoint(booking_id: int, booking_in: BookingUpdate, db: Session = Depends(get_db)):
    """Обновить параметры или статус бронирования."""
    booking = crud.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Бронирование с id {booking_id} не найдено"
        )
    return crud.update_booking(db=db, booking=booking, booking_in=booking_in)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking_endpoint(booking_id: int, db: Session = Depends(get_db)):
    """Удалить бронирование."""
    booking = crud.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Бронирование с id {booking_id} не найдено"
        )
    crud.delete_booking(db=db, booking=booking)
    return None