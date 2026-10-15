import { useState, useEffect } from 'react';
import { CssBaseline, Box, Snackbar, Alert, Fade } from '@mui/material';
import { Navbar } from './shared/ui/Navbar';
import { MachinesPage } from './pages/MachinesPage/MachinesPage';
import { SchedulePage } from './pages/SchedulePage/SchedulePage';
import { MyBookingsPage } from './pages/MyBookingsPage/MyBookingsPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import type { LaundryMachine, Booking, User } from './shared/types';
import { getRefreshToken, getAccessToken, clearTokens } from './shared/lib/authStorage';
import { fetchBookings, fetchMyBookings, fetchCurrentUser } from './shared/api/laundryApi';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [selectedMachine, setSelectedMachine] = useState<LaundryMachine | null>(null);

  // Данные пользователя и бронирований, синхронизируемые с базой данных
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Проверяем сохранённый токен при загрузке приложения и восстанавливаем пользователя
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

  // 2. Получение актуальных бронирований из базы данных
  const loadBookings = () => {
    if (currentTab === 'my-bookings' && currentUser) {
      fetchMyBookings()
        .then(setBookings)
        .catch((err) => console.warn('Не удалось загрузить бронирования пользователя:', err));
    } else {
      fetchBookings()
        .then(setBookings)
        .catch((err) => console.warn('Не удалось загрузить общее расписание:', err));
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

  // Локальный обработчик успешного бронирования слота
  const handleBookSlot = (_machineId: number, startTime: string, _endTime: string) => {
    loadBookings();
    setToastMessage(`Слот успешно забронирован на ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
    setCurrentTab('my-bookings');
  };

  // Локальный обработчик отмены бронирования
  const handleCancelBooking = (bookingId: number) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    );
    setToastMessage('Бронирование отменено');
  };

  // Выход из системы с отзывом токена
  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.warn('Сервер недоступен при выходе, сессия завершена локально', error);
      }
    }

    clearTokens();
    setCurrentUser(null);
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

      {/* Контейнер с анимацией переключения страниц */}
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
                  setToastMessage('Авторизация выполнена успешно');
                  setCurrentTab('catalog');
                }}
                onLogout={handleLogout}
              />
            </Box>
          </Fade>
        )}
      </Box>

      {/* Всплывающее уведомление */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMessage(null)} severity="success" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;