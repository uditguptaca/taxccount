'use client';
import { useParams } from 'next/navigation';
import Runner from '@/components/t1/Runner';

export default function ClientTaxIntakePortal() {
  const params = useParams();
  return <Runner engagementId={params?.engagementId as string} />;
}
