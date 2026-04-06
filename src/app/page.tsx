'use client';
import Link from 'next/link';
import { useState } from 'react';
import './landing.css';

/* -------- SVG ICON COMPONENTS -------- */
const IconCalendar = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const IconShield = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const IconFolder = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>);
const IconBell = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>);
const IconUsers = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>);
const IconMessageCircle = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>);
const IconCheck = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconArrowRight = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const IconCloud = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" /></svg>);
const IconClipboard = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>);
const IconGrid = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>);
const IconBriefcase = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>);
const IconUser = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconHome = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
const IconChevDown = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
const IconStar = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const IconZap = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);
const IconMenu = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);
const IconX = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);

/* -------- FAQ COMPONENT -------- */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="abl-faq-item" data-open={open} onClick={() => setOpen(!open)}>
      <div className="abl-faq-q">
        <span>{q}</span>
        <span className="abl-faq-chevron"><IconChevDown size={18} /></span>
      </div>
      {open && <div className="abl-faq-a">{a}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────
   MAIN LANDING PAGE
   ──────────────────────────────────────────── */
export default function LandingPage() {
  const [annual, setAnnual] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);

  const features = [
    { icon: <IconCalendar size={24} />, color: "#6366f1", title: "Compliance Tracking", desc: "Track recurring and one-time compliance tasks. View deadlines by month, urgency, or category with color-coded status indicators." },
    { icon: <IconFolder size={24} />, color: "#059669", title: "Document Management", desc: "Keep all documents organized and linked to specific tasks. One place for records -- accessible when you need them." },
    { icon: <IconCloud size={24} />, color: "#0891b2", title: "Google Drive Integration", desc: "Secure document storage through your own Google Drive. Files stay under your control with easy organization." },
    { icon: <IconBell size={24} />, color: "#d97706", title: "Smart Reminders", desc: "Deadline reminders, pending document alerts, and follow-up notifications. Custom alerts on your schedule." },
    { icon: <IconShield size={24} />, color: "#7c3aed", title: "Personal Compliance Vault", desc: "Your personal dashboard for family tracking, entity management, custom compliance items, notes, and records." },
    { icon: <IconUsers size={24} />, color: "#2563eb", title: "Consultant Workspace", desc: "Manage multiple clients, track pending items, send reminders, request documents, and monitor every deadline." },
    { icon: <IconMessageCircle size={24} />, color: "#db2777", title: "Chat & Collaboration", desc: "Task-based communication, document discussions, and centralized conversation history -- all in context." },
    { icon: <IconClipboard size={24} />, color: "#ea580c", title: "Checklist Engine", desc: "Predefined checklists, task-specific document requirements, and checklist-driven execution for complete coverage." },
    { icon: <IconGrid size={24} />, color: "#64748b", title: "Admin Control Center", desc: "Manage compliance categories, define instructions, approve suggestions, and govern the entire platform." },
  ];

  const audiences = [
    { icon: <IconUser size={28} />, color: "#6366f1", title: "For Individuals", desc: "Track tax filings, passport renewals, insurance deadlines, license expiry dates, and every personal obligation in one organized dashboard.", items: ["Personal compliance timeline", "Automated deadline reminders", "Document organization", "Google Drive linking"] },
    { icon: <IconHome size={28} />, color: "#059669", title: "For Families", desc: "Manage compliance for your entire household -- spouse, children, parents, dependents. Shared records, family reminders, and coordinated tracking.", items: ["Multiple family profiles", "Shared document structure", "Dependent tracking", "Family-wide calendar"] },
    { icon: <IconBriefcase size={28} />, color: "#2563eb", title: "For Consultants", desc: "A complete workspace for tax consultants, accountants, legal professionals, and compliance managers. Track clients, send reminders, request documents.", items: ["Multi-client dashboard", "Client reminders & workflows", "Document request system", "Communication center"] },
    { icon: <IconGrid size={28} />, color: "#d97706", title: "For Businesses", desc: "Manage corporate filings, tax deadlines, GST/HST, renewals, registrations, and internal obligations with team-level visibility.", items: ["Corporate compliance tracking", "Multi-user team access", "Advanced permissions", "Custom workflows"] },
  ];

  const testimonials = [
    { name: "Sarah Mitchell", role: "Individual User", text: "I used to track everything in a spreadsheet. Missed my passport renewal twice. AbideByLaw sends me reminders weeks in advance -- I have not missed a single deadline in 8 months." },
    { name: "James & Priya Chen", role: "Family Account", text: "Managing compliance for our family of five was overwhelming. Now everything from health card renewals to school registrations and tax filings are all in one place." },
    { name: "Robert Williams, CPA", role: "Tax Consultant", text: "I manage 45 clients. Before AbideByLaw, I was chasing documents through email and WhatsApp. Now I see exactly what is pending for each client, and they get automatic reminders." },
    { name: "Maria Rodriguez", role: "Immigration Consultant", text: "My clients have critical visa and PR deadlines. A missed filing can change someone's life. AbideByLaw gives me the visibility and control I need to serve them properly." },
    { name: "David Park", role: "Small Business Owner", text: "Corporate filings, HST, annual returns -- I used to forget at least one thing every quarter. Now everything is tracked with clear deadlines and reminders. Worth every dollar." },
    { name: "Ananya Desai", role: "Sole Proprietor", text: "As a freelancer, I am my own accountant, secretary, and compliance officer. AbideByLaw handles the compliance side so I can focus on actually doing my work." },
  ];

  const plans = [
    {
      name: "Individual", price: annual ? 9 : 12, period: "/month",
      desc: "For one person managing personal compliance.",
      features: ["Personal compliance dashboard", "Unlimited reminders", "Document organization", "Google Drive linking", "Personal timeline view", "Notes & records"],
      cta: "Start Free Trial", popular: false,
    },
    {
      name: "Family", price: annual ? 19 : 24, period: "/month",
      desc: "For households managing multiple family members.",
      features: ["Everything in Individual", "Up to 8 family profiles", "Shared document structure", "Family compliance calendar", "Dependent tracking", "Entity / business tracking", "Priority support"],
      cta: "Start Free Trial", popular: true,
    },
    {
      name: "Consultant", price: annual ? 49 : 62, period: "/month",
      desc: "For professionals managing multiple clients.",
      features: ["Multi-client dashboard", "Client reminders & workflows", "Document request system", "Communication center", "Checklist engine", "Workflow visibility", "Advanced reporting", "Team collaboration"],
      cta: "Start Free Trial", popular: false,
    },
  ];

  return (
    <div className="abl">
      {/* ── NAVIGATION ── */}
      <nav className="abl-nav">
        <div className="abl-nav-inner">
          <Link href="/" className="abl-brand">
            <div className="abl-brand-mark">A</div>
            <span>AbideByLaw</span>
          </Link>
          <div className="abl-nav-links">
            <a href="#features">Product</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">Resources</a>
            <a href="#about">About</a>
          </div>
          <div className="abl-nav-actions">
            <Link href="/login" className="abl-nav-signin">Sign In</Link>
            <Link href="/signup" className="abl-btn-nav">Get Started</Link>
          </div>
          <button className="abl-mobile-toggle" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
        {mobileNav && (
          <div className="abl-mobile-menu">
            <a href="#features" onClick={() => setMobileNav(false)}>Product</a>
            <a href="#solutions" onClick={() => setMobileNav(false)}>Solutions</a>
            <a href="#pricing" onClick={() => setMobileNav(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileNav(false)}>Resources</a>
            <Link href="/login" onClick={() => setMobileNav(false)}>Sign In</Link>
            <Link href="/signup" className="abl-btn-nav" onClick={() => setMobileNav(false)}>Get Started</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="abl-hero">
        <div className="abl-hero-content">
          <div className="abl-hero-badge">
            <IconZap size={14} />
            <span>Compliance management for real life</span>
          </div>
          <h1>Stay compliant.<br />Stay organized.<br /><span>Never miss what matters.</span></h1>
          <p className="abl-hero-desc">
            One place to track every deadline, document, and compliance obligation -- for individuals, families, consultants, and businesses.
          </p>
          <div className="abl-hero-ctas">
            <Link href="/signup" className="abl-btn-primary">Start Free <IconArrowRight size={18} /></Link>
            <a href="#demo" className="abl-btn-outline">See How It Works</a>
          </div>
          <div className="abl-hero-proof">
            <div className="abl-hero-proof-item"><IconShield size={16} /><span>Secure & private</span></div>
            <div className="abl-hero-proof-item"><IconCloud size={16} /><span>Google Drive connected</span></div>
            <div className="abl-hero-proof-item"><IconBell size={16} /><span>Automated reminders</span></div>
          </div>
        </div>

        {/* DASHBOARD MOCKUP */}
        <div className="abl-hero-visual" id="demo">
          <div className="abl-mockup">
            <div className="abl-mockup-bar">
              <div className="abl-mockup-dots"><span></span><span></span><span></span></div>
              <div className="abl-mockup-url">app.abidebylaw.com/dashboard</div>
            </div>
            <div className="abl-mockup-body">
              <div className="abl-mockup-sidebar">
                <div className="abl-ms-logo"><div className="abl-ms-logomark">A</div> AbideByLaw</div>
                <div className="abl-ms-nav">
                  <div className="abl-ms-item active"><IconGrid size={15} /> Dashboard</div>
                  <div className="abl-ms-item"><IconCalendar size={15} /> Calendar</div>
                  <div className="abl-ms-item"><IconClipboard size={15} /> Compliance</div>
                  <div className="abl-ms-item"><IconFolder size={15} /> Documents</div>
                  <div className="abl-ms-item"><IconUsers size={15} /> Family</div>
                  <div className="abl-ms-item"><IconMessageCircle size={15} /> Messages</div>
                  <div className="abl-ms-item"><IconBell size={15} /> Reminders</div>
                </div>
              </div>
              <div className="abl-mockup-main">
                <div className="abl-mm-header">
                  <h4>Good morning, James</h4>
                  <span className="abl-mm-date">Monday, April 6</span>
                </div>
                <div className="abl-mm-kpis">
                  <div className="abl-mm-kpi"><div className="abl-mm-kpi-val urgent">3</div><div className="abl-mm-kpi-label">Urgent</div></div>
                  <div className="abl-mm-kpi"><div className="abl-mm-kpi-val upcoming">7</div><div className="abl-mm-kpi-label">Upcoming</div></div>
                  <div className="abl-mm-kpi"><div className="abl-mm-kpi-val done">24</div><div className="abl-mm-kpi-label">Completed</div></div>
                  <div className="abl-mm-kpi"><div className="abl-mm-kpi-val docs">12</div><div className="abl-mm-kpi-label">Documents</div></div>
                </div>
                <div className="abl-mm-tasks">
                  <div className="abl-mm-task red">
                    <div className="abl-mm-task-dot red"></div>
                    <div className="abl-mm-task-info"><strong>T1 Personal Tax Return</strong><span>Due April 30 &middot; Tax Filing</span></div>
                    <div className="abl-mm-task-badge red">4 days left</div>
                  </div>
                  <div className="abl-mm-task yellow">
                    <div className="abl-mm-task-dot yellow"></div>
                    <div className="abl-mm-task-info"><strong>Passport Renewal</strong><span>Due Dec 31 &middot; Documents & IDs</span></div>
                    <div className="abl-mm-task-badge yellow">Upcoming</div>
                  </div>
                  <div className="abl-mm-task green">
                    <div className="abl-mm-task-dot green"></div>
                    <div className="abl-mm-task-info"><strong>Home Insurance Renewal</strong><span>Completed Jan 10 &middot; Insurance</span></div>
                    <div className="abl-mm-task-badge green">Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="abl-trust">
        <div className="abl-container">
          <div className="abl-trust-grid">
            {[
              ["Built for individuals, families, and consultants", "4 audience types served"],
              ["Reduce missed deadlines by 90%", "Automated reminders & alerts"],
              ["Google Drive-connected document control", "Your files stay under your ownership"],
              ["Secure, organized, and reminder-driven", "Zero document chaos"],
            ].map(([title, sub], i) => (
              <div key={i} className="abl-trust-item">
                <div className="abl-trust-check"><IconCheck size={16} /></div>
                <div>
                  <div className="abl-trust-title">{title}</div>
                  <div className="abl-trust-sub">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section className="abl-section abl-section-light" id="about">
        <div className="abl-container">
          <div className="abl-section-header">
            <div className="abl-section-label">The Problem</div>
            <h2>Important things slip through the cracks. It is not because you do not care.</h2>
            <p className="abl-section-desc">It is because your deadlines live in email threads, your documents are scattered across folders, and reminders come too late -- if they come at all.</p>
          </div>
          <div className="abl-problem-grid">
            {[
              { icon: <IconFolder size={22} />, title: "Scattered documents", desc: "Tax slips in email, IDs on your phone, insurance papers filed who-knows-where." },
              { icon: <IconCalendar size={22} />, title: "Missed deadlines", desc: "Renewal dates pass silently. Filing windows close. Penalties arrive without warning." },
              { icon: <IconMessageCircle size={22} />, title: "Follow-up chaos", desc: "Consultants chasing clients. Clients chasing paperwork. No single source of truth." },
              { icon: <IconBell size={22} />, title: "Last-minute panic", desc: "Every April, every quarter -- the same scramble. Missing documents, late submissions, avoidable stress." },
            ].map((item, i) => (
              <div key={i} className="abl-problem-card">
                <div className="abl-problem-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION SECTION ── */}
      <section className="abl-section">
        <div className="abl-container">
          <div className="abl-section-header">
            <div className="abl-section-label">The Solution</div>
            <h2>One command center for compliance, documents, and deadlines.</h2>
            <p className="abl-section-desc">AbideByLaw brings everything into a single, organized workspace. Track what is due, keep every document in place, coordinate with your consultants, and stay ahead -- always.</p>
          </div>
          <div className="abl-solution-grid">
            {[
              { icon: <IconCalendar size={20} />, label: "Deadline visibility", desc: "See what is due now, next week, and next quarter." },
              { icon: <IconClipboard size={20} />, label: "Task ownership", desc: "Every item has a clear owner and timeline." },
              { icon: <IconBell size={20} />, label: "Proactive reminders", desc: "Alerts before deadlines, not after penalties." },
              { icon: <IconFolder size={20} />, label: "Documents linked to tasks", desc: "The right file, attached to the right obligation." },
              { icon: <IconUsers size={20} />, label: "Consultant collaboration", desc: "Share securely. Communicate in context." },
              { icon: <IconClipboard size={20} />, label: "Checklist-driven execution", desc: "Know exactly what is needed, step by step." },
            ].map((item, i) => (
              <div key={i} className="abl-solution-item">
                <div className="abl-solution-icon">{item.icon}</div>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID (Dark) ── */}
      <section className="abl-section abl-section-dark" id="features">
        <div className="abl-container">
          <div className="abl-section-header light">
            <div className="abl-section-label light">Platform Capabilities</div>
            <h2>Everything you need to stay compliant and organized.</h2>
            <p className="abl-section-desc">A complete system built for real-world compliance -- not just another task manager.</p>
          </div>
          <div className="abl-feature-grid">
            {features.map((f, i) => (
              <div key={i} className="abl-feature-card">
                <div className="abl-feature-icon" style={{ background: f.color + "18", color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="abl-section">
        <div className="abl-container">
          <div className="abl-section-header">
            <div className="abl-section-label">How It Works</div>
            <h2>Up and running in minutes, not days.</h2>
          </div>
          <div className="abl-steps">
            {[
              { num: "01", title: "Create your profile", desc: "Sign up and set up your personal, family, or consultant workspace in under two minutes." },
              { num: "02", title: "Add what matters", desc: "Add compliance items, family members, clients, entities, and important deadlines." },
              { num: "03", title: "Link documents & set reminders", desc: "Attach documents to tasks, connect Google Drive, and configure your alert preferences." },
              { num: "04", title: "Stay on track", desc: "Get timely reminders, collaborate with consultants, and never miss an obligation again." },
            ].map((s, i) => (
              <div key={i} className="abl-step">
                <div className="abl-step-num">{s.num}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS BY USER TYPE ── */}
      <section className="abl-section abl-section-light" id="solutions">
        <div className="abl-container">
          <div className="abl-section-header">
            <div className="abl-section-label">Solutions</div>
            <h2>Built for how you actually work.</h2>
            <p className="abl-section-desc">Whether you are tracking your own deadlines or managing hundreds of clients -- AbideByLaw adapts to your workflow.</p>
          </div>
          <div className="abl-audience-grid">
            {audiences.map((a, i) => (
              <div key={i} className="abl-audience-card">
                <div className="abl-audience-icon" style={{ background: a.color + "14", color: a.color }}>{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
                <ul>
                  {a.items.map((item, j) => (
                    <li key={j}><IconCheck size={14} /> {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOOGLE DRIVE & DOCUMENT OWNERSHIP ── */}
      <section className="abl-section">
        <div className="abl-container">
          <div className="abl-split">
            <div className="abl-split-text">
              <div className="abl-section-label">Document Ownership</div>
              <h2>Your documents. Your Google Drive. Your control.</h2>
              <p>Unlike platforms that lock your files behind proprietary storage, AbideByLaw connects directly to your Google Drive. Your documents stay under your ownership -- organized, accessible, and shareable only when you decide.</p>
              <ul className="abl-check-list">
                <li><IconCheck size={16} /> Files stored in your own Google Drive</li>
                <li><IconCheck size={16} /> Organized folders linked to compliance tasks</li>
                <li><IconCheck size={16} /> Share with consultants on your terms</li>
                <li><IconCheck size={16} /> No vendor lock-in on your records</li>
              </ul>
            </div>
            <div className="abl-split-visual">
              <div className="abl-gdrive-card">
                <div className="abl-gdrive-header">
                  <IconCloud size={20} />
                  <span>Google Drive Connected</span>
                  <span className="abl-gdrive-status">&#9679; Active</span>
                </div>
                <div className="abl-gdrive-folders">
                  {["Tax Documents 2025", "Insurance Policies", "Property Records", "Identity Documents"].map((f, i) => (
                    <div key={i} className="abl-gdrive-folder">
                      <IconFolder size={16} />
                      <span>{f}</span>
                      <span className="abl-gdrive-count">{[8, 4, 6, 3][i]} files</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEADLINE INTELLIGENCE ── */}
      <section className="abl-section abl-section-light">
        <div className="abl-container">
          <div className="abl-split reverse">
            <div className="abl-split-visual">
              <div className="abl-reminder-card">
                <h4>Upcoming Deadlines</h4>
                {[
                  { title: "T1 Personal Tax Return", date: "Apr 30", urgency: "red", days: "4 days" },
                  { title: "Passport Renewal", date: "Dec 31", urgency: "yellow", days: "269 days" },
                  { title: "Auto Insurance Renewal", date: "Sep 15", urgency: "yellow", days: "162 days" },
                  { title: "RRSP Contribution", date: "Mar 1, 2027", urgency: "green", days: "329 days" },
                ].map((r, i) => (
                  <div key={i} className="abl-reminder-row">
                    <div className={`abl-reminder-dot ${r.urgency}`}></div>
                    <div className="abl-reminder-info">
                      <strong>{r.title}</strong>
                      <span>{r.date}</span>
                    </div>
                    <div className={`abl-reminder-badge ${r.urgency}`}>{r.days}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="abl-split-text">
              <div className="abl-section-label">Deadline Intelligence</div>
              <h2>See what needs attention -- right now.</h2>
              <p>Color-coded priority, urgency-sorted timelines, and proactive alerts mean you always know exactly what is pending, what is upcoming, and what is complete.</p>
              <ul className="abl-check-list">
                <li><IconCheck size={16} /> Urgency-sorted deadline view</li>
                <li><IconCheck size={16} /> Recurring task tracking</li>
                <li><IconCheck size={16} /> Custom reminder schedules</li>
                <li><IconCheck size={16} /> Category-based filtering</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="abl-section" id="pricing">
        <div className="abl-container">
          <div className="abl-section-header">
            <div className="abl-section-label">Pricing</div>
            <h2>Simple, transparent pricing.</h2>
            <p className="abl-section-desc">Start free. Upgrade when you need more. No hidden fees.</p>
          </div>
          <div className="abl-pricing-toggle">
            <span className={!annual ? "active" : ""}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className="abl-toggle-btn" data-active={annual}>
              <span className="abl-toggle-knob"></span>
            </button>
            <span className={annual ? "active" : ""}>Annual <span className="abl-save-badge">Save 20%</span></span>
          </div>
          <div className="abl-pricing-grid">
            {plans.map((plan, i) => (
              <div key={i} className={`abl-pricing-card ${plan.popular ? "popular" : ""}`}>
                {plan.popular && <div className="abl-popular-badge">Most Popular</div>}
                <h3>{plan.name}</h3>
                <p className="abl-pricing-desc">{plan.desc}</p>
                <div className="abl-pricing-price">
                  <span className="abl-price-currency">$</span>
                  <span className="abl-price-amount">{plan.price}</span>
                  <span className="abl-price-period">{plan.period}</span>
                </div>
                <Link href="/signup" className={`abl-pricing-cta ${plan.popular ? "primary" : ""}`}>{plan.cta}</Link>
                <ul className="abl-pricing-features">
                  {plan.features.map((f, j) => (
                    <li key={j}><IconCheck size={14} /> {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="abl-enterprise-bar">
            <div>
              <strong>Enterprise / Business</strong>
              <span>Custom workflows, multi-user teams, advanced permissions, dedicated onboarding support.</span>
            </div>
            <a href="mailto:hello@abidebylaw.com" className="abl-btn-outline sm">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="abl-section abl-section-light">
        <div className="abl-container">
          <div className="abl-section-header">
            <div className="abl-section-label">What People Say</div>
            <h2>Trusted by individuals and professionals.</h2>
          </div>
          <div className="abl-testimonial-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="abl-testimonial-card">
                <div className="abl-stars">
                  {[1,2,3,4,5].map(s => <IconStar key={s} size={14} />)}
                </div>
                <p>&ldquo;{t.text}&rdquo;</p>
                <div className="abl-testimonial-author">
                  <div className="abl-testimonial-avatar">{t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="abl-section" id="faq">
        <div className="abl-container abl-faq-container">
          <div className="abl-section-header">
            <div className="abl-section-label">FAQ</div>
            <h2>Common questions, clear answers.</h2>
          </div>
          <div className="abl-faq-list">
            <FAQItem q="What kind of deadlines can I track?" a="Anything with a due date -- tax filings, passport renewals, visa deadlines, insurance renewals, property tax, license expiry, school registrations, business filings, and any custom obligation you create." />
            <FAQItem q="Is this only for tax compliance?" a="Not at all. AbideByLaw covers tax, legal, immigration, insurance, property, education, medical, financial, and any category you define. It is a general compliance management system for real life." />
            <FAQItem q="Can I manage family members too?" a="Yes. The Family plan lets you create profiles for your spouse, children, parents, and dependents. Each family member gets their own compliance items, documents, and deadline tracking." />
            <FAQItem q="Can consultants manage multiple clients?" a="Absolutely. The Consultant plan provides a multi-client dashboard where you can track pending items, send reminders, request documents, and communicate -- all from one workspace." />
            <FAQItem q="Where are documents stored?" a="Documents can be stored directly in the platform or linked through your Google Drive. When connected to Google Drive, files remain under your ownership and control." />
            <FAQItem q="Does it replace my consultant?" a="No. AbideByLaw is a coordination and tracking tool -- it helps you and your consultant work together more effectively. Your consultant can use the platform alongside you." />
            <FAQItem q="How are reminders sent?" a="Reminders are delivered in-app and via email. You can customize reminder timing -- for example, 30 days before, 7 days before, and on the due date." />
            <FAQItem q="Can I create my own compliance tasks?" a="Yes. Both individuals and consultants can create custom tasks, attach reminders, upload documents, and manage personalized workflows beyond the predefined templates." />
            <FAQItem q="Is this suitable for small businesses?" a="Yes. Business owners can track corporate filings, GST/HST deadlines, annual returns, registrations, and internal obligations with team-level access and permissions." />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="abl-cta-final">
        <div className="abl-container" style={{ textAlign: "center" }}>
          <h2>Stop missing deadlines.<br />Start staying compliant.</h2>
          <p>Join thousands of individuals and professionals who trust AbideByLaw to keep their compliance, documents, and deadlines organized.</p>
          <div className="abl-cta-final-btns">
            <Link href="/signup" className="abl-btn-primary lg">Get Started Free <IconArrowRight size={18} /></Link>
            <a href="mailto:hello@abidebylaw.com" className="abl-btn-outline lg">Talk to Us</a>
          </div>
          <div className="abl-cta-confidence">No credit card required &middot; Free plan available &middot; Cancel anytime</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="abl-footer">
        <div className="abl-container">
          <div className="abl-footer-grid">
            <div className="abl-footer-brand">
              <div className="abl-brand">
                <div className="abl-brand-mark">A</div>
                <span>AbideByLaw</span>
              </div>
              <p>Your personal and professional compliance command center. One place for deadlines, documents, reminders, and coordination.</p>
            </div>
            <div className="abl-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Dashboard</a>
              <a href="#solutions">Integrations</a>
            </div>
            <div className="abl-footer-col">
              <h4>Solutions</h4>
              <a href="#solutions">For Individuals</a>
              <a href="#solutions">For Families</a>
              <a href="#solutions">For Consultants</a>
              <a href="#solutions">For Businesses</a>
            </div>
            <div className="abl-footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="mailto:hello@abidebylaw.com">Contact</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
          <div className="abl-footer-bottom">
            <span>&copy; {new Date().getFullYear()} AbideByLaw. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
