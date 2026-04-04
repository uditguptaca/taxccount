'use client';
import { useEffect, useState } from 'react';
import { UsersRound, Plus, Briefcase, CheckCircle, User, Mail, Phone, Clock, Shield, Pencil, Trash2 } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);

  const [tab, setTab] = useState('directory');
  const [revenue, setRevenue] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', manager_id: '' });
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editTeamForm, setEditTeamForm] = useState<any>({ id: '', name: '', description: '', manager_id: '' });

  // Bulk Reassignment
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedUserForReassign, setSelectedUserForReassign] = useState<any>(null);
  const [userStages, setUserStages] = useState<any[]>([]);
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [targetUserId, setTargetUserId] = useState('');

  function load() {
    fetch('/api/teams').then(r => r.json()).then(d => {
      setTeams(d.teams || []);
      setMembers(d.members || []);
      setUsers(d.users || []);
      setAllStaff(d.allStaff || []);
      setLoading(false);
    }).catch(console.error);
    fetch('/api/teams/revenue').then(r => r.json()).then(d => setRevenue(d.attribution || [])).catch(() => {});
  }

  const openReassignModal = async (member: any) => {
    setSelectedUserForReassign(member);
    setUserStages([]);
    setSelectedStageIds([]);
    setTargetUserId('');
    setShowReassignModal(true);
    const d = await fetch(`/api/users/${member.id}/stages`).then(r => r.json());
    setUserStages(d.stages || []);
  };

  const handleBulkReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStageIds.length === 0 || !targetUserId) return;
    await fetch('/api/projects/reassign', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_ids: selectedStageIds, new_user_id: targetUserId })
    });
    setShowReassignModal(false);
    load();
  };

  useEffect(() => { load(); }, []);

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowModal(false);
    setForm({ name: '', description: '', manager_id: '' });
    load();
  }

  function openEditTeam(team: any) {
    setEditTeamForm({ id: team.id, name: team.name, description: team.description || '', manager_id: team.manager_id || '' });
    setShowEditTeamModal(true);
  }

  async function handleEditTeam(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/teams', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editTeamForm)
    });
    setShowEditTeamModal(false);
    load();
  }

  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (!confirm(`Are you sure you want to deactivate team "${teamName}"? Members will be unassigned.`)) return;
    await fetch(`/api/teams?id=${teamId}`, { method: 'DELETE' });
    load();
  }

  const roleLabel: Record<string, string> = { manager: 'Manager', senior: 'Senior', member: 'Member' };
  const roleIcon: Record<string, string> = { super_admin: '🔴', admin: '🟠', team_manager: '🔵', team_member: '🟢' };
  const formatHours = (mins: number | null) => mins ? `${Math.round(mins / 60)}h` : '0h';


  const unteamed = allStaff.filter(s => !s.team_names);

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-2)' }}>
        <div>
          <h1>Teams</h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Manage your firm's staff, capacity, and performance.</p>
        </div>
        {tab === 'directory' && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> New Team</button>}
      </div>

      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { key: 'directory', label: 'Directory' },
          { key: 'staff', label: 'Team Members' },
          { key: 'capacity', label: 'Workload & Capacity' },
          { key: 'revenue', label: 'Revenue Attribution' },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* DIRECTORY TAB — Team Cards */}
      {tab === 'directory' && (
        <>
          {teams.map((team: any) => {
            const teamMembers = members.filter((m: any) => m.team_id === team.id);
            return (
              <div className="card" key={team.id} style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <UsersRound size={20} style={{ color: 'var(--color-primary)' }} />
                      {team.name}
                    </h3>
                    <span className="text-sm text-muted">{team.description || ''} · Manager: {team.manager_name || 'Unassigned'}</span>
                  </div>
                  <span className={`badge ${team.is_active ? 'badge-green' : 'badge-gray'}`}>{team.is_active ? 'Active' : 'Inactive'}</span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'var(--space-2)' }}>
                    <button className="btn btn-ghost btn-sm" title="Edit Team" onClick={() => openEditTeam(team)}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-sm" title="Delete Team" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteTeam(team.id, team.name)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                    {teamMembers.map((m: any) => (
                      <div key={m.id} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                            {m.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{m.name}</div>
                            <div className="text-xs text-muted">{roleLabel[m.role_in_team] || m.role_in_team}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <span className="badge badge-blue" style={{ fontSize: 11 }}><Briefcase size={12} /> {m.active_stages} active</span>
                          <span className="badge badge-gray" style={{ fontSize: 11 }}>{m.pending_stages} pending</span>
                          <span className="badge badge-green" style={{ fontSize: 11 }}><CheckCircle size={12} /> {m.completed_stages} done</span>
                        </div>
                        <div className="text-xs text-muted">{m.email}</div>
                      </div>
                    ))}
                  </div>
                  {teamMembers.length === 0 && <div className="text-center text-muted" style={{ padding: 'var(--space-6)' }}>No members in this team</div>}
                </div>
              </div>
            );
          })}
          {teams.length === 0 && !showModal && (
            <div className="card"><div className="empty-state"><UsersRound size={48} /><h3>No teams created</h3><p>Create your first team to start assigning projects.</p></div></div>
          )}
        </>
      )}

      {/* ========== TEAM MEMBERS (ALL STAFF DIRECTORY) ========== */}
      {tab === 'staff' && (
        <>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><User size={18} /> All Staff Members ({allStaff.length})</h3>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Team(s)</th>
                    <th>Active</th>
                    <th>Pending</th>
                    <th>Done</th>
                    <th>Hours (30d)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allStaff.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.is_active ? 'var(--color-primary-light)' : 'var(--color-gray-100)', color: s.is_active ? 'var(--color-primary)' : 'var(--color-gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </div>
                          <div>
                            <span className="client-name">{s.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} style={{ color: 'var(--color-gray-400)' }} /> {s.email}</td>
                      <td className="text-sm">{s.phone ? <><Phone size={12} style={{ color: 'var(--color-gray-400)' }} /> {s.phone}</> : '—'}</td>
                      <td>
                        <span className="badge badge-gray" style={{ fontSize: 11 }}>
                          {roleIcon[s.role] || ''} {s.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-sm">{s.team_names || <span className="text-muted" style={{ fontStyle: 'italic' }}>Solo</span>}</td>
                      <td><span className="badge badge-blue">{s.active_stages}</span></td>
                      <td><span className="badge badge-gray">{s.pending_stages}</span></td>
                      <td><span className="badge badge-green">{s.completed_stages}</span></td>
                      <td className="text-sm"><Clock size={12} style={{ color: 'var(--color-gray-400)' }} /> {formatHours(s.hours_last_30)}</td>
                      <td>
                        <span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {unteamed.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Shield size={18} /> Solo / Unassigned Staff ({unteamed.length})</h3>
                <span className="text-sm text-muted">Staff not assigned to any team</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                  {unteamed.map(s => (
                    <div key={s.id} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                        {s.first_name?.[0]}{s.last_name?.[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                        <div className="text-xs text-muted">{s.email} · {s.role?.replace('_', ' ')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>{s.active_stages}</span>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{s.pending_stages}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CAPACITY TAB */}
      {tab === 'capacity' && (
        <div className="card">
          <div className="card-header"><h3>Manager Workload Dashboard</h3></div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Team Member</th><th>Role</th><th>Department</th><th>Active Pipelines</th><th>Pending Queue</th><th>Action</th></tr></thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{m.name.split(' ').map((n: string) => n[0]).join('')}</div>
                        <span className="client-name">{m.name}</span>
                      </div>
                    </td>
                    <td>{roleLabel[m.role_in_team] || m.role_in_team}</td>
                    <td className="text-sm">{m.team_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: '60%', height: 8, background: 'var(--color-gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: Math.min((m.active_stages / 10) * 100, 100) + '%', background: m.active_stages > 5 ? 'var(--color-danger)' : 'var(--color-primary)' }}></div>
                        </div>
                        <span className="badge badge-blue">{m.active_stages} Active</span>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{m.pending_stages} Pending</span></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => openReassignModal(m)}>Reassign Queue</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVENUE TAB */}
      {tab === 'revenue' && (
        <div className="card">
          <div className="card-header"><h3>Primary Preparer Revenue Attribution</h3><span className="badge badge-green">Based on Paid & Sent Invoices</span></div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Preparer Name</th><th>System Role</th><th>Projects Served</th><th style={{ textAlign: 'right' }}>Total Attributed Revenue</th></tr></thead>
              <tbody>
                {revenue.map(r => (
                  <tr key={r.id}>
                    <td><span className="client-name">{r.name}</span></td>
                    <td>{r.role === 'team_manager' ? 'Manager' : r.role === 'team_member' ? 'Member' : r.role}</td>
                    <td><span className="badge badge-blue">{r.projects_prepped} Engagements</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(r.total_attributed_revenue)}</td>
                  </tr>
                ))}
                {revenue.length === 0 && <tr><td colSpan={4} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No revenue data available.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Team Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header"><h2>New Team</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={createTeam}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Team Name *</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Bookkeeping Team A" /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe this team's focus..."></textarea></div>
                <div className="form-group"><label className="form-label">Assign Manager</label>
                  <select className="form-select" value={form.manager_id} onChange={e => setForm({ ...form, manager_id: e.target.value })}>
                    <option value="">No Manager Assigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Team</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditTeamModal && (
        <div className="modal-overlay" onClick={() => setShowEditTeamModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header"><h2>Edit Team</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowEditTeamModal(false)}>✕</button></div>
            <form onSubmit={handleEditTeam}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Team Name *</label><input className="form-input" required value={editTeamForm.name} onChange={e => setEditTeamForm({ ...editTeamForm, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={editTeamForm.description} onChange={e => setEditTeamForm({ ...editTeamForm, description: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Assign Manager</label>
                  <select className="form-select" value={editTeamForm.manager_id} onChange={e => setEditTeamForm({ ...editTeamForm, manager_id: e.target.value })}>
                    <option value="">No Manager</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowEditTeamModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Reassign Modal */}
      {showReassignModal && (
        <div className="modal-overlay" onClick={() => setShowReassignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h2>Reassign: {selectedUserForReassign?.name}</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowReassignModal(false)}>✕</button></div>
            <form onSubmit={handleBulkReassign}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="form-group"><label className="form-label">Transfer To</label>
                  <select className="form-select" required value={targetUserId} onChange={e => setTargetUserId(e.target.value)}>
                    <option value="">Select teammate...</option>
                    {users.filter((u: any) => u.id !== selectedUserForReassign?.id).map((u: any) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                  </select>
                </div>
                <h4 style={{ marginTop: 'var(--space-4)' }}>Stages ({selectedStageIds.length} selected)</h4>
                {userStages.length === 0 ? <p className="text-sm text-muted">No active/pending stages.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', gap: 8, padding: 4, borderBottom: '1px solid var(--color-gray-100)' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedStageIds(userStages.map(s => s.stage_id))}>Select All</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedStageIds([])}>Clear</button>
                    </div>
                    {userStages.map(s => (
                      <label key={s.stage_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2)', cursor: 'pointer', borderRadius: 4, background: selectedStageIds.includes(s.stage_id) ? 'var(--color-primary-light)' : 'transparent' }}>
                        <input type="checkbox" checked={selectedStageIds.includes(s.stage_id)} onChange={e => { if (e.target.checked) setSelectedStageIds([...selectedStageIds, s.stage_id]); else setSelectedStageIds(selectedStageIds.filter(id => id !== s.stage_id)); }} />
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: 14 }}>{s.client_name} - {s.stage_name}</div><div className="text-xs text-muted">{s.engagement_code} · {s.status}</div></div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowReassignModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={selectedStageIds.length === 0 || !targetUserId}>Transfer ({selectedStageIds.length})</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
