import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import LogoutIcon from '@mui/icons-material/Logout';

// Описываем интерфейс пользователя прямо здесь, чтобы исключить ошибки импорта путей
interface NavbarUser {
  id?: number;
  full_name: string;
  telegram_id?: string | null;
  room_number?: string;
}

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser?: NavbarUser | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
}) => {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1976d2', mb: 3 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <LocalLaundryServiceIcon sx={{ display: 'flex', mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              mr: 4,
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              cursor: 'pointer',
            }}
            onClick={() => onTabChange('catalog')}
          >
            DormLaundry
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button
              onClick={() => onTabChange('catalog')}
              sx={{
                my: 2,
                color: 'white',
                backgroundColor: currentTab === 'catalog' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Стиральные машины
            </Button>
            <Button
              onClick={() => onTabChange('my-bookings')}
              sx={{
                my: 2,
                color: 'white',
                backgroundColor: currentTab === 'my-bookings' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Мои бронирования
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {currentUser ? (
              <>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                  {currentUser.full_name} ({currentUser.telegram_id || 'Студент'})
                </Typography>
                {onLogout && (
                  <Tooltip title="Выйти из аккаунта">
                    <IconButton
                      color="inherit"
                      onClick={onLogout}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                      }}
                    >
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => onTabChange('login')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                Войти
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;