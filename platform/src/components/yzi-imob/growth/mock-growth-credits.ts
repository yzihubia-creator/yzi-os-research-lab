import type { GrowthCreditState } from "./types";

export const MOCK_GROWTH_CREDITS: GrowthCreditState = {
  tenantId: "tenant_mock_growth_001",
  available: 1144,
  reserved: 84,
  consumed: 70,
  estimatedCost: 8,
  note: "Estado conceitual. Nenhuma geração real foi executada.",
};

export const MOCK_GROWTH_CREDIT_ROWS = [
  { label: "Saldo disponível", value: "1.144" },
  { label: "Custo estimado", value: "8 créditos" },
  { label: "Reservados", value: "84" },
  { label: "Saldo após confirmação", value: "1.136" },
];

