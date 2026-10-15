import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { LaundryMachine, Booking } from '../../shared/types';
import { formatTimeShort, formatDateRussian, isTimeOverlapping } from '../../shared/lib/formatters';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface SchedulePageProps {
  machine: LaundryMachine;
  bookings: Booking[];
  onBack: () => void;
  onBookSlot: (machineId: number, startTime: string, endTime: string) => void;
}

// Генерация согласованных слотов на текущий день с шагом в 2 часа
const generateSlots = (machineId: number, bookings: Booking[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [8, 10, 12, 14, 16, 18, 20];

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateBase = `${year}-${month}-${day}`;

  hours.forEach((hour) => {
    const startHourStr = String(hour).padStart(2, '0');
    const endHourStr = String(hour + 2).padStart(2, '0');

    // Формируем строгий ISO-формат, согласованный с Pydantic BookingCreate
    const startISO = `${dateBase}T${startHourStr}:00:00`;
    const endISO = `${dateBase}T${endHourStr}:00:00`;

    const slotStart = new Date(startISO);
    const slotEnd = new Date(endISO);

    // Точная сверка пересечений с активными бронированиями из PostgreSQL
    const isBooked = bookings.some((b) => {
      if (b.machine_id !== machineId || b.status !== 'active') {
        return false;
      }
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return isTimeOverlapping(slotStart, slotEnd, bStart, bEnd);
    });

    slots.push({
      id: `${machineId}-${startHourStr}`,
      startTime: startISO,
      endTime: endISO,
      isBooked,
    });
  });

  return slots;
};

export const SchedulePage: React.FC<SchedulePageProps> = ({
  machine,
  bookings,
  onBack,
  onBookSlot,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const slots = generateSlots(machine.id, bookings);
  const todayFormatted = formatDateRussian(new Date().toISOString());

  const handleOpenConfirm = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsDialogOpen(false);
    setSelectedSlot(null);
  };

  const handleConfirmBooking = () => {
    if (selectedSlot) {
      onBookSlot(machine.id, selectedSlot.startTime, selectedSlot.endTime);
      handleCloseConfirm();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="text"
        sx={{ mb: 2 }}
      >
        Назад к каталогу
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Расписание: {machine.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Этаж {machine.floor} • {machine.machine_type === 'washer' ? 'Стиральная машина' : 'Сушилка'}
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mt: 0.5, fontWeight: 500 }}>
          Дата: {todayFormatted}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Слоты для бронирования (интервал 2 часа):
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {slots.map((slot) => {
          const startLabel = formatTimeShort(slot.startTime);
          const endLabel = formatTimeShort(slot.endTime);

          return (
            <Paper
              key={slot.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: slot.isBooked ? 'grey.300' : 'primary.light',
                bgcolor: slot.isBooked ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color={slot.isBooked ? 'disabled' : 'primary'} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: slot.isBooked ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {startLabel} – {endLabel}
                </Typography>
              </Box>

              {slot.isBooked ? (
                <Chip
                  label="Занято"
                  size="small"
                  variant="outlined"
                  color="default"
                  sx={{ fontWeight: 500 }}
                />
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleOpenConfirm(slot)}
                >
                  Занять
                </Button>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Диалог подтверждения бронирования */}
      <Dialog open={isDialogOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Подтверждение бронирования</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы бронируете оборудование <strong>{machine.name}</strong> на интервал{' '}
            {selectedSlot && (
              <strong>
                {formatTimeShort(selectedSlot.startTime)} – {formatTimeShort(selectedSlot.endTime)}
              </strong>
            )}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleConfirmBooking} variant="contained" autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SchedulePage;