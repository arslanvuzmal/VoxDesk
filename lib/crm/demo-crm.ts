import {
  CRMProvider,
  CRMContactInput,
  CRMContactRecord,
  CRMActivityInput,
  CRMProviderHealth,
} from "./interface";

export class DemoCRMProvider implements CRMProvider {
  public readonly providerType = "DEMO";
  private contacts: Map<string, CRMContactRecord> = new Map();

  async findContact(phoneOrEmail: string): Promise<CRMContactRecord | null> {
    for (const c of this.contacts.values()) {
      if (c.phone === phoneOrEmail || c.email === phoneOrEmail) {
        return c;
      }
    }
    return null;
  }

  async createContact(input: CRMContactInput): Promise<CRMContactRecord> {
    const id = `demo-crm-${Date.now()}`;
    const record: CRMContactRecord = {
      id,
      externalId: `crm-ext-${Math.random().toString(36).substring(7)}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
      company: input.company || "Demo Client Enterprise",
    };
    this.contacts.set(id, record);
    return record;
  }

  async updateContact(contactId: string, input: Partial<CRMContactInput>): Promise<CRMContactRecord> {
    const existing = this.contacts.get(contactId);
    if (!existing) {
      throw new Error(`CRM Contact '${contactId}' not found`);
    }
    if (input.name) existing.name = input.name;
    if (input.phone) existing.phone = input.phone;
    if (input.email) existing.email = input.email;
    return existing;
  }

  async createActivity(input: CRMActivityInput): Promise<string> {
    return `activity-demo-${input.activityType.toLowerCase()}-${Date.now()}`;
  }

  async createTask(title: string, _priority: string, _dueDate: Date): Promise<string> {
    return `task-demo-${title.slice(0, 10).toLowerCase()}-${Date.now()}`;
  }

  async healthCheck(): Promise<CRMProviderHealth> {
    return {
      providerType: "DEMO",
      status: "DEMO",
      message: "Deterministic Demo CRM Provider operational (No external credentials required)",
    };
  }
}
