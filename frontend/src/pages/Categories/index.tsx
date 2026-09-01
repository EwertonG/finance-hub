import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';

import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

import { CategoryModal } from './components/CategoryModal';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { getCategoryIconComponent } from '../../constants/categoryIcons';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
}

export const Categories = () => {
  const theme = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { notify } = useNotification();

  // Otimista: some da lista e fecha o diálogo na hora; só volta a consultar
  // o servidor se a exclusão falhar.
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    const previousCategories = categories;

    setCategories((prev) => prev.filter((c) => c.id !== idToDelete));
    setDeleteId(null);

    try {
      await api.delete(`/categories/${idToDelete}`);
      notify('Categoria excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      setCategories(previousCategories);
      notify('Erro ao excluir a categoria. Verifique se há transações vinculadas a ela.', 'error');
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
      notify('Erro ao carregar categorias. Tente novamente.', 'error');
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

  // Usa a resposta da própria chamada de criar/editar pra atualizar a lista
  // local, sem precisar buscar tudo de novo no servidor.
  const handleCategorySaved = (savedCategory: Category) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === savedCategory.id);
      return exists
        ? prev.map((c) => (c.id === savedCategory.id ? savedCategory : c))
        : [...prev, savedCategory];
    });

    notify(selectedCategory ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!', 'success');
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

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
      {isLoading ? (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2,
                  borderBottom: index !== 4 ? `1px solid ${theme.palette.divider}` : 'none',
                }}
              >
                <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2.5, flexShrink: 0 }} />
                <Skeleton variant="text" sx={{ flexGrow: 1, fontSize: '1rem' }} />
                <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 1.5 }} />
              </Box>
            ))}
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <EmptyState icon={<CategoryRoundedIcon />} message="Nenhuma categoria encontrada" />
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            {categories.map((category, index) => {
              const isIncome = category.type === 'INCOME';
              const CategoryIcon = getCategoryIconComponent(category.icon);

              return (
                <Box
                  key={category.id}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 }, py: 2,
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
                    <CategoryIcon />
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

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEditCategory(category)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="default" onClick={() => setDeleteId(category.id)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* MODAL */}
      <CategoryModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSaved={handleCategorySaved}
        category={selectedCategory}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir categoria"
        message="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};