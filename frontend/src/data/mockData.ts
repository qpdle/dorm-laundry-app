import type { Machine, BookingSlot, UserBooking } from '../types/types';

export const initialMachines: Machine[] = [
  { id: 1, name: 'Стиральная машина №1', type: 'washer', status: 'available' },
  { id: 2, name: 'Стиральная машина №2', type: 'washer', status: 'busy' },
  { id: 3, name: 'Стиральная машина №3', type: 'washer', status: 'broken' },
  { id: 4, name: 'Сушильная машина №1', type: 'dryer', status: 'available' },
  { id: 5, name: 'Сушильная машина №2', type: 'dryer', status: 'busy' },
];

export const initialSlots: BookingSlot[] = [
  { id: 1, time: '08:00 - 09:00', isBooked: true, bookedBy: 'Иван Иванов' },
  { id: 2, time: '09:00 - 10:00', isBooked: false },
  { id: 3, time: '10:00 - 11:00', isBooked: false },
  { id: 4, time: '11:00 - 12:00', isBooked: true, bookedBy: 'Анна Смирнова' },
  { id: 5, time: '12:00 - 13:00', isBooked: false },
  { id: 6, time: '13:00 - 14:00', isBooked: false },
  { id: 7, time: '14:00 - 15:00', isBooked: false },
  { id: 8, time: '15:00 - 16:00', isBooked: true, bookedBy: 'Петр Васильев' },
  { id: 9, time: '16:00 - 17:00', isBooked: false },
];

export const initialMyBookings: UserBooking[] = [
  {
    id: 101,
    machineName: 'Стиральная машина №1',
    machineType: 'washer',
    date: '2026-09-24',
    timeSlot: '12:00 - 13:00',
  },
  {
    id: 102,
    machineName: 'Сушильная машина №2',
    machineType: 'dryer',
    date: '2026-09-24',
    timeSlot: '14:00 - 15:00',
  },
];