import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Button } from '@mui/material';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import WavesIcon from '@mui/icons-material/Waves';
import type { LaundryMachine } from '../../shared/types';

interface MachineCardProps {
  machine: LaundryMachine;
  onSelect?: (machine: LaundryMachine) => void;
}

const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
  available: 'success',
  in_use: 'warning',
  maintenance: 'error',
};

const statusLabels: Record<string, string> = {
  available: 'Свободна',
  in_use: 'Занята',
  maintenance: 'Не работает',
};

export const MachineCard: React.FC<MachineCardProps> = ({ machine, onSelect }) => {
  const isAvailable = machine.status === 'available';

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {machine.machine_type === 'washer' ? (
              <LocalLaundryServiceIcon color="primary" />
            ) : (
              <WavesIcon color="secondary" />
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {machine.name}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={statusLabels[machine.status] || machine.status}
            color={statusColors[machine.status] || 'default'}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Этаж: {machine.floor}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Тип: {machine.machine_type === 'washer' ? 'Стиральная машина' : 'Сушилка'}
        </Typography>

        {onSelect && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={!isAvailable}
              onClick={() => onSelect(machine)}
            >
              {isAvailable ? 'Выбрать время' : 'Недоступна'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};