import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";

const ROLE_LABELS = {
  ADMIN: "Administrador",
  COMITE: "Comité científico",
  AUTOR: "Autor",
};

function formatRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, roles, activeRole, switchRole, endSession } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    try {
      await endSession();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: "#1e293b" }}>
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 2, py: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ cursor: "pointer" }}
          >
            Sistema de Gestión
          </Typography>
          {activeRole && (
            <Chip
              label={`Rol: ${formatRoleLabel(activeRole)}`}
              size="small"
              sx={{
                bgcolor: "#2859d8",
                color: "#fff",
                fontWeight: 600,
              }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="text"
            size="small"
            onClick={() => navigate("/mi-perfil")}
            sx={{
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" },
            }}
          >
            Mi Perfil
          </Button>

          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography variant="body2" fontWeight={600} color="inherit">
              {user.nombre}
            </Typography>
            {user.email && (
              <Typography variant="caption" sx={{ color: "#cbd5e1", display: "block" }}>
                {user.email}
              </Typography>
            )}
          </Box>

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel
              id="navbar-active-role-label"
              sx={{
                color: "#cbd5e1",
                "&.Mui-focused": { color: "#fff" },
              }}
            >
              Rol activo
            </InputLabel>
            <Select
              labelId="navbar-active-role-label"
              id="navbar-active-role-select"
              value={activeRole || ""}
              label="Rol activo"
              disabled={roles.length <= 1 || loggingOut}
              onChange={(event) => switchRole(event.target.value)}
              sx={{
                color: "#fff",
                ".MuiSelect-select": {
                  color: "#fff",
                },
                ".MuiSelect-select.Mui-disabled": {
                  color: "#fff",
                  WebkitTextFillColor: "#fff",
                },
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.35)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#fff",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#93c5fd",
                },
                "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.35)",
                },
                ".MuiSvgIcon-root, .MuiSvgIcon-root.Mui-disabled": {
                  color: "#fff",
                },
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {formatRoleLabel(role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            disabled={loggingOut}
            onClick={handleLogoutClick}
            sx={{
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.45)",
              textTransform: "none",
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            {loggingOut ? "Saliendo..." : "Salir"}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}