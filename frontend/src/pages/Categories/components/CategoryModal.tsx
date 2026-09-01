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
  Typography,
} from '@mui/material';

import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { api } from '../../../services/api';
import { ACCENT_COLORS } from '../../../constants/accentColors';
import { CATEGORY_ICONS, CATEGORY_ICON_KEYS, DEFAULT_CATEGORY_ICON } from '../../../constants/categoryIcons';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
  budget: number | null;
  createdAt: string;
}

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (category: Category) => void;

  category?: Category | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onClose,
  onSaved,
  category,
}) => {
  const [name, setName] = useState('');

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(
    'EXPENSE',
  );

  const [color, setColor] = useState(ACCENT_COLORS[0]);
  const [icon, setIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [budget, setBudget] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color);
      setIcon(category.icon);
      setBudget(category.budget != null ? String(category.budget) : '');
    } else {
      setName('');
      setType('EXPENSE');
      setColor(ACCENT_COLORS[0]);
      setIcon(DEFAULT_CATEGORY_ICON);
      setBudget('');
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

      const data = {
        name: name.trim(),
        color,
        icon,
        type,
        budget: budget ? Number(budget) : null,
      };

      const response = category
        ? await api.put(`/categories/${category.id}`, data)
        : await api.post('/categories', data);

      onSaved(response.data);

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

          {/* Limite mensal (só faz sentido para despesas) */}

          {type === 'EXPENSE' && (
            <TextField
              label="Limite mensal (opcional)"
              placeholder="Ex: 500,00"
              type="number"
              fullWidth
              size="small"
              slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              helperText="Deixe em branco para não definir um limite"
            />
          )}

          {/* Ícone da categoria */}

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Ícone
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {CATEGORY_ICON_KEYS.map((key) => {
                const IconComponent = CATEGORY_ICONS[key];
                const isSelected = icon === key;
                return (
                  <Box
                    key={key}
                    onClick={() => setIcon(key)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: isSelected ? color : 'action.hover',
                      color: isSelected ? '#fff' : 'text.secondary',
                      transition: 'background-color 0.15s, color 0.15s',
                    }}
                  >
                    <IconComponent fontSize="small" />
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Cor da categoria */}

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Cor
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {ACCENT_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </Box>
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