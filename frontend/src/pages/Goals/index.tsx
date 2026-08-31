import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { api } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { GoalModal } from './components/GoalModal';
import type { Goal as EditableGoal } from './components/GoalModal';
import { ContributionModal } from './components/ContributionModal';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string | null;
  color: string;
  currentAmount: number;
  progress: number;
  completed: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => {
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

const GoalCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width="60%" sx={{ fontSize: '1rem' }} />
        </Box>
        <Skeleton variant="rounded" height={8} sx={{ borderRadius: 4, mb: 1 }} />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  );
};

export const Goals: React.FC = () => {
  const theme = useTheme();
  const { notify } = useNotification();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<EditableGoal | null>(null);

  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      notify('Erro ao carregar metas. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/goals/${deleteId}`);
      notify('Meta excluída com sucesso!', 'success');
      loadGoals();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      notify('Erro ao excluir meta. Tente novamente.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreateModal}
          sx={{ borderRadius: 2, px: 2.5, py: 1, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
        >
          Nova Meta
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <GoalCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<SavingsRoundedIcon />}
          message="Nenhuma meta cadastrada ainda. Que tal criar a primeira?"
        />
      ) : (
        <Grid container spacing={2}>
          {goals.map((goal) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={goal.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          bgcolor: alpha(goal.color, 0.12),
                          color: goal.color,
                        }}
                      >
                        {goal.completed ? <CheckCircleRoundedIcon /> : <SavingsRoundedIcon />}
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {goal.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title="Depositar/Sacar">
                        <IconButton size="small" onClick={() => setContributionGoal(goal)}>
                          <SwapVertRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEditModal(goal)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="default" onClick={() => setDeleteId(goal.id)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(goal.color, 0.15),
                        mb: 1,
                        '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: goal.color },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(goal.currentAmount)}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}/ {formatCurrency(goal.targetAmount)}
                        </Typography>
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: goal.color }}>
                        {goal.progress.toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      {goal.targetDate ? (
                        <Typography variant="caption" color="text.secondary">
                          Até {formatDate(goal.targetDate)}
                        </Typography>
                      ) : (
                        <span />
                      )}
                      {goal.completed && (
                        <Chip
                          label="Concluída"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 600, borderRadius: 1.5 }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <GoalModal
        open={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSaved={loadGoals}
        goal={editingGoal}
      />

      <ContributionModal
        open={!!contributionGoal}
        onClose={() => setContributionGoal(null)}
        onSaved={loadGoals}
        goalId={contributionGoal?.id ?? null}
        goalName={contributionGoal?.name}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir meta"
        message="Tem certeza que deseja excluir esta meta? Todo o histórico de depósitos e saques dela também será removido."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </Box>
  );
};
