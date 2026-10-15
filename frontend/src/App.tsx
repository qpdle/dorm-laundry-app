import { useState, useEffect } from 'react';
import { CssBaseline, Box, Snackbar, Alert, Fade } from '@mui/material';
import { Navbar } from './shared/ui/Navbar';
import { MachinesPage } from './pages/MachinesPage/MachinesPage';
import { SchedulePage } from './pages/SchedulePage/SchedulePage';
import { MyBookingsPage } from './pages/MyBookingsPage/MyBookingsPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import type { LaundryMachine, Booking, User } from './shared/types';
import { getRefreshToken, getAccessToken, clearTokens } from './shared/lib/authStorage';
import {
  fetchBookings,
  fetchMyBookings,
  fetchCurrentUser,
  createBookingApi,
  deleteBookingApi,
} from './shared/api/laundryApi';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [selectedMachine, setSelectedMachine] = useState<LaundryMachine | null>(null);

  // Данные приложения из базы данных
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // 1. Проверка сохранённого токена при входе на сайт
  useEffect(() => {
    if (getAccessToken()) {
      fetchCurrentUser()
        .then((user) => setCurrentUser(user))
        .catch(() => {
          clearTokens();
          setCurrentUser(null);
        });
    }
  }, []);

  // 2. Загрузка бронирований из базы данных
  const loadBookings = () => {
    if (currentTab === 'my-bookings' && currentUser) {
      fetchMyBookings()
        .then(setBookings)
        .catch((err) => console.warn('Ошибка загрузки личных броней:', err));
    } else {
      fetchBookings()
        .then(setBookings)
        .catch((err) => console.warn('Ошибка загрузки расписания:', err));
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentTab, currentUser]);

  // Выбор стиральной машины и открытие страницы расписания
  const handleSelectMachine = (machine: LaundryMachine) => {
    setSelectedMachine(machine);
    setCurrentTab('schedule');
  };

  // Создание бронирования через API (POST /api/bookings/)
  const handleBookSlot = async (machineId: number, startTime: string, endTime: string) => {
    if (!currentUser) {
      setToastSeverity('error');
      setToastMessage('Для бронирования необходимо войти в систему');
      setCurrentTab('login');
      return;
    }

    try {
      await createBookingApi({
        machine_id: machineId,
        start_time: startTime,
        end_time: endTime,
      });

      setToastSeverity('success');
      setToastMessage('Слот успешно забронирован в базе данных!');
      loadBookings();
      setCurrentTab('my-bookings');
    } catch (err: unknown) {
      setToastSeverity('error');
      setToastMessage(err instanceof Error ? err.message : 'Не удалось забронировать слот');
    }
  };

  // Удаление / отмена бронирования через API (DELETE /api/bookings/{id})
  const handleCancelBooking = async (bookingId: number) => {
    try {
      await deleteBookingApi(bookingId);
      setToastSeverity('success');
      setToastMessage('Бронирование успешно отменено');
      loadBookings();
    } catch (err: unknown) {
      setToastSeverity('error');
      setToastMessage(err instanceof Error ? err.message : 'Ошибка отмены бронирования');
    }
  };

  // Обновление состояния пользователя после редактирования
  const handleUserUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setToastSeverity('success');
    setToastMessage('Профиль успешно обновлён');
  };

  // Выход из системы
  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // локальный сброс даже при сбое сети
      }
    }

    clearTokens();
    setCurrentUser(null);
    setToastSeverity('success');
    setToastMessage('Вы успешно вышли из системы');
    setCurrentTab('login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* Навигационная панель */}
      <Navbar
        currentTab={currentTab === 'schedule' ? 'catalog' : currentTab}
        onTabChange={(tab) => {
          setSelectedMachine(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <Box sx={{ position: 'relative' }}>
        {currentTab === 'catalog' && (
          <Fade in={currentTab === 'catalog'} timeout={400}>
            <Box>
              <MachinesPage onSelectMachine={handleSelectMachine} />
            </Box>
          </Fade>
        )}

        {currentTab === 'schedule' && selectedMachine && (
          <Fade in={currentTab === 'schedule'} timeout={400}>
            <Box>
              <SchedulePage
                machine={selectedMachine}
                bookings={bookings}
                onBack={() => {
                  setSelectedMachine(null);
                  setCurrentTab('catalog');
                }}
                onBookSlot={handleBookSlot}
              />
            </Box>
          </Fade>
        )}

        {currentTab === 'my-bookings' && (
          <Fade in={currentTab === 'my-bookings'} timeout={400}>
            <Box>
              <MyBookingsPage
                bookings={bookings}
                onCancelBooking={handleCancelBooking}
                onGoToCatalog={() => setCurrentTab('catalog')}
              />
            </Box>
          </Fade>
        )}

        {currentTab === 'login' && (
          <Fade in={currentTab === 'login'} timeout={400}>
            <Box>
              <LoginPage
                currentUser={currentUser}
                onLogin={(user) => {
                  setCurrentUser(user);
                  setToastSeverity('success');
                  setToastMessage('Авторизация выполнена успешно');
                  setCurrentTab('catalog');
                }}
                onLogout={handleLogout}
                onUpdateUser={handleUserUpdated}
              />
            </Box>
          </Fade>
        )}
      </Box>

      {/* Всплывающие уведомления */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity={toastSeverity}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;