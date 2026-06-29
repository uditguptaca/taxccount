'use client';
import { useEffect, useState } from 'react';
import { Building2, Users, FileStack, Bell, Calculator, Link2, Save, CheckCircle2, Network, Mail, HardDrive, MessageCircle, Phone, Shield, Key, ExternalLink, Settings, Zap, UserCircle, DollarSign, Plus, Edit2, Trash2, ClipboardList, FileText, UsersRound } from 'lucide-react';
import Link from 'next/link';
import ChecklistsTab from '@/components/ChecklistsTab';
import DocumentsPage from '../documents/page';
import TemplatesPage from '../templates/page';
import SmartFormsPage from '../smart-forms/page';
import TeamsPage from '../teams/page';


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('firm');
  const [saved, setSaved] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  
  // Invite Team Member Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ first_name: '', last_name: '', email: '', role: 'team_member', phone: '', team_id: '' });
  const [editForm, setEditForm] = useState({ user_id: '', role: 'team_member', team_id: '' });

  // Template State
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ id: '', name: '', code: '', description: '', price: 0, category: 'General', checklist_id: '' });

  // Client Types State
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingClientType, setEditingClientType] = useState<string | null>(null);
  const [editClientTypeName, setEditClientTypeName] = useState('');

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState([
    { label: 'New document uploaded', desc: 'When a client uploads a document to their portal', email: true, inApp: true, sms: false },
    { label: 'Invoice payment received', desc: 'When an invoice is paid via any method', email: true, inApp: true, sms: true },
    { label: 'Filing deadline approaching', desc: '7, 3, and 1 day reminders before CRA deadlines', email: true, inApp: true, sms: true },
    { label: 'New client message', desc: 'When a client sends a message through the portal', email: true, inApp: true, sms: false },
    { label: 'Stage transition', desc: 'When an engagement moves to a new stage', email: false, inApp: true, sms: false },
    { label: 'Proposal accepted', desc: 'When a client accepts an engagement proposal', email: true, inApp: true, sms: false },
    { label: 'New lead received', desc: 'When a new lead inquiry is submitted', email: true, inApp: true, sms: true },
    { label: 'Team member assignment', desc: 'When you are assigned to a new engagement stage', email: true, inApp: true, sms: false },
  ]);

  // Tax Rates State
  const [taxRates, setTaxRates] = useState<any[]>([
    { province: 'Federal', gst: '5', pst: '0', pst_label: 'N/A', isSystem: true },
    { province: 'Ontario', gst: '5', pst: '8', pst_label: 'HST', isSystem: true },
    { province: 'British Columbia', gst: '5', pst: '7', pst_label: 'PST', isSystem: true },
    { province: 'Alberta', gst: '5', pst: '0', pst_label: 'N/A', isSystem: true },
    { province: 'Quebec', gst: '5', pst: '9.975', pst_label: 'QST', isSystem: true },
    { province: 'Manitoba', gst: '5', pst: '7', pst_label: 'RST', isSystem: true },
    { province: 'Saskatchewan', gst: '5', pst: '6', pst_label: 'PST', isSystem: true },
    { province: 'Nova Scotia', gst: '5', pst: '10', pst_label: 'HST', isSystem: true },
  ]);
  const [showTaxRateModal, setShowTaxRateModal] = useState(false);
  const [taxRateForm, setTaxRateForm] = useState<any>({ province: '', gst: '5', pst: '0', pst_label: 'PST' });
  const [editingTaxRate, setEditingTaxRate] = useState<number | null>(null);

  // Integrations State
  const [integrations, setIntegrations] = useState([
    { id: 'cra', name: 'CRA Auto-fill', desc: 'Automatically download T4, T5, and other CRA slips', status: 'connected', icon: 'shield', color: '#dc2626', features: ['Auto-download T4/T5 slips', 'Pre-fill tax returns', 'Direct CRA API access'] },
    { id: 'gmail', name: 'Gmail / Google Workspace', desc: 'Send and receive emails directly from the platform using your Google account', status: 'available', icon: 'mail', color: '#ea4335', features: ['Send emails from Taxccount', 'Sync inbox & sent mail', 'Email templates with merge fields', 'Auto-attach to client timeline'] },
    { id: 'gdrive', name: 'Google Drive', desc: 'Store, sync, and manage all client documents in Google Drive', status: 'available', icon: 'drive', color: '#4285f4', features: ['Auto-sync uploaded documents', 'Folder-per-client structure', 'Shared team drives', 'Direct preview & edit in Drive'] },
    { id: 'twilio', name: 'Twilio SMS & Messaging', desc: 'Send SMS reminders, notifications, and two-way messages to clients', status: 'available', icon: 'phone', color: '#f22f46', features: ['SMS deadline reminders', 'Document request notifications', 'Two-way client messaging', 'Bulk SMS campaigns'] },
    { id: 'qbo', name: 'QuickBooks Online', desc: 'Sync invoices and payments with QBO', status: 'available', icon: 'calc', color: '#2ca01c', features: ['Auto-sync invoices', 'Payment reconciliation', 'Chart of accounts mapping'] },
    { id: 'stripe', name: 'Stripe Payments', desc: 'Accept online credit card payments for invoices', status: 'available', icon: 'zap', color: '#635bff', features: ['Online invoice payments', 'Auto-receipt generation', 'PCI compliant'] },
    { id: 'docusign', name: 'DocuSign', desc: 'Electronic signatures for engagement letters and T183', status: 'available', icon: 'sign', color: '#ff5100', features: ['E-sign engagement letters', 'T183 digital signatures', 'Audit trail'] },
    { id: 'm365', name: 'Microsoft 365', desc: 'Email integration and file storage', status: 'available', icon: 'ms', color: '#0078d4', features: ['Outlook email sync', 'OneDrive file storage', 'Teams integration'] },
  ]);

  // Integration config modal state
  const [showIntegrationConfig, setShowIntegrationConfig] = useState<any>(null);
  const [integrationConfig, setIntegrationConfig] = useState<any>({});

  // My Profile State
  const [myProfile, setMyProfile] = useState<any>({});

  const [firmProfile, setFirmProfile] = useState({
    name: 'Taxccount Professional Services',
    address: '100 King Street West, Suite 5600',
    city: 'Toronto',
    province: 'Ontario',
    postal_code: 'M5X 1C9',
    phone: '416-555-0100',
    email: 'admin@taxccount.ca',
    website: 'www.taxccount.ca',
    gst_number: '123456789RT0001',
    fiscal_year_end: '2025-12-31',
  });

  const loadTeamsData = () => {
    fetch('/api/teams').then(r => r.json()).then(d => {
      if (d.members) setTeamMembers(d.members);
      if (d.teams) setTeams(d.teams);
    }).catch(() => {});
  };

  const loadClientTypes = () => {
    fetch('/api/settings/client-types').then(r => r.json()).then(d => {
      if (d.types) setClientTypes(d.types);
    }).catch(() => {});
  };

  const loadTemplates = () => {
    fetch('/api/templates').then(r => r.json()).then(d => {
      if (d.templates) setTemplates(d.templates);
    }).catch(() => {});
  };

  const [checklists, setChecklists] = useState<any[]>([]);
  const loadChecklists = () => {
    fetch('/api/settings/checklists').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setChecklists(d);
    }).catch(() => {});
  };

  const [currencySettings, setCurrencySettings] = useState({ base_currency: 'CAD', currency_display_style: 'code_and_amount' });
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({ id: '', from_currency: '', to_currency: 'CAD', exchange_rate: '', effective_date: new Date().toISOString().split('T')[0], status: 'active', notes: '' });

  const loadCurrencyData = () => {
    fetch('/api/settings/currency').then(r => r.json()).then(d => {
      if (d.settings) setCurrencySettings({ base_currency: d.settings.base_currency || 'CAD', currency_display_style: d.settings.currency_display_style || 'code_and_amount' });
    }).catch(() => {});
    fetch('/api/settings/exchange-rates').then(r => r.json()).then(d => {
      if (d.rates) setExchangeRates(d.rates);
    }).catch(() => {});
  };

  async function handleSaveCurrencySettings(e: any) {
    e.preventDefault();
    const res = await fetch('/api/settings/currency', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currencySettings) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function handleSaveRate(e: any) {
    e.preventDefault();
    const res = await fetch('/api/settings/exchange-rates', { method: rateForm.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rateForm) });
    if (res.ok) { setShowRateModal(false); loadCurrencyData(); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function handleDeleteRate(id: string) {
    if (!confirm('Delete this exchange rate?')) return;
    const res = await fetch(`/api/settings/exchange-rates?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadCurrencyData();
  }

  const loadFirmProfile = () => {
    fetch('/api/settings/profile').then(r => r.json()).then(d => {
      if (d.profile) setFirmProfile(d.profile);
    }).catch(() => {});
  };

  const loadTaxRates = () => {
    fetch('/api/settings/tax-rates').then(r => r.json()).then(d => {
      if (d.rates && d.rates.length > 0) {
        setTaxRates(d.rates);
      }
    }).catch(() => {});
  };

  async function handleSaveTaxRate(e: React.FormEvent) {
    e.preventDefault();
    const method = taxRateForm.id ? 'PUT' : 'POST';
    const res = await fetch('/api/settings/tax-rates', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taxRateForm)
    });
    if (res.ok) {
      setShowTaxRateModal(false);
      setEditingTaxRate(null);
      loadTaxRates();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleDeleteTaxRate(id: string) {
    if (!confirm('Delete this tax rate?')) return;
    const res = await fetch(`/api/settings/tax-rates?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadTaxRates();
  }

  useEffect(() => { 
    loadFirmProfile();
    loadTeamsData(); 
    loadClientTypes();
    loadTemplates();
    loadTaxRates();
    loadCurrencyData();
    loadChecklists();
    // Load current user profile
    fetch('/api/me').then(r => r.json()).then(d => { if (d.id) setMyProfile(d); }).catch(() => {});
  }, []);

  async function handleSave() {
    await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firmProfile)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/settings/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteForm)
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to invite team member');
      return;
    }
    setShowInviteModal(false);
    setInviteForm({ first_name: '', last_name: '', email: '', role: 'team_member', phone: '', team_id: '' });
    loadTeamsData();
  }

  async function handleDeactivateMember(userId: string) {
    if (!confirm('Deactivate this team member? They will lose access to the platform.')) return;
    await fetch('/api/settings/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, is_active: false })
    });
    loadTeamsData();
  }



  async function handleEditMember(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/settings/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      setShowEditMemberModal(false);
      loadTeamsData();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update member');
    }
  }

  function openEditModal(m: any) {
    setEditForm({ user_id: m.id, role: m.role || 'team_member', team_id: m.team_id || '' });
    setShowEditMemberModal(true);
  }

  async function handleSaveTemplate(e: React.FormEvent) {
    e.preventDefault();
    const method = templateForm.id ? 'PUT' : 'POST';
    const res = await fetch('/api/templates', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateForm)
    });
    if (res.ok) {
      setShowTemplateModal(false);
      loadTemplates();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert('Failed to save template');
    }
  }

  async function handleDeleteTemplate(id: string) {
    if(!confirm('Are you sure you want to delete this template?')) return;
    const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadTemplates();
  }

  async function handleAddClientType() {
    if (!newTypeName.trim()) return;
    const res = await fetch('/api/settings/client-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTypeName.trim() })
    });
    if (res.ok) {
      setNewTypeName('');
      loadClientTypes();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add type');
    }
  }

  async function handleUpdateClientType(id: string) {
    if (!editClientTypeName.trim()) return;
    try {
      await fetch('/api/settings/client-types', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name: editClientTypeName.trim() }) });
      setEditingClientType(null);
      setEditClientTypeName('');
      loadClientTypes();
    } catch (error) {
      alert('Failed to update client type');
    }
  }

  async function handleDeleteClientType(id: string) {
    if (!confirm('Are you sure you want to remove this client type?')) return;
    const res = await fetch(`/api/settings/client-types?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadClientTypes();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const err = await res.json();
      alert(err.error || 'Cannot remove type in use.');
    }
  }

  const handleConnectIntegration = (id: string, currentStatus: string) => {
    if (currentStatus === 'connected') return;
    
    setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connecting' } : int));
    
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'connected' } : int));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  };

  function openIntegrationConfig(int: any) {
    const defaults: Record<string, any> = {
      gmail: { client_id: '', client_secret: '', redirect_uri: 'https://app.taxccount.ca/api/auth/google/callback', scopes: 'gmail.send gmail.readonly', auto_sync: true, sync_interval: '15' },
      gdrive: { client_id: '', client_secret: '', root_folder: 'Taxccount Clients', auto_create_folders: true, folder_structure: 'client_name', sync_documents: true, shared_drive: '' },
      twilio: { account_sid: '', auth_token: '', phone_number: '', sms_enabled: true, whatsapp_enabled: false, default_country: 'CA', reminder_template: 'Hi {{client_name}}, this is a reminder about {{subject}}. Please contact us at {{firm_phone}}.' },
      qbo: { client_id: '', client_secret: '', company_id: '', auto_sync_invoices: true },
      stripe: { publishable_key: '', secret_key: '', webhook_secret: '' },
      docusign: { integration_key: '', secret_key: '', account_id: '' },
      m365: { client_id: '', tenant_id: '', client_secret: '' },
      cra: { api_key: '', rep_id: '' },
    };
    setIntegrationConfig(defaults[int.id] || {});
    setShowIntegrationConfig(int);
  }

  async function handleSaveIntegration(e: React.FormEvent) {
    e.preventDefault();
    if (!showIntegrationConfig) return;
    // Simulate saving integration config
    setIntegrations(prev => prev.map(int => int.id === showIntegrationConfig.id ? { ...int, status: 'connected' } : int));
    setShowIntegrationConfig(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDisconnectIntegration(id: string) {
    if (!confirm('Disconnect this integration? Existing data will be preserved.')) return;
    setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: 'available' } : int));
  }

  const navItems = [
    { key: 'profile', label: 'My Profile', icon: UserCircle },
    { key: 'firm', label: 'Firm Profile', icon: Building2 },
    { key: 'teams', label: 'Teams & Staff', icon: UsersRound },
    { key: 'documents', label: 'Document Vault', icon: FileText },
    { key: 'templates', label: 'Templates', icon: FileStack },
    { key: 'smart_forms', label: 'Smart Forms', icon: ClipboardList },
    { key: 'checklists', label: 'Checklist Library', icon: ClipboardList },
    { key: 'client_types', label: 'Client Types', icon: Network },
    { key: 'tax', label: 'Tax Rates', icon: Calculator },
    { key: 'integrations', label: 'Integrations', icon: Link2 },
    { key: 'currency', label: 'Currency Settings', icon: DollarSign },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];


  return (
    <>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>System configuration and preferences</p>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: 500, background: 'var(--color-success-light)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            <CheckCircle2 size={16} /> Changes saved
          </div>
        )}
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={`settings-nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon size={16} /> {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* My Profile */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header"><h3>My Profile</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
                    {(myProfile.first_name || '?')[0]}{(myProfile.last_name || '?')[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{myProfile.first_name || ''} {myProfile.last_name || ''}</div>
                    <div className="text-sm text-muted">{myProfile.email || ''}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>Role: {(myProfile.role || '').replace(/_/g, ' ')} · {myProfile.org?.name || 'Organization'}</div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={myProfile.first_name || ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={myProfile.last_name || ''} readOnly /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={myProfile.email || ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={myProfile.phone || '—'} readOnly /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Last Login</label><input className="form-input" value={myProfile.last_login_at ? new Date(myProfile.last_login_at).toLocaleString() : '—'} readOnly /></div>
                  <div className="form-group"><label className="form-label">Account Created</label><input className="form-input" value={myProfile.created_at ? new Date(myProfile.created_at).toLocaleString() : '—'} readOnly /></div>
                </div>
              </div>
            </div>
          )}

          {/* Firm Profile */}
          {activeTab === 'firm' && (
            <div className="card">
              <div className="card-header"><h3>Firm Profile</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Firm Name</label>
                  <input className="form-input" value={firmProfile.name} onChange={e => setFirmProfile({ ...firmProfile, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={firmProfile.address} onChange={e => setFirmProfile({ ...firmProfile, address: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={firmProfile.city} onChange={e => setFirmProfile({ ...firmProfile, city: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <select className="form-select" value={firmProfile.province} onChange={e => setFirmProfile({ ...firmProfile, province: e.target.value })}>
                      <option value="Ontario">Ontario</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Alberta">Alberta</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="New Brunswick">New Brunswick</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input className="form-input" value={firmProfile.postal_code} onChange={e => setFirmProfile({ ...firmProfile, postal_code: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={firmProfile.phone} onChange={e => setFirmProfile({ ...firmProfile, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={firmProfile.email} onChange={e => setFirmProfile({ ...firmProfile, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input className="form-input" value={firmProfile.website} onChange={e => setFirmProfile({ ...firmProfile, website: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST/HST Number</label>
                    <input className="form-input" value={firmProfile.gst_number} onChange={e => setFirmProfile({ ...firmProfile, gst_number: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Fiscal Year End</label>
                  <input className="form-input" type="date" value={firmProfile.fiscal_year_end} onChange={e => setFirmProfile({ ...firmProfile, fiscal_year_end: e.target.value })} style={{ width: 200 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                  <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* Teams & Staff Directory */}
          {activeTab === 'teams' && (
            <TeamsPage />
          )}

          {/* Client Types Configuration */}
          {activeTab === 'client_types' && (
            <div className="card">
              <div className="card-header">
                <h3>Client Entity Types</h3>
              </div>
              <div className="card-body">
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-6)' }}>Manage the types of entities your firm works with. These categories appear as options when onboarding a new client and determine workflow constraints.</p>
                
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                  <input className="form-input" placeholder="New Client Type (e.g. Holding Company)" value={newTypeName} onChange={e => setNewTypeName(e.target.value)} style={{ flex: 1, maxWidth: 300 }} onKeyDown={e => e.key === 'Enter' && handleAddClientType()} />
                  <button className="btn btn-primary" onClick={handleAddClientType}>Add Type</button>
                </div>

                <div className="data-table-wrapper" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Entity Type Name</th>
                        <th>Classification</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientTypes.map(ct => (
                        <tr key={ct.id}>
                          <td style={{ fontWeight: 500 }}>
                            {editingClientType === ct.id ? (
                              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <input className="form-input" autoFocus value={editClientTypeName} onChange={e => setEditClientTypeName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdateClientType(ct.id); if (e.key === 'Escape') setEditingClientType(null); }} />
                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateClientType(ct.id)}>Save</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingClientType(null)}>Cancel</button>
                              </div>
                            ) : ct.name}
                          </td>
                          <td>
                            {ct.is_system === 1 ? <span className="badge badge-gray">System Default</span> : <span className="badge badge-blue">Custom Entity</span>}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {editingClientType !== ct.id && (
                              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingClientType(ct.id); setEditClientTypeName(ct.name); }}>Edit</button>
                                <button className="btn btn-ghost btn-danger btn-sm text-danger" onClick={() => handleDeleteClientType(ct.id)}>Remove</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {clientTypes.length === 0 && (
                        <tr><td colSpan={3} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>Loading types...</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Templates */}
          {activeTab === 'templates' && (
            <TemplatesPage />
          )}

          {/* Document Vault */}
          {activeTab === 'documents' && (
            <DocumentsPage />
          )}

          {/* Smart Forms */}
          {activeTab === 'smart_forms' && (
            <SmartFormsPage />
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header"><h3>Notification Preferences</h3></div>
              <div className="card-body">
                {notifPrefs.map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderBottom: i < notifPrefs.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{n.label}</div>
                      <div className="text-xs text-muted">{n.desc}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={n.email} onChange={() => setNotifPrefs(prev => prev.map((p, pi) => pi === i ? { ...p, email: !p.email } : p))} style={{ accentColor: 'var(--color-primary)' }} /> Email
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={n.inApp} onChange={() => setNotifPrefs(prev => prev.map((p, pi) => pi === i ? { ...p, inApp: !p.inApp } : p))} style={{ accentColor: 'var(--color-primary)' }} /> In-app
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={n.sms} onChange={() => setNotifPrefs(prev => prev.map((p, pi) => pi === i ? { ...p, sms: !p.sms } : p))} style={{ accentColor: 'var(--color-primary)' }} /> SMS
                      </label>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                  <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Preferences</button>
                </div>
              </div>
            </div>
          )}

          {/* Tax Rates */}
          {activeTab === 'tax' && (
            <div className="card">
              <div className="card-header">
                <h3>Tax Rates</h3>
                <button className="btn btn-primary btn-sm" onClick={() => { setTaxRateForm({ province: '', gst: '5', pst: '0', pst_label: 'PST' }); setShowTaxRateModal(true); }}>Add Rate</button>
              </div>
              <div className="card-body">
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>Manage provincial tax rates used for invoice calculations. Edit any rate by clicking the pencil icon.</p>
                <div className="data-table-wrapper" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead><tr><th>Province / Region</th><th>GST</th><th>PST / HST</th><th>Combined</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                    <tbody>
                      {taxRates.map((r, i) => {
                        const combined = (parseFloat(r.gst) + parseFloat(r.pst)).toFixed(r.pst.includes('.') ? 3 : 0);
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{r.province}</td>
                            <td>{r.gst}%</td>
                            <td>{parseFloat(r.pst) > 0 ? `${r.pst}% (${r.pst_label})` : '—'}</td>
                            <td style={{ fontWeight: 600 }}>{combined}%</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setTaxRateForm(r); setEditingTaxRate(i); setShowTaxRateModal(true); }}>Edit</button>
                                {!r.isSystem && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteTaxRate(r.id)}>Delete</button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-header">
                  <h3>Integrations & Connected Services</h3>
                  <span className="badge badge-green">{integrations.filter(i => i.status === 'connected').length} Active</span>
                </div>
                <div className="card-body" style={{ paddingTop: 0 }}>
                  <p className="text-sm text-muted">Connect third-party services to enhance your workflow. Configure API keys and OAuth credentials below.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {integrations.map(int => {
                  const IntIcon = int.icon === 'mail' ? Mail : int.icon === 'drive' ? HardDrive : int.icon === 'phone' ? Phone : int.icon === 'shield' ? Shield : int.icon === 'zap' ? Zap : int.icon === 'calc' ? Calculator : int.icon === 'sign' ? FileStack : Settings;
                  return (
                    <div key={int.id} className="card" style={{ overflow: 'hidden', border: int.status === 'connected' ? `2px solid ${int.color}30` : undefined }}>
                      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${int.color}12`, color: int.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <IntIcon size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              {int.name}
                              {int.status === 'connected' && <span className="badge badge-green" style={{ fontSize: 9 }}><span className="badge-dot"></span>Active</span>}
                            </div>
                            <div className="text-xs text-muted">{int.desc}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-3)' }}>
                          {int.features.map((f, fi) => (
                            <span key={fi} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-gray-500)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-full)', padding: '2px 8px', border: '1px solid var(--color-gray-100)' }}>
                              <CheckCircle2 size={9} style={{ color: int.status === 'connected' ? 'var(--color-success)' : 'var(--color-gray-300)' }} />
                              {f}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          {int.status === 'connected' ? (
                            <>
                              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openIntegrationConfig(int)}><Settings size={13} /> Configure</button>
                              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDisconnectIntegration(int.id)}>Disconnect</button>
                            </>
                          ) : (
                            <button className="btn btn-primary btn-sm" style={{ flex: 1, background: int.color, borderColor: int.color }} onClick={() => openIntegrationConfig(int)}><Key size={13} /> Connect & Configure</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

      {activeTab === 'currency' && (
        <div className="settings-section">
          <div className="settings-header">
            <h2>Currency Settings</h2>
            <p>Manage your firm&apos;s base currency and exchange rates for dashboard revenue conversion.</p>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Base Dashboard Currency</h3>
            <form onSubmit={handleSaveCurrencySettings}>
              <div className="form-group">
                <label className="form-label">Base Currency</label>
                <select className="form-input" value={currencySettings.base_currency} onChange={e => setCurrencySettings({...currencySettings, base_currency: e.target.value})} style={{ maxWidth: 300 }}>
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                  <option value="EUR">EUR</option>
                </select>
                <div className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Used for dashboard revenue cards, pipeline, and team workload attribution.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Currency Display Style</label>
                <select className="form-input" value={currencySettings.currency_display_style} onChange={e => setCurrencySettings({...currencySettings, currency_display_style: e.target.value})} style={{ maxWidth: 300 }}>
                  <option value="symbol_only">Symbol only (e.g. C$1,000)</option>
                  <option value="code_only">Currency code only (e.g. CAD 1,000)</option>
                  <option value="code_and_amount">Code + amount (e.g. CAD 1,000.00)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Save Base Currency</button>
            </form>
          </div>

          <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>Currency Exchange Rates</h3>
              <p className="text-muted text-sm" style={{ margin: 0 }}>Used to convert foreign currency projects into your base currency.</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setRateForm({ id: '', from_currency: 'USD', to_currency: currencySettings.base_currency, exchange_rate: '', effective_date: new Date().toISOString().split('T')[0], status: 'active', notes: '' }); setShowRateModal(true); }}>Add Exchange Rate</button>
          </div>

          <div className="card">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>From Currency</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>To Currency</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Exchange Rate</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Effective Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-gray-500)' }}>
                      No exchange rates found. Add one if you work with foreign currencies.
                    </td>
                  </tr>
                ) : exchangeRates.map(rate => (
                  <tr key={rate.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{rate.from_currency}</td>
                    <td style={{ padding: '12px 16px' }}>{rate.to_currency}</td>
                    <td style={{ padding: '12px 16px' }}>{rate.exchange_rate}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(rate.effective_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={"badge " + (rate.status === 'active' ? 'badge-success' : 'badge-secondary')}>{rate.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setRateForm({ id: rate.id, from_currency: rate.from_currency, to_currency: rate.to_currency, exchange_rate: rate.exchange_rate, effective_date: rate.effective_date.split('T')[0], status: rate.status, notes: rate.notes || '' }); setShowRateModal(true); }} style={{ padding: '4px', marginRight: 'var(--space-2)' }}>Edit</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteRate(rate.id)} style={{ padding: '4px', color: 'var(--color-danger)' }}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'checklists' && (
        <ChecklistsTab checklists={checklists} loadChecklists={loadChecklists} />
      )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleInviteMember}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" required value={inviteForm.first_name} onChange={e => setInviteForm({...inviteForm, first_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" required value={inviteForm.last_name} onChange={e => setInviteForm({...inviteForm, last_name: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" required value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={inviteForm.phone} onChange={e => setInviteForm({...inviteForm, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role *</label>
                    <select className="form-select" required value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})}>
                      <option value="admin">Admin</option>
                      <option value="team_manager">Team Manager</option>
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign to Team</label>
                  <select className="form-select" value={inviteForm.team_id} onChange={e => setInviteForm({...inviteForm, team_id: e.target.value})}>
                    <option value="">No Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <div className="modal-overlay" onClick={() => setShowEditMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2>Edit Member Role</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditMemberModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select className="form-select" required value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                    <option value="admin">Admin (Full Rights)</option>
                    <option value="team_manager">Team Manager (Add/Delete in Staff)</option>
                    <option value="team_member">Team Member (Add only in Staff)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign to Team</label>
                  <select className="form-select" value={editForm.team_id} onChange={e => setEditForm({...editForm, team_id: e.target.value})}>
                    <option value="">No Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{templateForm.id ? 'Edit Template' : 'Add Template'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTemplateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveTemplate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Template Name *</label>
                  <input className="form-input" required value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} placeholder="e.g. T1 Personal Tax Return" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Short Code *</label>
                    <input className="form-input" required value={templateForm.code} onChange={e => setTemplateForm({...templateForm, code: e.target.value.toUpperCase()})} placeholder="e.g. T1" style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Price ($)</label>
                    <input className="form-input" type="number" step="0.01" value={templateForm.price} onChange={e => setTemplateForm({...templateForm, price: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <textarea className="form-input" rows={2} value={templateForm.description} onChange={e => setTemplateForm({...templateForm, description: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Use Generic Document Checklist?</label>
                  <select 
                    className="form-input" 
                    value={
                      templateForm.checklist_id === '' ? 'none' : 
                      (templateForm.checklist_id === (checklists.find(c => c.name === 'Generic Default Document Checklist')?.id || 'not-found') ? 'default' : 'custom')
                    }
                    onChange={e => {
                      const val = e.target.value;
                      const defaultId = checklists.find(c => c.name === 'Generic Default Document Checklist')?.id || '';
                      if (val === 'none') setTemplateForm({...templateForm, checklist_id: ''});
                      else if (val === 'default') setTemplateForm({...templateForm, checklist_id: defaultId});
                      else setTemplateForm({...templateForm, checklist_id: checklists.find(c => c.id !== defaultId)?.id || ''});
                    }}
                  >
                    <option value="default">Yes, add default checklist</option>
                    <option value="none">No, start blank</option>
                    <option value="custom">Select from saved checklist library</option>
                  </select>
                </div>

                {templateForm.checklist_id !== '' && templateForm.checklist_id !== (checklists.find(c => c.name === 'Generic Default Document Checklist')?.id || 'not-found') && (
                  <div className="form-group">
                    <label className="form-label">Select Checklist</label>
                    <select className="form-input" value={templateForm.checklist_id} onChange={e => setTemplateForm({...templateForm, checklist_id: e.target.value})}>
                      <option value="">-- Choose a Checklist --</option>
                      {checklists.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integration Configuration Modal */}
      {showIntegrationConfig && (
        <div className="modal-overlay" onClick={() => setShowIntegrationConfig(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Key size={18} style={{ color: showIntegrationConfig.color }} />
                {showIntegrationConfig.status === 'connected' ? 'Configure' : 'Connect'} {showIntegrationConfig.name}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowIntegrationConfig(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveIntegration}>
              <div className="modal-body">
                {/* Gmail / Google Workspace Config */}
                {showIntegrationConfig.id === 'gmail' && (
                  <>
                    <div style={{ padding: 'var(--space-3)', background: '#fef3c7', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: '#92400e' }}>
                      <strong>Setup:</strong> Create OAuth 2.0 credentials in <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: '#b45309', textDecoration: 'underline' }}>Google Cloud Console</a> → APIs & Services → Credentials. Enable the Gmail API.
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">OAuth Client ID *</label><input className="form-input" required placeholder="xxxxx.apps.googleusercontent.com" value={integrationConfig.client_id} onChange={e => setIntegrationConfig({...integrationConfig, client_id: e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Client Secret *</label><input className="form-input" type="password" required placeholder="GOCSPX-xxxxxxx" value={integrationConfig.client_secret} onChange={e => setIntegrationConfig({...integrationConfig, client_secret: e.target.value})} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Redirect URI</label><input className="form-input" readOnly value={integrationConfig.redirect_uri} style={{ background: 'var(--color-gray-50)' }} /></div>
                    <div className="form-group"><label className="form-label">Scopes</label><input className="form-input" value={integrationConfig.scopes} onChange={e => setIntegrationConfig({...integrationConfig, scopes: e.target.value})} /></div>
                    <div className="form-row">
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={integrationConfig.auto_sync} onChange={e => setIntegrationConfig({...integrationConfig, auto_sync: e.target.checked})} style={{ accentColor: 'var(--color-primary)' }} />
                          <span className="form-label" style={{ marginBottom: 0 }}>Auto-sync emails</span>
                        </label>
                      </div>
                      <div className="form-group"><label className="form-label">Sync Interval (min)</label>
                        <select className="form-select" value={integrationConfig.sync_interval} onChange={e => setIntegrationConfig({...integrationConfig, sync_interval: e.target.value})}>
                          <option value="5">Every 5 min</option><option value="15">Every 15 min</option><option value="30">Every 30 min</option><option value="60">Every hour</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Google Drive Config */}
                {showIntegrationConfig.id === 'gdrive' && (
                  <>
                    <div style={{ padding: 'var(--space-3)', background: '#dbeafe', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: '#1e40af' }}>
                      <strong>Setup:</strong> Enable the Google Drive API in <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>Google Cloud Console</a>. Use the same OAuth credentials as Gmail if already configured.
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">OAuth Client ID *</label><input className="form-input" required placeholder="xxxxx.apps.googleusercontent.com" value={integrationConfig.client_id} onChange={e => setIntegrationConfig({...integrationConfig, client_id: e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Client Secret *</label><input className="form-input" type="password" required placeholder="GOCSPX-xxxxxxx" value={integrationConfig.client_secret} onChange={e => setIntegrationConfig({...integrationConfig, client_secret: e.target.value})} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Root Folder Name</label><input className="form-input" value={integrationConfig.root_folder} onChange={e => setIntegrationConfig({...integrationConfig, root_folder: e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Folder Structure</label>
                        <select className="form-select" value={integrationConfig.folder_structure} onChange={e => setIntegrationConfig({...integrationConfig, folder_structure: e.target.value})}>
                          <option value="client_name">By Client Name</option><option value="client_code">By Client Code</option><option value="year_client">By Year → Client</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group"><label className="form-label">Shared Drive ID (optional)</label><input className="form-input" placeholder="Leave blank to use personal Drive" value={integrationConfig.shared_drive} onChange={e => setIntegrationConfig({...integrationConfig, shared_drive: e.target.value})} /></div>
                    <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={integrationConfig.auto_create_folders} onChange={e => setIntegrationConfig({...integrationConfig, auto_create_folders: e.target.checked})} style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-sm">Auto-create client folders</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={integrationConfig.sync_documents} onChange={e => setIntegrationConfig({...integrationConfig, sync_documents: e.target.checked})} style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-sm">Sync uploaded documents</span>
                      </label>
                    </div>
                  </>
                )}

                {/* Twilio Config */}
                {showIntegrationConfig.id === 'twilio' && (
                  <>
                    <div style={{ padding: 'var(--space-3)', background: '#fce7f3', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: '#9d174d' }}>
                      <strong>Setup:</strong> Get credentials from <a href="https://console.twilio.com" target="_blank" rel="noreferrer" style={{ color: '#be185d', textDecoration: 'underline' }}>Twilio Console</a>. You need an Account SID, Auth Token, and a registered phone number.
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Account SID *</label><input className="form-input" required placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={integrationConfig.account_sid} onChange={e => setIntegrationConfig({...integrationConfig, account_sid: e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Auth Token *</label><input className="form-input" type="password" required placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={integrationConfig.auth_token} onChange={e => setIntegrationConfig({...integrationConfig, auth_token: e.target.value})} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Twilio Phone Number *</label><input className="form-input" required placeholder="+1xxxxxxxxxx" value={integrationConfig.phone_number} onChange={e => setIntegrationConfig({...integrationConfig, phone_number: e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Default Country</label>
                        <select className="form-select" value={integrationConfig.default_country} onChange={e => setIntegrationConfig({...integrationConfig, default_country: e.target.value})}>
                          <option value="CA">Canada (+1)</option><option value="US">United States (+1)</option><option value="GB">United Kingdom (+44)</option><option value="IN">India (+91)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={integrationConfig.sms_enabled} onChange={e => setIntegrationConfig({...integrationConfig, sms_enabled: e.target.checked})} style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-sm">Enable SMS</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={integrationConfig.whatsapp_enabled} onChange={e => setIntegrationConfig({...integrationConfig, whatsapp_enabled: e.target.checked})} style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-sm">Enable WhatsApp</span>
                      </label>
                    </div>
                    <div className="form-group"><label className="form-label">Default SMS Template</label>
                      <textarea className="form-input" rows={3} value={integrationConfig.reminder_template} onChange={e => setIntegrationConfig({...integrationConfig, reminder_template: e.target.value})} />
                      <div className="text-xs text-muted" style={{ marginTop: 4 }}>Variables: {'{{client_name}}'}, {'{{subject}}'}, {'{{firm_phone}}'}, {'{{due_date}}'}</div>
                    </div>
                  </>
                )}

                {/* QuickBooks Config */}
                {showIntegrationConfig.id === 'qbo' && (
                  <>
                    <div className="form-group"><label className="form-label">OAuth Client ID * </label><input className="form-input" required value={integrationConfig.client_id} onChange={e => setIntegrationConfig({...integrationConfig, client_id: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Client Secret *</label><input className="form-input" type="password" required value={integrationConfig.client_secret} onChange={e => setIntegrationConfig({...integrationConfig, client_secret: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Company ID</label><input className="form-input" value={integrationConfig.company_id} onChange={e => setIntegrationConfig({...integrationConfig, company_id: e.target.value})} /></div>
                  </>
                )}

                {/* Stripe Config */}
                {showIntegrationConfig.id === 'stripe' && (
                  <>
                    <div className="form-group"><label className="form-label">Publishable Key *</label><input className="form-input" required placeholder="pk_live_xxxxx" value={integrationConfig.publishable_key} onChange={e => setIntegrationConfig({...integrationConfig, publishable_key: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Secret Key *</label><input className="form-input" type="password" required placeholder="sk_live_xxxxx" value={integrationConfig.secret_key} onChange={e => setIntegrationConfig({...integrationConfig, secret_key: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Webhook Secret</label><input className="form-input" placeholder="whsec_xxxxx" value={integrationConfig.webhook_secret} onChange={e => setIntegrationConfig({...integrationConfig, webhook_secret: e.target.value})} /></div>
                  </>
                )}

                {/* DocuSign Config */}
                {showIntegrationConfig.id === 'docusign' && (
                  <>
                    <div className="form-group"><label className="form-label">Integration Key *</label><input className="form-input" required value={integrationConfig.integration_key} onChange={e => setIntegrationConfig({...integrationConfig, integration_key: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Secret Key *</label><input className="form-input" type="password" required value={integrationConfig.secret_key} onChange={e => setIntegrationConfig({...integrationConfig, secret_key: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Account ID</label><input className="form-input" value={integrationConfig.account_id} onChange={e => setIntegrationConfig({...integrationConfig, account_id: e.target.value})} /></div>
                  </>
                )}

                {/* Microsoft 365 Config */}
                {showIntegrationConfig.id === 'm365' && (
                  <>
                    <div className="form-group"><label className="form-label">Application (Client) ID *</label><input className="form-input" required value={integrationConfig.client_id} onChange={e => setIntegrationConfig({...integrationConfig, client_id: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Directory (Tenant) ID *</label><input className="form-input" required value={integrationConfig.tenant_id} onChange={e => setIntegrationConfig({...integrationConfig, tenant_id: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Client Secret *</label><input className="form-input" type="password" required value={integrationConfig.client_secret} onChange={e => setIntegrationConfig({...integrationConfig, client_secret: e.target.value})} /></div>
                  </>
                )}

                {/* CRA Config */}
                {showIntegrationConfig.id === 'cra' && (
                  <>
                    <div className="form-group"><label className="form-label">CRA API Key</label><input className="form-input" value={integrationConfig.api_key} onChange={e => setIntegrationConfig({...integrationConfig, api_key: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Representative ID</label><input className="form-input" value={integrationConfig.rep_id} onChange={e => setIntegrationConfig({...integrationConfig, rep_id: e.target.value})} /></div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowIntegrationConfig(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: showIntegrationConfig.color, borderColor: showIntegrationConfig.color }}>
                  {showIntegrationConfig.status === 'connected' ? 'Save Configuration' : 'Connect & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Rate Add/Edit Modal */}
      {showTaxRateModal && (
        <div className="modal-overlay" onClick={() => { setShowTaxRateModal(false); setEditingTaxRate(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2>{editingTaxRate !== null ? 'Edit Tax Rate' : 'Add Tax Rate'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowTaxRateModal(false); setEditingTaxRate(null); }}>✕</button>
            </div>
            <form onSubmit={handleSaveTaxRate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Province / Region *</label>
                  <input className="form-input" required value={taxRateForm.province} onChange={e => setTaxRateForm({...taxRateForm, province: e.target.value})} placeholder="e.g. Prince Edward Island" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GST Rate (%)</label>
                    <input className="form-input" type="number" step="0.001" value={taxRateForm.gst} onChange={e => setTaxRateForm({...taxRateForm, gst: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PST/HST Rate (%)</label>
                    <input className="form-input" type="number" step="0.001" value={taxRateForm.pst} onChange={e => setTaxRateForm({...taxRateForm, pst: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">PST Label</label>
                  <select className="form-select" value={taxRateForm.pst_label} onChange={e => setTaxRateForm({...taxRateForm, pst_label: e.target.value})}>
                    <option value="PST">PST</option>
                    <option value="HST">HST</option>
                    <option value="QST">QST</option>
                    <option value="RST">RST</option>
                    <option value="N/A">N/A (No PST)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowTaxRateModal(false); setEditingTaxRate(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTaxRate !== null ? 'Save Changes' : 'Add Rate'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Exchange Rate Modal */}
      {showRateModal && (
        <div className="modal-overlay" onClick={() => setShowRateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{rateForm.id ? 'Edit Exchange Rate' : 'Add Exchange Rate'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRateModal(false)}>✕</button>
            </div>
            <form id="rateForm" onSubmit={handleSaveRate}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">From Currency</label>
                    <select className="form-input" value={rateForm.from_currency} onChange={e => setRateForm({...rateForm, from_currency: e.target.value})} required>
                      <option value="">Select</option>
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="GBP">GBP</option>
                      <option value="AUD">AUD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">To Currency</label>
                    <input type="text" className="form-input" value={rateForm.to_currency} disabled />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Exchange Rate</label>
                  <input type="number" step="0.0001" className="form-input" value={rateForm.exchange_rate} onChange={e => setRateForm({...rateForm, exchange_rate: e.target.value})} required placeholder="e.g. 1.35 or 0.016" />
                  <div className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Multiply 'From' by this rate to get 'To'.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Effective Date</label>
                  <input type="date" className="form-input" value={rateForm.effective_date} onChange={e => setRateForm({...rateForm, effective_date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={rateForm.status} onChange={e => setRateForm({...rateForm, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows={2} value={rateForm.notes} onChange={e => setRateForm({...rateForm, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
