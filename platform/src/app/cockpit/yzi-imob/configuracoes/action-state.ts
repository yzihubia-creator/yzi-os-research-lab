export type OperationalSettingsSaveState = {
  status: "idle" | "saved" | "error";
  message?: string;
  /** Muda a cada resultado para o aria-live anunciar repetições do mesmo texto. */
  revision: number;
};

export const INITIAL_OPERATIONAL_SETTINGS_SAVE_STATE: OperationalSettingsSaveState = {
  status: "idle",
  revision: 0,
};
