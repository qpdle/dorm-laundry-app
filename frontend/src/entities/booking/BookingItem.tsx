import React from 'react';
import { Paper, Box, Typography, Button, Chip } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Booking } from '../../shared/types';
import { formatTimeShort, formatDateRussian } from '../../shared/lib/formatters';

interface BookingItemProps {
  booking: Booking;
  onCancel?: (bookingId: number) => void;
}

export const BookingItem: React.FC<BookingItemProps> = ({ booking, onCancel }) => {
  const startTime = formatTimeShort(booking.start_time);
  const endTime = formatTimeShort(booking.end_time);
  const dateStr = formatDateRussian(booking.start_time);

  const getStatusColor = (status: string): 'primary' | 'success' | 'default' => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 2.5,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {booking.machine?.name || `Оборудование #${booking.machine_id}`}
          </Typography>

          {booking.machine && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Этаж {booking.machine.floor} • {booking.machine.machine_type === 'washer' ? 'Стиральная машина' : 'Сушилка'}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 0.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EventIcon fontSize="small" color="action" />
              <Typography variant="body2">{dateStr}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: { sm: 1 } }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">{startTime} – {endTime}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            size="small"
            label={getStatusLabel(booking.status)}
            color={getStatusColor(booking.status)}
            sx={{ fontWeight: 500 }}
          />

          {booking.status === 'active' && onCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
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

export default BookingItem;