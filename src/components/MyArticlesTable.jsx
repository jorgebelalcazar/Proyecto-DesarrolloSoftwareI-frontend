import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArticleIcon from "@mui/icons-material/Article";
import { getMyArticles, getThematicLines } from "../services/articleService";

const LINEAS_TEMATICAS_BASE = [
  { id: 1, nombre: "Sistemas Inteligentes" },
  { id: 2, nombre: "Tecnologías en Informática" },
  { id: 3, nombre: "Educación en Informática" },
  { id: 4, nombre: "Sistemas de Software" },
  { id: 5, nombre: "Software en la práctica" },
];

const ESTADOS_ARTICULO = [
  { value: "POSTULADO", label: "Postulado", color: "info" },
  { value: "EN_REVISION", label: "En revisión", color: "warning" },
  { value: "CORRECCIONES", label: "Requiere correcciones", color: "secondary" },
  { value: "ACEPTADO", label: "Aceptado", color: "success" },
  { value: "RECHAZADO", label: "Rechazado", color: "error" },
];

function getStatusBadgeConfig(rawStatus = "") {
  const normalized = String(rawStatus).trim().toUpperCase().replace(/\s+/g, "_");
  const found = ESTADOS_ARTICULO.find((item) => item.value === normalized);
  if (found) return found;

  return {
    value: normalized || "POSTULADO",
    label: rawStatus || "Postulado",
    color: "default",
  };
}

function getThematicLineName(article, linesCatalog) {
  if (typeof article.linea_tematica_nombre === "string") {
    return article.linea_tematica_nombre;
  }
  if (article.linea_tematica && typeof article.linea_tematica === "object") {
    return article.linea_tematica.nombre || "Sin línea asignada";
  }
  const found = linesCatalog.find(
    (line) => Number(line.id) === Number(article.linea_tematica)
  );
  return found ? found.nombre : "Sin línea asignada";
}

function getCurrentVersionLabel(article) {
  const version =
    article.version_actual ??
    article.numero_version ??
    article.version ??
    1;
  return `v${version}`;
}

export default function MyArticlesTable({
  onBack,
  onNewArticle,
  onSelectArticle,
  onEditArticle,
}) {
  const [articles, setArticles] = useState([]);
  const [thematicLines, setThematicLines] = useState(LINEAS_TEMATICAS_BASE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lineFilter, setLineFilter] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [articlesData, linesData] = await Promise.all([
          getMyArticles(),
          getThematicLines().catch(() => []),
        ]);

        if (!active) return;
        setArticles(articlesData);
        if (Array.isArray(linesData) && linesData.length > 0) {
          setThematicLines(linesData);
        }
      } catch (err) {
        if (!active) return;
        const apiError =
          err.response?.data?.detail ||
          "No se pudo cargar el listado de tus artículos postulados.";
        setError(apiError);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const title = (article.titulo || "").toLowerCase();
      const matchesSearch =
        !searchText.trim() || title.includes(searchText.trim().toLowerCase());

      const statusConfig = getStatusBadgeConfig(article.estado);
      const matchesStatus =
        !statusFilter || statusConfig.value === statusFilter;

      const articleLineId =
        typeof article.linea_tematica === "object"
          ? article.linea_tematica?.id
          : article.linea_tematica;
      const matchesLine =
        !lineFilter || Number(articleLineId) === Number(lineFilter);

      return matchesSearch && matchesStatus && matchesLine;
    });
  }, [articles, searchText, statusFilter, lineFilter]);

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setLineFilter("");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Card
        elevation={1}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          p: { xs: 1.5, sm: 3 },
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            {/* Encabezado */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Box>
                {onBack && (
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{ textTransform: "none", mb: 0.5, ml: -1 }}
                  >
                    Volver al panel principal
                  </Button>
                )}

                <Typography
                  variant="overline"
                  sx={{ color: "#2859d8", fontWeight: 700, letterSpacing: 1 }}
                >
                  Seguimiento de Autor
                </Typography>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Mis Artículos Postulados
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Consulta el estado actual, línea temática y versión vigente de tus trabajos enviados.
                </Typography>
              </Box>

              {onNewArticle && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onNewArticle}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: "#2859d8",
                    px: 2,
                    py: 1,
                    height: 40,
                    alignSelf: { xs: "flex-start", sm: "center" },
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Nuevo artículo
                </Button>
              )}
            </Stack>

            <Divider />

            {/* Barra de Filtros por Título, Estado y Línea Temática */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                size="small"
                placeholder="Buscar por título del artículo..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                size="small"
                label="Estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ flex: 1, minWidth: 180 }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {ESTADOS_ARTICULO.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Línea temática"
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                sx={{ flex: 1.3, minWidth: 210 }}
              >
                <MenuItem value="">Todas las líneas temáticas</MenuItem>
                {thematicLines.map((linea) => (
                  <MenuItem key={linea.id} value={linea.id}>
                    {linea.nombre}
                  </MenuItem>
                ))}
              </TextField>

              {(searchText || statusFilter || lineFilter) && (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                >
                  Limpiar filtros
                </Button>
              )}
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {/* Contenido principal: Carga / Tabla / Estado vacío */}
            {loading ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Cargando tus artículos postulados...
                </Typography>
              </Box>
            ) : filteredArticles.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 5,
                  textAlign: "center",
                  borderRadius: 2.5,
                  bgcolor: "#f8fafc",
                }}
              >
                <ArticleIcon sx={{ fontSize: 44, color: "#94a3b8", mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {articles.length === 0
                    ? "Aún no tienes artículos postulados"
                    : "No hay artículos que coincidan con los filtros seleccionados"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {articles.length === 0
                    ? "Postula tu primer manuscrito para comenzar el proceso de evaluación."
                    : "Prueba cambiando el estado o la línea temática en los filtros."}
                </Typography>
              </Paper>
            ) : (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2, overflowX: "auto" }}
              >
                <Table size="medium" aria-label="Tabla de mis artículos postulados">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Línea temática</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Versión actual
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Estado
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredArticles.map((article) => {
                      const statusBadge = getStatusBadgeConfig(article.estado);
                      const lineName = getThematicLineName(
                        article,
                        thematicLines
                      );

                      return (
                        <TableRow
                          key={article.id}
                          hover
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell sx={{ maxWidth: 340 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {article.titulo}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {lineName}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={getCurrentVersionLabel(article)}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={statusBadge.label}
                              color={statusBadge.color}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="flex-end"
                            >
                              {onEditArticle && (
                                <Tooltip title="Editar metadatos del artículo">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      disabled={
                                        String(article.estado || "").toUpperCase() ===
                                        "DESHABILITADO"
                                      }
                                      aria-label={`Editar ${article.titulo}`}
                                      onClick={() => onEditArticle(article)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}

                              <Tooltip title="Ver detalle del artículo">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  aria-label={`Ver detalle de ${article.titulo}`}
                                  onClick={() => onSelectArticle?.(article)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}