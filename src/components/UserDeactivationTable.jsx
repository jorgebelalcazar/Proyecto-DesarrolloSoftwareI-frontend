import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

/**
 * Reusable user table. It asks for an explicit confirmation before calling
 * the deactivation callback and only removes the row after that succeeds.
 */
export default function UserDeactivationTable({
  users,
  onDeactivateUser,
  onUserDeactivated,
  canDeactivate = false,
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState("");

  const closeDialog = () => {
    if (deactivating) return;
    setSelectedUser(null);
    setError("");
  };

  const confirmDeactivation = async () => {
    if (!selectedUser) return;

    setDeactivating(true);
    setError("");
    try {
      await onDeactivateUser(selectedUser.id, selectedUser);
      onUserDeactivated(selectedUser.id);
      setSelectedUser(null);
    } catch {
      setError("No se pudo dar de baja al usuario. Intenta de nuevo.");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table aria-label="Usuarios del sistema">
          <TableHead sx={{ bgcolor: "#eef2f7" }}>
            <TableRow>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell><strong>Correo</strong></TableCell>
              <TableCell><strong>Rol</strong></TableCell>
              {canDeactivate && <TableCell align="right"><strong>Acción</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canDeactivate ? 4 : 3} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No hay usuarios para mostrar.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.correo}</TableCell>
                  <TableCell>{user.rol}</TableCell>
                  {canDeactivate && (
                    <TableCell align="right">
                      <Button
                        color="error"
                        onClick={() => {
                          setError("");
                          setSelectedUser(user);
                        }}
                        sx={{ textTransform: "none" }}
                        aria-label={`Dar de baja a ${user.nombre}`}
                      >
                        Dar de baja
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(selectedUser)}
        onClose={closeDialog}
        aria-labelledby="deactivate-user-title"
        aria-describedby="deactivate-user-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="deactivate-user-title">Confirmar baja de usuario</DialogTitle>
        <DialogContent>
          <DialogContentText id="deactivate-user-description">
            {selectedUser && (
              <>
                ¿Confirmas que deseas desactivar a <strong>{selectedUser.nombre}</strong>
                {selectedUser.correo ? ` (${selectedUser.correo})` : ""}? Se revocará su acceso y se conservará su historial.
              </>
            )}
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} disabled={deactivating} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDeactivation}
            color="error"
            variant="contained"
            disabled={deactivating}
            sx={{ textTransform: "none" }}
          >
            {deactivating ? "Procesando…" : "Confirmar baja"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
