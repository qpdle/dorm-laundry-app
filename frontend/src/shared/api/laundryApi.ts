import { request } from './apiClient';
import type { LaundryMachine, Booking, User } from '../types';

// Загрузка каталога оборудования из базы данных PostgreSQL
export const fetchMachines = (): Promise<LaundryMachine[]> => {
  return request<LaundryMachine[]>('/api/machines/');
};

// Загрузка общего расписания бронирований
export const fetchBookings = (): Promise<Booking[]> => {
  return request<Booking[]>('/api/bookings/');
};

// Загрузка личных бронирований текущего студента
export const fetchMyBookings = (): Promise<Booking[]> => {
  return request<Booking[]>('/api/bookings/my');
};

// Загрузка профиля текущего пользователя по JWT токену
export const fetchCurrentUser = (): Promise<User> => {
  return request<User>('/api/auth/me');
};