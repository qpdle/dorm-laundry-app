import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { initialSlots, initialMachines } from '../data/mockData';
import type { BookingSlot } from '../types/types';

export const SchedulePage = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();

  const machine = initialMachines.find((m) => m.id === Number(machineId));
  const [slots, setSlots] = useState<BookingSlot[]>(initialSlots);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleBookSlot = (slotId: number, slotTime: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, isBooked: true, bookedBy: 'Текущий студент' } : slot,
      ),
    );
    setSuccessMessage(`Слот ${slotTime} успешно забронирован!`);
  };

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Назад к списку машин
      </Button>

      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        {machine ? machine.name : `Машина #${machineId}`}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Расписание на сегодня. Длительность одной стирки/сушки — 1 час.
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={2}>
        {slots.map((slot) => (
          <Grid size={{ xs: 12, sm: 6 }} key={slot.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: slot.isBooked ? '#f9f9f9' : '#ffffff',
                borderLeft: slot.isBooked ? '4px solid #ed6c02' : '4px solid #2e7d32',
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {slot.time}
                </Typography>
                {slot.isBooked ? (
                  <Chip label={`Занято: ${slot.bookedBy || 'Студент'}`} size="small" color="warning" />
                ) : (
                  <Chip label="Свободно" size="small" color="success" />
                )}
              </Box>

              <Button
                variant={slot.isBooked ? 'outlined' : 'contained'}
                size="small"
                disabled={slot.isBooked}
                onClick={() => handleBookSlot(slot.id, slot.time)}
              >
                {slot.isBooked ? 'Занято' : 'Занять'}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};