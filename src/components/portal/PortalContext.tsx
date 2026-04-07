'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type PortalContextType = {
  data: any;
  loading: boolean;
  refresh: () => void;
  userId: string;
};

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  const fetchDashboard = () => {
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('client_id');
    const url = cid ? `/api/portal/dashboard?client_id=${cid}` : '/api/portal/dashboard';
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserId(user.id || '');
    fetchDashboard();
  }, []);

  return (
    <PortalContext.Provider value={{ data, loading, refresh: fetchDashboard, userId }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
