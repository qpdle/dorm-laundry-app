import { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Демонстрационный переход на главную после клика "Войти"
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2, textAlign: 'center' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#1976d2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#fff',
          }}
        >
          <LockOutlinedIcon />
        </Box>

        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Авторизация
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Войдите с учетной записью общежития
        </Typography>

        {isSubmitted && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Успешный вход! Перенаправление...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email или номер комнаты"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 1 }}>
            Войти
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};