// YZI IMOB Runtime — Barrel (Runtime Foundation, unidade 1).
//
// Superfície pública do menor Runtime executável possível. Reexporta os
// contratos e a entrada única. Nenhum efeito de importação (módulos puros).

export * from "./types";
export { runYziImobRuntime } from "./runtime-api";
export { routeIntent } from "./intent-router";
export { selectWorkflow, listKnownWorkflows } from "./workflow-selector";
export { applyPolicy } from "./policy";
export { buildContext } from "./context-builder";
export { orchestrate } from "./orchestrator";
export { WORKFLOW_REGISTRY, getWorkflowDefinition } from "./workflows";
export { findMockProperty } from "./mock-data";
export { demoReadOnlyPropertyLookup, DEMO_REQUEST } from "./example";
