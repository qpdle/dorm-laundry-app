import { request } from './apiClient';
import type { LaundryMachine, Booking, User } from '../types';

// Получение каталога оборудования
export const fetchMachines = (): Promise<LaundryMachine[]> => {
  return request<LaundryMachine[]>('/api/machines/');
};

// Получение общего списка броней
export const fetchBookings = (): Promise<Booking[]> => {
  return request<Booking[]>('/api/bookings/');
};

// Получение личных броней авторизованного студента
export const fetchMyBookings = (): Promise<Booking[]> => {
  return request<Booking[]>('/api/bookings/my');
};

// Получение профиля текущего пользователя
export const fetchCurrentUser = (): Promise<User> => {
  return request<User>('/api/auth/me');
};

// Вход в систему (POST /api/auth/login)
export interface LoginPayload {
  telegram_id: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export const loginApi = (payload: LoginPayload): Promise<AuthResponse> => {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
};

// Регистрация нового студента (POST /api/auth/register)
export interface RegisterPayload {
  full_name: string;
  room_number: string;
  telegram_id: string;
  password: string;
}

export const registerApi = (payload: RegisterPayload): Promise<User> => {
  return request<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
};

// Создание нового бронирования (POST /api/bookings/)
export interface CreateBookingPayload {
  machine_id: number;
  start_time: string;
  end_time: string;
}

export const createBookingApi = (payload: CreateBookingPayload): Promise<Booking> => {
  return request<Booking>('/api/bookings/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Отмена / удаление бронирования (DELETE /api/bookings/{id})
export const deleteBookingApi = (bookingId: number): Promise<void> => {
  return request<void>(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
  });
};

// Редактирование профиля пользователя (PUT /api/users/{id})
export interface UpdateUserPayload {
  full_name?: string;
  room_number?: string;
  telegram_id?: string;
}

export const updateUserApi = (userId: number, payload: UpdateUserPayload): Promise<User> => {
  return request<User>(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};