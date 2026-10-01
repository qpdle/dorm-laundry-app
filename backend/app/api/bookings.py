from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import MachineStatus
from app.schemas.schemas import BookingCreate, BookingUpdate, BookingResponse
from app.services import crud

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking_endpoint(booking_in: BookingCreate, db: Session = Depends(get_db)):
    """Создать новое бронирование с полной бизнес-валидацией."""
    # 1. Проверяем существование пользователя
    user = crud.get_user(db=db, user_id=booking_in.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Невозможно создать бронь: пользователь с ID={booking_in.user_id} не найден"
        )

    # 2. Проверяем существование машины
    machine = crud.get_machine(db=db, machine_id=booking_in.machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Невозможно создать бронь: оборудование с ID={booking_in.machine_id} не найдено"
        )

    # 3. Проверяем статус машины (нельзя бронировать сломанную или на ТО)
    if machine.status == MachineStatus.MAINTENANCE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Машина '{machine.name}' находится на техническом обслуживании или в ремонте"
        )

    # 4. Проверяем конфликт времени (не занята ли машина кем-то другим в этот интервал)
    conflict = crud.check_machine_overlap(
        db=db,
        machine_id=booking_in.machine_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time
    )
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Выбранное время пересекается с существующим бронированием #{conflict.id} "
                f"({conflict.start_time.strftime('%H:%M')} - {conflict.end_time.strftime('%H:%M')})"
            )
        )

    return crud.create_booking(db=db, booking_in=booking_in)


@router.get("/", response_model=List[BookingResponse])
def get_bookings_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список всех бронирований."""
    if skip < 0 or limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Параметры пагинации некорректны: skip >= 0, limit > 0"
        )
    return crud.get_bookings(db=db, skip=skip, limit=limit)


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_endpoint(booking_id: int, db: Session = Depends(get_db)):
    """Получить бронирование по ID."""
    booking = crud.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Бронирование с ID={booking_id} не найдено"
        )
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_endpoint(booking_id: int, booking_in: BookingUpdate, db: Session = Depends(get_db)):
    """Обновить параметры бронирования с проверкой конфликта интервалов."""
    booking = crud.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Бронирование с ID={booking_id} не найдено"
        )

    new_start = booking_in.start_time or booking.start_time
    new_end = booking_in.end_time or booking.end_time

    # Если меняется время, проверяем, нет ли пересечений с другими бронированиями этой же машины
    if booking_in.start_time or booking_in.end_time:
        conflict = crud.check_machine_overlap(
            db=db,
            machine_id=booking.machine_id,
            start_time=new_start,
            end_time=new_end,
            exclude_booking_id=booking.id
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Новое время пересекается с бронированием #{conflict.id}"
            )

    return crud.update_booking(db=db, booking=booking, booking_in=booking_in)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking_endpoint(booking_id: int, db: Session = Depends(get_db)):
    """Отменить/удалить бронирование."""
    booking = crud.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Невозможно удалить: бронирование с ID={booking_id} не найдено"
        )
    crud.delete_booking(db=db, booking=booking)
    return None