import { permanentRedirect } from 'next/navigation';

export default function LegacyPhoneNumbersPage() {
  permanentRedirect('/dashboard/integrations?section=telephony');
}

