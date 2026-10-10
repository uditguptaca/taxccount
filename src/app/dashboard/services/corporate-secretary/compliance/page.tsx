'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Calendar, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CompliancePage() {
  const { selectedClientId, corporation, complianceTasks, refreshData } = useCorporateSecretary();
  const router = useRouter();

  const [showModal, setShowModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategory, setNewCategory] = React.useState('annual_return');
  const [newDueDate, setNewDueDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = React.useState(false);

  const handleCompleteTask = async (task: any) => {
    let wizard = 'registered-address';
    if (task.category === 'annual_return') {
      wizard = 'share-issuance';
    } else if (task.category === 'isc_review') {
      wizard = 'registered-address';
    }
    router.push(`/dashboard/services/corporate-secretary/changes?clientId=${selectedClientId}&wizard=${wizard}`);
  };

  const handleAddObligation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/corpsec/${selectedClientId}/compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          due_date: newDueDate
        })
      });
      if (res.ok) {
        setShowModal(false);
        setNewTitle('');
        await refreshData();
      } else {
        alert('Failed to add compliance obligation.');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!corporation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Title Header */}
      <div className="cs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={28} style={{ color: 'var(--cs-accent)' }} />
            Compliance Obligations & Tasks
          </h1>
          <p className="cs-page-subtitle">
            Monitor due dates for corporate filings, annual returns, and mandatory internal registry reviews.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="cs-btn cs-btn-primary cs-btn-sm"
        >
          Add Obligation
        </button>
      </div>

      <div className="cs-grid-2">
        
        {/* Left: Compliance Tasks List */}
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Active Compliance Deadlines</h2>
          </div>

          <div className="cs-card-body">
            {complianceTasks.length === 0 ? (
              <div className="cs-empty">
                <Calendar size={36} />
                <p>No compliance obligations recorded for this period.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {complianceTasks.map(task => {
                  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';
                  return (
                    <div 
                      key={task.id} 
                      className={`cs-alert ${isOverdue ? 'danger' : 'info'}`} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        margin: 0, 
                        padding: '16px 20px',
                        background: isOverdue ? 'var(--cs-red-light)' : 'var(--cs-surface-hover)',
                        borderColor: isOverdue ? 'var(--cs-red)' : 'var(--cs-border-light)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {isOverdue ? (
                          <AlertTriangle size={18} style={{ color: 'var(--cs-red)', flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <Clock size={18} style={{ color: 'var(--cs-accent)', flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cs-text-primary)', margin: '0 0 4px 0' }}>{task.title}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--cs-text-secondary)' }}>
                            Category: <strong>{task.category}</strong> • Due: <strong>{task.due_date}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className={`cs-badge ${task.status === 'completed' ? 'green' : isOverdue ? 'red' : 'amber'}`}>
                          {isOverdue ? 'Overdue' : task.status}
                        </span>
                        {task.status !== 'completed' && (
                          <button 
                            onClick={() => handleCompleteTask(task)}
                            className="cs-btn cs-btn-primary cs-btn-sm"
                          >
                            File Return <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Filing Context details */}
        <div className="cs-card">
          <div className="cs-card-header">
            <h2>Regulatory Calendar Info</h2>
          </div>
          <div className="cs-card-body">
            <p style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Annual Returns are due within 60 days of the corporation&apos;s anniversary date for CBCA (federal) entities. Failure to file may lead to strike-offs.
            </p>
          </div>
        </div>

      </div>

      {showModal && (
        <div className="cs-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="cs-modal" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="cs-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Add Compliance Obligation</h2>
              <button className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <form onSubmit={handleAddObligation} className="cs-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
              <div className="cs-form-group">
                <label className="cs-form-label">Obligation Title</label>
                <input required type="text" className="cs-form-input" placeholder="e.g. File QC Annual Declaration" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label">Category</label>
                <select className="cs-form-select" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                  <option value="annual_return">Annual Return / Declaration</option>
                  <option value="isc_review">Significant Control (ISC) Review</option>
                  <option value="director_meeting">Directors Meeting / Resolution</option>
                  <option value="other">Other Regulatory Filing</option>
                </select>
              </div>
              <div className="cs-form-group">
                <label className="cs-form-label">Due Date</label>
                <input required type="date" className="cs-form-input" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="cs-btn cs-btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} className="cs-btn cs-btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Adding...' : 'Add Obligation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
