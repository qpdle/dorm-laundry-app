import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import { Link as RouterLink } from 'react-router-dom';

export const Navbar = () => {
  return (
    <AppBar position="static" sx={{ mb: 4, backgroundColor: '#1976d2' }}>
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 1, sm: 0 },
          }}
        >
          {/* Левый блок: Логотип + кнопки навигации на десктопе */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalLaundryServiceIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 3,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                letterSpacing: '.05rem',
              }}
            >
              DormLaundry
            </Typography>

            {/* Навигация на экранах от планшета и выше */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              <Button
                component={RouterLink}
                to="/"
                sx={{ color: 'white', textTransform: 'none' }}
              >
                Машинки
              </Button>
              <Button
                component={RouterLink}
                to="/my-bookings"
                sx={{ color: 'white', textTransform: 'none' }}
              >
                Мои записи
              </Button>
            </Box>
          </Box>

          {/* Правый блок: Кнопка входа */}
          <Box>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Войти
            </Button>
          </Box>

          {/* Навигация для мобильных телефонов (выносится вниз под логотип) */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              width: '100%',
              justifyContent: 'center',
              gap: 2,
              mt: 1,
              pt: 0.5,
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Button
              component={RouterLink}
              to="/"
              size="small"
              sx={{ color: 'white', textTransform: 'none' }}
            >
              Машинки
            </Button>
            <Button
              component={RouterLink}
              to="/my-bookings"
              size="small"
              sx={{ color: 'white', textTransform: 'none' }}
            >
              Мои записи
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};