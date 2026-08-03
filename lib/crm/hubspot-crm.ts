import {
  CRMProvider,
  CRMContactInput,
  CRMContactRecord,
  CRMActivityInput,
  CRMProviderHealth,
} from "./interface";

export class HubSpotCRMProvider implements CRMProvider {
  public readonly providerType = "HUBSPOT";
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.HUBSPOT_ACCESS_TOKEN || "";
  }

  async findContact(_phoneOrEmail: string): Promise<CRMContactRecord | null> {
    return null;
  }

  async createContact(input: CRMContactInput): Promise<CRMContactRecord> {
    return {
      id: `hubspot-${Date.now()}`,
      externalId: `hs-id-${Date.now()}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
    };
  }

  async updateContact(
    contactId: string,
    input: Partial<CRMContactInput>,
  ): Promise<CRMContactRecord> {
    return {
      id: contactId,
      externalId: `hs-${contactId}`,
      name: input.name || "HubSpot Contact",
    };
  }

  async createActivity(input: CRMActivityInput): Promise<string> {
    return `hs-engagement-${input.activityType}-${Date.now()}`;
  }

  async createTask(
    _title: string,
    _priority: string,
    _dueDate: Date,
  ): Promise<string> {
    return `hs-task-${Date.now()}`;
  }

  async healthCheck(): Promise<CRMProviderHealth> {
    const hasCreds = Boolean(this.accessToken);
    return {
      providerType: "HUBSPOT",
      status: hasCreds ? "OPERATIONAL" : "DEGRADED",
      message: hasCreds
        ? "HubSpot v3 API token configured"
        : "HubSpot token missing (HUBSPOT_ACCESS_TOKEN)",
    };
  }
}
