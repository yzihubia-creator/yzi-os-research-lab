"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { GrowthCreativeStatus } from "./mock-growth-assets";

// Estado de aprovação de peças de campanha, em memória (sem persistência,
// sem backend). Montado no Shell v2 (mesmo nível do YziImobWorkspaceProvider)
// para sobreviver à navegação dentro de /cockpit/yzi-imob — é o que permite
// Campanhas, Property Workspace e Dashboard lerem a mesma decisão do gestor.

export type CampaignPieceStatus = GrowthCreativeStatus | "Ajuste solicitado";

export type CampaignPieceOverride = {
  status: CampaignPieceStatus;
  note?: string;
  updatedAt: string;
};

type GrowthCampaignStateValue = {
  overrides: Record<string, CampaignPieceOverride>;
  approvePiece: (pieceId: string) => void;
  requestAdjustment: (pieceId: string, note: string) => void;
  statusFor: (pieceId: string, fallback: GrowthCreativeStatus) => CampaignPieceStatus;
  noteFor: (pieceId: string) => string | undefined;
};

const GrowthCampaignStateContext = createContext<GrowthCampaignStateValue | null>(null);

export function GrowthCampaignStateProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, CampaignPieceOverride>>({});

  const approvePiece = useCallback((pieceId: string) => {
    setOverrides((current) => ({
      ...current,
      [pieceId]: { status: "Aprovado", updatedAt: new Date().toISOString() },
    }));
  }, []);

  const requestAdjustment = useCallback((pieceId: string, note: string) => {
    setOverrides((current) => ({
      ...current,
      [pieceId]: { status: "Ajuste solicitado", note, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const statusFor = useCallback(
    (pieceId: string, fallback: GrowthCreativeStatus): CampaignPieceStatus =>
      overrides[pieceId]?.status ?? fallback,
    [overrides],
  );

  const noteFor = useCallback((pieceId: string) => overrides[pieceId]?.note, [overrides]);

  const value = useMemo<GrowthCampaignStateValue>(
    () => ({ overrides, approvePiece, requestAdjustment, statusFor, noteFor }),
    [overrides, approvePiece, requestAdjustment, statusFor, noteFor],
  );

  return (
    <GrowthCampaignStateContext.Provider value={value}>
      {children}
    </GrowthCampaignStateContext.Provider>
  );
}

export function useGrowthCampaignState(): GrowthCampaignStateValue {
  const value = useContext(GrowthCampaignStateContext);
  if (!value) {
    throw new Error(
      "useGrowthCampaignState precisa estar dentro de GrowthCampaignStateProvider",
    );
  }
  return value;
}
