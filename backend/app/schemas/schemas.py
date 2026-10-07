from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.models.entities import MachineType, MachineStatus, BookingStatus


# Схемы для пользователей (User)

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="ФИО студента")
    room_number: str = Field(..., min_length=1, max_length=20, description="Номер комнаты")
    telegram_id: Optional[str] = Field(None, max_length=50, description="Telegram username или ID")

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("ФИО не может состоять из пробелов и должно содержать минимум 2 символа")
        return v

    @field_validator("room_number")
    @classmethod
    def validate_room_number(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Номер комнаты не может быть пустым")
        return v

    @field_validator("telegram_id")
    @classmethod
    def validate_telegram_id(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if not v.startswith("@"):
                v = f"@{v}"
        return v


class UserCreate(UserBase):
    pass


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="Пароль пользователя")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v.strip()) < 6:
            raise ValueError("Пароль должен содержать минимум 6 символов")
        return v


class UserLogin(BaseModel):
    telegram_id: str = Field(..., description="Telegram-логин пользователя")
    password: str = Field(..., description="Пароль пользователя")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    room_number: Optional[str] = Field(None, min_length=1, max_length=20)
    telegram_id: Optional[str] = Field(None, max_length=50)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError("ФИО должно содержать минимум 2 символа")
        return v


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Схемы для токенов аутентификации (JWT)

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT токен доступа к защищенному API")
    refresh_token: str = Field(..., description="JWT токен для продления access token")
    token_type: str = Field(default="bearer", description="Тип авторизационного заголовка")
    expires_in: int = Field(..., description="Срок действия access token в секундах")
    user: UserResponse = Field(..., description="Данные аутентифицированного пользователя")


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="Действующий refresh token")


class TokenRefreshResponse(BaseModel):
    access_token: str = Field(..., description="Новый JWT токен доступа")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Срок действия нового access token в секундах")


# Схемы для оборудования (Laundry Machine)

class MachineBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Название машины")
    machine_type: MachineType = Field(default=MachineType.WASHER, description="Тип: washer или dryer")
    floor: int = Field(default=1, ge=1, le=30, description="Этаж (от 1 до 30)")
    status: MachineStatus = Field(default=MachineStatus.AVAILABLE, description="Текущий статус")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Название машины должно содержать минимум 2 символа")
        return v


class MachineCreate(MachineBase):
    pass


class MachineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    machine_type: Optional[MachineType] = None
    floor: Optional[int] = Field(None, ge=1, le=30)
    status: Optional[MachineStatus] = None


class MachineResponse(MachineBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Схемы для бронирований (Booking)

class BookingBase(BaseModel):
    machine_id: int = Field(..., gt=0, description="ID машины")
    start_time: datetime = Field(..., description="Время начала слота")
    end_time: datetime = Field(..., description="Время окончания слота")
    status: BookingStatus = Field(default=BookingStatus.ACTIVE, description="Статус бронирования")

    @model_validator(mode="after")
    def validate_booking_times(self):
        start = self.start_time
        end = self.end_time

        # Приводим к naive datetime без часового пояса для корректного сравнения
        if start.tzinfo is not None:
            start = start.replace(tzinfo=None)
        if end.tzinfo is not None:
            end = end.replace(tzinfo=None)

        if end <= start:
            raise ValueError("Время окончания бронирования (end_time) должно быть строго позже времени начала (start_time)")

        duration_minutes = (end - start).total_seconds() / 60
        if duration_minutes < 30:
            raise ValueError("Минимальная длительность бронирования составляет 30 минут")
        if duration_minutes > 180:
            raise ValueError("Максимальная длительность бронирования не может превышать 3 часа (180 минут)")

        return self


class BookingCreate(BookingBase):
    # user_id опционален в теле запроса, так как он берётся из JWT токена
    user_id: Optional[int] = Field(None, gt=0, description="ID пользователя (подставляется сервером)")


class BookingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[BookingStatus] = None

    @model_validator(mode="after")
    def validate_update_times(self):
        if self.start_time is not None and self.end_time is not None:
            start = self.start_time.replace(tzinfo=None) if self.start_time.tzinfo else self.start_time
            end = self.end_time.replace(tzinfo=None) if self.end_time.tzinfo else self.end_time
            if end <= start:
                raise ValueError("Время окончания должно быть строго позже времени начала")
        return self


class BookingResponse(BaseModel):
    id: int
    user_id: int
    machine_id: int
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    created_at: datetime
    user: Optional[UserResponse] = None
    machine: Optional[MachineResponse] = None

    model_config = ConfigDict(from_attributes=True)