'use client';
import Link from 'next/link';
import { LayoutDashboard, Users, FileStack, ShieldAlert, BadgeDollarSign, UserPlus, CheckCircle2, ArrowRight, Zap, Lock, HardDrive, Database, Network, Scale, BellRing, Target, FolderSync } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-mesh-bg"></div>
      
      {/* GLASSS NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-brand"><div className="brand-logo-sm">A</div> Abidebylaw</Link>
          <div className="landing-nav-links">
            <a href="#why-compliance" className="nav-item">Why Compliance?</a>
            <a href="#features" className="nav-item">Features Matrix</a>
            <Link href="/login" className="nav-item">Sign In</Link>
            <Link href="/signup" className="landing-btn landing-btn-primary" style={{ padding: '10px 24px' }}>Deploy Now</Link>
          </div>
        </div>
      </nav>

      {/* SUPER HERO */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <Zap size={14} /> Next-Generation Compliance Engine
        </div>
        <h1 className="landing-hero-title">
          Universal Compliance.<br />
          <span>Uncompromising Security.</span>
        </h1>
        <p className="landing-hero-sub">
          The ultimate multi-tenant SaaS platform built to shield proactive individuals from strict penalties and scale professional consulting firms to global heights.
        </p>
        <div className="landing-hero-cta">
          <Link href="/signup" className="landing-btn landing-btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <a href="#demo" className="landing-btn landing-btn-secondary" style={{ padding: '16px 36px', fontSize: '16px' }}>
            View Full Features
          </a>
        </div>
      </section>

      {/* MOCK UI ABSTRACT */}
      <div className="mock-ui-container" id="demo">
        <div className="mock-ui-frame">
          <div className="mock-ui-header">
            <div className="mock-dots">
              <div className="mock-dot r"></div><div className="mock-dot y"></div><div className="mock-dot g"></div>
            </div>
          </div>
          <div className="mock-ui-body">
            <div className="mock-ui-side">
              <div className="mock-skeleton" style={{ height: '30px', width: '80%', marginBottom: '30px' }}></div>
              <div className="mock-skeleton" style={{ height: '16px', width: '90%' }}></div>
              <div className="mock-skeleton" style={{ height: '16px', width: '60%' }}></div>
              <div className="mock-skeleton" style={{ height: '16px', width: '100%' }}></div>
              <div className="mock-skeleton" style={{ height: '16px', width: '70%', marginTop: '30px' }}></div>
              <div className="mock-skeleton" style={{ height: '16px', width: '50%' }}></div>
            </div>
            <div className="mock-ui-main" style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr 1fr' }}>
               <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', gridColumn: 'span 3', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '20px', fontWeight: 800 }}>IRS Form 1040 Pending</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Due in 14 days. Avoid $450 late penalty.</p>
                  </div>
                  <div style={{ background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: 600 }}>File Automatically</div>
               </div>
               <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', height: '180px' }}>
                 <div className="mock-skeleton" style={{ height: '40px', width: '40px', borderRadius: '10px', background: '#dbeafe' }}></div>
                 <div className="mock-skeleton" style={{ height: '16px', width: '70%', marginTop: 'auto' }}></div>
                 <div className="mock-skeleton" style={{ height: '16px', width: '40%' }}></div>
               </div>
               <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', height: '180px' }}>
                 <div className="mock-skeleton" style={{ height: '40px', width: '40px', borderRadius: '10px', background: '#dcfce3' }}></div>
                 <div className="mock-skeleton" style={{ height: '16px', width: '80%', marginTop: 'auto' }}></div>
                 <div className="mock-skeleton" style={{ height: '16px', width: '60%' }}></div>
               </div>
               <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', height: '180px' }}>
                 <div className="mock-skeleton" style={{ height: '40px', width: '40px', borderRadius: '10px', background: '#fee2e2' }}></div>
                 <div className="mock-skeleton" style={{ height: '16px', width: '90%', marginTop: 'auto' }}></div>
                 <div className="mock-skeleton" style={{ height: '16px', width: '50%' }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY COMPLIANCE MATTERS */}
      <section className="super-section-dark" id="why-compliance">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="super-title">The Cost of Non-Compliance is Severe.</h2>
          <p className="super-sub super-dark-sub">Whether you are an individual managing personal taxes or a global consultant handling hundreds of clients, missed deadlines and improper legal registrations trigger enormous financial penalties.</p>
          
          <div className="bento-grid" style={{ marginBottom: '60px' }}>
            <div className="bento-card-dark">
              <ShieldAlert className="feature-icon-box bg-rose-light" />
              <h3>Avoid Devastating Penalties</h3>
              <p>Government agencies across both the United States and Canada enforce strict compound-interest penalties for late regulatory filings. Abidebylaw utilizes continuous tracking engines to warn you weeks in advance.</p>
            </div>
            <div className="bento-card-dark">
              <UserPlus className="feature-icon-box bg-emerald-light" />
              <h3>Critical Individual Registration</h3>
              <p>By registering a free personal vault on Abidebylaw, individuals safeguard their identities, track family entities, and aggregate sensitive financial data before passing it cryptographically to certified consultants.</p>
            </div>
            <div className="bento-card-dark bento-span-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <BadgeDollarSign className="feature-icon-box bg-amber-light" />
              <h3>Global Jurisdiction Automation</h3>
              <p>Our platform automatically determines your regional templates. For instance, signing up from the US immediately provisions IRS Forms (1040/1120), whereas a UK profile seamlessly maps to HMRC (SA100) parameters, guaranteeing perfect regional compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MASSIVE FEATURE MATRIX */}
      <section className="super-section" id="features">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="super-title">Unparalleled Feature Matrix</h2>
          <p className="super-sub" style={{ margin: '0 auto' }}>A heavy, densely configured array of enterprise-grade tools available to every user.</p>
        </div>

        <div className="bento-grid">
          <div className="bento-card bento-span-2">
            <HardDrive className="feature-icon-box bg-indigo-light" />
            <h3>Impenetrable Zero-Knowledge Vault</h3>
            <p>Every firm client and individual user is granted a native, independently encrypted document vault. Host your raw tax data, identity documents, and sensitive corporate ledgers with absolute peace of mind. Files are automatically processed through backend OCR for immediate categorizations.</p>
          </div>
          <div className="bento-card">
            <FolderSync className="feature-icon-box bg-emerald-light" />
            <h3>Google Drive Bidirectional Sync</h3>
            <p>Eliminate cloud-vendor silos. Map your Abidebylaw environments to external Google Workspace folders to maintain a live, two-way mirror of your most critical document hierarchies.</p>
          </div>
          <div className="bento-card">
            <LayoutDashboard className="feature-icon-box bg-amber-light" />
            <h3>Multi-Stage CRM Orchestration</h3>
            <p>Firms can navigate clients seamlessly through a multi-tiered pipeline: from raw lead tracking, to onboarding extraction, all the way to finalized annual report generations.</p>
          </div>
          <div className="bento-card">
            <Database className="feature-icon-box bg-rose-light" />
            <h3>Logical Multi-Tenancy</h3>
            <p>Built with cutting edge Database isolation. Firm scopes are rigidly separated while intentionally allowing cross-linked clients to safely grant granular access to their unified data sets.</p>
          </div>
          <div className="bento-card">
            <Target className="feature-icon-box bg-indigo-light" />
            <h3>Dynamic Workflow Engines</h3>
            <p>Assign highly complex project trees internally. Dispatch tasks across legal, tax, and auditing departments while monitoring overarching timeline completions via real-time analytics.</p>
          </div>
        </div>
      </section>

      {/* PENALTY BANNER CTA */}
      <div style={{ padding: '0 24px', marginBottom: '120px' }}>
        <div className="penalty-banner">
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>Don't let a missed form cost you thousands.</h2>
            <p style={{ fontSize: '18px', color: '#e0e7ff', maxWidth: '600px', lineHeight: 1.6 }}>Scale your consultancy. Protect your personal assets. Secure your compliance lifecycle from day one.</p>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Link href="/signup" className="landing-btn landing-btn-secondary" style={{ padding: '18px 40px', fontSize: '18px', color: '#4c1d95', borderRadius: '16px' }}>Start 100% Free</Link>
          </div>
        </div>
      </div>

      {/* ULTRA FOOTER */}
      <footer className="ultra-footer">
        <div className="ultra-footer-grid">
          <div className="footer-col">
            <div className="landing-brand"><div className="brand-logo-sm">A</div> Abidebylaw</div>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '20px', lineHeight: 1.6 }}>The unified multi-tenant SaaS platform built for professional consulting firms and proactive individuals.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/features" className="footer-link">Feature Matrix</Link>
            <Link href="/compliance-guide" className="footer-link">Penalty Preventions</Link>
            <Link href="/signup" className="footer-link">Google Drive Sync</Link>
            <Link href="/signup" className="footer-link">Firm CRM</Link>
          </div>
          <div className="footer-col">
            <h4>Use Cases</h4>
            <Link href="/signup" className="footer-link">For Accountants</Link>
            <Link href="/signup" className="footer-link">For Audit Advisory</Link>
            <Link href="/signup" className="footer-link">For Individuals</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/" className="footer-link">Privacy Protocol</Link>
            <Link href="/" className="footer-link">Terms of Service</Link>
            <Link href="/" className="footer-link">Encryption Standards</Link>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#94a3b8', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
          &copy; {new Date().getFullYear()} Abidebylaw Global Operations. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
