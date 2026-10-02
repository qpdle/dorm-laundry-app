import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { MachineCard } from '../../entities/machine/MachineCard';
import { MachineFilters } from '../../features/filter-machines/MachineFilters';
import { LoadingState } from '../../shared/ui/LoadingState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { EmptyState } from '../../shared/ui/EmptyState';
import type { LaundryMachine } from '../../shared/types';

const mockMachines: LaundryMachine[] = [
  { id: 1, name: 'Стиральная машина №1', machine_type: 'washer', floor: 1, status: 'available', created_at: new Date().toISOString() },
  { id: 2, name: 'Стиральная машина №2', machine_type: 'washer', floor: 1, status: 'in_use', created_at: new Date().toISOString() },
  { id: 3, name: 'Сушилка Bosch №1', machine_type: 'dryer', floor: 2, status: 'available', created_at: new Date().toISOString() },
  { id: 4, name: 'Сушилка LG №2', machine_type: 'dryer', floor: 2, status: 'maintenance', created_at: new Date().toISOString() },
];

interface MachinesPageProps {
  onSelectMachine: (machine: LaundryMachine) => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({ onSelectMachine }) => {
  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');

  // Имитация асинхронного сетевого запроса к бэкенду
  const loadMachinesData = (simulateError: boolean = false) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      if (simulateError) {
        setErrorMessage('Не удалось связаться с сервером базы данных (PostgreSQL). Проверьте работу backend.');
        setIsLoading(false);
      } else {
        setMachines(mockMachines);
        setIsLoading(false);
      }
    }, 700);
  };

  useEffect(() => {
    loadMachinesData();
  }, []);

  const filteredMachines = machines.filter((m) => {
    const matchesType = typeFilter === 'all' || m.machine_type === typeFilter;
    const matchesFloor = floorFilter === 'all' || m.floor === floorFilter;
    return matchesType && matchesFloor;
  });

  const handleResetFilters = () => {
    setTypeFilter('all');
    setFloorFilter('all');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Оборудование прачечной
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Выберите доступную стиральную или сушильную машину для бронирования слота.
          </Typography>
        </Box>

        {/* Кнопка демонстрации состояния ошибки для отчёта */}
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={() => loadMachinesData(true)}
        >
          Симулировать сбой сети
        </Button>
      </Box>

      {/* 1. Состояние ошибки */}
      {errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={() => loadMachinesData(false)}
        />
      )}

      {/* 2. Состояние загрузки */}
      {isLoading && <LoadingState message="Получение актуального статуса оборудования..." />}

      {/* 3. Основной контент при успешной загрузке */}
      {!isLoading && !errorMessage && (
        <>
          <MachineFilters
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
            selectedFloor={floorFilter}
            onFloorChange={setFloorFilter}
          />

          {/* Состояние отсутствия данных (когда фильтры дали пустой результат) */}
          {filteredMachines.length === 0 ? (
            <EmptyState
              title="Машины не найдены"
              description="Нет оборудования, соответствующего выбранным параметрам этажа или типа."
              actionText="Сбросить фильтры"
              onAction={handleResetFilters}
            />
          ) : (
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
          )}
        </>
      )}
    </Container>
  );
};