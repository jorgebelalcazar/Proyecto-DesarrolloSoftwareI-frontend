import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import MultiSelectChips from "./MultiSelectChips";

const emptyForm = { nombre: "", correo: "", roles: [], lineas: [] };

/** Reusable UI dialog. The parent owns persistence and supplies onCreateUser. */
export default function CreateUserDialog({
  open,
  onClose,
  onCreateUser,
  rolesDisponibles = [],
  lineasDisponibles = [],
  loading = false,
}) {
  const [form, setForm] = useState(emptyForm);

  const closeDialog = () => {
    if (loading) return;
    setForm(emptyForm);
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    await onCreateUser({
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      roles: form.roles,
      lineas: form.lineas,
    });
    setForm(emptyForm);
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-user-title"
    >
      <DialogTitle id="create-user-title">Crear usuario</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2.5 }}>
          Registra los datos del miembro y asigna sus roles y líneas temáticas.
        </DialogContentText>
        <Stack component="form" id="create-user-form" spacing={2.5} onSubmit={submit}>
          <TextField
            autoFocus
            required
            fullWidth
            label="Nombre completo"
            value={form.nombre}
            onChange={(event) => setForm((actual) => ({ ...actual, nombre: event.target.value }))}
            autoComplete="name"
          />
          <TextField
            required
            fullWidth
            type="email"
            label="Correo electrónico"
            value={form.correo}
            onChange={(event) => setForm((actual) => ({ ...actual, correo: event.target.value }))}
            autoComplete="email"
          />
          <MultiSelectChips
            label="Roles"
            options={rolesDisponibles}
            value={form.roles}
            onChange={(roles) => setForm((actual) => ({ ...actual, roles }))}
          />
          <MultiSelectChips
            label="Líneas temáticas"
            options={lineasDisponibles}
            value={form.lineas}
            onChange={(lineas) => setForm((actual) => ({ ...actual, lineas }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={closeDialog} disabled={loading} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="create-user-form"
          variant="contained"
          disabled={loading}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {loading ? "Guardando…" : "Crear usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
