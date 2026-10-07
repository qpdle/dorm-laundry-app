from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.entities import MachineStatus, User
from app.schemas.schemas import BookingCreate, BookingResponse, BookingUpdate
from app.services import crud

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/", response_model=List[BookingResponse])
def read_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Публичный просмотр всех активных слотов в расписании."""
    return crud.get_bookings(db, skip=skip, limit=limit)


@router.get("/my", response_model=List[BookingResponse])
def read_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Приватный эндпоинт: получение списка бронирований текущего авторизованного студента."""
    return crud.get_user_bookings(db=db, user_id=current_user.id)


@router.get("/{booking_id}", response_model=BookingResponse)
def read_booking(booking_id: int, db: Session = Depends(get_db)):
    """Публичный просмотр деталей конкретного бронирования."""
    booking = crud.get_booking(db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Бронирование с id={booking_id} не найдено"
        )
    return booking


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Приватный эндпоинт: создание бронирования слота для текущего авторизованного студента."""
    # 1. Проверяем существование машины
    machine = crud.get_machine(db, machine_id=booking_in.machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Машина с id={booking_in.machine_id} не найдена"
        )

    # 2. Проверяем статус оборудования (не на ремонте ли оно)
    if machine.status == MachineStatus.MAINTENANCE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Машина '{machine.name}' находится на техническом обслуживании и недоступна для бронирования"
        )

    # 3. Проверяем пересечение с существующими бронированиями
    overlap = crud.check_machine_overlap(
        db,
        machine_id=booking_in.machine_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time
    )
    if overlap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Выбранный интервал пересекается с существующим бронированием "
                f"(c {overlap.start_time.strftime('%H:%M')} по {overlap.end_time.strftime('%H:%M')})"
            )
        )

    # Создаём бронь строго от имени текущего авторизованного пользователя
    return crud.create_booking(db=db, booking_in=booking_in, user_id=current_user.id)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Приватный эндпоинт: отмена/удаление бронирования с проверкой прав доступа (только своей брони)."""
    booking = crud.get_booking(db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Бронирование с id={booking_id} не найдено"
        )

    # Разграничение прав: нельзя удалить чужую бронь
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Отказано в доступе: вы можете отменять только свои собственные бронирования"
        )

    crud.delete_booking(db, booking=booking)
    return None