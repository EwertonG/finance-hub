import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Divider,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { useCategories } from "../../../hooks/useCategories";

export interface NewDebtorData {
  item: string;
  totalAmount: number;
  people: string[];
  mySplit: boolean;
  categoryId?: string;
  date: string;
}

interface DebtorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewDebtorData) => void;
}

export const DebtorModal: React.FC<DebtorModalProps> = ({ open, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  const [item, setItem] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [mySplit, setMySplit] = useState(true);
  const [date, setDate] = useState(today);
  const [categoryId, setCategoryId] = useState("");
  const [personInput, setPersonInput] = useState("");
  const [people, setPeople] = useState<string[]>([]);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  const handleAddPerson = () => {
    const trimmed = personInput.trim();
    if (trimmed && !people.includes(trimmed)) {
      setPeople((prev) => [...prev, trimmed]);
    }
    setPersonInput("");
  };

  const handlePersonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPerson();
    }
  };

  const handleRemovePerson = (name: string) => {
    setPeople((prev) => prev.filter((p) => p !== name));
  };

  const totalParts = mySplit ? people.length + 1 : people.length;
  const individualAmount =
    totalParts > 0 && totalAmount
      ? (parseFloat(totalAmount) / totalParts).toFixed(2)
      : "0.00";

  const resetForm = () => {
    setItem("");
    setTotalAmount("");
    setMySplit(true);
    setDate(today);
    setCategoryId("");
    setPeople([]);
    setPersonInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !totalAmount || people.length === 0) return;
    onSubmit({
      item,
      totalAmount: parseFloat(totalAmount),
      people,
      mySplit,
      categoryId: categoryId || undefined,
      date,
    });
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <PeopleRoundedIcon color="primary" />
        Nova Divisão de Conta
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Descrição do Item"
            placeholder="Ex: Jantar no restaurante"
            fullWidth
            required
            size="small"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
          <TextField
            label="Valor Total (R$)"
            type="number"
            placeholder="0,00"
            fullWidth
            required
            size="small"
            slotProps={{ htmlInput: { step: "0.01", min: "0.01" } }}
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />
          <TextField
            label="Data"
            type="date"
            fullWidth
            required
            size="small"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="Categoria (opcional)"
            fullWidth
            size="small"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isLoadingCategories}
            slotProps={{
              input: {
                startAdornment: isLoadingCategories ? (
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                ) : null,
              },
            }}
          >
            <MenuItem value="">Sem categoria</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <Divider />
          <FormControlLabel
            control={
              <Switch
                checked={mySplit}
                onChange={(e) => setMySplit(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{fontWeight:600}}>
                  Incluir minha parte
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ao ativar, uma despesa será registrada automaticamente para você
                </Typography>
              </Box>
            }
          />
          <Divider />
          <Box>
            <Typography variant="body2" sx={{fontWeight:600, mb:1}}>
              Pessoas que devem pagar
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Nome da pessoa"
                placeholder="Ex: João"
                size="small"
                fullWidth
                value={personInput}
                onChange={(e) => setPersonInput(e.target.value)}
                onKeyDown={handlePersonKeyDown}
              />
              <IconButton
                onClick={handleAddPerson}
                disabled={!personInput.trim()}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "action.disabledBackground" },
                }}
              >
                <AddRoundedIcon />
              </IconButton>
            </Box>
            {people.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                {people.map((person) => (
                  <Chip
                    key={person}
                    label={person}
                    onDelete={() => handleRemovePerson(person)}
                    deleteIcon={<CloseRoundedIcon />}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                ))}
              </Box>
            )}
          </Box>
          {people.length > 0 && totalAmount && (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "primary.main",
                borderRadius: 2,
                p: 2,
                bgcolor: "#f0f7ff",
                opacity: 0.9,
              }}
            >
              <Typography variant="body2" sx={{color:"text.secondary", mb:0.5}}>
                Cálculo da divisão
              </Typography>
              <Typography variant="body1" sx={{fontWeight:700, color: "primary.main"}}>
                R$ {individualAmount} por pessoa
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {totalParts} {totalParts === 1 ? "parte" : "partes"} ·{" "}
                {mySplit
                  ? `${people.length} amigo(s) + você`
                  : `${people.length} amigo(s)`}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!item || !totalAmount || people.length === 0}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
