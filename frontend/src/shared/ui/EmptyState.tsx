import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Ничего не найдено',
  description = 'По выбранным критериям фильтрации нет доступных элементов.',
  actionText,
  onAction,
}) => {
  return (
    <Box
      sx={{
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: onAction ? 3 : 0, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};