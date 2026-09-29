import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import { Link as RouterLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <AppBar position="static" sx={{ mb: 4, backgroundColor: '#1976d2' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <LocalLaundryServiceIcon sx={{ display: 'flex', mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 4,
              display: 'flex',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DormLaundry
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Машинки
            </Button>
            <Button
              component={RouterLink}
              to="/my-bookings"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Мои записи
            </Button>
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="inherit"
              size="small"
            >
              Войти
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};