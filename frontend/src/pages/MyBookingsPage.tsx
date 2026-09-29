import { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { initialMyBookings } from '../data/mockData';
import type { UserBooking } from '../types/types';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<UserBooking[]>(initialMyBookings);
  const [canceledNotice, setCanceledNotice] = useState<string | null>(null);

  const handleCancel = (id: number) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setCanceledNotice('Бронирование успешно отменено');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Мои активные бронирования
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Список ваших запланированных сеансов стирки и сушки
      </Typography>

      {canceledNotice && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setCanceledNotice(null)}>
          {canceledNotice}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Alert severity="warning">У вас пока нет активных записей на стирку или сушку.</Alert>
      ) : (
        <Stack spacing={2}>
          {bookings.map((booking) => (
            <Card key={booking.id} sx={{ borderRadius: 2, boxShadow: 1 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {booking.machineName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2">{booking.date}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">{booking.timeSlot}</Typography>
                    </Box>
                    <Chip
                      label={booking.machineType === 'washer' ? 'Стирка' : 'Сушка'}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleCancel(booking.id)}
                >
                  Отменить бронь
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};