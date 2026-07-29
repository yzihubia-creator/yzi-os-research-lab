export type TeamAccessActionState = {
  status: "idle" | "saved" | "error";
  message?: string;
  revision: number;
};

export const INITIAL_TEAM_ACCESS_ACTION_STATE: TeamAccessActionState = {
  status: "idle",
  revision: 0,
};
