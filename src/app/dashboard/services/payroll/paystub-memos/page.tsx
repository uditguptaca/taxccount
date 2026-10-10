'use client';

import React, { useState, useEffect } from 'react';
import { usePayrollClient } from '@/components/Payroll/ClientContext';
import { Plus, MessageSquare, Clock, CheckCircle2, X, Search, Trash2, Edit } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { bg: '#F1F5F9', color: '#64748B', icon: <Clock size={12} /> },
  ACTIVE: { bg: '#D1FAE5', color: '#059669', icon: <CheckCircle2 size={12} /> },
  INACTIVE: { bg: '#FEE2E2', color: '#EF4444', icon: <X size={12} /> },
};

const DEFAULT_MEMOS = [
  {
    id: 'memo-1',
    message: 'Wishing you all a wonderful and safe holiday season!',
    targetGroup: 'All Employees',
    startDate: '2026-12-15',
    endDate: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: 'memo-2',
    message: 'Reminder: Q3 Expense reimbursement requests must be submitted by September 25th.',
    targetGroup: 'Weekly Salaried',
    startDate: '2026-09-10',
    endDate: '2026-09-25',
    status: 'ACTIVE',
  },
  {
    id: 'memo-3',
    message: 'Notice: Standard office hours will resume starting October 1st.',
    targetGroup: 'Bi-weekly Hourly',
    startDate: '2026-09-15',
    endDate: '2026-10-01',
    status: 'DRAFT',
  }
];

export default function PaystubMemosPage() {
  const { selectedClientId: clientId, loading: clientLoading } = usePayrollClient();
  const [memos, setMemos] = useState(DEFAULT_MEMOS);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMemo, setEditingMemo] = useState<any>(null);
  
  // Form State
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('All Employees');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [status, setStatus] = useState('ACTIVE');

  const handleOpenAdd = () => {
    setEditingMemo(null);
    setMessage('');
    setTargetGroup('All Employees');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const handleOpenEdit = (memo: any) => {
    setEditingMemo(memo);
    setMessage(memo.message);
    setTargetGroup(memo.targetGroup);
    setStartDate(memo.startDate);
    setEndDate(memo.endDate);
    setStatus(memo.status);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this memo?')) {
      setMemos(memos.filter(m => m.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMemo) {
      // Edit existing
      setMemos(memos.map(m => m.id === editingMemo.id ? {
        ...m,
        message,
        targetGroup,
        startDate,
        endDate,
        status
      } : m));
    } else {
      // Create new
      const newMemo = {
        id: `memo-${Date.now()}`,
        message,
        targetGroup,
        startDate,
        endDate,
        status
      };
      setMemos([newMemo, ...memos]);
    }
    setShowModal(false);
  };

  if (clientLoading) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>Loading paystub memos...</div>;
  if (!clientId) return <div style={{ padding: '40px', color: '#64748B', textAlign: 'center' }}>No client selected.</div>;

  const filteredMemos = memos.filter(m => 
    m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.targetGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Paystub Memos</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Add personalized messages or reminders directly to employee pay statements.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            background: '#059669', color: 'white', border: 'none', padding: '10px 20px',
            borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '8px', transition: 'background-color 0.15s ease'
          }}
        >
          <Plus size={16} /> Create Paystub Memo
        </button>
      </div>

      {/* Toolbar / Search */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search memos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px',
              border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {filteredMemos.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', margin: '0 0 4px 0' }}>No Paystub Memos Found</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Create a paystub memo to display a message on employee stubs.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Message</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Audience</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Active Dates</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemos.map(memo => {
                const statusStyle = STATUS_STYLES[memo.status] || STATUS_STYLES.DRAFT;
                return (
                  <tr key={memo.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', maxWidth: '400px', fontWeight: 500 }}>{memo.message}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{memo.targetGroup}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                      {memo.startDate} to {memo.endDate}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px',
                        fontWeight: 600, background: statusStyle.bg, color: statusStyle.color
                      }}>
                        {statusStyle.icon}
                        {memo.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(memo)}
                          style={{
                            background: 'transparent', border: 'none', color: '#059669',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                            padding: '6px', borderRadius: '4px'
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(memo.id)}
                          style={{
                            background: 'transparent', border: 'none', color: '#EF4444',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                            padding: '6px', borderRadius: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%',
            maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #F1F5F9'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {editingMemo ? 'Edit Paystub Memo' : 'Create Paystub Memo'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Memo Message</label>
                <textarea
                  required
                  placeholder="e.g. Standard office hours will resume starting October 1st."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px',
                    minHeight: '100px', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Target Pay Group</label>
                <select
                  value={targetGroup}
                  onChange={e => setTargetGroup(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="All Employees">All Employees</option>
                  <option value="Weekly Salaried">Weekly Salaried</option>
                  <option value="Bi-weekly Hourly">Bi-weekly Hourly</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #CBD5E1', outline: 'none', fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, background: 'white', border: '1px solid #CBD5E1',
                    padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                    cursor: 'pointer', color: '#475569'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, background: '#059669', border: 'none',
                    padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
                    cursor: 'pointer', color: 'white'
                  }}
                >
                  {editingMemo ? 'Save Changes' : 'Create Memo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
