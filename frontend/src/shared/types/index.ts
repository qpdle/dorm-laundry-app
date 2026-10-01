// Статусы и типы оборудования
export type MachineType = 'washer' | 'dryer';
export type MachineStatus = 'available' | 'in_use' | 'maintenance';

// Статусы бронирования
export type BookingStatus = 'active' | 'completed' | 'cancelled';

// Сущность пользователя
export interface User {
  id: number;
  full_name: string;
  room_number: string;
  telegram_id?: string;
  created_at: string;
}

// Сущность оборудования
export interface LaundryMachine {
  id: number;
  name: string;
  machine_type: MachineType;
  floor: number;
  status: MachineStatus;
  created_at: string;
}

// Сущность бронирования слота
export interface Booking {
  id: number;
  user_id: number;
  machine_id: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  user?: User;
  machine?: LaundryMachine;
}