'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export interface Client {
  id: string;
  display_name: string;
  address_line_1: string;
  city: string;
  state_province: string;
  postal_code: string;
  client_type?: string;
  secretarial_data?: any;
}

export interface SecretarialData {
  directors: any[];
  officers: any[];
  shareholders: any[];
  shareClasses: any[];
}

interface ClientContextType {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedClient: Client | null;
  secretarialData: SecretarialData | null;
  loading: boolean;
}

const CorporateSecretaryContext = createContext<ClientContextType | undefined>(undefined);

export function CorporateSecretaryProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get('clientId') || null;
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cid = searchParams?.get('clientId');
    if (cid && cid !== selectedClientId) {
      setSelectedClientId(cid);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/clients?status=active')
      .then(r => r.json())
      .then(d => {
        if (d.clients) setClients(d.clients);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clients.find(c => c.id === selectedClientId) || null;
  }, [selectedClientId, clients]);

  const secretarialData = useMemo(() => {
    if (!selectedClient) return null;

    let dbData: any = {};
    if (selectedClient.secretarial_data) {
      dbData = typeof selectedClient.secretarial_data === 'string' 
        ? JSON.parse(selectedClient.secretarial_data) 
        : selectedClient.secretarial_data;
    }

    // Map DB directors to what the UI expects
    const directors = dbData.directors && dbData.directors.length > 0 ? dbData.directors.map((d: any, i: number) => ({
      id: i + 1,
      name: d.name,
      address: d.address || 'Unknown',
      email: `${d.name.split(' ')[0].toLowerCase()}@example.com`,
      phone: '555-0000',
      is_owner: d.is_owner,
      share_amount: d.share_amount
    })) : [
      // Fallback
      { id: 1, name: `Jane ${selectedClient.display_name.split(' ')[0] || 'Doe'}`, address: selectedClient.address_line_1 || '123 Main St', email: `jane@example.com`, phone: '555-0101' }
    ];

    const officers = directors.map((d: any) => ({
      id: d.id,
      name: d.name,
      position: d.id === 1 ? 'President / CEO' : 'Secretary',
      email: d.email,
      phone: d.phone
    }));

    const shareholders = directors.filter((d: any) => d.is_owner || dbData.directors?.length === 0).map((d: any) => ({
      id: d.id,
      name: d.name,
      shares: parseInt(d.share_amount) || 1000,
      class: 'Class A Common',
      type: 'Individual'
    }));

    return {
      directors,
      officers,
      shareholders,
      shareClasses: dbData.shareClasses || [
        { id: 1, name: 'Class A Common', votes: 1, issued: shareholders.reduce((sum: number, s: any) => sum + s.shares, 0), price: 1.00 },
        { id: 2, name: 'Class B Preferred', votes: 0, issued: 0, price: 10.00 }
      ]
    };
  }, [selectedClient]);

  return (
    <CorporateSecretaryContext.Provider value={{ clients, selectedClientId, setSelectedClientId, selectedClient, secretarialData, loading }}>
      {children}
    </CorporateSecretaryContext.Provider>
  );
}

export function useCorporateSecretary() {
  const context = useContext(CorporateSecretaryContext);
  if (context === undefined) {
    throw new Error('useCorporateSecretary must be used within a CorporateSecretaryProvider');
  }
  return context;
}
