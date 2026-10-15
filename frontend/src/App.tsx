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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // Восстановление сессии при инициализации
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

  // Синхронизация данных бронирований с PostgreSQL
  const syncBookings = useCallback(async () => {
    try {
      if (currentTab === 'my-bookings' && currentUser) {
        const myData = await fetchMyBookings();
        setBookings(myData);
      } else {
        const allData = await fetchBookings();
        setBookings(allData);
      }
    } catch (err) {
      console.warn('Ошибка синхронизации данных с сервером:', err);
    }
  }, [currentTab, currentUser]);

  useEffect(() => {
    syncBookings();
  }, [syncBookings]);

  // Выбор оборудования и актуализация расписания
  const handleSelectMachine = async (machine: LaundryMachine) => {
    setSelectedMachine(machine);
    // Принудительно подтягиваем актуальные брони с сервера перед открытием сетки
    try {
      const liveBookings = await fetchBookings();
      setBookings(liveBookings);
    } catch {
      // Игнорируем фоновый сбой
    }
    setCurrentTab('schedule');
  };

  // Создание бронирования через API с мгновенной синхронизацией UI
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
      setToastMessage('Слот успешно забронирован!');
      
      // Актуализируем данные в интерфейсе
      await syncBookings();
      setCurrentTab('my-bookings');
    } catch (err: unknown) {
      setToastSeverity('error');
      setToastMessage(err instanceof Error ? err.message : 'Не удалось забронировать слот');
    }
  };

  // Отмена бронирования через API с мгновенным обновлением UI
  const handleCancelBooking = async (bookingId: number) => {
    try {
      await deleteBookingApi(bookingId);
      setToastSeverity('success');
      setToastMessage('Бронирование успешно отменено');
      
      // Мгновенно обновляем список
      await syncBookings();
    } catch (err: unknown) {
      setToastSeverity('error');
      setToastMessage(err instanceof Error ? err.message : 'Ошибка отмены бронирования');
    }
  };

  const handleUserUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setToastSeverity('success');
    setToastMessage('Профиль успешно обновлён');
  };

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