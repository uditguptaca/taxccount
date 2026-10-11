'use client';
import { useParams } from 'next/navigation';
import Runner from '@/components/t1/Runner';

// The firm filling in or correcting the form for a client uses the same screen the client sees.
export default function PreparerFill() {
  const params = useParams();
  const id = params?.engagementId as string;
  return <Runner engagementId={id} backHref={`/dashboard/tax-intake/${id}`} />;
}
