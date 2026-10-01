import React from 'react';
import { Paper, Box, Typography, Button, Chip } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Booking } from '../../shared/types';

interface BookingItemProps {
  booking: Booking;
  onCancel?: (bookingId: number) => void;
}

export const BookingItem: React.FC<BookingItemProps> = ({ booking, onCancel }) => {
  const startTime = new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date(booking.start_time).toLocaleDateString('ru-RU');

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {booking.machine?.name || `Оборудование #${booking.machine_id}`}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 0.5 }}>
            <EventIcon fontSize="small" />
            <Typography variant="body2">{dateStr}</Typography>
            <AccessTimeIcon fontSize="small" sx={{ ml: 1 }} />
            <Typography variant="body2">{startTime} - {endTime}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            size="small"
            label={booking.status === 'active' ? 'Активно' : booking.status === 'completed' ? 'Завершено' : 'Отменено'}
            color={booking.status === 'active' ? 'primary' : 'default'}
          />
          {booking.status === 'active' && onCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onCancel(booking.id)}
            >
              Отменить
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};