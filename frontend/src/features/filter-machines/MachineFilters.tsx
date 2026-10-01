import React from 'react';
import { Box, Tabs, Tab, FormControl, Select, MenuItem, InputLabel } from '@mui/material';

interface MachineFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedFloor: number | 'all';
  onFloorChange: (floor: number | 'all') => void;
}

export const MachineFilters: React.FC<MachineFiltersProps> = ({
  selectedType,
  onTypeChange,
  selectedFloor,
  onFloorChange,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
      <Tabs
        value={selectedType}
        onChange={(_, val) => onTypeChange(val)}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="all" label="Все" />
        <Tab value="washer" label="Стиралки" />
        <Tab value="dryer" label="Сушилки" />
      </Tabs>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="floor-select-label">Этаж</InputLabel>
        <Select
          labelId="floor-select-label"
          value={selectedFloor}
          label="Этаж"
          onChange={(e) => onFloorChange(e.target.value as number | 'all')}
        >
          <MenuItem value="all">Все этажи</MenuItem>
          <MenuItem value={1}>1 этаж</MenuItem>
          <MenuItem value={2}>2 этаж</MenuItem>
          <MenuItem value={3}>3 этаж</MenuItem>
          <MenuItem value={4}>4 этаж</MenuItem>
          <MenuItem value={5}>5 этаж</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};