import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Collapse,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditIcon from '@mui/icons-material/Edit';
import type { User } from '../../shared/types';
import { loginApi, registerApi, updateUserApi } from '../../shared/api/laundryApi';
import { saveTokens } from '../../shared/lib/authStorage';

interface LoginPageProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Поля формы
  const [telegramId, setTelegramId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Состояние диалога редактирования профиля
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editRoomNumber, setEditRoomNumber] = useState<string>('');
  const [editTelegramId, setEditTelegramId] = useState<string>('');

  // Открытие диалога редактирования
  const handleOpenEdit = () => {
    if (currentUser) {
      setEditFullName(currentUser.full_name);
      setEditRoomNumber(currentUser.room_number);
      setEditTelegramId(currentUser.telegram_id || '');
      setIsEditDialogOpen(true);
    }
  };

  // Сохранение отредактированного профиля (PUT /api/users/{id})
  const handleSaveEdit = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const updated = await updateUserApi(currentUser.id, {
        full_name: editFullName.trim(),
        room_number: editRoomNumber.trim(),
        telegram_id: editTelegramId.trim() || undefined,
      });
      onUpdateUser(updated);
      setIsEditDialogOpen(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка обновления профиля');
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка формы логина / регистрации
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const response = await loginApi({
          telegram_id: telegramId.trim(),
          password: password.trim(),
        });
        saveTokens(response.access_token, response.refresh_token);
        onLogin(response.user);
      } else {
        await registerApi({
          full_name: fullName.trim(),
          room_number: roomNumber.trim(),
          telegram_id: telegramId.trim(),
          password: password.trim(),
        });

        // После успешной регистрации автоматически авторизуем пользователя
        const response = await loginApi({
          telegram_id: telegramId.trim(),
          password: password.trim(),
        });
        saveTokens(response.access_token, response.refresh_token);
        onLogin(response.user);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Произошла ошибка запроса');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return (
      <Container maxWidth="xs" sx={{ py: 6 }}>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              onClick={handleOpenEdit}
            >
              Редактировать профиль
            </Button>
            <Button variant="outlined" color="error" fullWidth onClick={onLogout}>
              Выйти из аккаунта
            </Button>
          </Box>
        </Paper>

        {/* Диалог редактирования профиля */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Редактирование профиля</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="ФИО"
              fullWidth
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              sx={{ mt: 1 }}
            />
            <TextField
              label="Комната"
              fullWidth
              value={editRoomNumber}
              onChange={(e) => setEditRoomNumber(e.target.value)}
            />
            <TextField
              label="Telegram"
              fullWidth
              value={editTelegramId}
              onChange={(e) => setEditTelegramId(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={handleSaveEdit} disabled={isLoading}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
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
            {activeTab === 'login' ? 'Авторизация' : 'Регистрация'}
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setErrorMessage(null);
          }}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab value="login" label="Вход" />
          <Tab value="register" label="Регистрация" />
        </Tabs>

        <Collapse in={Boolean(errorMessage)}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activeTab === 'register' && (
            <>
              <TextField
                label="ФИО студента *"
                required
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
              />
              <TextField
                label="Номер комнаты *"
                required
                fullWidth
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="402-Б"
              />
            </>
          )}

          <TextField
            label="Telegram логин *"
            required
            fullWidth
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="@ivan_dorm"
          />

          <TextField
            label="Пароль *"
            type="password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 1 }}
          >
            {isLoading ? 'Загрузка...' : activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;