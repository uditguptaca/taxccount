'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface Client {
  id: string;
  display_name: string;
  client_type?: string;
  state_province?: string;
  postal_code?: string;
}

interface PayrollContextType {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedClient: Client | null;
  loading: boolean;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export function PayrollProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialClientId = searchParams?.get('clientId') || null;
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(initialClientId);
  const [loading, setLoading] = useState(true);

  // If we're inside a workspace and no client is selected, try to get from URL or redirect
  useEffect(() => {
    fetch('/api/clients?status=active')
      .then(r => r.json())
      .then(d => {
        if (d.clients) setClients(d.clients);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const setSelectedClientId = (id: string | null) => {
    setSelectedClientIdState(id);
    if (id) {
      // If we are on the landing page, redirect to overview
      if (pathname === '/dashboard/services/payroll') {
        router.push('/dashboard/services/payroll/overview');
      }
    } else {
      router.push('/dashboard/services/payroll');
    }
  };

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clients.find(c => c.id === selectedClientId) || null;
  }, [selectedClientId, clients]);

  return (
    <PayrollContext.Provider value={{ clients, selectedClientId, setSelectedClientId, selectedClient, loading }}>
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayrollClient() {
  const context = useContext(PayrollContext);
  if (context === undefined) {
    throw new Error('usePayrollClient must be used within a PayrollProvider');
  }
  return context;
}
