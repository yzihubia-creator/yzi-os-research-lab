export type PropertyWorkspaceActionState = {
  status: "idle" | "ok" | "error" | "membership_missing";
  message?: string;
  fieldErrors?: readonly string[];
};

export const INITIAL_PROPERTY_WORKSPACE_ACTION_STATE: PropertyWorkspaceActionState = {
  status: "idle",
};
