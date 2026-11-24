import { Container, Typography } from "@mui/material";
import ArticleDisablePanel from "./ArticleDisablePanel";

const sampleArticle = {
  id: "ART-0264",
  titulo: "Aprendizaje federado para la detección temprana de anomalías clínicas",
  autor: "María López",
  estado: "En revisión",
};

export default function ArticleDisablePreview() {
  const previewDisable = async (articleId, motivo) => {
    console.info("Vista previa de deshabilitación:", { articleId, motivo });
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
      <Typography variant="h4" fontWeight={700} color="#1d3150" sx={{ mb: 1 }}>
        Supervisión de artículo
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Vista previa local del flujo de deshabilitación para el Comité Científico.
      </Typography>
      <ArticleDisablePanel article={sampleArticle} onDisable={previewDisable} />
    </Container>
  );
}
