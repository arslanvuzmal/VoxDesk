import { CRMProvider } from "./interface";
import { DemoCRMProvider } from "./demo-crm";
import { HubSpotCRMProvider } from "./hubspot-crm";
import { GenericWebhookCRMProvider } from "./webhook-crm";

export function getCRMProvider(providerType: string = "DEMO"): CRMProvider {
  switch (providerType.toUpperCase()) {
    case "HUBSPOT":
      return new HubSpotCRMProvider();
    case "GENERIC_WEBHOOK":
      return new GenericWebhookCRMProvider();
    case "DEMO":
    default:
      return new DemoCRMProvider();
  }
}
