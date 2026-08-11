export type PropertyPublicationActionState = {
  status: "idle" | "ok" | "error" | "forbidden";
  message?: string;
  blockers?: readonly string[];
};

export const INITIAL_PROPERTY_PUBLICATION_ACTION_STATE: PropertyPublicationActionState = {
  status: "idle",
};
