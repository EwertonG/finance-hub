import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { DebtorModal } from "./components/DebtorModal";
import type { NewDebtorData } from "./components/DebtorModal";
import { api } from "../../services/api";
import { useNotification } from '../../contexts/NotificationContext';
import { usePeriod } from '../../contexts/PeriodContext';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TableSkeleton } from '../../components/TableSkeleton';

interface Debtor {
  id: string;
  personName: string;
  item: string;
  amount: number;
  totalAmount: number;
  status: "PENDING" | "CHARGED" | "PAID";
  date: string;
}

interface DebtorSummary {
  totalPending: number;
  totalCharged: number;
  totalPaid: number;
  totalToReceive: number;
  totalOverall: number;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Pendente",
    color: "warning" as const,
    icon: <HourglassEmptyRoundedIcon fontSize="small" />,
  },
  CHARGED: {
    label: "Cobrado",
    color: "info" as const,
    icon: <NotificationsActiveRoundedIcon fontSize="small" />,
  },
  PAID: {
    label: "Pago",
    color: "success" as const,
    icon: <CheckCircleRoundedIcon fontSize="small" />,
  },
};

const PAGE_SIZE = 10;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (dateString: string) => {
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
};

export const Debtors: React.FC = () => {
  const theme = useTheme();

  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [summary, setSummary] = useState<DebtorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status update dialog
  const [editStatusDebtor, setEditStatusDebtor] = useState<Debtor | null>(null);
  const [newStatus, setNewStatus] = useState<"PENDING" | "CHARGED" | "PAID">("PENDING");

  const { notify } = useNotification();
  const { month, year, viewMode } = usePeriod();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Em modo mensal filtra pelo mês corrente; em modo anual usa o ano
      // inteiro (o backend aceita "year" sozinho para esse caso).
      const periodParams = viewMode === "monthly" ? { month, year } : { year };
      const [debtorsRes, summaryRes] = await Promise.all([
        api.get("/debtors", {
          params: {
            ...periodParams,
            ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
            page,
            limit: PAGE_SIZE,
          },
        }),
        api.get("/debtors/summary", { params: periodParams }),
      ]);
      setDebtors(debtorsRes.data.data);
      setTotalPages(debtorsRes.data.totalPages);
      setSummary(summaryRes.data);
    } catch {
      notify("Erro ao carregar devedores. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, month, year, viewMode, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Muda filtro ou período reseta a página, que pode não existir mais no
  // novo recorte.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, month, year, viewMode]);

  const handleCreate = async (data: NewDebtorData) => {
    try {
      await api.post("/debtors", data);
      notify("Divisão registrada com sucesso!", "success");
      loadData();
    } catch {
      notify("Erro ao registrar divisão. Tente novamente.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/debtors/${deleteId}`);
      setDebtors((prev) => prev.filter((d) => d.id !== deleteId));
      notify("Devedor excluído com sucesso!", "success");
      loadData();
    } catch {
      notify("Erro ao excluir devedor.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editStatusDebtor) return;
    try {
      await api.put(`/debtors/${editStatusDebtor.id}`, { status: newStatus });
      notify("Status atualizado com sucesso!", "success");
      setEditStatusDebtor(null);
      loadData();
    } catch {
      notify("Erro ao atualizar status.", "error");
    }
  };

  const openEditStatus = (debtor: Debtor) => {
    setEditStatusDebtor(debtor);
    setNewStatus(debtor.status);
  };

  const summaryCards = [
    {
      title: "A Receber",
      value: summary?.totalToReceive ?? 0,
      icon: <AccountBalanceWalletRoundedIcon />,
      color: theme.palette.primary.main,
      bgcolor: "#f0f7ff",
      description: "Pendente + Cobrado",
    },
    {
      title: "Pendente",
      value: summary?.totalPending ?? 0,
      icon: <HourglassEmptyRoundedIcon />,
      color: theme.palette.warning.main,
      bgcolor: "#fffbf0",
      description: "Ainda não cobrado",
    },
    {
      title: "Cobrado",
      value: summary?.totalCharged ?? 0,
      icon: <NotificationsActiveRoundedIcon />,
      color: theme.palette.info.main,
      bgcolor: "#f0f8ff",
      description: "Aguardando pagamento",
    },
    {
      title: "Recebido",
      value: summary?.totalPaid ?? 0,
      icon: <CheckCircleRoundedIcon />,
      color: theme.palette.success.main,
      bgcolor: "#f0fff4",
      description: "Já pago",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Barra de Ações Superior */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
          }}
        >
          Nova Divisão
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {summaryCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "none",
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: card.bgcolor,
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: card.color,
                      color: "white",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: card.color }}>
                      {formatCurrency(card.value)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filtrar por status</InputLabel>
          <Select
            value={statusFilter}
            label="Filtrar por status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="PENDING">Pendente</MenuItem>
            <MenuItem value="CHARGED">Cobrado</MenuItem>
            <MenuItem value="PAID">Pago</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "none",
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Pessoa</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Valor Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Parte Dela</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={5} columns={7} />
                ) : debtors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        variant="plain"
                        icon={<PeopleRoundedIcon />}
                        message="Nenhum devedor encontrado"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                    debtors.map((debtor) => {
                      const statusCfg = STATUS_CONFIG[debtor.status];
                      return (
                        <TableRow
                          key={debtor.id}
                          hover
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {debtor.personName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {debtor.item}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(debtor.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(debtor.totalAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                              {formatCurrency(debtor.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusCfg.icon}
                              label={statusCfg.label}
                              size="small"
                              color={statusCfg.color}
                              variant="outlined"
                              sx={{ fontWeight: 600, borderRadius: 1.5 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                              <Tooltip title="Atualizar status">
                                <IconButton size="small" onClick={() => openEditStatus(debtor)}>
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => setDeleteId(debtor.id)}
                                >
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {!isLoading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Debtor Creation Modal */}
      <DebtorModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Excluir devedor"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />

      {/* Edit Status Dialog */}
      <Dialog
        open={!!editStatusDebtor}
        onClose={() => setEditStatusDebtor(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Atualizar Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Atualize o status de <strong>{editStatusDebtor?.personName}</strong> para o item{" "}
            <strong>{editStatusDebtor?.item}</strong>.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Novo status</InputLabel>
            <Select
              value={newStatus}
              label="Novo status"
              onChange={(e) => setNewStatus(e.target.value as "PENDING" | "CHARGED" | "PAID")}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="PENDING">Pendente</MenuItem>
              <MenuItem value="CHARGED">Cobrado</MenuItem>
              <MenuItem value="PAID">Pago</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditStatusDebtor(null)}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none" }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
