export type OperationalActionState = {
  status: "idle" | "saved" | "error";
  message: string;
  revision: number;
};

export const INITIAL_OPERATIONAL_ACTION_STATE: OperationalActionState = {
  status: "idle",
  message: "",
  revision: 0,
};
