import { redirect } from 'next/navigation';

export default function CallsPage() {
  redirect('/dashboard/conversations');
}
