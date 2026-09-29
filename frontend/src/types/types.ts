export type MachineType = 'washer' | 'dryer';

export type MachineStatus = 'available' | 'busy' | 'broken';

export interface Machine {
  id: number;
  name: string;
  type: MachineType;
  status: MachineStatus;
}

export interface BookingSlot {
  id: number;
  time: string;
  isBooked: boolean;
  bookedBy?: string;
}

export interface UserBooking {
  id: number;
  machineName: string;
  machineType: MachineType;
  date: string;
  timeSlot: string;
}