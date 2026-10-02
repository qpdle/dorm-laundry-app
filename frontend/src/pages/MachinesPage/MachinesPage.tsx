import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { MachineCard } from '../../entities/machine/MachineCard';
import { MachineFilters } from '../../features/filter-machines/MachineFilters';
import type { LaundryMachine } from '../../shared/types';

// Демонстрационные данные оборудования
const initialMachines: LaundryMachine[] = [
  {
    id: 1,
    name: 'Стиральная машина №1',
    machine_type: 'washer',
    floor: 1,
    status: 'available',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Стиральная машина №2',
    machine_type: 'washer',
    floor: 1,
    status: 'in_use',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Сушилка Bosch №1',
    machine_type: 'dryer',
    floor: 2,
    status: 'available',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Сушилка LG №2',
    machine_type: 'dryer',
    floor: 2,
    status: 'maintenance',
    created_at: new Date().toISOString(),
  },
];

interface MachinesPageProps {
  onSelectMachine: (machine: LaundryMachine) => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({ onSelectMachine }) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');

  const filteredMachines = initialMachines.filter((m) => {
    const matchesType = typeFilter === 'all' || m.machine_type === typeFilter;
    const matchesFloor = floorFilter === 'all' || m.floor === floorFilter;
    return matchesType && matchesFloor;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Оборудование прачечной
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Выберите доступную стиральную или сушильную машину для бронирования слота.
        </Typography>
      </Box>

      <MachineFilters
        selectedType={typeFilter}
        onTypeChange={setTypeFilter}
        selectedFloor={floorFilter}
        onFloorChange={setFloorFilter}
      />

      {/* Адаптивная CSS-сетка через Box без конфликтов версий MUI Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {filteredMachines.map((machine) => (
          <Box key={machine.id}>
            <MachineCard machine={machine} onSelect={onSelectMachine} />
          </Box>
        ))}
      </Box>
    </Container>
  );
};