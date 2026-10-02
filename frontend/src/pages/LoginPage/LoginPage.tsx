import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import type { User } from '../../shared/types';

interface LoginPageProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [telegramId, setTelegramId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim() || !roomNumber.trim()) {
      return;
    }

    const newUser: User = {
      id: Date.now(),
      full_name: fullName.trim(),
      room_number: roomNumber.trim(),
      telegram_id: telegramId.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    onLogin(newUser);
    setSuccessMessage(`Успешный вход! Добро пожаловать, ${newUser.full_name}`);
  };

  if (currentUser) {
    return (
      <Container maxWidth="xs" sx={{ py: 8 }}>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Профиль студента
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>ФИО:</strong> {currentUser.full_name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Комната:</strong> {currentUser.room_number}
          </Typography>
          {currentUser.telegram_id && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              <strong>Telegram:</strong> {currentUser.telegram_id}
            </Typography>
          )}
          <Button variant="outlined" color="error" fullWidth onClick={onLogout}>
            Выйти из аккаунта
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.main',
              mb: 1,
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Авторизация
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Сервис прачечной общежития
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ФИО студента"
            variant="outlined"
            fullWidth
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иван Иванов"
          />

          <TextField
            label="Номер комнаты"
            variant="outlined"
            fullWidth
            required
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="314-А"
          />

          <TextField
            label="Telegram никнейм"
            variant="outlined"
            fullWidth
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="@ivan_dorm"
            helperText="Для получения напоминаний о стирке"
          />

          <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 1 }}>
            Войти в систему
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};