import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.database import Base


# Функция получения текущего времени UTC без предупреждений об устаревании
def get_utc_now():
    return datetime.now(timezone.utc)


# Тип оборудования: стиральная машина или сушилка
class MachineType(str, enum.Enum):
    WASHER = "washer"
    DRYER = "dryer"


# Статус оборудования
class MachineStatus(str, enum.Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    MAINTENANCE = "maintenance"


# Статус бронирования
class BookingStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    """Модель пользователя (студента)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    room_number = Column(String(20), nullable=False)
    telegram_id = Column(String(50), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Связь один-ко-многим с бронированиями
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")


class LaundryMachine(Base):
    """Модель единицы оборудования (стиральная машина или сушилка)."""
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    machine_type = Column(SQLEnum(MachineType), default=MachineType.WASHER, nullable=False)
    floor = Column(Integer, nullable=False, default=1)
    status = Column(SQLEnum(MachineStatus), default=MachineStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Связь один-ко-многим с бронированиями
    bookings = relationship("Booking", back_populates="machine", cascade="all, delete-orphan")


class Booking(Base):
    """Модель бронирования времени стирки или сушки."""
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False)
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Внешние связи
    user = relationship("User", back_populates="bookings")
    machine = relationship("LaundryMachine", back_populates="bookings")