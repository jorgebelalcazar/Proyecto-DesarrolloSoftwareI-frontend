import { useEffect, useMemo, useState, useRef } from "react";
import {
  Alert,
  Box,
  Button,
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
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

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

const DEFAULT_FILTERS = {
  search: "",
  rol: "TODOS",
  activo: "TODOS",
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
  filters = { search: "", rol: "TODOS", activo: "TODOS" },
  onFiltersChange,
  onRefresh,
}) {
  // Estado local del input para aplicar debounce antes de disparar Axios
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [orderBy, setOrderBy] = useState("nombres");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debounceTimerRef = useRef(null);

  // Sincroniza si los filtros se limpian desde fuera
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Debounce de 400 ms para reactivar la consulta Axios al escribir
  useEffect(() => {
    debounceTimerRef.current = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        setPage(0);
        onFiltersChange?.({
          ...filters,
          search: searchInput,
        });
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput, filters, onFiltersChange]);

  const handleRoleChange = (event) => {
    setPage(0);
    onFiltersChange?.({
      ...filters,
      rol: event.target.value,
    });
  };

  const handleStatusChange = (event) => {
    setPage(0);
    onFiltersChange?.({
      ...filters,
      activo: event.target.value,
    });
  };

  const handleClearFilters = () => {
    if (debounceTimerRef.current){
      clearTimeout(debounceTimerRef.current);
    }

    setSearchInput(DEFAULT_FILTERS.search);
    setRowsPerPage(10);
    setPage(0);
    setOrderBy("nombres");
    setOrder("asc");

    const hasAppliedCriteria =
      (filters.search || "") !== DEFAULT_FILTERS.search || 
      (filters.rol || "TODOS") !== DEFAULT_FILTERS.rol ||
      (filters.activo || "TODOS") !== DEFAULT_FILTERS.activo;
    
    if (hasAppliedCriteria) {
      onFiltersChange?.({ ...DEFAULT_FILTERS });
    } else {
      onRefresh?.();
    }
  };

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    (filters.rol && filters.rol !== DEFAULT_FILTERS.rol) ||
    (filters.activo && filters.activo !== DEFAULT_FILTERS.activo);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const valA = (a[orderBy] || "").toString().toLowerCase();
      const valB = (b[orderBy] || "").toString().toLowerCase();
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, orderBy, order]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedUsers.slice(start, start + rowsPerPage);
  }, [sortedUsers, page, rowsPerPage]);

  return (
    <Paper elevation={2} sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
      {/* Barra superior de título y filtros combinados */}
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Directorio de usuarios registrados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sortedUsers.length} usuario(s) encontrado(s)
              </Typography>
            </Box>

            {onRefresh && (
              <Tooltip title="Recargar datos desde el servidor">
                <span>
                  <IconButton onClick={onRefresh} disabled={loading} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>

          {/* Barra de controles combinados: TextField + Selects + Limpiar */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              size="small"
              label="Buscar usuario"
              placeholder="Nombre, correo o afiliación..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 260 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Limpiar texto de búsqueda"
                      onClick={() => setSearchInput("")}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 190 } }}>
              <InputLabel id="filter-role-label">Filtrar por rol</InputLabel>
              <Select
                labelId="filter-role-label"
                value={filters.rol || "TODOS"}
                label="Filtrar por rol"
                onChange={handleRoleChange}
              >
                <MenuItem value="TODOS">Todos los roles</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="COMITE">Comité científico</MenuItem>
                <MenuItem value="AUTOR">Autor</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 170 } }}>
              <InputLabel id="filter-status-label">Estado de cuenta</InputLabel>
              <Select
                labelId="filter-status-label"
                value={filters.activo || "TODOS"}
                label="Estado de cuenta"
                onChange={handleStatusChange}
              >
                <MenuItem value="TODOS">Todos los estados</MenuItem>
                <MenuItem value="true">Activos</MenuItem>
                <MenuItem value="false">Inactivos</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="secondary"
              size="medium"
              startIcon={<FilterAltOffIcon />}
              onClick={handleClearFilters}
              disabled={!hasActiveFilters || loading}
              sx={{ whiteSpace: "nowrap", height: 40 }}
            >
              Limpiar Filtros
            </Button>
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
                    Consultando usuarios...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron usuarios con los criterios seleccionados.
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
        count={sortedUsers.length}
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