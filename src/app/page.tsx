'use client';
import Link from 'next/link';
import { Shield, Users, FileStack, BarChart2, Building2, User, CheckCircle2, ArrowRight, Zap, Lock, Globe, HardDrive, Database, Network } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-brand"><span className="brand-logo-sm">A</span> Abidebylaw</Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: 14 }}>Sign In</Link>
            <Link href="/signup" className="btn btn-primary" style={{ fontSize: 14, padding: '8px 20px' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-badge">🚀 Compliance Management, Reimagined</div>
        <h1 className="landing-hero-title">Universal Compliance.<br />Uncompromising Security.</h1>
        <p className="landing-hero-sub">The unified multi-tenant SaaS platform built for professional consulting firms and proactive individuals. Manage clients, track regulatory deadlines, and synchronize your data effortlessly.</p>
        <div className="landing-hero-cta">
          <Link href="/signup" className="btn btn-primary btn-lg">Get Started Free <ArrowRight size={18} /></Link>
          <Link href="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>
        <div className="landing-hero-stats">
          <div><strong>3</strong><span>Demo Firms</span></div>
          <div><strong>40+</strong><span>Features</span></div>
          <div><strong>∞</strong><span>Compliance Items</span></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-section" id="features">
        <h2 className="landing-section-title">Built for two audiences</h2>
        <p className="landing-section-sub">Whether you run a consulting firm or manage personal compliance — we&apos;ve got you covered.</p>
        <div className="landing-cards">
          <div className="landing-card landing-card-firm">
            <div className="landing-card-icon"><Building2 size={28} /></div>
            <h3>For Consulting Firms</h3>
            <p>Full-featured practice management enabling data-driven advisory and seamless client onboarding.</p>
            <ul className="landing-feature-list">
              <li><CheckCircle2 size={16} /> B2B/B2C CRM Pipeline & Conversion</li>
              <li><CheckCircle2 size={16} /> Compliance Template Engine</li>
              <li><CheckCircle2 size={16} /> Multi-Stage Project Orchestration</li>
              <li><CheckCircle2 size={16} /> Revenue Tracking & Time Management</li>
              <li><CheckCircle2 size={16} /> Granular Team Role Administration</li>
              <li><CheckCircle2 size={16} /> Branded Client Communication Portal</li>
              <li><CheckCircle2 size={16} /> Two-Way Secure Document Vault</li>
              <li><CheckCircle2 size={16} /> Custom Client Request Workflows</li>
            </ul>
          </div>
          <div className="landing-card landing-card-individual">
            <div className="landing-card-icon"><User size={28} /></div>
            <h3>For Individuals</h3>
            <p>Your self-sovereign digital vault for managing personal risk, entities, and tax preparation.</p>
            <ul className="landing-feature-list">
              <li><CheckCircle2 size={16} /> Universal Identity Verification</li>
              <li><CheckCircle2 size={16} /> Cross-Firm Data Portability</li>
              <li><CheckCircle2 size={16} /> Family & Entity Ownership Tracking</li>
              <li><CheckCircle2 size={16} /> Zero-Knowledge Data Architecture</li>
              <li><CheckCircle2 size={16} /> Automated Deadline Reminders</li>
              <li><CheckCircle2 size={16} /> Consultant Marketplace Directory</li>
              <li><CheckCircle2 size={16} /> 1-Click Firm Onboarding</li>
              <li><CheckCircle2 size={16} /> Audit-Ready Document Exporting</li>
            </ul>
          </div>
        </div>
      </section>

      {/* UNIVERSAL VAULT FEATURE */}
      <section className="landing-section" style={{ background: 'var(--blue-50)', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
        <h2 className="landing-section-title">The Universal Compliance Vault</h2>
        <p className="landing-section-sub">A cryptographic, immutable record of your most sensitive financial and legal documents.</p>
        
        <div className="landing-grid-3" style={{ marginTop: 40 }}>
          <div className="landing-capability" style={{ background: 'white' }}>
            <div className="landing-capability-icon"><HardDrive size={24} /></div>
            <h4>Native Google Drive Sync</h4>
            <p>Link your Google Workspace easily. Automated 2-way syncing ensures your cloud folders mirror the vault in real-time, preventing data silos and vendor lock-in.</p>
          </div>
          <div className="landing-capability" style={{ background: 'white' }}>
            <div className="landing-capability-icon"><Database size={24} /></div>
            <h4>Automated OCR & NLP</h4>
            <p>Every uploaded document undergoes secure optical character recognition and natural language processing to extract structured data and automate tagging.</p>
          </div>
          <div className="landing-capability" style={{ background: 'white' }}>
            <div className="landing-capability-icon"><Network size={24} /></div>
            <h4>SaaS Multi-Tenancy</h4>
            <p>Strict logical database partitioning ensures your firm's data or your personal records are hermetically isolated while preserving rapid cross-network permissions.</p>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="landing-section landing-section-dark">
        <h2 className="landing-section-title">Platform Capabilities</h2>
        <div className="landing-grid-3">
          {[
            { icon: <Shield size={24} />, title: 'Multi-Tenant Security', desc: 'Complete data isolation between organizations with role-based access control.' },
            { icon: <Users size={24} />, title: 'Team Collaboration', desc: 'Assign tasks, manage teams, and track progress across your entire firm.' },
            { icon: <FileStack size={24} />, title: 'Document Management', desc: 'Secure document vault with versioning, approvals, and client-facing uploads.' },
            { icon: <BarChart2 size={24} />, title: 'Analytics & Reports', desc: 'Revenue tracking, engagement analytics, and team performance dashboards.' },
            { icon: <Zap size={24} />, title: 'Workflow Automation', desc: 'Auto-advance stages, send reminders, and trigger actions on events.' },
            { icon: <Globe size={24} />, title: 'Client Portal', desc: 'Branded portal for clients to view progress, upload docs, and communicate.' },
          ].map((f, i) => (
            <div key={i} className="landing-capability">
              <div className="landing-capability-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="landing-section" id="pricing">
        <h2 className="landing-section-title">Simple, transparent pricing</h2>
        <p className="landing-section-sub">Start free. Upgrade as you grow.</p>
        <div className="landing-pricing">
          {[
            { name: 'Free', price: '$0', period: '/forever', desc: 'For individuals and small firms getting started', features: ['1 user','5 clients','Basic compliance tracking','Personal vault','Email support'], cta: 'Get Started', primary: false },
            { name: 'Professional', price: '$49', period: '/mo', desc: 'For growing consulting firms', features: ['20 users','100 clients','Full CRM & pipeline','Team management','Priority support','Custom templates'], cta: 'Start Free Trial', primary: true },
            { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large firms with complex needs', features: ['Unlimited users','Unlimited clients','API access','SSO integration','Dedicated support','Custom integrations'], cta: 'Contact Sales', primary: false },
          ].map((p, i) => (
            <div key={i} className={`landing-price-card ${p.primary ? 'landing-price-featured' : ''}`}>
              {p.primary && <div className="landing-price-badge">Most Popular</div>}
              <h3>{p.name}</h3>
              <div className="landing-price-amount">{p.price}<span>{p.period}</span></div>
              <p className="landing-price-desc">{p.desc}</p>
              <ul>{p.features.map((f, fi) => <li key={fi}><CheckCircle2 size={14} /> {f}</li>)}</ul>
              <Link href="/signup" className={`btn ${p.primary ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div><span className="brand-logo-sm">A</span> <strong>Abidebylaw</strong> — Compliance management for everyone.</div>
          <div className="landing-footer-links">
            <Link href="/login">Sign In</Link>
            <Link href="/signup">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
