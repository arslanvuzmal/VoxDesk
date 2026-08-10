import { permanentRedirect } from 'next/navigation';

export default function LegacyEscalationsPage() {
  permanentRedirect('/dashboard/conversations?tab=escalated');
}

