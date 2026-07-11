// YZI IMOB — Capabilities (barrel). Superfície pública das capabilities de
// produto construídas SOBRE o runtime. Módulos puros, sem efeito de importação.

export {
  runPropertySearch,
  detectFilters,
  type PropertySearchResult,
  type PropertySearchFilters,
  type PropertyCandidate,
} from "./property-search";
export {
  demoPropertySearch,
  demoPropertySearchNoMatch,
  DEMO_SEARCH_REQUEST,
  DEMO_SEARCH_REQUEST_NO_MATCH,
} from "./example";
