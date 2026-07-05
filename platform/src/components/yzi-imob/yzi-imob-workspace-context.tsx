"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

// Ponte entre o Canvas (Workspace Principal) e o Inspector da YZI.
// O Canvas publica a "leitura" do item selecionado; o Inspector, renderizado
// pelo Shell v2 fora de `children`, consome essa leitura e a apresenta como
// coordenadora operacional (Content Language). Sem dados reais, sem Runtime.

// Leitura contextual que a YZI mostra ao selecionar uma entidade operacional
// (imóvel, e no futuro corretor/cliente/campanha/atendimento). Estrutura
// canônica do Entity Workspace Pattern v1 — sempre as mesmas 7 seções,
// muda só o conteúdo por entidade. Nunca Runtime/banco/tool real.
export type YziInspection = {
  name: string;
  subtitle: string;
  statusLabel: string;
  situation: string; // Resumo
  pendencies: string[]; // Pendências
  checklist: { label: string; done: boolean }[]; // Checklist
  score: number; // Readiness (0–100)
  scoreLabel: string; // rótulo por entidade, ex.: "Property Readiness"
  nextAction: string; // Próxima ação
  suggestions: string[]; // Sugestões
  history: string[]; // Histórico
};

type WorkspaceContextValue = {
  inspection: YziInspection | null;
  open: boolean;
  select: (inspection: YziInspection) => void;
  clear: () => void;
  setOpen: (value: boolean) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function YziImobWorkspaceProvider({
  children,
  defaultOpen = true,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [inspection, setInspection] = useState<YziInspection | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  const select = useCallback((next: YziInspection) => {
    setInspection(next);
    setOpen(true);
  }, []);

  const clear = useCallback(() => setInspection(null), []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({ inspection, open, select, clear, setOpen }),
    [inspection, open, select, clear],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useYziImobWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) {
    throw new Error(
      "useYziImobWorkspace precisa estar dentro de YziImobWorkspaceProvider",
    );
  }
  return value;
}
