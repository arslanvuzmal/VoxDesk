import {
  CRMProvider,
  CRMContactInput,
  CRMContactRecord,
  CRMActivityInput,
  CRMProviderHealth,
} from './interface';

export class GenericWebhookCRMProvider implements CRMProvider {
  public readonly providerType = 'GENERIC_WEBHOOK';

  async findContact(_phoneOrEmail: string): Promise<CRMContactRecord | null> {
    return null;
  }

  async createContact(input: CRMContactInput): Promise<CRMContactRecord> {
    throw new Error('Generic webhook CRM is not configured for contact creation.');
  }

  async updateContact(
    contactId: string,
    input: Partial<CRMContactInput>
  ): Promise<CRMContactRecord> {
    throw new Error('Generic webhook CRM is not configured for contact updates.');
  }

  async createActivity(input: CRMActivityInput): Promise<string> {
    throw new Error('Generic webhook CRM is not configured for activity creation.');
  }

  async createTask(_title: string, _priority: string, _dueDate: Date): Promise<string> {
    throw new Error('Generic webhook CRM is not configured for task creation.');
  }

  async healthCheck(): Promise<CRMProviderHealth> {
    return {
      providerType: 'GENERIC_WEBHOOK',
      status: 'UNAVAILABLE',
      message: 'Generic Webhook CRM Adapter requires an authorized HTTPS endpoint.',
    };
  }
}

