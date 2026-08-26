import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { api } from '../../../services/api';

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
}

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;

  category?: Category | null;
}

const CATEGORY_COLORS = {
  INCOME: '#10B981',
  EXPENSE: '#EF4444',
};

export const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onClose,
  onCreated,
  category,
}) => {
  const [name, setName] = useState('');

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(
    'EXPENSE',
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setName(category.name);
      setType(category.type);
    } else {
      setName('');
      setType('EXPENSE');
    }

    setIsSubmitting(false);
  }, [open, category]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const color = CATEGORY_COLORS[type];

      const data = {
        name: name.trim(),
        color,
        type,
      };

      if (category) {
        await api.put(`/categories/${category.id}`, data);
      } else {
        await api.post('/categories', data);
      }

      onCreated();

      onClose();
    } catch (error) {
      console.error(
        category
          ? 'Erro ao atualizar categoria:'
          : 'Erro ao criar categoria:',
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: 'INCOME' | 'EXPENSE' | null,
  ) => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const isEditing = Boolean(category);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            pt: 1,
          }}
        >
          {/* Nome da categoria */}

          <TextField
            label="Nome"
            placeholder="Ex: Alimentação"
            fullWidth
            required
            size="small"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />

          {/* Tipo da categoria */}

          <Box>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              size="small"
            >
              <ToggleButton
                value="EXPENSE"
                sx={{
                  gap: 1,
                  borderRadius: 2,
                  color: 'error.main',
                  fontWeight: 600,

                  '&.Mui-selected': {
                    bgcolor: 'error.light',
                    color: 'error.dark',

                    '&:hover': {
                      bgcolor: 'error.light',
                    },
                  },
                }}
              >
                <ArrowDownwardRoundedIcon fontSize="small" />
                Despesa
              </ToggleButton>

              <ToggleButton
                value="INCOME"
                sx={{
                  gap: 1,
                  borderRadius: 2,
                  color: 'success.main',
                  fontWeight: 600,

                  '&.Mui-selected': {
                    bgcolor: 'success.light',
                    color: 'success.dark',

                    '&:hover': {
                      bgcolor: 'success.light',
                    },
                  },
                }}
              >
                <ArrowUpwardRoundedIcon fontSize="small" />
                Receita
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            disabled={isSubmitting}
            sx={{
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={!name.trim() || isSubmitting}
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
            }}
          >
            {isSubmitting
              ? isEditing
                ? 'Salvando...'
                : 'Criando...'
              : isEditing
                ? 'Salvar'
                : 'Criar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};