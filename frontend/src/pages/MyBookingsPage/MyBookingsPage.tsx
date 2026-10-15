import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { BookingItem } from '../../entities/booking/BookingItem';
import { LoadingState } from '../../shared/ui/LoadingState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { EmptyState } from '../../shared/ui/EmptyState';
import type { Booking, User } from '../../shared/types';

interface MyBookingsPageProps {
  bookings: Booking[];
  currentUser: User | null;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onCancelBooking: (bookingId: number) => void;
  onGoToCatalog: () => void;
  onGoToLogin: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings,
  currentUser,
  isLoading,
  errorMessage,
  onRetry,
  onCancelBooking,
  onGoToCatalog,
  onGoToLogin,
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

      {/* Если пользователь не авторизован - требуем вход */}
      {!currentUser && (
        <Paper
          variant="outlined"
          sx={{
            py: 6,
            px: 3,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              color: 'text.secondary',
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Требуется авторизация
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
            Чтобы просматривать личные записи и управлять ими, войдите в систему под своим студенческим аккаунтом.
          </Typography>
          <Button variant="contained" onClick={onGoToLogin}>
            Войти в систему
          </Button>
        </Paper>
      )}

      {/* Состояние ошибки загрузки с кнопкой повтора */}
      {currentUser && errorMessage && (
        <ErrorState
          title="Сбой загрузки бронирований"
          message={errorMessage}
          onRetry={onRetry}
        />
      )}

      {/* Индикатор загрузки для авторизованного пользователя */}
      {currentUser && isLoading && !errorMessage && (
        <LoadingState message="Синхронизация списка ваших бронирований с базой данных..." />
      )}

      {/* Пустой список бронирований */}
      {currentUser && !isLoading && !errorMessage && bookings.length === 0 && (
        <EmptyState
          title="У вас пока нет активных бронирований"
          description="Выберите свободную стиральную или сушильную машину в каталоге и забронируйте удобный интервал."
          actionText="Перейти к выбору техники"
          onAction={onGoToCatalog}
        />
      )}

      {/* Карточки бронирований студента */}
      {currentUser && !isLoading && !errorMessage && bookings.length > 0 && (
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

export default MyBookingsPage;