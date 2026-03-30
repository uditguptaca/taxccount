'use client';

import React, { useEffect, useState } from 'react';
import CalendarView, { ComplianceTask } from '@/components/CalendarView';

export default function AdminCalendarPage() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/calendar/admin');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error('Failed to fetch calendar tasks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskChange = async (taskId: string, updates: Partial<ComplianceTask>) => {
    try {
      const res = await fetch(`/api/calendar/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchTasks();
      } else {
        alert('Failed to update task.');
      }
    } catch (e) {
      console.error('Update error', e);
      alert('Failed to update task.');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading calendar...</div>;
  }

  return (
    <div style={{ padding: '24px', height: '100%', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '2rem' }}>Compliance Calendar</h1>
      <CalendarView tasks={tasks} isAdmin={true} onTaskChange={handleTaskChange} />
    </div>
  );
}
