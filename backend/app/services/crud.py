from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.entities import User, LaundryMachine, Booking, RefreshToken, MachineStatus, BookingStatus
from app.schemas.schemas import (
    UserCreate, UserUpdate, UserRegister,
    MachineCreate, MachineUpdate,
    BookingCreate, BookingUpdate
)


# Операции для пользователей (User)

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Получение пользователя по его первичному ключу ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_telegram(db: Session, telegram_id: str) -> Optional[User]:
    """Поиск пользователя по telegram_id для проверки уникальности."""
    if not telegram_id:
        return None
    return db.query(User).filter(User.telegram_id == telegram_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Получение списка пользователей с пагинацией."""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate) -> User:
    """Создание пользователя с дефолтным хешем (для обратной совместимости)."""
    default_hashed_pwd = get_password_hash("default_password_123")
    user = User(
        full_name=user_in.full_name,
        room_number=user_in.room_number,
        telegram_id=user_in.telegram_id,
        hashed_password=default_hashed_pwd,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_registered_user(db: Session, user_in: UserRegister) -> User:
    """Создание пользователя с криптографическим хешированием пароля."""
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        full_name=user_in.full_name,
        room_number=user_in.room_number,
        telegram_id=user_in.telegram_id,
        hashed_password=hashed_pwd,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, telegram_id: str, password: str) -> Optional[User]:
    """Проверка существования пользователя и совпадения хеша пароля."""
    user = get_user_by_telegram(db=db, telegram_id=telegram_id)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    """Обновление данных профиля пользователя."""
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    """Удаление пользователя из БД."""
    db.delete(user)
    db.commit()


# Операции для Refresh токенов (RefreshToken)

def save_refresh_token(db: Session, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
    """Сохранение выданного refresh токена в базу данных."""
    db_token = RefreshToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at,
        revoked=False
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    """Поиск refresh токена в базе данных."""
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()


def revoke_refresh_token(db: Session, token: str) -> bool:
    """Отзыв refresh токена."""
    db_token = get_refresh_token(db, token=token)
    if db_token:
        db_token.revoked = True
        db.commit()
        return True
    return False


# Операции для оборудования (Laundry Machine)

def get_machine(db: Session, machine_id: int) -> Optional[LaundryMachine]:
    """Получение оборудования по ID."""
    return db.query(LaundryMachine).filter(LaundryMachine.id == machine_id).first()


def get_machines(db: Session, skip: int = 0, limit: int = 100) -> List[LaundryMachine]:
    """Получение списка оборудования."""
    return db.query(LaundryMachine).offset(skip).limit(limit).all()


def create_machine(db: Session, machine_in: MachineCreate) -> LaundryMachine:
    """Добавление новой стиральной или сушильной машины."""
    machine = LaundryMachine(
        name=machine_in.name,
        machine_type=machine_in.machine_type,
        floor=machine_in.floor,
        status=machine_in.status,
    )
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


def update_machine(db: Session, machine: LaundryMachine, machine_in: MachineUpdate) -> LaundryMachine:
    """Обновление параметров машины."""
    update_data = machine_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(machine, field, value)
    db.commit()
    db.refresh(machine)
    return machine


def delete_machine(db: Session, machine: LaundryMachine) -> None:
    """Удаление машины из БД."""
    db.delete(machine)
    db.commit()


# Операции для бронирований (Booking)

def get_booking(db: Session, booking_id: int) -> Optional[Booking]:
    """Получение бронирования по ID."""
    return db.query(Booking).filter(Booking.id == booking_id).first()


def get_bookings(db: Session, skip: int = 0, limit: int = 100) -> List[Booking]:
    """Получение списка бронирований."""
    return db.query(Booking).offset(skip).limit(limit).all()


def check_machine_overlap(
    db: Session,
    machine_id: int,
    start_time: datetime,
    end_time: datetime,
    exclude_booking_id: Optional[int] = None,
) -> Optional[Booking]:
    """Проверка пересечения запрашиваемого интервала с существующими активными бронями."""
    query = db.query(Booking).filter(
        Booking.machine_id == machine_id,
        Booking.status == BookingStatus.ACTIVE,
        Booking.start_time < end_time,
        Booking.end_time > start_time,
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first()


def create_booking(db: Session, booking_in: BookingCreate) -> Booking:
    """Создание бронирования слота."""
    booking = Booking(
        user_id=booking_in.user_id,
        machine_id=booking_in.machine_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        status=booking_in.status,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def update_booking(db: Session, booking: Booking, booking_in: BookingUpdate) -> Booking:
    """Обновление параметров бронирования."""
    update_data = booking_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)
    return booking


def delete_booking(db: Session, booking: Booking) -> None:
    """Удаление бронирования из БД."""
    db.delete(booking)
    db.commit()