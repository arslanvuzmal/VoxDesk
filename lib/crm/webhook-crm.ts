import crypto from "crypto";
import {
  CRMProvider,
  CRMContactInput,
  CRMContactRecord,
  CRMActivityInput,
  CRMProviderHealth,
} from "./interface";

export class GenericWebhookCRMProvider implements CRMProvider {
  public readonly providerType = "GENERIC_WEBHOOK";
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.WEBHOOK_SIGNING_SECRET || "whsec_default";
  }

  async findContact(_phoneOrEmail: string): Promise<CRMContactRecord | null> {
    return null;
  }

  async createContact(input: CRMContactInput): Promise<CRMContactRecord> {
    return {
      id: `wh-${Date.now()}`,
      externalId: `wh-contact-${Date.now()}`,
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
      externalId: `wh-${contactId}`,
      name: input.name || "Webhook Contact",
    };
  }

  async createActivity(input: CRMActivityInput): Promise<string> {
    return `wh-event-${input.activityType}-${Date.now()}`;
  }

  async createTask(
    _title: string,
    _priority: string,
    _dueDate: Date,
  ): Promise<string> {
    return `wh-task-${Date.now()}`;
  }

  async healthCheck(): Promise<CRMProviderHealth> {
    return {
      providerType: "GENERIC_WEBHOOK",
      status: "OPERATIONAL",
      message: "Generic Webhook CRM Adapter ready",
    };
  }
}
