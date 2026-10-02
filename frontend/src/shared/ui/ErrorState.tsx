import React from 'react';
import { Box, Alert, AlertTitle, Button } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ошибка загрузки',
  message,
  onRetry,
}) => {
  return (
    <Box sx={{ py: 4, width: '100%' }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<ReplayIcon />}
              onClick={onRetry}
            >
              Повторить
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};