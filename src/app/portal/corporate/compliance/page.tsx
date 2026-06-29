'use client';

import React from 'react';
import { useCorporateSecretary } from '@/components/CorporateSecretary/ClientContext';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ClientCorporateCompliance() {
  const { corporation, complianceTasks } = useCorporateSecretary();

  if (!corporation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="cs-skeleton" style={{ width: '200px', height: '20px' }} />
      </div>
    );
  }

  return (
    <div className="cs-grid-2">
      
      {/* Compliance Tasks List */}
      <div className="cs-card">
        <div className="cs-card-header">
          <h2>Upcoming Filing Requirements</h2>
        </div>

        <div className="cs-card-body">
          {complianceTasks.length === 0 ? (
            <div className="cs-empty">
              <Clock size={36} />
              <p>No compliance deadlines recorded.</p>
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
                        <Clock size={18} style={{ color: 'var(--cs-emerald)', flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cs-text-primary)', margin: '0 0 4px 0' }}>{task.title}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--cs-text-secondary)' }}>Category: <strong>{task.category}</strong> • Due: <strong>{task.due_date}</strong></span>
                      </div>
                    </div>

                    <span className={`cs-badge ${task.status === 'completed' ? 'green' : isOverdue ? 'red' : 'amber'}`}>
                      {isOverdue ? 'Overdue' : task.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Calendar details */}
      <div className="cs-card">
        <div className="cs-card-header">
          <h2>Compliance Help</h2>
        </div>
        <div className="cs-card-body">
          <p style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Mandatory annual filings and registries reviews are synced with your corporate profile. If you have questions about specific filing requirements, please contact our team via the communications tab.
          </p>
        </div>
      </div>

    </div>
  );
}
