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

interface FormErrors {
  fullName?: string;
  roomNumber?: string;
  telegramId?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [telegramId, setTelegramId] = useState<string>('');
  
  // Состояние ошибок валидации
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Валидация полей
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Валидация ФИО
    const cleanName = fullName.trim();
    if (!cleanName) {
      newErrors.fullName = 'Введите имя и фамилию';
    } else if (cleanName.length < 3) {
      newErrors.fullName = 'ФИО должно содержать не менее 3 символов';
    } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(cleanName)) {
      newErrors.fullName = 'ФИО может содержать только буквы, пробелы и дефис';
    }

    // 2. Валидация номера комнаты
    const cleanRoom = roomNumber.trim();
    if (!cleanRoom) {
      newErrors.roomNumber = 'Укажите номер комнаты в общежитии';
    } else if (cleanRoom.length > 10) {
      newErrors.roomNumber = 'Номер комнаты слишком длинный (до 10 символов)';
    }

    // 3. Валидация Telegram
    const cleanTg = telegramId.trim();
    if (cleanTg) {
      if (!cleanTg.startsWith('@')) {
        newErrors.telegramId = 'Никнейм должен начинаться с символа @';
      } else if (cleanTg.length < 4) {
        newErrors.telegramId = 'Telegram никнейм слишком короткий (минимум @abc)';
      } else if (!/^@[a-zA-Z0-9_]+$/.test(cleanTg)) {
        newErrors.telegramId = 'Разрешены только латинские буквы, цифры и символ _';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      setSubmitError('Пожалуйста, исправьте ошибки в заполненных полях');
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

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ФИО студента *"
            variant="outlined"
            fullWidth
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors({ ...errors, fullName: undefined });
            }}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
            placeholder="Иван Иванов"
          />

          <TextField
            label="Номер комнаты *"
            variant="outlined"
            fullWidth
            value={roomNumber}
            onChange={(e) => {
              setRoomNumber(e.target.value);
              if (errors.roomNumber) setErrors({ ...errors, roomNumber: undefined });
            }}
            error={Boolean(errors.roomNumber)}
            helperText={errors.roomNumber}
            placeholder="314-А"
          />

          <TextField
            label="Telegram никнейм"
            variant="outlined"
            fullWidth
            value={telegramId}
            onChange={(e) => {
              setTelegramId(e.target.value);
              if (errors.telegramId) setErrors({ ...errors, telegramId: undefined });
            }}
            error={Boolean(errors.telegramId)}
            helperText={errors.telegramId || 'Например, @ivan_dorm (необязательно)'}
            placeholder="@ivan_dorm"
          />

          <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 1 }}>
            Войти в систему
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};