'use client';
import { useParams } from 'next/navigation';
import Workspace from '@/components/t1/Workspace';

export default function EngagementDetailPage() {
  const params = useParams();
  return <Workspace engagementId={params?.engagementId as string} />;
}
