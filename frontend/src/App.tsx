import { useState } from 'react';
import { CssBaseline, Box, Snackbar, Alert, Fade } from '@mui/material';
import { Navbar } from './shared/ui/Navbar';
import { MachinesPage } from './pages/MachinesPage/MachinesPage';
import { SchedulePage } from './pages/SchedulePage/SchedulePage';
import { MyBookingsPage } from './pages/MyBookingsPage/MyBookingsPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import type { LaundryMachine, Booking, User } from './shared/types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [selectedMachine, setSelectedMachine] = useState<LaundryMachine | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 1,
    full_name: 'Иван Иванов',
    room_number: '402-Б',
    telegram_id: '@ivan_dorm',
    created_at: new Date().toISOString(),
  });

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 101,
      user_id: 1,
      machine_id: 1,
      start_time: `${new Date().toISOString().split('T')[0]}T10:00:00`,
      end_time: `${new Date().toISOString().split('T')[0]}T12:00:00`,
      status: 'active',
      created_at: new Date().toISOString(),
      machine: {
        id: 1,
        name: 'Стиральная машина №1',
        machine_type: 'washer',
        floor: 1,
        status: 'available',
        created_at: new Date().toISOString(),
      },
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelectMachine = (machine: LaundryMachine) => {
    setSelectedMachine(machine);
    setCurrentTab('schedule');
  };

  const handleBookSlot = (machineId: number, startTime: string, endTime: string) => {
    const newBooking: Booking = {
      id: Date.now(),
      user_id: currentUser ? currentUser.id : 1,
      machine_id: machineId,
      start_time: startTime,
      end_time: endTime,
      status: 'active',
      created_at: new Date().toISOString(),
      machine: selectedMachine || undefined,
    };

    setBookings((prev) => [newBooking, ...prev]);
    setToastMessage(`Слот успешно забронирован на ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
    setCurrentTab('my-bookings');
  };

  const handleCancelBooking = (bookingId: number) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    );
    setToastMessage('Бронирование отменено');
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
      />

      {/* Контейнер с плавной анимацией смены вкладок */}
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
                }}
                onLogout={() => {
                  setCurrentUser(null);
                  setToastMessage('Вы вышли из системы');
                }}
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