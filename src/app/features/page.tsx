'use client';
import Link from 'next/link';
import { HardDrive, Network, Database, ShieldCheck, UserCheck, Bolt, Target, BarChart2, CheckCircle } from 'lucide-react';
import '../globals.css'; // Inheriting global styles

export default function FeaturesPage() {
  return (
    <div className="landing" style={{ background: '#f8fafc' }}>
      {/* NAV */}
      <nav className="landing-nav" style={{ position: 'sticky' }}>
        <div className="landing-nav-inner">
          <Link href="/" className="landing-brand"><div className="brand-logo-sm">A</div> Abidebylaw</Link>
          <div className="landing-nav-links">
            <Link href="/" className="nav-item">Home</Link>
            <Link href="/compliance-guide" className="nav-item">Why Compliance?</Link>
            <Link href="/login" className="nav-item">Sign In</Link>
            <Link href="/signup" className="landing-btn landing-btn-primary" style={{ padding: '8px 20px' }}>Deploy</Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ padding: '120px 24px', textAlign: 'center', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
        <div className="landing-hero-badge"><Bolt size={14} /> Full Technical Specification</div>
        <h1 className="super-title" style={{ fontSize: '56px', marginBottom: '20px' }}>Abidebylaw Features Matrix</h1>
        <p className="super-sub" style={{ margin: '0 auto', fontSize: '20px' }}>Discover the robust enterprise tools driving our ultimate compliance engine.</p>
      </section>

      {/* DETAILED LIST */}
      <section style={{ padding: '100px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Core Architecture */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}><Network color="#4f46e5" /> System Architecture</h2>
          <div className="bento-grid" style={{ gridTemplateColumns: '1fr', gap: '30px' }}>
            <div className="bento-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
               <Database className="feature-icon-box bg-indigo-light" style={{ flexShrink: 0 }} />
               <div>
                 <h3>Multi-Tenant Data Isolation</h3>
                 <p>Every firm acts as a solitary tenant securely cordoned at the database level. However, users can traverse seamlessly, verifying their identities and approving selective data exports across organizations.</p>
               </div>
            </div>
            <div className="bento-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
               <HardDrive className="feature-icon-box bg-indigo-light" style={{ flexShrink: 0 }} />
               <div>
                 <h3>Globally Distributed Storage</h3>
                 <p>Document storage runs on highly redundant distributed volumes, offering absolute persistence for critical audit data whilst delivering edge-optimized load times.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Workflows */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}><Target color="#e11d48" /> Workflows & Practice Management</h2>
          <div className="bento-grid" style={{ gridTemplateColumns: '1fr', gap: '30px' }}>
            <div className="bento-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
               <BarChart2 className="feature-icon-box bg-rose-light" style={{ flexShrink: 0 }} />
               <div>
                 <h3>Project & Time Tracking</h3>
                 <p>Construct multi-stage operational lifecycles for any task—ranging from simple individual tax filings to exhaustive corporate audits. Automatically attribute revenues against logged hours.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}><ShieldCheck color="#059669" /> Security & Trust</h2>
          <div className="bento-grid" style={{ gridTemplateColumns: '1fr', gap: '30px' }}>
            <div className="bento-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
               <UserCheck className="feature-icon-box bg-emerald-light" style={{ flexShrink: 0 }} />
               <div>
                 <h3>Role-Based Access Control (RBAC)</h3>
                 <p>Firm administrators can enact extremely granular permissions limiting staff members purely to specific clients, protecting wide-reaching data exposures natively.</p>
               </div>
            </div>
          </div>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="ultra-footer" style={{ marginTop: '0' }}>
         <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
          &copy; {new Date().getFullYear()} Abidebylaw Global Operations. Built for the modern ecosystem.
        </div>
      </footer>
    </div>
  );
}
