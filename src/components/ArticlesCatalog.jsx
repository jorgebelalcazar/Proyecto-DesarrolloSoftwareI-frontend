import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
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
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { ARTICLE_LINES, ARTICLE_STATES } from "../constants/articleFilters";

const emptyFilters = { linea: "", estado: "", texto: "" };

function filtersFromSearchParams(searchParams) {
  return {
    linea: searchParams.get("linea") || "",
    estado: searchParams.get("estado") || "",
    texto: searchParams.get("q") || "",
  };
}

function activeFilterCount(filters) {
  return Object.values(filters).filter((value) => value.trim()).length;
}

function normalizeArticle(article) {
  return {
    id: article.id,
    titulo: article.titulo || article.title || "Sin título",
    autores: article.autores || article.autor || article.autor_nombre || "Sin autor",
    linea: article.linea_tematica || article.linea || "Sin línea",
    estado: article.estado || "Sin estado",
  };
}

/**
 * Committee/admin article catalog. The fetcher can be swapped in tests or
 * previews; the real page uses Axios through articlesService.
 */
export default function ArticlesCatalog({ fetchArticles }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftFilters, setDraftFilters] = useState(() => filtersFromSearchParams(searchParams));
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const search = async (filters) => {
    const count = activeFilterCount(filters);
    if (count < 2) {
      setArticles([]);
      setSearched(false);
      setError("Selecciona al menos dos filtros para consultar el catálogo.");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const results = await fetchArticles(filters);
      setArticles(results.map(normalizeArticle));
    } catch {
      setArticles([]);
      setError("No fue posible consultar los artículos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    const cleanFilters = {
      linea: draftFilters.linea,
      estado: draftFilters.estado,
      texto: draftFilters.texto.trim(),
    };
    if (activeFilterCount(cleanFilters) < 2) {
      setArticles([]);
      setSearched(false);
      setError("Selecciona al menos dos filtros para consultar el catálogo.");
      return;
    }

    setSearchParams(
      Object.fromEntries(Object.entries(cleanFilters).filter(([, value]) => value)),
    );
    search(cleanFilters);
  };

  const reset = () => {
    setDraftFilters(emptyFilters);
    setSearchParams({});
    setArticles([]);
    setError("");
    setSearched(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1d3150">
            Catálogo de artículos
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Usa al menos dos filtros para consultar las recepciones del evento.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Box component="form" onSubmit={submit} noValidate>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Línea temática"
                  value={draftFilters.linea}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, linea: event.target.value }))}
                >
                  <MenuItem value="">Todas las líneas</MenuItem>
                  {ARTICLE_LINES.map((line) => <MenuItem key={line} value={line}>{line}</MenuItem>)}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Estado"
                  value={draftFilters.estado}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, estado: event.target.value }))}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  {ARTICLE_STATES.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </TextField>
                <TextField
                  fullWidth
                  label="Autor o palabra clave"
                  value={draftFilters.texto}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, texto: event.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  }}
                />
              </Stack>
              <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} justifyContent="flex-end">
                <Button type="button" onClick={reset} startIcon={<RestartAltIcon />} sx={{ textTransform: "none" }}>
                  Restablecer filtros
                </Button>
                <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ textTransform: "none" }}>
                  Aplicar filtros
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", minHeight: 180 }}>
            <CircularProgress aria-label="Consultando artículos" />
          </Box>
        ) : searched && !error ? (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table aria-label="Resultados del catálogo de artículos">
              <TableHead sx={{ bgcolor: "#eef2f7" }}>
                <TableRow>
                  <TableCell><strong>Artículo</strong></TableCell>
                  <TableCell><strong>Autor responsable</strong></TableCell>
                  <TableCell><strong>Línea temática</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No hay artículos que coincidan con los filtros.</TableCell></TableRow>
                ) : articles.map((article) => (
                  <TableRow key={article.id} hover>
                    <TableCell>{article.titulo}</TableCell>
                    <TableCell>{article.autores}</TableCell>
                    <TableCell>{article.linea}</TableCell>
                    <TableCell><Chip size="small" label={article.estado} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">Aún no se han aplicado filtros al catálogo.</Alert>
        )}
      </Stack>
    </Container>
  );
}
