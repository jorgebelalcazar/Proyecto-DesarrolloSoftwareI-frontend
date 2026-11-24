import ArticlesCatalog from "./ArticlesCatalog";

const sampleArticles = [
  { id: "art-1", titulo: "Aprendizaje federado para detección de anomalías clínicas", autores: "María López", linea_tematica: "Sistemas Inteligentes", estado: "En revisión" },
  { id: "art-2", titulo: "Arquitectura de microservicios para repositorios científicos", autores: "Diego Suárez", linea_tematica: "Sistemas de Software", estado: "Enviado" },
  { id: "art-3", titulo: "Analítica de aprendizaje en cursos introductorios", autores: "Ana Torres", linea_tematica: "Educación en Informática", estado: "Aceptado" },
  { id: "art-4", titulo: "Monitoreo ambiental universitario con redes IoT", autores: "María López", linea_tematica: "Tecnologías en Informática", estado: "En revisión" },
];

const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function ArticlesCatalogPreview() {
  const fetchPreviewArticles = async ({ linea, estado, texto }) => sampleArticles.filter((article) => {
    const matchesLine = !linea || article.linea_tematica === linea;
    const matchesState = !estado || article.estado === estado;
    const searchable = normalize(`${article.titulo} ${article.autores}`);
    const matchesText = !texto || searchable.includes(normalize(texto));
    return matchesLine && matchesState && matchesText;
  });

  return <ArticlesCatalog fetchArticles={fetchPreviewArticles} />;
}
