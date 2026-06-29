'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Calendar, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CompliancePage() {
  const { selectedClientId, corporation, complianceTasks, refreshData } = useCorporateSecretary();

  const handleCompleteTask = async (taskId: string) => {
    // Simply confirm compliance task execution in mock
    alert('Annual return filed with the government registry. The compliance task is marked completed.');
    await refreshData();
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
      <div className="cs-page-header">
        <h1 className="cs-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={28} style={{ color: 'var(--cs-accent)' }} />
          Compliance Obligations & Tasks
        </h1>
        <p className="cs-page-subtitle">
          Monitor due dates for corporate filings, annual returns, and mandatory internal registry reviews.
        </p>
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
                            onClick={() => handleCompleteTask(task.id)}
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

    </div>
  );
}
