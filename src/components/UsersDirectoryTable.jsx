import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";

const ROLE_CHIP_CONFIG = {
  ADMIN: {
    label: "Administrador",
    color: "error",
    variant: "filled",
  },
  COMITE: {
    label: "Comité científico",
    color: "primary",
    variant: "filled",
  },
  AUTOR: {
    label: "Autor",
    color: "success",
    variant: "outlined",
  },
};

const normalizeRoles = (roles = []) =>
  roles.map((rol) => (typeof rol === "string" ? rol : rol?.nombre || "")).filter(Boolean);

function renderRoles(roles = []) {
  const normalized = normalizeRoles(roles);

  if (!normalized.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin roles
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {normalized.map((rol) => {
        const config = ROLE_CHIP_CONFIG[rol] || {
          label: rol,
          color: "default",
          variant: "outlined",
        };
        return (
          <Chip
            key={rol}
            label={config.label}
            color={config.color}
            variant={config.variant}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      })}
    </Box>
  );
}

function renderEspecialidades(especialidades = []) {
  if (!Array.isArray(especialidades) || !especialidades.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No aplica
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {especialidades.map((esp, index) => {
        const label = typeof esp === "string" ? esp : esp?.nombre || "";
        if (!label) return null;

        return (
          <Chip
            key={esp?.id ?? `${label}-${index}`}
            label={label}
            size="small"
            variant="outlined"
            color="info"
          />
        );
      })}
    </Box>
  );
}

export default function UsersDirectoryTable({
  users = [],
  loading = false,
  error = "",
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const [orderBy, setOrderBy] = useState("nombres");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const filteredAndSortedUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = users.filter((user) => {
      const userRoles = normalizeRoles(user.roles);
      const matchesRole = roleFilter === "TODOS" || userRoles.includes(roleFilter);

      if (!matchesRole) return false;
      if (!term) return true;

      const fullName = ((user.nombres || "") + " " + (user.apellidos || "")).toLowerCase();
      const email = (user.correo || "").toLowerCase();
      const affiliation = (user.afiliacion || "").toLowerCase();
      const country = (user.pais || "").toLowerCase();

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        affiliation.includes(term) ||
        country.includes(term)
      );
    });

    return [...filtered].sort((a, b) => {
      const valA = (a[orderBy] || "").toString().toLowerCase();
      const valB = (b[orderBy] || "").toString().toLowerCase();
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, search, roleFilter, orderBy, order]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSortedUsers.slice(start, start + rowsPerPage);
  }, [filteredAndSortedUsers, page, rowsPerPage]);

  return (
    <Paper elevation={2} sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Directorio de usuarios registrados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredAndSortedUsers.length} usuario(s) encontrado(s)
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Buscar por nombre, correo o afiliación..."
              value={search}
              onChange={handleSearchChange}
              sx={{ minWidth: { xs: "100%", sm: 280 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Limpiar búsqueda"
                      onClick={() => {
                        setSearch("");
                        setPage(0);
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 170 } }}>
              <InputLabel id="filter-role-label">Filtrar por rol</InputLabel>
              <Select
                labelId="filter-role-label"
                value={roleFilter}
                label="Filtrar por rol"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="TODOS">Todos los roles</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="COMITE">Comité científico</MenuItem>
                <MenuItem value="AUTOR">Autor</MenuItem>
              </Select>
            </FormControl>

            {onRefresh && (
              <Tooltip title="Actualizar listado">
                <span>
                  <IconButton onClick={onRefresh} disabled={loading} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer sx={{ maxHeight: 520, overflowX: "auto" }}>
        <Table stickyHeader size="medium" aria-label="Tabla de directorio de usuarios">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
                <TableSortLabel
                  active={orderBy === "nombres"}
                  direction={orderBy === "nombres" ? order : "asc"}
                  onClick={() => handleRequestSort("nombres")}
                >
                  Nombre completo
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>
                <TableSortLabel
                  active={orderBy === "correo"}
                  direction={orderBy === "correo" ? order : "asc"}
                  onClick={() => handleRequestSort("correo")}
                >
                  Correo electrónico
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
                <TableSortLabel
                  active={orderBy === "afiliacion"}
                  direction={orderBy === "afiliacion" ? order : "asc"}
                  onClick={() => handleRequestSort("afiliacion")}
                >
                  Afiliación
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>País</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 210 }}>Roles asignados</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Especialidades</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Cargando directorio de usuarios...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron usuarios que coincidan con los criterios de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user, index) => (
                <TableRow
                  key={user.id || user.correo || index}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {((user.nombres || "") + " " + (user.apellidos || "")).trim() || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>{user.correo || "—"}</TableCell>
                  <TableCell>{user.afiliacion || "—"}</TableCell>
                  <TableCell>{user.pais || "—"}</TableCell>
                  <TableCell>{renderRoles(user.roles)}</TableCell>
                  <TableCell>{renderEspecialidades(user.especialidades)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredAndSortedUsers.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          from + "–" + to + " de " + (count !== -1 ? count : "más de " + to)
        }
      />
    </Paper>
  );
}