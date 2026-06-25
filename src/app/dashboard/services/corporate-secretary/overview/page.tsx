'use client';
import React from 'react';
import Link from 'next/link';
import { Settings, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CorporateSecretaryOverview() {
  const benefits = [
    "No filling out forms — platform fills forms automatically using existing profile data",
    "eSignature tool for quick signing",
    "Government filing on your behalf",
    "Legally required corporate resolutions prepared automatically",
    "All documents stored in dashboard Minute Book"
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard/services/corporate-secretary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
          ← Back to Corporate Secretary
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={32} style={{ color: '#6366f1' }} />
          Making Changes to Your Corporation
        </h1>
        <p style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.6 }}>
          As your business grows, your corporate structure will need to evolve. We make these changes seamless and legally compliant.
        </p>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>The Abide by Law Advantage</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
          {benefits.map((benefit, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle2 size={20} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ color: '#334155', fontSize: '15px' }}>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Navigate to Specific Changes</h2>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        
        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', marginTop: 0, marginBottom: '12px' }}>Company Changes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/dashboard/services/corporate-secretary/registered-address" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Change Registered Head Office Address <ArrowRight size={14} /></Link>
            <Link href="/dashboard/services/corporate-secretary/directors" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Add/Remove/Edit Directors <ArrowRight size={14} /></Link>
            <Link href="/dashboard/services/corporate-secretary/officers" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Add/Remove/Edit Officers <ArrowRight size={14} /></Link>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', marginTop: 0, marginBottom: '12px' }}>Amendments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/dashboard/services/corporate-secretary/articles-of-amendment" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Change Corporation's Name <ArrowRight size={14} /></Link>
            <Link href="/dashboard/services/corporate-secretary/articles-of-amendment" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Change Minimum/Maximum Directors <ArrowRight size={14} /></Link>
            <Link href="/dashboard/services/corporate-secretary/articles-of-amendment" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Change Share Classes <ArrowRight size={14} /></Link>
            <Link href="/dashboard/services/corporate-secretary/articles-of-amendment" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Restriction on Share Transfers & Provisions <ArrowRight size={14} /></Link>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', marginTop: 0, marginBottom: '12px' }}>Ownership Structure Changes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#64748B', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Issue Shares (Coming soon)</span>
            <Link href="/dashboard/services/corporate-secretary/share-transfers" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Transfer Shares <ArrowRight size={14} /></Link>
            <Link href="/dashboard/services/corporate-secretary/share-repurchases" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>Share Repurchases (Buy-Backs) <ArrowRight size={14} /></Link>
          </div>
        </div>

      </div>
    </div>
  );
}
