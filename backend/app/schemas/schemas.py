from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.entities import MachineType, MachineStatus, BookingStatus


# СХЕМЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ (USER)

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="ФИО студента")
    room_number: str = Field(..., min_length=1, max_length=20, description="Номер комнаты")
    telegram_id: Optional[str] = Field(None, max_length=50, description="Telegram никнейм/ID")


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    room_number: Optional[str] = Field(None, min_length=1, max_length=20)
    telegram_id: Optional[str] = Field(None, max_length=50)


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# СХЕМЫ ДЛЯ ОБОРУДОВАНИЯ (LAUNDRY MACHINE)

class MachineBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Название машины")
    machine_type: MachineType = Field(default=MachineType.WASHER, description="Тип: washer или dryer")
    floor: int = Field(default=1, ge=1, le=50, description="Этаж размещения")
    status: MachineStatus = Field(default=MachineStatus.AVAILABLE, description="Текущий статус")


class MachineCreate(MachineBase):
    pass


class MachineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    machine_type: Optional[MachineType] = None
    floor: Optional[int] = Field(None, ge=1, le=50)
    status: Optional[MachineStatus] = None


class MachineResponse(MachineBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# СХЕМЫ ДЛЯ БРОНИРОВАНИЙ (BOOKING)

class BookingBase(BaseModel):
    user_id: int = Field(..., description="ID пользователя")
    machine_id: int = Field(..., description="ID машины")
    start_time: datetime = Field(..., description="Время начала")
    end_time: datetime = Field(..., description="Время окончания")
    status: BookingStatus = Field(default=BookingStatus.ACTIVE, description="Статус бронирования")


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[BookingStatus] = None


class BookingResponse(BookingBase):
    id: int
    created_at: datetime
    user: Optional[UserResponse] = None
    machine: Optional[MachineResponse] = None

    model_config = ConfigDict(from_attributes=True)