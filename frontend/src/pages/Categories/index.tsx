import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  icon: React.ReactNode;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Alimentação',
    description: 'Gastos com alimentação',
    type: 'EXPENSE',
    icon: <RestaurantRoundedIcon />,
  },
  {
    id: '2',
    name: 'Salário',
    description: 'Entradas de trabalho',
    type: 'INCOME',
    icon: <AccountBalanceRoundedIcon />,
  },
  {
    id: '3',
    name: 'Lazer',
    description: 'Entretenimento e diversão',
    type: 'EXPENSE',
    icon: <SportsEsportsRoundedIcon />,
  },
];

export const Categories: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Categorias
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
            }}
          >
            Organize suas categorias para facilitar seus lançamentos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 1,
            boxShadow: 'none',
          }}
        >
          Nova Categoria
        </Button>
      </Box>

      {/* Lista de categorias */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <CardContent
          sx={{
            p: 0,
            '&:last-child': {
              pb: 0,
            },
          }}
        >
          {categories.map((category, index) => {
            const isIncome = category.type === 'INCOME';

            return (
              <Box
                key={category.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderBottom:
                    index !== categories.length - 1
                      ? `1px solid ${theme.palette.divider}`
                      : 'none',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                {/* Ícone */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isIncome ? 'success.light' : 'error.light',
                    color: isIncome ? 'success.dark' : 'error.dark',
                    flexShrink: 0,
                  }}
                >
                  {category.icon}
                </Box>

                {/* Informações */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {category.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mt: 0.25,
                    }}
                  >
                    {category.description}
                  </Typography>
                </Box>

                {/* Tipo */}
                <Chip
                  label={isIncome ? 'Receita' : 'Despesa'}
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: isIncome ? 'success.light' : 'error.light',
                    color: isIncome ? 'success.dark' : 'error.dark',
                    fontWeight: 600,
                  }}
                />

                {/* Ações */}
                <IconButton
                  size="small"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </CardContent>
      </Card>
    </Box>
  );
};