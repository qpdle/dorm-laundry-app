import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grow } from '@mui/material';
import { MachineCard } from '../../entities/machine/MachineCard';
import { MachineFilters } from '../../features/filter-machines/MachineFilters';
import { LoadingState } from '../../shared/ui/LoadingState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { EmptyState } from '../../shared/ui/EmptyState';
import type { LaundryMachine } from '../../shared/types';
import { fetchMachines } from '../../shared/api/laundryApi';

interface MachinesPageProps {
  onSelectMachine: (machine: LaundryMachine) => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({ onSelectMachine }) => {
  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');

  const loadMachinesData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Реальный сетевой запрос к базе данных PostgreSQL через FastAPI
      const data = await fetchMachines();
      setMachines(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось связаться с сервером базы данных (PostgreSQL). Проверьте работу backend.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Оборудование прачечной
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Выберите доступную стиральную или сушильную машину для бронирования слота.
        </Typography>
      </Box>

      {/* 1. Состояние ошибки */}
      {errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={loadMachinesData}
        />
      )}

      {/* 2. Состояние загрузки */}
      {isLoading && <LoadingState message="Получение актуального списка оборудования из базы данных..." />}

      {/* 3. Каталог машин */}
      {!isLoading && !errorMessage && (
        <>
          <MachineFilters
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
            selectedFloor={floorFilter}
            onFloorChange={setFloorFilter}
          />

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
              {filteredMachines.map((machine, index) => (
                <Grow
                  key={machine.id}
                  in={true}
                  style={{ transformOrigin: '0 0 0' }}
                  timeout={Math.min((index + 1) * 200, 1000)}
                >
                  <Box>
                    <MachineCard machine={machine} onSelect={onSelectMachine} />
                  </Box>
                </Grow>
              ))}
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default MachinesPage;