import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.database import Base


# Тип оборудования: стиральная машина или сушилка
class MachineType(str, enum.Enum):
    WASHER = "washer"  # Стиральная машина
    DRYER = "dryer"    # Сушильная машина


# Статус оборудования
class MachineStatus(str, enum.Enum):
    AVAILABLE = "available"      # Доступна
    IN_USE = "in_use"            # Занята
    MAINTENANCE = "maintenance"  # На обслуживании / ремонт


# Статус бронирования
class BookingStatus(str, enum.Enum):
    ACTIVE = "active"        # Активна
    COMPLETED = "completed"  # Завершена
    CANCELLED = "cancelled"  # Отменена


class User(Base):
    """Модель пользователя (студента)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    room_number = Column(String(20), nullable=False)
    telegram_id = Column(String(50), unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Связь один-ко-многим с бронированиями
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")


class LaundryMachine(Base):
    """Модель единицы оборудования (стиральная машина или сушилка)."""
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)                    # Например, «Стиралка №1» или «Сушилка №2»
    machine_type = Column(SQLEnum(MachineType), default=MachineType.WASHER, nullable=False)
    floor = Column(Integer, nullable=False, default=1)           # Этаж
    status = Column(SQLEnum(MachineStatus), default=MachineStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

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
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Внешние связи
    user = relationship("User", back_populates="bookings")
    machine = relationship("LaundryMachine", back_populates="bookings")