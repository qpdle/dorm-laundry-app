import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { BookingItem } from '../../entities/booking/BookingItem';
import type { Booking } from '../../shared/types';

interface MyBookingsPageProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: number) => void;
  onGoToCatalog: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings,
  onCancelBooking,
  onGoToCatalog,
}) => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Мои бронирования
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Список ваших запланированных и прошедших слотов в прачечной.
        </Typography>
      </Box>

      {bookings.length === 0 ? (
        <Box
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <EventBusyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет активных бронирований
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Выберите свободную стиральную или сушильную машину в каталоге.
          </Typography>
          <Button variant="contained" onClick={onGoToCatalog}>
            Перейти к выбору техники
          </Button>
        </Box>
      ) : (
        <Box>
          {bookings.map((booking) => (
            <BookingItem
              key={booking.id}
              booking={booking}
              onCancel={onCancelBooking}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};