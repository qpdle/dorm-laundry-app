from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.entities import User, LaundryMachine, Booking, MachineStatus, BookingStatus
from app.schemas.schemas import (
    UserCreate, UserUpdate,
    MachineCreate, MachineUpdate,
    BookingCreate, BookingUpdate
)


# CRUD ДЛЯ ПОЛЬЗОВАТЕЛЕЙ (USER)

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_telegram(db: Session, telegram_id: str) -> Optional[User]:
    """Поиск пользователя по telegram_id для проверки уникальности."""
    if not telegram_id:
        return None
    return db.query(User).filter(User.telegram_id == telegram_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(
        full_name=user_in.full_name,
        room_number=user_in.room_number,
        telegram_id=user_in.telegram_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()


# CRUD ДЛЯ ОБОРУДОВАНИЯ (LAUNDRY MACHINE)

def get_machine(db: Session, machine_id: int) -> Optional[LaundryMachine]:
    return db.query(LaundryMachine).filter(LaundryMachine.id == machine_id).first()


def get_machines(db: Session, skip: int = 0, limit: int = 100) -> List[LaundryMachine]:
    return db.query(LaundryMachine).offset(skip).limit(limit).all()


def create_machine(db: Session, machine_in: MachineCreate) -> LaundryMachine:
    machine = LaundryMachine(
        name=machine_in.name,
        machine_type=machine_in.machine_type,
        floor=machine_in.floor,
        status=machine_in.status
    )
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


def update_machine(db: Session, machine: LaundryMachine, machine_in: MachineUpdate) -> LaundryMachine:
    update_data = machine_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(machine, field, value)
    db.commit()
    db.refresh(machine)
    return machine


def delete_machine(db: Session, machine: LaundryMachine) -> None:
    db.delete(machine)
    db.commit()


# CRUD ДЛЯ БРОНИРОВАНИЙ (BOOKING)

def get_booking(db: Session, booking_id: int) -> Optional[Booking]:
    return db.query(Booking).filter(Booking.id == booking_id).first()


def get_bookings(db: Session, skip: int = 0, limit: int = 100) -> List[Booking]:
    return db.query(Booking).offset(skip).limit(limit).all()


def check_machine_overlap(
    db: Session,
    machine_id: int,
    start_time: datetime,
    end_time: datetime,
    exclude_booking_id: Optional[int] = None
) -> Optional[Booking]:
    """
    Проверяет, пересекается ли запрошенный слот со временем уже существующих активных бронирований.
    Два интервала [A, B] и [C, D] пересекаются, если A < D и B > C.
    """
    query = db.query(Booking).filter(
        Booking.machine_id == machine_id,
        Booking.status == BookingStatus.ACTIVE,
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first()


def create_booking(db: Session, booking_in: BookingCreate) -> Booking:
    booking = Booking(
        user_id=booking_in.user_id,
        machine_id=booking_in.machine_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        status=booking_in.status
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def update_booking(db: Session, booking: Booking, booking_in: BookingUpdate) -> Booking:
    update_data = booking_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)
    return booking


def delete_booking(db: Session, booking: Booking) -> None:
    db.delete(booking)
    db.commit()