export type YziImobLead = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: string | null;
  temperature: string | null;
  source: string | null;
  notes: string | null;
};

export type YziImobLeadInterest = {
  leadId: string;
  propertyId: string;
  propertyTitle: string | null;
  status: string | null;
  source: string | null;
  score: number | null;
};

export type YziImobLeadConversation = {
  leadId: string;
  channel: string | null;
  status: string | null;
  startedAt: string | null;
  lastMessageAt: string | null;
};

export type YziImobLeadListItem = YziImobLead & {
  interestCount: number;
  maxInterestScore: number | null;
  lastInteractionAt: string | null;
};

export type YziImobLeadWorkspaceData = {
  lead: YziImobLead;
  interests: readonly YziImobLeadInterest[];
  conversations: readonly YziImobLeadConversation[];
};
