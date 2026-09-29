import { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useNavigate } from 'react-router-dom';
import { initialMachines } from '../data/mockData';
import type { Machine, MachineStatus, MachineType } from '../types/types';

export const MachinesPage = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [filter, setFilter] = useState<'all' | MachineType>('all');

  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: 'all' | MachineType | null,
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const getStatusChip = (status: MachineStatus) => {
    switch (status) {
      case 'available':
        return <Chip label="Свободна" color="success" size="small" />;
      case 'busy':
        return <Chip label="Занята" color="warning" size="small" />;
      case 'broken':
        return <Chip label="Не работает" color="error" size="small" />;
    }
  };

  const toggleStatusByAdmin = (id: number) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus: MachineStatus = m.status === 'broken' ? 'available' : 'broken';
          return { ...m, status: nextStatus };
        }
        return m;
      }),
    );
  };

  const filteredMachines = machines.filter((machine) => {
    if (filter === 'all') return true;
    return machine.type === filter;
  });

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: { xs: '1.6rem', sm: '2.1rem' } }}>
            Прачечная общежития
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Выберите доступную машину для просмотра расписания и записи
          </Typography>
        </div>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, display: 'flex' }}
        >
          <ToggleButton value="all" sx={{ flexGrow: { xs: 1, sm: 0 } }}>Все</ToggleButton>
          <ToggleButton value="washer" sx={{ flexGrow: { xs: 1, sm: 0 } }}>Стиралки</ToggleButton>
          <ToggleButton value="dryer" sx={{ flexGrow: { xs: 1, sm: 0 } }}>Сушилки</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {filteredMachines.map((machine) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={machine.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  {machine.type === 'washer' ? (
                    <LocalLaundryServiceIcon color="primary" sx={{ fontSize: 36 }} />
                  ) : (
                    <LocalFireDepartmentIcon color="warning" sx={{ fontSize: 36 }} />
                  )}
                  {getStatusChip(machine.status)}
                </Box>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  {machine.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Тип: {machine.type === 'washer' ? 'Стиральная' : 'Сушильная'}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={machine.status === 'broken'}
                  onClick={() => navigate(`/machine/${machine.id}`)}
                >
                  {machine.status === 'broken' ? 'Недоступна' : 'Смотреть слоты'}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={() => toggleStatusByAdmin(machine.id)}
                >
                  (Админ) {machine.status === 'broken' ? 'Активировать' : 'Пометить сломанной'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};