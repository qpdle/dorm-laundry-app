import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => onTabChange('catalog')}
          >
            <LocalLaundryServiceIcon color="primary" />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              DormLaundry
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={currentTab === 'catalog' ? 'contained' : 'text'}
              onClick={() => onTabChange('catalog')}
            >
              Оборудование
            </Button>
            <Button
              variant={currentTab === 'my-bookings' ? 'contained' : 'text'}
              onClick={() => onTabChange('my-bookings')}
            >
              Мои записи
            </Button>
            <Button
              variant={currentTab === 'login' ? 'outlined' : 'text'}
              onClick={() => onTabChange('login')}
            >
              Вход
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};