'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface ClientContextType {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedClient: Client | null;
  corporation: any | null;
  directors: any[];
  officers: any[];
  shareholders: any[];
  shareClasses: any[];
  capTable: any[];
  convertibles: any[];
  optionPlans: any[];
  optionGrants: any[];
  complianceTasks: any[];
  minuteBook: any | null;
  documents: any[];
  changes: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const CorporateSecretaryContext = createContext<ClientContextType | undefined>(undefined);

export function CorporateSecretaryProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get('clientId') || searchParams?.get('client_id') || null;
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId);
  const [loading, setLoading] = useState(true);

  // Loaded data states
  const [corporation, setCorporation] = useState<any | null>(null);
  const [directors, setDirectors] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [shareClasses, setShareClasses] = useState<any[]>([]);
  const [capTable, setCapTable] = useState<any[]>([]);
  const [convertibles, setConvertibles] = useState<any[]>([]);
  const [optionPlans, setOptionPlans] = useState<any[]>([]);
  const [optionGrants, setOptionGrants] = useState<any[]>([]);
  const [complianceTasks, setComplianceTasks] = useState<any[]>([]);
  const [minuteBook, setMinuteBook] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);

  useEffect(() => {
    const cid = searchParams?.get('clientId') || searchParams?.get('client_id');
    if (cid && cid !== selectedClientId) {
      setSelectedClientId(cid);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/clients?status=active&type=business')
      .then(r => r.json())
      .then(d => {
        if (d.clients) setClients(d.clients);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const refreshData = useCallback(async () => {
    if (!selectedClientId) return;
    try {
      // 1. Corporation Details
      const resCorp = await fetch(`/api/corpsec/${selectedClientId}/corporation`);
      const dataCorp = await resCorp.json();
      if (dataCorp.corporation) setCorporation(dataCorp.corporation);

      // 2. Directors
      const resDirs = await fetch(`/api/corpsec/${selectedClientId}/registers/directors`);
      const dataDirs = await resDirs.json();
      if (dataDirs.directors) setDirectors(dataDirs.directors);

      // 3. Officers
      const resOffs = await fetch(`/api/corpsec/${selectedClientId}/registers/officers`);
      const dataOffs = await resOffs.json();
      if (dataOffs.officers) setOfficers(dataOffs.officers);

      // 4. Shareholders
      const resHolders = await fetch(`/api/corpsec/${selectedClientId}/registers/shareholders`);
      const dataHolders = await resHolders.json();
      if (dataHolders.shareholders) setShareholders(dataHolders.shareholders);

      // 5. Equity / Cap Table / Options
      const resEq = await fetch(`/api/corpsec/${selectedClientId}/equity/cap-table`);
      const dataEq = await resEq.json();
      if (dataEq) {
        if (dataEq.shareClasses) setShareClasses(dataEq.shareClasses);
        if (dataEq.capTable) setCapTable(dataEq.capTable);
        if (dataEq.convertibles) setConvertibles(dataEq.convertibles);
        if (dataEq.optionPlans) setOptionPlans(dataEq.optionPlans);
        if (dataEq.optionGrants) setOptionGrants(dataEq.optionGrants);
      }

      // 6. Compliance tasks
      const resComp = await fetch(`/api/corpsec/${selectedClientId}/compliance`);
      const dataComp = await resComp.json();
      if (dataComp.tasks) setComplianceTasks(dataComp.tasks);

      // 7. Minute Book
      const resBook = await fetch(`/api/corpsec/${selectedClientId}/minute-book`);
      const dataBook = await resBook.json();
      if (dataBook) setMinuteBook(dataBook);

      // 8. Documents
      const resDocs = await fetch(`/api/corpsec/${selectedClientId}/documents`);
      const dataDocs = await resDocs.json();
      if (dataDocs.documents) setDocuments(dataDocs.documents);

      // 9. Changes
      const resChanges = await fetch(`/api/corpsec/${selectedClientId}/changes`);
      const dataChanges = await resChanges.json();
      if (dataChanges.changes) setChanges(dataChanges.changes);

    } catch (err) {
      console.error('Error refreshing corporate secretary data:', err);
    }
  }, [selectedClientId]);

  useEffect(() => {
    if (selectedClientId) {
      refreshData();
    } else {
      // Clear data
      setCorporation(null);
      setDirectors([]);
      setOfficers([]);
      setShareholders([]);
      setShareClasses([]);
      setCapTable([]);
      setConvertibles([]);
      setOptionPlans([]);
      setOptionGrants([]);
      setComplianceTasks([]);
      setMinuteBook(null);
      setDocuments([]);
      setChanges([]);
    }
  }, [selectedClientId, refreshData]);

  return (
    <CorporateSecretaryContext.Provider value={{
      clients,
      selectedClientId,
      setSelectedClientId,
      selectedClient,
      corporation,
      directors,
      officers,
      shareholders,
      shareClasses,
      capTable,
      convertibles,
      optionPlans,
      optionGrants,
      complianceTasks,
      minuteBook,
      documents,
      changes,
      loading,
      refreshData
    }}>
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
