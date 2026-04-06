'use client';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, BadgeDollarSign, FileWarning, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import '../globals.css';

export default function ComplianceGuidePage() {
  return (
    <div className="landing" style={{ background: '#fefeff' }}>
      
      {/* NAV */}
      <nav className="landing-nav" style={{ position: 'sticky' }}>
        <div className="landing-nav-inner">
          <Link href="/" className="landing-brand"><div className="brand-logo-sm" style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)' }}>A</div> Abidebylaw</Link>
          <div className="landing-nav-links">
            <Link href="/" className="nav-item">Home</Link>
            <Link href="/features" className="nav-item">Features</Link>
            <Link href="/login" className="nav-item">Sign In</Link>
            <Link href="/signup" className="landing-btn landing-btn-primary" style={{ padding: '8px 20px', background: '#4c1d95' }}>Protect Yourself Free</Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="super-section-dark" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #020617, #1e1b4b)' }}>
        <div className="landing-hero-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}><ShieldAlert size={14} /> The True Cost of Non-Compliance</div>
        <h1 className="super-title" style={{ fontSize: '56px', marginBottom: '20px' }}>Why You Must Register Today.</h1>
        <p className="super-sub super-dark-sub" style={{ margin: '0 auto', fontSize: '20px', color: '#c4b5fd' }}>Understanding the severe financial penalties and legal ramifications individuals face for missing simple annual deadlines.</p>
      </section>

      {/* GUIDE BODY */}
      <section style={{ padding: '80px 24px', maxWidth: '850px', margin: '0 auto', fontSize: '18px', lineHeight: 1.8, color: '#334155' }}>
        
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', letterSpacing: '-0.02em' }}>The Hidden Dangers of Missing Deadlines</h2>
        <p style={{ marginBottom: '30px' }}>
          Every year, millions of individuals overlook standard compliance registrations simply because the dates slip their minds. 
          What begins as a seemingly small administrative oversight rapidly balloons into severe, compounding penalties orchestrated by global government tax and corporate agencies.
        </p>

        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '30px', borderRadius: '20px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#be123c', fontWeight: 700, fontSize: '20px' }}>
            <AlertTriangle /> The Compound Interest Threat
          </div>
          <p style={{ margin: 0, color: '#881337', fontSize: '16px' }}>
            When a deadline is missed, governments don't just charge a flat fee. For example, failing to file an IRS 1040 can result in a <strong>5% penalty per month</strong> on unpaid taxes, up to 25%. Similarly, failure to file corporate entity renewals can result in summary dissolution—freezing all your business assets unexpectedly overnight.
          </p>
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', marginTop: '60px' }}>Why Individual Registration is Mandatory for Safety</h2>
        <p style={{ marginBottom: '30px' }}>
          By establishing a free personal account on Abidebylaw, you immediately shift from a reactive state to a completely proactive defense strategy. Here is how your free vault protects you:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '60px' }}>
          <div style={{ display: 'flex', gap: '16px', padding: '24px', background: '#f8fafc', borderRadius: '16px' }}>
             <BadgeDollarSign size={28} color="#059669" style={{ flexShrink: 0 }} />
             <div>
               <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Zero Penalty Guarantee</h4>
               <p style={{ margin: 0, fontSize: '15px' }}>Our automated reminder engines sync directly into your calendar. We track your specific jurisdiction (US, UK, CA, etc.) and alert you 60, 30, and 7 days prior to any critical cutoff.</p>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', padding: '24px', background: '#f8fafc', borderRadius: '16px' }}>
             <FileWarning size={28} color="#059669" style={{ flexShrink: 0 }} />
             <div>
               <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Instant Consultant Linking</h4>
               <p style={{ margin: 0, fontSize: '15px' }}>When you do fall behind, immediately share your Abidebylaw vault with a certified professional embedded in our network. They take over your compliance matrix instantly, mitigating further charges.</p>
             </div>
          </div>
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', marginTop: '60px' }}>Take Control of Your Legal Footprint</h2>
        <p style={{ marginBottom: '40px' }}>
          The peace of mind granted by an immutable document ledger and automated compliance tracking pays for itself immediately upon your first averted crisis. The registration for individual users is permanently free, ensuring robust safety for everyone.
        </p>

        <Link href="/signup" className="landing-btn landing-btn-primary" style={{ width: '100%', padding: '20px', fontSize: '20px', background: '#4c1d95', borderRadius: '16px', boxShadow: '0 10px 25px rgba(76,29,149,0.3)' }}>
          Create Your Free Safety Vault Now <ArrowRight />
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="ultra-footer" style={{ marginTop: '0', borderTop: '1px solid #f1f5f9' }}>
         <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
          &copy; {new Date().getFullYear()} Abidebylaw Safety & Compliance Education.
        </div>
      </footer>
    </div>
  );
}
