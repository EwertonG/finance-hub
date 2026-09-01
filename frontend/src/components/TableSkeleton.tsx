import React from 'react';
import { Skeleton, TableCell, TableRow } from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
