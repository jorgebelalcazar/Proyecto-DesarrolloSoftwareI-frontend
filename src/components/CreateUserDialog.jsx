import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Stack,
  TextField,
} from "@mui/material";
import MultiSelectChips from "./MultiSelectChips";

const emptyForm = {
  nombres: "", apellidos: "", correo: "", afiliacion: "", pais: "", clave: "", roles: [], lineas: [],
};

/** Reusable UI dialog. The parent owns persistence and supplies onCreateUser. */
export default function CreateUserDialog({
  open,
  onClose,
  onCreateUser,
  rolesDisponibles = [],
  lineasDisponibles = [],
  loading = false,
  error = "",
}) {
  const [form, setForm] = useState(emptyForm);

  const closeDialog = () => {
    if (loading) return;
    setForm(emptyForm);
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.roles.length === 0) return;
    try {
      await onCreateUser({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim(),
        afiliacion: form.afiliacion.trim(),
        pais: form.pais.trim(),
        clave: form.clave,
        roles: form.roles,
        lineas: form.lineas,
      });
      setForm(emptyForm);
    } catch {
      // El contenedor presenta el error del servidor dentro del diálogo.
    }
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
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack component="form" id="create-user-form" spacing={2.5} onSubmit={submit}>
          <TextField
            autoFocus
            required
            fullWidth
            label="Nombres"
            value={form.nombres}
            onChange={(event) => setForm((actual) => ({ ...actual, nombres: event.target.value }))}
            autoComplete="given-name"
          />
          <TextField
            required
            fullWidth
            label="Apellidos"
            value={form.apellidos}
            onChange={(event) => setForm((actual) => ({ ...actual, apellidos: event.target.value }))}
            autoComplete="family-name"
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
          <TextField
            required
            fullWidth
            label="Afiliación institucional"
            value={form.afiliacion}
            onChange={(event) => setForm((actual) => ({ ...actual, afiliacion: event.target.value }))}
          />
          <TextField
            required
            fullWidth
            label="País"
            value={form.pais}
            onChange={(event) => setForm((actual) => ({ ...actual, pais: event.target.value }))}
          />
          <TextField
            required
            fullWidth
            type="password"
            label="Contraseña (mínimo 8 caracteres)"
            inputProps={{ minLength: 8 }}
            value={form.clave}
            onChange={(event) => setForm((actual) => ({ ...actual, clave: event.target.value }))}
            autoComplete="new-password"
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
