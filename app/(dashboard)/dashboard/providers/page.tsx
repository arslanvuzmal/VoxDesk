import { permanentRedirect } from 'next/navigation';

export default function LegacyProvidersPage() {
  permanentRedirect('/dashboard/integrations');
}
