import { useState, useEffect, useCallback } from 'react';
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

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [isBookingsLoading, setIsBookingsLoading] = useState<boolean>(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning'>('success');

  // Восстановление сессии при наличии сохраненного токена
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

  // Синхронизация списка бронирований
  const syncBookings = useCallback(async () => {
    // Если открыта вкладка личных бронирований, но пользователь не вошел — ничего не запрашиваем
    if (currentTab === 'my-bookings' && !currentUser) {
      setBookings([]);
      return;
    }

    setIsBookingsLoading(true);
    setBookingsError(null);

    try {
      if (currentTab === 'my-bookings' && currentUser) {
        // Личные бронирования авторизованного пользователя
        const myData = await fetchMyBookings();
        setBookings(myData);
      } else {
        // Общая сетка расписания для каталога и слотов
        const allData = await fetchBookings();
        setBookings(allData);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось связаться с сервером базы данных';
      setBookingsError(message);
    } finally {
      setIsBookingsLoading(false);
    }
  }, [currentTab, currentUser]);

  useEffect(() => {
    syncBookings();
  }, [syncBookings]);

  const handleSelectMachine = async (machine: LaundryMachine) => {
    setSelectedMachine(machine);
    try {
      const liveBookings = await fetchBookings();
      setBookings(liveBookings);
    } catch {
      // игнорируем фоновый сбой
    }
    setCurrentTab('schedule');
  };

  const handleBookSlot = async (machineId: number, startTime: string, endTime: string) => {
    if (!currentUser) {
      setToastSeverity('warning');
      setToastMessage('Для бронирования оборудования необходимо войти в аккаунт');
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
      await syncBookings();
      setCurrentTab('my-bookings');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при оформлении бронирования';
      setToastSeverity('error');
      setToastMessage(message);
      throw err;
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await deleteBookingApi(bookingId);
      setToastSeverity('success');
      setToastMessage('Бронирование успешно отменено');
      await syncBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка отмены бронирования';
      setToastSeverity('error');
      setToastMessage(message);
    }
  };

  const handleUserUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setToastSeverity('success');
    setToastMessage('Профиль успешно обновлён');
  };

  // Выход из аккаунта
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
        // локальный сброс
      }
    }

    clearTokens();
    setCurrentUser(null);
    setBookings([]); // Сразу очищаем список личных броней
    setToastSeverity('success');
    setToastMessage('Вы успешно вышли из системы');
    setCurrentTab('login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

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
                currentUser={currentUser}
                isLoading={isBookingsLoading}
                errorMessage={bookingsError}
                onRetry={syncBookings}
                onCancelBooking={handleCancelBooking}
                onGoToCatalog={() => setCurrentTab('catalog')}
                onGoToLogin={() => setCurrentTab('login')}
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

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4500}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity={toastSeverity}
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;