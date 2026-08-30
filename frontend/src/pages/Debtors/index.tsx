import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  Snackbar,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [debtorsRes, summaryRes] = await Promise.all([
        api.get("/debtors", {
          params: statusFilter !== "ALL" ? { status: statusFilter } : {},
        }),
        api.get("/debtors/summary"),
      ]);
      setDebtors(debtorsRes.data);
      setSummary(summaryRes.data);
    } catch {
      showSnackbar("Erro ao carregar devedores. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (data: NewDebtorData) => {
    try {
      await api.post("/debtors", data);
      showSnackbar("Divisão registrada com sucesso!", "success");
      loadData();
    } catch {
      showSnackbar("Erro ao registrar divisão. Tente novamente.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/debtors/${deleteId}`);
      setDebtors((prev) => prev.filter((d) => d.id !== deleteId));
      showSnackbar("Devedor excluído com sucesso!", "success");
      loadData();
    } catch {
      showSnackbar("Erro ao excluir devedor.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editStatusDebtor) return;
    try {
      await api.put(`/debtors/${editStatusDebtor.id}`, { status: newStatus });
      showSnackbar("Status atualizado com sucesso!", "success");
      setEditStatusDebtor(null);
      loadData();
    } catch {
      showSnackbar("Erro ao atualizar status.", "error");
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
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PeopleRoundedIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Caderno de Devedores
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Gerencie divisões de conta e cobranças
            </Typography>
          </Box>
        </Box>
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
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                  {debtors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        <PeopleRoundedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                        <Typography variant="body2">Nenhum devedor encontrado</Typography>
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
      )}

      {/* Debtor Creation Modal */}
      <DebtorModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir devedor</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none" }}
          >
            {isDeleting ? <CircularProgress size={18} color="inherit" /> : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", color: "#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
