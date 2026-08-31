import React from 'react';
import { Box, Card, CardContent, Skeleton, useTheme } from '@mui/material';

export const StatCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" sx={{ fontSize: '0.75rem' }} />
          <Skeleton variant="text" width="80%" sx={{ fontSize: '1.25rem' }} />
        </Box>
      </CardContent>
    </Card>
  );
};
