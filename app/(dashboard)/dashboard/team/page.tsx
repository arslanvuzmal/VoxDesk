import { permanentRedirect } from 'next/navigation';

export default function LegacyTeamPage() {
  permanentRedirect('/dashboard/settings?section=team');
}

