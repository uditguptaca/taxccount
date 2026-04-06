'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, User, Filter, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface ComplianceTask {
  id: string;
  engagement_code: string;
  due_date: string;
  status: string;
  client_id: string;
  client_name: string;
  client_type: string;
  template_name: string;
  color_code?: string;
  assignee_name?: string;
}

interface CalendarViewProps {
  tasks: ComplianceTask[];
  onTaskChange?: (taskId: string, updates: Partial<ComplianceTask>) => void;
  isAdmin?: boolean;
  hideHeader?: boolean;
}

export default function CalendarView({ tasks, onTaskChange, isAdmin = false, hideHeader = false }: CalendarViewProps) {
  const [filterClientType, setFilterClientType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState<ComplianceTask | null>(null);

  // Convert tasks to calendar events
  const events = useMemo(() => {
    return tasks
      .filter(t => filterClientType === 'all' || t.client_type === filterClientType)
      .filter(t => filterStatus === 'all' || t.status === filterStatus)
      .map(t => {
        const d = new Date(t.due_date);
        return {
          id: t.id,
          title: `${t.template_name} - ${t.client_name}`,
          start: d,
          end: d,
          allDay: true,
          resource: t
        };
      });
  }, [tasks, filterClientType, filterStatus]);

  const eventStyleGetter = (event: any) => {
    const task = event.resource as ComplianceTask;
    let backgroundColor = task.color_code || '#3b82f6'; // Default blue
    let decoration = 'none';
    let opacity = 1;

    if (task.status === 'completed') {
      backgroundColor = '#10b981'; // Green for completed
      decoration = 'line-through';
      opacity = 0.7;
    } else if (new Date(task.due_date) < new Date() && task.status !== 'completed') {
      backgroundColor = '#ef4444'; // Red for overdue
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity,
        color: 'white',
        border: '0px',
        display: 'block',
        textDecoration: decoration,
        fontSize: '0.8rem',
        padding: '2px 4px'
      }
    };
  };

  const handleSelectEvent = (event: any) => {
    setSelectedTask(event.resource);
  };

  // Custom toolbars or wrappers could be added here
  
  return (
    <div className="calendar-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: '600px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-gray-200)' }}>
      {/* Filters Header */}
      {!hideHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
              <CalendarIcon size={24} style={{ color: 'var(--color-primary)' }}/> 
              Compliance Calendar
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--color-gray-500)' }}/>
              <select className="form-input" style={{ padding: '6px 12px', width: 'auto' }} value={filterClientType} onChange={e => setFilterClientType(e.target.value)}>
                <option value="all">All Client Types</option>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="trust">Trust</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select className="form-input" style={{ padding: '6px 12px', width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day']}
          defaultView="month"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}
        />
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: selectedTask.color_code || 'var(--color-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedTask.template_name}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Client:</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14}/> {selectedTask.client_name} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-gray-500)' }}>({selectedTask.client_type})</span></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Engagement:</span>
                <code>{selectedTask.engagement_code}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Due Date:</span>
                <strong>{new Date(selectedTask.due_date).toLocaleDateString('en-CA')}</strong>
              </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Assignee:</span>
                <strong>{selectedTask.assignee_name || 'Unassigned'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Status:</span>
                <span className={`badge ${selectedTask.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>{selectedTask.status.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {isAdmin && onTaskChange && selectedTask.status !== 'completed' && (
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    const newDate = window.prompt("Enter new due date (YYYY-MM-DD):", selectedTask.due_date);
                    if (newDate && onTaskChange) {
                      onTaskChange(selectedTask.id, { due_date: newDate });
                      setSelectedTask(null);
                    }
                  }}
                >
                  Edit Date
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    if (onTaskChange) {
                      onTaskChange(selectedTask.id, { status: 'completed' });
                      setSelectedTask(null);
                    }
                  }}
                >
                  <CheckCircle2 size={16} /> Mark Completed
                </button>
              </div>
            )}
            
            {!isAdmin && selectedTask.status === 'completed' && (
              <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Task Completed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
