export interface CRMContactInput {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
}

export interface CRMContactRecord {
  id: string;
  externalId: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
}

export interface CRMActivityInput {
  contactId: string;
  activityType:
    "CALL_LOG" | "APPOINTMENT_BOOKED" | "LEAD_QUALIFIED" | "HUMAN_ESCALATION";
  summary: string;
  details: Record<string, unknown>;
}

export interface CRMProviderHealth {
  providerType: string;
  status: "OPERATIONAL" | "DEMO" | "DEGRADED" | "UNAVAILABLE";
  message: string;
}

export interface CRMProvider {
  providerType: string;
  findContact(phoneOrEmail: string): Promise<CRMContactRecord | null>;
  createContact(input: CRMContactInput): Promise<CRMContactRecord>;
  updateContact(
    contactId: string,
    input: Partial<CRMContactInput>,
  ): Promise<CRMContactRecord>;
  createActivity(input: CRMActivityInput): Promise<string>;
  createTask(title: string, priority: string, dueDate: Date): Promise<string>;
  healthCheck(): Promise<CRMProviderHealth>;
}
