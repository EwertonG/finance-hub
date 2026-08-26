import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import { api } from '../../services/api';

import { CategoryModal } from './components/CategoryModal';

interface Category {
  id: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
}

const getCategoryIcon = (categoryName: string) => {
  const normalizedName = categoryName.trim().toLowerCase();
  if (normalizedName.includes('aliment') || normalizedName.includes('comida') || normalizedName.includes('restaurante')) return <RestaurantRoundedIcon />;
  if (normalizedName.includes('supermercado') || normalizedName.includes('mercado') || normalizedName.includes('compras')) return <ShoppingCartRoundedIcon />;
  if (normalizedName.includes('transporte') || normalizedName.includes('combustível') || normalizedName.includes('combustivel') || normalizedName.includes('ônibus') || normalizedName.includes('onibus') || normalizedName.includes('uber')) return <DirectionsBusRoundedIcon />;
  if (normalizedName.includes('moradia') || normalizedName.includes('casa') || normalizedName.includes('aluguel')) return <HomeRoundedIcon />;
  if (normalizedName.includes('lazer') || normalizedName.includes('jogo') || normalizedName.includes('jogos') || normalizedName.includes('entretenimento')) return <SportsEsportsRoundedIcon />;
  if (normalizedName.includes('salário') || normalizedName.includes('salario') || normalizedName.includes('trabalho') || normalizedName.includes('emprego')) return <BusinessCenterRoundedIcon />;
  if (normalizedName.includes('investimento') || normalizedName.includes('investimentos') || normalizedName.includes('poupança') || normalizedName.includes('poupanca')) return <SavingsRoundedIcon />;
  
  return <MoreHorizRoundedIcon />;
};

export const Categories = () => {
  const theme = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCategory, setMenuCategory] = useState<Category | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    category: Category,
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuCategory(null);
  };

  const handleEditFromMenu = () => {
    if (!menuCategory) return;
    handleEditCategory(menuCategory);
    handleCloseMenu();
  };

  const handleDeleteFromMenu = async () => {
    if (!menuCategory) return;

    const isConfirmed = window.confirm(`Tem certeza que deseja excluir a categoria "${menuCategory.name}"?`);
    
    if (!isConfirmed) {
      handleCloseMenu();
      return;
    }

    try {
      await api.delete(`/categories/${menuCategory.id}`);
      showSnackbar('Categoria excluída com sucesso!', 'success');
      loadCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      showSnackbar('Erro ao excluir a categoria. Verifique se há transações vinculadas a ela.', 'error');
    } finally {
      handleCloseMenu();
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setError('Não foi possível carregar suas categorias.');
      showSnackbar('Erro ao carregar categorias. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleCategorySaved = () => {
    loadCategories();
    const successMessage = selectedCategory 
      ? 'Categoria atualizada com sucesso!' 
      : 'Categoria criada com sucesso!';
      
    showSnackbar(successMessage, 'success');
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={loadCategories}>Tentar novamente</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* CABEÇALHO */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Categorias
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Organize suas categorias para facilitar seus lançamentos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenModal}
          sx={{ borderRadius: 2, px: 2.5, py: 1, boxShadow: 'none' }}
        >
          Nova Categoria
        </Button>
      </Box>

      {/* LISTA DE CATEGORIAS */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {categories.map((category, index) => {
            const isIncome = category.type === 'INCOME';

            return (
              <Box
                key={category.id}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2,
                  borderBottom: index !== categories.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.2s',
                }}
              >
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: 2.5, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', bgcolor: alpha(category.color, 0.12), color: category.color,
                    flexShrink: 0, '& svg': { fontSize: 25 },
                  }}
                >
                  {getCategoryIcon(category.name)}
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {category.name}
                  </Typography>
                </Box>

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

                <IconButton size="small" onClick={(event) => handleOpenMenu(event, category)} sx={{ color: 'text.secondary' }}>
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* MENU SUSPENSO */}
      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleEditFromMenu}>Editar</MenuItem>

        <MenuItem 
            onClick={handleDeleteFromMenu} 
            sx={{ color: 'error.main' }}
          >
            Excluir
          </MenuItem>
        </Menu>

      {/* MODAL */}
      <CategoryModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onCreated={handleCategorySaved}
        category={selectedCategory}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%', color: '#fff' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};