import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, Save, Plus, Trash2, 
  Users, UsersRound, MapPin, FileText, Settings, 
  ArrowRightLeft, DollarSign, SplitSquareHorizontal, ShieldAlert, Lock, ArrowDownToLine, ChevronRight 
} from 'lucide-react';

interface SecretarialCenterTabProps {
  clientId: string;
}

export default function SecretarialCenterTab({ clientId }: SecretarialCenterTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [secretarialData, setSecretarialData] = useState({
    directors: [] as any[],
    owners: [] as any[],
  });

  const corporateChanges = [
    { label: 'Add, update, or remove directors', href: `/dashboard/services/corporate-secretary/directors?clientId=${clientId}`, icon: Users },
    { label: 'Add, update, or remove officers', href: `/dashboard/services/corporate-secretary/officers?clientId=${clientId}`, icon: UsersRound },
    { label: 'Change your registered office address', href: `/dashboard/services/corporate-secretary/registered-address?clientId=${clientId}`, icon: MapPin },
    { label: 'Federal Articles of Amendment', href: `/dashboard/services/corporate-secretary/articles-of-amendment?clientId=${clientId}`, icon: FileText },
    { label: 'Making Changes to Your Corporation', href: `/dashboard/services/corporate-secretary/overview?clientId=${clientId}`, icon: Settings },
  ];

  const ownershipChanges = [
    { label: 'Share transfers', href: `/dashboard/services/corporate-secretary/share-transfers?clientId=${clientId}`, icon: ArrowRightLeft },
    { label: 'Price per Share', href: `/dashboard/services/corporate-secretary/price-per-share?clientId=${clientId}`, icon: DollarSign },
    { label: 'Share Splits', href: `/dashboard/services/corporate-secretary/share-splits?clientId=${clientId}`, icon: SplitSquareHorizontal },
    { label: 'Share Restrictions in Corporate Documents', href: `/dashboard/services/corporate-secretary/share-restrictions?clientId=${clientId}`, icon: ShieldAlert },
    { label: 'Private Issuer Exemption', href: `/dashboard/services/corporate-secretary/private-issuer-exemption?clientId=${clientId}`, icon: Lock },
    { label: 'Share Repurchases (or "Buy-Backs")', href: `/dashboard/services/corporate-secretary/share-repurchases?clientId=${clientId}`, icon: ArrowDownToLine },
  ];

  const loadClient = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      const data = await res.json();
      setClient(data.client);
      if (data.client?.secretarial_data) {
        let sd = data.client.secretarial_data;
        if (typeof sd === 'string') sd = JSON.parse(sd);
        setSecretarialData({
          directors: sd.directors || [],
          owners: sd.owners || [],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretarial_data: secretarialData })
      });
      // Optionally show a success toast
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#94A3B8', padding: '24px' }}>Loading secretarial data...</div>;

  return (
    <div style={{ background: 'white', color: '#1E293B', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
      
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#0F172A' }}>
          <Briefcase size={20} style={{ color: '#6366f1' }} />
          Secretarial Center
        </h2>
      </div>

      <div style={{ padding: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '16px' }}>
          
          {/* Card 1: Corporate Changes */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Corporate Changes</h2>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>Manage directors, officers, and corporate structure</p>
            </div>
            <div style={{ padding: '12px' }}>
              {corporateChanges.map((item, i) => (
                <Link key={i} href={item.href} className="hover:bg-gray-50" style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease', color: '#1E293B' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0 }}>
                    <item.icon size={18} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 500, fontSize: '14px' }}>
                    {item.label}
                  </div>
                  <ChevronRight size={18} style={{ color: '#CBD5E1' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Card 2: Changing Ownership Structure */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Changing Ownership Structure</h2>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>Manage shares, prices, and transfers</p>
            </div>
            <div style={{ padding: '12px' }}>
              {ownershipChanges.map((item, i) => (
                <Link key={i} href={item.href} className="hover:bg-gray-50" style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease', color: '#1E293B' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0 }}>
                    <item.icon size={18} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 500, fontSize: '14px' }}>
                    {item.label}
                  </div>
                  <ChevronRight size={18} style={{ color: '#CBD5E1' }} />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
      
    </div>
  );
}
