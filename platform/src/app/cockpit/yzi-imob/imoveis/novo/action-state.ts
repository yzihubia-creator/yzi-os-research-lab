type CreatePropertyResumeStep = "private_location" | "proximities" | "property_details";

export type CreatePropertyActionState = {
  status: "idle" | "error" | "membership_missing" | "partial";
  message?: string;
  fieldErrors?: Readonly<Record<string, string>>;
  createdPropertyId?: string;
  failedSection?: "localizacao" | "proximidades" | "cadastro";
  resumeFrom?: CreatePropertyResumeStep;
  completedProximities?: number;
};

export const INITIAL_CREATE_PROPERTY_STATE: CreatePropertyActionState = { status: "idle" };
