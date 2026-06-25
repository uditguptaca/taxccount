import React from 'react';
import LedgerFlowTab from '@/components/clients/LedgerFlowTab';
import { Landmark } from 'lucide-react';

export default function FirmAccountingPage() {
  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold' }}>
            <Landmark size={24} style={{ color: 'var(--color-primary)' }}/> Firm Accounting
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--color-gray-500)' }}>Manage internal firm finances, chart of accounts, and ledgers.</p>
        </div>
      </div>
      
      {/* We pass 'FIRM' as the client ID. The backend routes will automatically create a ledger tied to the firm itself instead of a specific client. */}
      <LedgerFlowTab clientId="FIRM" />
    </div>
  );
}
