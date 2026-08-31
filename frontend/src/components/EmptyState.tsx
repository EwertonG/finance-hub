import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  action?: React.ReactNode;
  variant?: 'card' | 'dashed';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, action, variant = 'card' }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 'none',
        border: variant === 'dashed' ? `1px dashed ${theme.palette.divider}` : `1px solid ${theme.palette.divider}`,
        p: 4,
        textAlign: 'center',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        {icon && (
          <Box sx={{ color: 'text.disabled', display: 'flex', '& svg': { fontSize: 40 } }}>{icon}</Box>
        )}
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {action}
      </Box>
    </Card>
  );
};
