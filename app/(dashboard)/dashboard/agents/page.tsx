import { permanentRedirect } from 'next/navigation';

export default function LegacyAgentsPage() {
  permanentRedirect('/dashboard/agent');
}
