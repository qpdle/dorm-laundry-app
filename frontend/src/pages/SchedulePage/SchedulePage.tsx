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
import type { LaundryMachine, Booking } from '../../shared/types';

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

const generateSlots = (machineId: number, bookings: Booking[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [8, 10, 12, 14, 16, 18, 20];

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  hours.forEach((hour) => {
    const startHourStr = hour < 10 ? `0${hour}` : `${hour}`;
    const endHourStr = hour + 2 < 10 ? `0${hour + 2}` : `${hour + 2}`;

    const startISO = `${dateStr}T${startHourStr}:00:00`;
    const endISO = `${dateStr}T${endHourStr}:00:00`;

    const isBooked = bookings.some(
      (b) =>
        b.machine_id === machineId &&
        b.status === 'active' &&
        b.start_time.startsWith(`${dateStr}T${startHourStr}`)
    );

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
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Доступные слоты на сегодня:
      </Typography>

      {/* Адаптивная сетка слотов на Box без устаревших перегрузок Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {slots.map((slot) => {
          const startLabel = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endLabel = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                bgcolor: slot.isBooked ? 'action.hover' : 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color={slot.isBooked ? 'disabled' : 'primary'} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'medium',
                    color: slot.isBooked ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {startLabel} - {endLabel}
                </Typography>
              </Box>

              {slot.isBooked ? (
                <Chip label="Занято" size="small" />
              ) : (
                <Button
                  variant="contained"
                  size="small"
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
            Вы уверены, что хотите забронировать <strong>{machine.name}</strong> на интервал{' '}
            {selectedSlot && (
              <strong>
                {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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