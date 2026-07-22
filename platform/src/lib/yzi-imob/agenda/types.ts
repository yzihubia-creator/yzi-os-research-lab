export const APPOINTMENT_STATUS_VALUES = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type YziImobAppointmentStatus = (typeof APPOINTMENT_STATUS_VALUES)[number];

export const APPOINTMENT_CONFIRMATION_STATUS_VALUES = [
  "pending",
  "confirmed",
  "declined",
] as const;

export type YziImobAppointmentConfirmationStatus =
  (typeof APPOINTMENT_CONFIRMATION_STATUS_VALUES)[number];

export type YziImobAppointment = {
  id: string;
  tenantId: string;
  leadId: string | null;
  leadName: string | null;
  propertyId: string | null;
  propertyTitle: string | null;
  title: string;
  startsAt: string;
  endsAt: string | null;
  status: YziImobAppointmentStatus | string;
  confirmationStatus: YziImobAppointmentConfirmationStatus | string;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CreateAppointmentInput = {
  leadId?: string | null;
  propertyId?: string | null;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  status: YziImobAppointmentStatus;
  confirmationStatus: YziImobAppointmentConfirmationStatus;
  notes?: string | null;
};
