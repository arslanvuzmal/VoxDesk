import { permanentRedirect } from 'next/navigation';

export default function LegacyAuditPage() {
  permanentRedirect('/dashboard/settings/audit');
}
