'use client';
import React, { useEffect, useState } from 'react';
import { 
  BookOpen, DollarSign, ShoppingCart, Landmark, PieChart, 
  ChevronDown, ChevronRight, FileText, ArrowUpRight, ArrowDownRight, 
  Activity, CheckCircle2, Search, Plus, MoreVertical, Edit2, 
  UploadCloud, Check, SplitSquareHorizontal, Zap, Users, Receipt, CreditCard,
  Trash2, X, PlusCircle, Calendar, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface LedgerFlowTabProps {
  clientId: string;
}

export default function LedgerFlowTab({ clientId }: LedgerFlowTabProps) {
  // Navigation & Data State
  const [activeTab, setActiveTab] = useState('chart_of_accounts');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any>({ customers: [], invoices: [] });
  const [purchasesData, setPurchasesData] = useState<any>({ vendors: [], bills: [] });

  // Sidebar sections expanded state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    accounting: true, sales: true, purchases: true, banking: true, reports: true
  });

  // Date and Report states
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0]; // Jan 1st of current year
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [glAccountId, setGlAccountId] = useState('all');

  // Report results states
  const [trialBalanceResult, setTrialBalanceResult] = useState<any>(null);
  const [plResult, setPlResult] = useState<any>(null);
  const [balanceSheetResult, setBalanceSheetResult] = useState<any>(null);
  const [generalLedgerResult, setGeneralLedgerResult] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Journal Entry History
  const [journalHistory, setJournalHistory] = useState<any[]>([]);
  const [expandedJournals, setExpandedJournals] = useState<Record<string, boolean>>({});

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Form states
  const [accountForm, setAccountForm] = useState({
    id: '', name: '', type: 'asset', subtype: '', account_code: '', description: ''
  });
  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    entries: [
      { account_id: '', debit: '', credit: '', memo: '' },
      { account_id: '', debit: '', credit: '', memo: '' }
    ]
  });
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', billing_address: '' });
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', phone: '', billing_address: '' });
  const [paymentForm, setPaymentForm] = useState({ id: '', amount: '', date: new Date().toISOString().split('T')[0], type: '' });
  
  const [invoiceForm, setInvoiceForm] = useState({
    customer_id: '', invoice_number: '', date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    tax_rate: '0',
    lines: [{ description: '', account_id: '', quantity: '1', unit_price: '0' }]
  });

  const [billForm, setBillForm] = useState({
    vendor_id: '', bill_number: '', date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    tax_rate: '0',
    lines: [{ description: '', account_id: '', quantity: '1', unit_price: '0' }]
  });

  const [bankTxnForm, setBankTxnForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'deposit',
    account_id: ''
  });

  const [csvFileContent, setCsvFileContent] = useState<string>('');
  const [csvMappedColumns, setCsvMappedColumns] = useState({ date: 0, description: 1, amount: 2 });
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  // Reconciliation state
  const [reconForm, setReconForm] = useState({ account_id: '', ending_balance: '', as_of: new Date().toISOString().split('T')[0] });
  const [reconSession, setReconSession] = useState<any>(null);
  const [clearedTxns, setClearedTxns] = useState<Record<string, boolean>>({});

  const getGroupHeader = (type: string) => {
    if (type === 'asset') return 'Assets';
    if (type === 'liability') return 'Liabilities';
    if (type === 'equity') return 'Equity';
    if (type === 'revenue') return 'Revenue';
    if (type === 'expense') return 'Expenses';
    return type;
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '—';
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return `${month}/${day}/${year}`;
    }
    return cleanDate;
  };

  const toggleSection = (section: string) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    fetchLedgerData();
  }, [clientId]);

  useEffect(() => {
    if (activeTab === 'profit_loss') fetchProfitLoss();
    if (activeTab === 'trial_balance') fetchTrialBalance();
    if (activeTab === 'balance_sheet') fetchBalanceSheet();
    if (activeTab === 'general_ledger') fetchGeneralLedger();
    if (activeTab === 'journal_entries') fetchJournalHistory();
  }, [activeTab, fromDate, toDate, asOfDate, glAccountId]);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/ledger`);
      if (res.ok) setData(await res.json());
      
      const txnRes = await fetch(`/api/clients/${clientId}/ledger/transactions`);
      if (txnRes.ok) setTransactions((await txnRes.json()).transactions || []);

      const accRes = await fetch(`/api/clients/${clientId}/ledger/accounts`);
      if (accRes.ok) setAccounts((await accRes.json()).accounts || []);

      const salesRes = await fetch(`/api/clients/${clientId}/ledger/sales`);
      if (salesRes.ok) setSalesData(await salesRes.json());

      const purRes = await fetch(`/api/clients/${clientId}/ledger/purchases`);
      if (purRes.ok) setPurchasesData(await purRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJournalHistory = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/journal`);
      if (res.ok) setJournalHistory((await res.json()).transactions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTrialBalance = async () => {
    try {
      setLoadingReport(true);
      const res = await fetch(`/api/clients/${clientId}/ledger/reports?type=trial-balance&as_of=${asOfDate}`);
      if (res.ok) setTrialBalanceResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchProfitLoss = async () => {
    try {
      setLoadingReport(true);
      const res = await fetch(`/api/clients/${clientId}/ledger/reports?type=profit-loss&from=${fromDate}&to=${toDate}`);
      if (res.ok) setPlResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchBalanceSheet = async () => {
    try {
      setLoadingReport(true);
      const res = await fetch(`/api/clients/${clientId}/ledger/reports?type=balance-sheet&as_of=${asOfDate}`);
      if (res.ok) setBalanceSheetResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchGeneralLedger = async () => {
    try {
      setLoadingReport(true);
      const res = await fetch(`/api/clients/${clientId}/ledger/reports?type=general-ledger&from=${fromDate}&to=${toDate}&account_id=${glAccountId}`);
      if (res.ok) setGeneralLedgerResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  // Mutators
  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name || !accountForm.type) return alert("Name and Type are required.");
    
    try {
      const isEdit = !!accountForm.id;
      const url = `/api/clients/${clientId}/ledger/accounts`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { account_id: accountForm.id, ...accountForm } : accountForm)
      });
      if (res.ok) {
        alert(isEdit ? "Account updated successfully!" : "Account created successfully!");
        setActiveModal(null);
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save account");
      }
    } catch (e) {
      alert("Error saving account");
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account? It will be marked inactive.")) return;
    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/accounts?account_id=${accountId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Account deleted/inactive successfully!");
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete account");
      }
    } catch (e) {
      alert("Error deleting account");
    }
  };

  const handlePostJournal = async () => {
    if (!journalForm.date || !journalForm.description) return alert("Please fill out date and description");
    
    let totalDebit = 0;
    let totalCredit = 0;
    for (const e of journalForm.entries) {
      if (!e.account_id) return alert("Please select an account for all lines.");
      totalDebit += parseFloat(e.debit || '0');
      totalCredit += parseFloat(e.credit || '0');
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return alert(`Debits (${totalDebit.toFixed(2)}) must equal Credits (${totalCredit.toFixed(2)})`);
    }

    if (totalDebit === 0) return alert("Please enter debit and credit amounts.");

    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: journalForm.date,
          description: journalForm.description,
          entries: journalForm.entries.map(e => ({
            account_id: e.account_id,
            debit: parseFloat(e.debit || '0'),
            credit: parseFloat(e.credit || '0'),
            memo: e.memo || undefined
          }))
        })
      });
      if (res.ok) {
        alert("Journal entry posted successfully!");
        setJournalForm({
          date: new Date().toISOString().split('T')[0],
          description: '',
          entries: [
            { account_id: '', debit: '', credit: '', memo: '' },
            { account_id: '', debit: '', credit: '', memo: '' }
          ]
        });
        fetchLedgerData();
        fetchJournalHistory();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post journal entry");
      }
    } catch (e) {
      alert("Error posting entry");
    }
  };

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name) return alert("Customer name is required.");
    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'customer', data: customerForm })
      });
      if (res.ok) {
        alert("Customer created successfully!");
        setCustomerForm({ name: '', email: '', phone: '', billing_address: '' });
        setActiveModal(null);
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create customer");
      }
    } catch (e) {
      alert("Error creating customer");
    }
  };

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name) return alert("Vendor name is required.");
    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'vendor', data: vendorForm })
      });
      if (res.ok) {
        alert("Vendor created successfully!");
        setVendorForm({ name: '', email: '', phone: '', billing_address: '' });
        setActiveModal(null);
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create vendor");
      }
    } catch (e) {
      alert("Error creating vendor");
    }
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.customer_id || !invoiceForm.invoice_number) return alert("Customer and Invoice number are required.");
    if (invoiceForm.lines.some(l => !l.account_id || parseFloat(l.quantity || '0') <= 0 || parseFloat(l.unit_price || '0') < 0)) {
      return alert("Please review line items. All lines must have an account, quantity > 0 and price >= 0.");
    }

    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'invoice',
          data: {
            customer_id: invoiceForm.customer_id,
            invoice_number: invoiceForm.invoice_number,
            date: invoiceForm.date,
            due_date: invoiceForm.due_date,
            tax_rate: parseFloat(invoiceForm.tax_rate || '0'),
            lines: invoiceForm.lines.map(l => ({
              description: l.description,
              account_id: l.account_id,
              quantity: parseFloat(l.quantity),
              unit_price: parseFloat(l.unit_price)
            }))
          }
        })
      });
      if (res.ok) {
        alert("Invoice created successfully!");
        setInvoiceForm({
          customer_id: '',
          invoice_number: '',
          date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          tax_rate: '0',
          lines: [{ description: '', account_id: '', quantity: '1', unit_price: '0' }]
        });
        setActiveModal(null);
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create invoice");
      }
    } catch (e) {
      alert("Error creating invoice");
    }
  };

  const createBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.vendor_id || !billForm.bill_number) return alert("Vendor and Bill number are required.");
    if (billForm.lines.some(l => !l.account_id || parseFloat(l.quantity || '0') <= 0 || parseFloat(l.unit_price || '0') < 0)) {
      return alert("Please review line items. All lines must have an account, quantity > 0 and price >= 0.");
    }

    try {
      const res = await fetch(`/api/clients/${clientId}/ledger/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bill',
          data: {
            vendor_id: billForm.vendor_id,
            bill_number: billForm.bill_number,
            date: billForm.date,
            due_date: billForm.due_date,
            tax_rate: parseFloat(billForm.tax_rate || '0'),
            lines: billForm.lines.map(l => ({
              description: l.description,
              account_id: l.account_id,
              quantity: parseFloat(l.quantity),
              unit_price: parseFloat(l.unit_price)
            }))
          }
        })
      });
      if (res.ok) {
        alert("Bill created successfully!");
        setBillForm({
          vendor_id: '',
          bill_number: '',
          date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          tax_rate: '0',
          lines: [{ description: '', account_id: '', quantity: '1', unit_price: '0' }]
        });
        setActiveModal(null);
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create bill");
      }
    } catch (e) {
      alert("Error creating bill");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.amount) return alert("Please enter payment amount.");
    try {
      const isInvoice = paymentForm.type === 'invoice';
      const endpoint = isInvoice ? `/api/clients/${clientId}/ledger/sales` : `/api/clients/${clientId}/ledger/purchases`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isInvoice ? 'invoice_payment' : 'bill_payment',
          data: {
            invoice_id: isInvoice ? paymentForm.id : undefined,
            bill_id: !isInvoice ? paymentForm.id : undefined,
            payment_amount: parseFloat(paymentForm.amount),
            date: paymentForm.date
          }
        })
      });
      if (res.ok) {
        alert("Payment recorded successfully!");
        setActiveModal(null);
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record payment");
      }
    } catch (e) {
      alert("Error recording payment");
    }
  };

  const createBankTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankTxnForm.description || !bankTxnForm.amount || !bankTxnForm.account_id) {
      return alert("Description, Amount, and Category Account are required.");
    }
    
    try {
      const amountVal = parseFloat(bankTxnForm.amount);
      const isDeposit = bankTxnForm.type === 'deposit';
      const absoluteAmount = Math.abs(amountVal);
      const signedAmount = isDeposit ? absoluteAmount : -absoluteAmount;

      const bankAcc = accounts.find(a => a.subtype === 'bank');
      if (!bankAcc) {
        return alert("Checking/Bank Account not found in Chart of Accounts. Please create one with subtype 'bank' first.");
      }

      // Generate journal entries automatically
      const journalLines = [
        {
          account_id: bankAcc.id,
          debit: isDeposit ? absoluteAmount : 0,
          credit: !isDeposit ? absoluteAmount : 0,
          memo: bankTxnForm.description
        },
        {
          account_id: bankTxnForm.account_id,
          debit: !isDeposit ? absoluteAmount : 0,
          credit: isDeposit ? absoluteAmount : 0,
          memo: bankTxnForm.description
        }
      ];

      const res = await fetch(`/api/clients/${clientId}/ledger/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: bankTxnForm.date,
          description: bankTxnForm.description,
          amount: signedAmount,
          type: bankTxnForm.type,
          status: 'categorized',
          reference: 'MANUAL',
          entries: journalLines
        })
      });

      if (res.ok) {
        alert("Bank transaction recorded & categorized successfully!");
        setBankTxnForm({
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: '',
          type: 'deposit',
          account_id: ''
        });
        setActiveModal(null);
        fetchLedgerData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record transaction");
      }
    } catch (e) {
      alert("Error recording transaction");
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvFileContent(text);
      
      // Generate preview lines
      const lines = text.split('\n').map(l => l.split(',')).filter(l => l.length > 1 && l[0]);
      setCsvPreview(lines.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const importCsvTransactions = async () => {
    if (!csvFileContent) return alert("Please select a file first.");
    try {
      const rows = csvFileContent.split('\n').map(l => l.split(',')).filter(l => l.length > 1 && l[0]);
      // Skip header row
      const dataRows = rows.slice(1);
      
      let importedCount = 0;
      for (const row of dataRows) {
        const dateStr = row[csvMappedColumns.date]?.trim();
        const desc = row[csvMappedColumns.description]?.trim();
        const amtStr = row[csvMappedColumns.amount]?.trim().replace(/"/g, '');
        
        if (!dateStr || !desc || !amtStr) continue;
        const amount = parseFloat(amtStr);
        if (isNaN(amount)) continue;

        await fetch(`/api/clients/${clientId}/ledger/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date(dateStr).toISOString().split('T')[0],
            description: desc,
            amount: amount,
            type: amount >= 0 ? 'deposit' : 'withdrawal',
            status: 'pending',
            reference: 'CSV-IMPORT'
          })
        });
        importedCount++;
      }

      alert(`Successfully imported ${importedCount} transaction(s)!`);
      setCsvFileContent('');
      setCsvPreview([]);
      fetchLedgerData();
      setActiveTab('transaction_inbox');
    } catch (e) {
      alert("Error importing CSV file");
    }
  };

  // Start proper bank reconciliation session
  const startReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconForm.account_id || !reconForm.ending_balance) return alert("Select account and ending balance.");
    const bankAcc = accounts.find(a => a.id === reconForm.account_id);
    
    // Find all pending transactions for this account in the system
    const activeTxns = transactions.filter(t => t.status !== 'reconciled');
    setReconSession({
      account: bankAcc,
      ending_balance: parseFloat(reconForm.ending_balance),
      as_of: reconForm.as_of,
      transactions: activeTxns
    });
    setClearedTxns({});
  };

  const toggleClearTxn = (id: string) => {
    setClearedTxns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completeReconciliation = async () => {
    if (!reconSession) return;
    const clearedTotal = Object.keys(clearedTxns)
      .filter(id => clearedTxns[id])
      .reduce((s, id) => {
        const tx = reconSession.transactions.find((t: any) => t.id === id);
        return s + (tx ? parseFloat(tx.amount) : 0);
      }, 0);

    const difference = reconSession.ending_balance - clearedTotal;
    if (Math.abs(difference) > 0.01) {
      return alert(`Cannot reconcile. The difference is ${formatCurrency(difference)}. It must be CAD 0.00.`);
    }

    try {
      // Update status of all cleared transactions
      const clearedIds = Object.keys(clearedTxns).filter(id => clearedTxns[id]);
      for (const id of clearedIds) {
        await fetch(`/api/clients/${clientId}/ledger/transactions/reconcile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_id: id, status: 'reconciled' })
        });
      }
      alert("Reconciliation completed successfully! Statement balanced.");
      setReconSession(null);
      setReconForm({ account_id: '', ending_balance: '', as_of: new Date().toISOString().split('T')[0] });
      fetchLedgerData();
    } catch (e) {
      alert("Error completing reconciliation");
    }
  };

  if (loading) return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: '#64748B', fontWeight: 500 }}>Booting LedgerFlow Engine...</p>
    </div>
  );

  const stats = data?.stats || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, cashInBank: 0 };

  const SidebarItem = ({ id, label }: { id: string, label: string }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{
        padding: '8px 12px 8px 36px',
        fontSize: '13px',
        color: activeTab === id ? '#0D9488' : '#475569',
        background: activeTab === id ? '#F0FDFA' : 'transparent',
        borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
        fontWeight: activeTab === id ? 600 : 500,
        transition: 'all 0.15s ease'
      }}
    >
      {label}
    </div>
  );

  const SidebarSection = ({ id, label, icon: Icon, children }: any) => (
    <div style={{ marginBottom: '12px' }}>
      <div 
        onClick={() => toggleSection(id)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', color: '#1E293B', fontWeight: 700, fontSize: '13px' }}
      >
        <Icon size={16} style={{ color: '#94A3B8' }} />
        <span style={{ flex: 1 }}>{label}</span>
        {expanded[id] ? <ChevronDown size={14} color="#94A3B8" /> : <ChevronRight size={14} color="#94A3B8" />}
      </div>
      {expanded[id] && <div style={{ paddingLeft: '4px' }}>{children}</div>}
    </div>
  );

  const TableHeader = ({ title, desc, actionLabel, icon: Icon, onAction }: any) => (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{title}</h3>
        <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>{desc}</p>
      </div>
      {actionLabel && (
        <button onClick={onAction} style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(13, 148, 136, 0.15)' }}>
          <Icon size={14} /> {actionLabel}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: '850px', marginTop: '16px', fontFamily: 'Inter, sans-serif', color: '#334155' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', flexShrink: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 12px', overflowY: 'auto', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
        <SidebarSection id="accounting" label="Accounting" icon={BookOpen}>
          <SidebarItem id="chart_of_accounts" label="Chart of Accounts" />
          <SidebarItem id="journal_entries" label="Journal Entries" />
          <SidebarItem id="general_ledger" label="General Ledger" />
        </SidebarSection>
        <SidebarSection id="sales" label="Sales (AR)" icon={DollarSign}>
          <SidebarItem id="customers" label="Customers" />
          <SidebarItem id="invoices" label="Invoices" />
        </SidebarSection>
        <SidebarSection id="purchases" label="Purchases (AP)" icon={ShoppingCart}>
          <SidebarItem id="vendors" label="Vendors" />
          <SidebarItem id="bills" label="Bills" />
        </SidebarSection>
        <SidebarSection id="banking" label="Banking" icon={Landmark}>
          <SidebarItem id="transaction_inbox" label="Transaction Inbox" />
          <SidebarItem id="csv_import" label="CSV Import" />
          <SidebarItem id="reconciliation" label="Reconciliation" />
        </SidebarSection>
        <SidebarSection id="reports" label="Reports" icon={PieChart}>
          <SidebarItem id="reports_hub" label="Reports Hub" />
          <SidebarItem id="profit_loss" label="Profit & Loss" />
          <SidebarItem id="trial_balance" label="Trial Balance" />
          <SidebarItem id="balance_sheet" label="Balance Sheet" />
        </SidebarSection>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, minWidth: 0 }}>
        
        {/* STATS HEADER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue (YTD)</span>
              <div style={{ background: '#ECFDF5', width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={14} style={{ color: '#10B981' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expenses (YTD)</span>
              <div style={{ background: '#FEF2F2', width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDownRight size={14} style={{ color: '#EF4444' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{formatCurrency(stats.totalExpenses)}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Profit</span>
              <div style={{ background: '#F0F9FF', width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={14} style={{ color: '#0EA5E9' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{formatCurrency(stats.netProfit)}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash on Hand</span>
              <div style={{ background: '#FFFBEB', width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Landmark size={14} style={{ color: '#F59E0B' }} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{formatCurrency(stats.cashInBank)}</div>
          </div>
        </div>

        {/* 1. CHART OF ACCOUNTS */}
        {activeTab === 'chart_of_accounts' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader 
              title="Chart of Accounts" 
              desc="Manage your client's accounts structure and opening balances." 
              actionLabel="Add Account" 
              icon={Plus} 
              onAction={() => {
                setAccountForm({ id: '', name: '', type: 'asset', subtype: '', account_code: '', description: '' });
                setActiveModal('add_account');
              }}
            />
            <div style={{ padding: '0 12px 12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Code</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Subtype</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Balance</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {['asset', 'liability', 'equity', 'revenue', 'expense'].map(groupType => {
                    const groupAccounts = accounts.filter(a => a.type === groupType);
                    if (groupAccounts.length === 0) return null;
                    return (
                      <React.Fragment key={groupType}>
                        <tr style={{ background: '#F8FAFC' }}>
                          <td colSpan={6} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 800, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{getGroupHeader(groupType)}</td>
                        </tr>
                        {groupAccounts.map(acc => (
                          <tr key={acc.id} style={{ borderBottom: '1px solid #F1F5F9', hover: { background: '#F8FAFC' } } as any}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{acc.account_code || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{acc.name}</td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>{acc.type}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B', textTransform: 'capitalize' }}>{acc.subtype?.replace('_', ' ') || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{formatCurrency(acc.balance)}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              {!acc.is_system && (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => {
                                    setAccountForm({ id: acc.id, name: acc.name, type: acc.type, subtype: acc.subtype || '', account_code: acc.account_code || '', description: acc.description || '' });
                                    setActiveModal('add_account');
                                  }} style={{ border: 'none', background: 'none', color: '#0D9488', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={14} /></button>
                                  <button onClick={() => deleteAccount(acc.id)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={14} /></button>
                                </div>
                              )}
                              {acc.is_system && <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>System Locked</span>}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. JOURNAL ENTRIES */}
        {activeTab === 'journal_entries' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Create Journal Entry */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <TableHeader title="New Journal Entry" desc="Log adjusting journal entries with balanced debit and credit values." actionLabel="Post Journal Entry" icon={Check} onAction={handlePostJournal} />
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6, color: '#475569' }}>Transaction Date</label>
                    <input type="date" value={journalForm.date} onChange={e => setJournalForm({...journalForm, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6, color: '#475569' }}>Description / Memo</label>
                    <input type="text" value={journalForm.description} onChange={e => setJournalForm({...journalForm, description: e.target.value})} placeholder="e.g. Adjusting depreciation" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                  </div>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                      <th style={{ textAlign: 'left', padding: '10px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Account</th>
                      <th style={{ textAlign: 'left', padding: '10px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Memo</th>
                      <th style={{ textAlign: 'right', padding: '10px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', width: '130px' }}>Debit</th>
                      <th style={{ textAlign: 'right', padding: '10px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', width: '130px' }}>Credit</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {journalForm.entries.map((entry, index) => (
                      <tr key={index}>
                        <td style={{ padding: '8px 4px' }}>
                          <select value={entry.account_id} onChange={e => {
                            const newEntries = [...journalForm.entries];
                            newEntries[index].account_id = e.target.value;
                            setJournalForm({...journalForm, entries: newEntries});
                          }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white' }}>
                            <option value="">Select Account...</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.account_code ? `[${a.account_code}] ` : ''}{a.name} ({a.type})</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '8px 4px' }}>
                          <input type="text" value={entry.memo} onChange={e => {
                            const newEntries = [...journalForm.entries];
                            newEntries[index].memo = e.target.value;
                            setJournalForm({...journalForm, entries: newEntries});
                          }} placeholder="Line description" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                        </td>
                        <td style={{ padding: '8px 4px' }}>
                          <input type="number" value={entry.debit} onChange={e => {
                            const newEntries = [...journalForm.entries];
                            newEntries[index].debit = e.target.value;
                            if (e.target.value) newEntries[index].credit = '';
                            setJournalForm({...journalForm, entries: newEntries});
                          }} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', textAlign: 'right' }} />
                        </td>
                        <td style={{ padding: '8px 4px' }}>
                          <input type="number" value={entry.credit} onChange={e => {
                            const newEntries = [...journalForm.entries];
                            newEntries[index].credit = e.target.value;
                            if (e.target.value) newEntries[index].debit = '';
                            setJournalForm({...journalForm, entries: newEntries});
                          }} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', textAlign: 'right' }} />
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          {journalForm.entries.length > 2 && (
                            <button onClick={() => {
                              const newEntries = journalForm.entries.filter((_, idx) => idx !== index);
                              setJournalForm({...journalForm, entries: newEntries});
                            }} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}><X size={16} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button 
                  onClick={() => setJournalForm({...journalForm, entries: [...journalForm.entries, { account_id: '', debit: '', credit: '', memo: '' }]})}
                  style={{ color: '#0D9488', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <PlusCircle size={16} /> Add Line
                </button>
              </div>
            </div>

            {/* Journal History */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: 'white' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Journal Entry History</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>View and review historically posted manual double-entry transactions.</p>
              </div>
              <div style={{ padding: '12px' }}>
                {journalHistory.map((txn) => {
                  const isExpanded = !!expandedJournals[txn.id];
                  return (
                    <div key={txn.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                      <div 
                        onClick={() => setExpandedJournals(prev => ({ ...prev, [txn.id]: !prev[txn.id] }))}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', cursor: 'pointer', alignItems: 'center' }}
                      >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>{formatDateString(txn.date)}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{txn.description}</span>
                          <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize', color: '#475569' }}>{txn.type.replace('_', ' ')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{formatCurrency(txn.amount)}</span>
                          {isExpanded ? <ChevronDown size={16} color="#64748B" /> : <ChevronRight size={16} color="#64748B" />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div style={{ padding: '12px 16px', background: 'white' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Account</th>
                                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Memo</th>
                                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', width: '120px' }}>Debit</th>
                                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', width: '120px' }}>Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {txn.entries?.map((entry: any) => (
                                <tr key={entry.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                  <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                    {entry.account_code ? `[${entry.account_code}] ` : ''}{entry.account_name}
                                  </td>
                                  <td style={{ padding: '10px 0', fontSize: '13px', color: '#64748B' }}>{entry.memo || '—'}</td>
                                  <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</td>
                                  <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
                {journalHistory.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '13px' }}>No journal entries posted yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. GENERAL LEDGER */}
        {activeTab === 'general_ledger' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader title="General Ledger" desc="Full double-entry transaction journals categorized by account." />
            
            {/* Filters */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>FROM</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>TO</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>ACCOUNT FILTER</label>
                <select value={glAccountId} onChange={e => setGlAccountId(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white' }}>
                  <option value="all">All Accounts</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.account_code ? `[${a.account_code}] ` : ''}{a.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {loadingReport ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading General Ledger...</p>
              ) : (
                generalLedgerResult?.accounts?.map((acc: any) => {
                  if (acc.entries.length === 0 && acc.opening_balance === 0) return null;
                  return (
                    <div key={acc.account_id} style={{ marginBottom: '32px', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                          {acc.account_code ? `${acc.account_code} — ` : ''}{acc.account_name}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                          Normal Balance: {acc.account_type === 'asset' || acc.account_type === 'expense' ? 'Debit' : 'Credit'}
                        </span>
                      </div>
                      
                      <div style={{ padding: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                              <th style={{ textAlign: 'left', padding: '8px', fontSize: '11px', color: '#64748B' }}>Date</th>
                              <th style={{ textAlign: 'left', padding: '8px', fontSize: '11px', color: '#64748B' }}>Description / Transaction</th>
                              <th style={{ textAlign: 'left', padding: '8px', fontSize: '11px', color: '#64748B' }}>Memo</th>
                              <th style={{ textAlign: 'right', padding: '8px', fontSize: '11px', color: '#64748B', width: '120px' }}>Debit</th>
                              <th style={{ textAlign: 'right', padding: '8px', fontSize: '11px', color: '#64748B', width: '120px' }}>Credit</th>
                              <th style={{ textAlign: 'right', padding: '8px', fontSize: '11px', color: '#64748B', width: '130px' }}>Running Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Opening Balance */}
                            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748B' }}>{formatDateString(fromDate)}</td>
                              <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: 600, color: '#475569' }} colSpan={2}>Opening Balance</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right' }}>—</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right' }}>—</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>{formatCurrency(acc.opening_balance)}</td>
                            </tr>
                            
                            {/* Entries */}
                            {acc.entries.map((e: any, idx: number) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748B' }}>{formatDateString(e.date)}</td>
                                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#1E293B', fontWeight: 500 }}>
                                  {e.description} <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'capitalize' }}>({e.txn_type.replace('_', ' ')})</span>
                                </td>
                                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748B' }}>{e.memo || '—'}</td>
                                <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '13px', color: e.debit > 0 ? '#0F172A' : '#94A3B8' }}>{e.debit > 0 ? formatCurrency(e.debit) : '—'}</td>
                                <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '13px', color: e.credit > 0 ? '#0F172A' : '#94A3B8' }}>{e.credit > 0 ? formatCurrency(e.credit) : '—'}</td>
                                <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{formatCurrency(e.balance)}</td>
                              </tr>
                            ))}

                            {/* Closing Balance */}
                            <tr style={{ borderTop: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                              <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748B' }}>{formatDateString(toDate)}</td>
                              <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: 700, color: '#1E293B' }} colSpan={2}>Closing Balance</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right' }}>—</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right' }}>—</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 800, fontSize: '13.5px', color: '#0D9488' }}>{formatCurrency(acc.closing_balance)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
              {generalLedgerResult?.accounts?.every((a: any) => a.entries.length === 0 && a.opening_balance === 0) && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No ledger data found for selected criteria.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. CUSTOMERS */}
        {activeTab === 'customers' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader 
              title="Customers (Accounts Receivable)" 
              desc="Manage outstanding balance ledger customers." 
              actionLabel="New Customer" 
              icon={Users} 
              onAction={() => {
                setCustomerForm({ name: '', email: '', phone: '', billing_address: '' });
                setActiveModal('add_customer');
              }} 
            />
            <div style={{ padding: '0 12px 12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Customer Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Phone</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.customers.map((c: any) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{c.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{c.email || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{c.phone || '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                  {salesData.customers.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No customers found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. INVOICES */}
        {activeTab === 'invoices' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader 
              title="Invoices (Sales Journal)" 
              desc="Draft, view, and record payments on customer ledger invoices." 
              actionLabel="Create Invoice" 
              icon={Receipt} 
              onAction={() => {
                setInvoiceForm({
                  customer_id: '',
                  invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
                  date: new Date().toISOString().split('T')[0],
                  due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                  tax_rate: '0',
                  lines: [{ description: '', account_id: '', quantity: '1', unit_price: '0' }]
                });
                setActiveModal('add_invoice');
              }} 
            />
            <div style={{ padding: '0 12px 12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Invoice #</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Paid</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.invoices.map((inv: any) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#0D9488' }}>{inv.invoice_number}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{inv.customer_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{formatDateString(inv.issue_date)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{formatCurrency(inv.total_amount)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>{formatCurrency(inv.amount_paid)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase',
                          background: inv.status === 'paid' ? '#ECFDF5' : inv.status === 'partially_paid' ? '#EFF6FF' : '#FEF2F2',
                          color: inv.status === 'paid' ? '#059669' : inv.status === 'partially_paid' ? '#2563EB' : '#DC2626'
                        }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {inv.status !== 'paid' && (
                          <button 
                            onClick={() => {
                              const remaining = parseFloat(inv.total_amount) - parseFloat(inv.amount_paid || '0');
                              setPaymentForm({ id: inv.id, amount: remaining.toString(), date: new Date().toISOString().split('T')[0], type: 'invoice' });
                              setActiveModal('record_payment');
                            }}
                            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            Record Payment
                          </button>
                        )}
                        {inv.status === 'paid' && <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Settled</span>}
                      </td>
                    </tr>
                  ))}
                  {salesData.invoices.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No invoices found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. VENDORS */}
        {activeTab === 'vendors' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader 
              title="Vendors (Accounts Payable)" 
              desc="Manage vendors for bill payment tracking." 
              actionLabel="New Vendor" 
              icon={Users} 
              onAction={() => {
                setVendorForm({ name: '', email: '', phone: '', billing_address: '' });
                setActiveModal('add_vendor');
              }} 
            />
            <div style={{ padding: '0 12px 12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Vendor Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Phone</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesData.vendors.map((v: any) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{v.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{v.email || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{v.phone || '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                  {purchasesData.vendors.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No vendors found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. BILLS */}
        {activeTab === 'bills' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader 
              title="Bills (Purchase Ledger)" 
              desc="Enter bills from vendors and record cash payments." 
              actionLabel="Create Bill" 
              icon={Receipt} 
              onAction={() => {
                setBillForm({
                  vendor_id: '',
                  bill_number: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
                  date: new Date().toISOString().split('T')[0],
                  due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                  tax_rate: '0',
                  lines: [{ description: '', account_id: '', quantity: '1', unit_price: '0' }]
                });
                setActiveModal('add_bill');
              }} 
            />
            <div style={{ padding: '0 12px 12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Bill #</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Vendor</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Paid</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesData.bills.map((bill: any) => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#E11D48' }}>{bill.bill_number}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{bill.vendor_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{formatDateString(bill.issue_date)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{formatCurrency(bill.total_amount)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>{formatCurrency(bill.amount_paid)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase',
                          background: bill.status === 'paid' ? '#ECFDF5' : bill.status === 'partially_paid' ? '#EFF6FF' : '#FEF2F2',
                          color: bill.status === 'paid' ? '#059669' : bill.status === 'partially_paid' ? '#2563EB' : '#DC2626'
                        }}>
                          {bill.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {bill.status !== 'paid' && (
                          <button 
                            onClick={() => {
                              const remaining = parseFloat(bill.total_amount) - parseFloat(bill.amount_paid || '0');
                              setPaymentForm({ id: bill.id, amount: remaining.toString(), date: new Date().toISOString().split('T')[0], type: 'bill' });
                              setActiveModal('record_payment');
                            }}
                            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            Record Payment
                          </button>
                        )}
                        {bill.status === 'paid' && <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Settled</span>}
                      </td>
                    </tr>
                  ))}
                  {purchasesData.bills.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No bills found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. TRANSACTION INBOX */}
        {activeTab === 'transaction_inbox' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader 
              title="Transaction Inbox" 
              desc="Review, categorize, and reconcile imported bank transactions." 
              actionLabel="Add Bank Transaction" 
              icon={Landmark} 
              onAction={() => {
                setBankTxnForm({
                  date: new Date().toISOString().split('T')[0],
                  description: '',
                  amount: '',
                  type: 'deposit',
                  account_id: ''
                });
                setActiveModal('add_bank_txn');
              }} 
            />
            <div style={{ padding: '0 12px 12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn: any) => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid #F1F5F9', background: txn.status === 'reconciled' ? '#F0FDF4' : 'white' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>{formatDateString(txn.date)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{txn.description}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, textAlign: 'right', color: txn.amount >= 0 ? '#10B981' : '#0F172A' }}>{formatCurrency(txn.amount)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', padding: '4px 8px', borderRadius: '12px',
                          background: txn.status === 'reconciled' ? '#059669' : txn.status === 'pending' ? '#F59E0B' : '#0EA5E9',
                          color: 'white'
                        }}>
                          {txn.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {txn.status !== 'reconciled' && (
                          <button 
                            onClick={async () => {
                              await fetch(`/api/clients/${clientId}/ledger/transactions/reconcile`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ transaction_id: txn.id, status: 'reconciled' })
                              });
                              fetchLedgerData();
                            }}
                            style={{ background: 'transparent', border: '1px solid #10B981', color: '#10B981', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            Quick Reconcile
                          </button>
                        )}
                        {txn.status === 'reconciled' && <CheckCircle2 size={16} style={{ color: '#10B981', display: 'inline-block' }} />}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No bank transactions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. CSV IMPORT */}
        {activeTab === 'csv_import' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader title="CSV Bank Statement Import" desc="Upload bank CSV statements to populate the Transaction Inbox." />
            <div style={{ padding: '24px' }}>
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', marginBottom: '24px' }}>
                <UploadCloud size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: 4 }}>Select Bank Statement CSV File</p>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: 16 }}>Expected columns: Date | Description | Amount</p>
                <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ margin: '0 auto', display: 'block' }} />
              </div>

              {csvPreview.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>File Preview & Column Mapping</h4>
                  
                  {/* Mapping options */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>DATE COLUMN INDEX</label>
                      <input type="number" min={0} value={csvMappedColumns.date} onChange={e => setCsvMappedColumns({...csvMappedColumns, date: parseInt(e.target.value) || 0})} style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>DESCRIPTION INDEX</label>
                      <input type="number" min={0} value={csvMappedColumns.description} onChange={e => setCsvMappedColumns({...csvMappedColumns, description: parseInt(e.target.value) || 0})} style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>AMOUNT INDEX</label>
                      <input type="number" min={0} value={csvMappedColumns.amount} onChange={e => setCsvMappedColumns({...csvMappedColumns, amount: parseInt(e.target.value) || 0})} style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1' }} />
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #E2E8F0' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9' }}>
                        {csvPreview[0]?.map((_: any, idx: number) => (
                          <th key={idx} style={{ padding: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                            Col {idx} {csvMappedColumns.date === idx ? '(Date)' : csvMappedColumns.description === idx ? '(Desc)' : csvMappedColumns.amount === idx ? '(Amt)' : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row: any[], idx: number) => (
                        <tr key={idx}>
                          {row.map((col: any, cIdx: number) => (
                            <td key={cIdx} style={{ padding: '8px', border: '1px solid #E2E8F0' }}>{col}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <button onClick={importCsvTransactions} style={{ marginTop: '20px', background: '#0D9488', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Import CSV Statement
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 10. RECONCILIATION */}
        {activeTab === 'reconciliation' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader title="Bank Reconciliation" desc="Reconcile bank accounts against monthly physical bank statements." />
            
            <div style={{ padding: '24px' }}>
              {!reconSession ? (
                <form onSubmit={startReconciliation} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Bank / Cash Account</label>
                    <select value={reconForm.account_id} onChange={e => setReconForm({...reconForm, account_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                      <option value="">Select account...</option>
                      {accounts.filter(a => a.subtype === 'bank').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Statement Ending Balance</label>
                    <input type="number" step="0.01" value={reconForm.ending_balance} onChange={e => setReconForm({...reconForm, ending_balance: e.target.value})} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Statement Cutoff Date</label>
                    <input type="date" value={reconForm.as_of} onChange={e => setReconForm({...reconForm, as_of: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                    Start Reconciliation
                  </button>
                </form>
              ) : (
                <div>
                  {/* Session info bar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '24px', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700 }}>RECONCILING ACCOUNT</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{reconSession.account?.name}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700 }}>STATEMENT BALANCE</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{formatCurrency(reconSession.ending_balance)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700 }}>CLEARED IN BOOK</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                        {formatCurrency(
                          Object.keys(clearedTxns)
                            .filter(id => clearedTxns[id])
                            .reduce((s, id) => {
                              const tx = reconSession.transactions.find((t: any) => t.id === id);
                              return s + (tx ? parseFloat(tx.amount) : 0);
                            }, 0)
                        )}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 700 }}>DIFFERENCE</span>
                      <span style={{ 
                        fontSize: '14px', fontWeight: 800, 
                        color: Math.abs(reconSession.ending_balance - Object.keys(clearedTxns).filter(id => clearedTxns[id]).reduce((s, id) => s + (reconSession.transactions.find((t: any) => t.id === id)?.amount || 0), 0)) < 0.01 ? '#059669' : '#DC2626'
                      }}>
                        {formatCurrency(
                          reconSession.ending_balance - Object.keys(clearedTxns)
                            .filter(id => clearedTxns[id])
                            .reduce((s, id) => {
                              const tx = reconSession.transactions.find((t: any) => t.id === id);
                              return s + (tx ? parseFloat(tx.amount) : 0);
                            }, 0)
                        )}
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Mark Cleared Transactions</h4>
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>Select the ledger transactions matching your physical bank statement to clear them.</p>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                        <th style={{ width: '40px', padding: '12px' }}></th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#64748B' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#64748B' }}>Description</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', color: '#64748B' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconSession.transactions.map((txn: any) => (
                        <tr key={txn.id} style={{ borderBottom: '1px solid #F1F5F9', background: clearedTxns[txn.id] ? '#F0FDF4' : 'white' }}>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <input type="checkbox" checked={!!clearedTxns[txn.id]} onChange={() => toggleClearTxn(txn.id)} />
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px', color: '#64748B' }}>{formatDateString(txn.date)}</td>
                          <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{txn.description}</td>
                          <td style={{ padding: '12px', fontSize: '13px', fontWeight: 700, textAlign: 'right', color: txn.amount >= 0 ? '#10B981' : '#0F172A' }}>{formatCurrency(txn.amount)}</td>
                        </tr>
                      ))}
                      {reconSession.transactions.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No pending transactions found for this account.</td></tr>}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={completeReconciliation} style={{ background: '#0D9488', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Complete Reconciliation
                    </button>
                    <button onClick={() => setReconSession(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Cancel Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 11. REPORTS HUB */}
        {activeTab === 'reports_hub' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Client Financial Reports</h3>
            <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '13px' }}>Generate and audit compliant balance sheets, trial balances, and net profit margins.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div 
                onClick={() => setActiveTab('profit_loss')}
                style={{ padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: '#F8FAFC' }}
              >
                <div style={{ background: '#ECFDF5', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><PieChart size={20} style={{ color: '#059669' }} /></div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>Profit & Loss</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>Track performance, sales revenue streams, and expenditures over a custom date range.</p>
              </div>
              <div 
                onClick={() => setActiveTab('trial_balance')}
                style={{ padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: '#F8FAFC' }}
              >
                <div style={{ background: '#EFF6FF', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><SplitSquareHorizontal size={20} style={{ color: '#2563EB' }} /></div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>Trial Balance</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>Verify the mathematical accuracy of the general ledger by checking debit=credit equality.</p>
              </div>
              <div 
                onClick={() => setActiveTab('balance_sheet')}
                style={{ padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: '#F8FAFC' }}
              >
                <div style={{ background: '#FFFBEB', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Landmark size={20} style={{ color: '#D97706' }} /></div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>Balance Sheet</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>Audit capital holdings: Assets, Liabilities, and Equity as of a specific cutoff date.</p>
              </div>
            </div>
          </div>
        )}

        {/* 12. PROFIT & LOSS */}
        {activeTab === 'profit_loss' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader title="Profit & Loss" desc="Revenue, expense, and net income performance statement." />
            
            {/* Range Pickers */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>FROM</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>TO</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
              </div>
            </div>

            <div style={{ padding: '32px 48px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Profit and Loss</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>For the period from {formatDateString(fromDate)} to {formatDateString(toDate)}</p>
              </div>

              {loadingReport ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Generating Report...</p>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  {/* Revenue */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#1E293B', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Revenue</span>
                      <span>Amount</span>
                    </h3>
                    {plResult?.revenue?.map((r: any) => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px' }}>
                        <span>{r.code ? `[${r.code}] ` : ''}{r.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(r.amount)}</span>
                      </div>
                    ))}
                    {plResult?.revenue?.length === 0 && <p style={{ padding: '8px 12px', margin: 0, fontSize: '13px', color: '#94A3B8' }}>No revenue recorded.</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', padding: '8px 12px', fontWeight: 700, fontSize: '13.5px', background: '#F8FAFC' }}>
                      <span>Total Revenue</span>
                      <span>{formatCurrency(plResult?.total_revenue || 0)}</span>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#1E293B', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Expenses</span>
                      <span>Amount</span>
                    </h3>
                    {plResult?.expenses?.map((e: any) => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px' }}>
                        <span>{e.code ? `[${e.code}] ` : ''}{e.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                    {plResult?.expenses?.length === 0 && <p style={{ padding: '8px 12px', margin: 0, fontSize: '13px', color: '#94A3B8' }}>No expenses recorded.</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', padding: '8px 12px', fontWeight: 700, fontSize: '13.5px', background: '#F8FAFC' }}>
                      <span>Total Expenses</span>
                      <span>{formatCurrency(plResult?.total_expenses || 0)}</span>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div style={{ borderTop: '2px double #0D9488', borderBottom: '2px double #0D9488', padding: '12px 12px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', background: '#F0FDFA', color: '#0F766E' }}>
                    <span>NET INCOME</span>
                    <span>{formatCurrency(plResult?.net_income || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 13. TRIAL BALANCE */}
        {activeTab === 'trial_balance' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader title="Trial Balance" desc="Mathematical ledger audit checks. Ensure total debits equal total credits." />
            
            {/* Cutoff Date */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>AS OF DATE</label>
                <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
              </div>
            </div>

            <div style={{ padding: '32px 48px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Trial Balance</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>As of {formatDateString(asOfDate)}</p>
                
                {/* Balance validation alert */}
                {trialBalanceResult && (
                  <div style={{ 
                    display: 'inline-flex', marginTop: '16px', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                    background: trialBalanceResult.is_balanced ? '#ECFDF5' : '#FEF2F2',
                    color: trialBalanceResult.is_balanced ? '#059669' : '#DC2626'
                  }}>
                    {trialBalanceResult.is_balanced ? '✅ Ledger is Balanced' : '❌ Warning: General Ledger is Out of Balance'}
                  </div>
                )}
              </div>

              {loadingReport ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Generating Report...</p>
              ) : (
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', color: '#64748B' }}>Account Code</th>
                        <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', color: '#64748B' }}>Account Name</th>
                        <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', color: '#64748B', width: '150px' }}>Debit Balance</th>
                        <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', color: '#64748B', width: '150px' }}>Credit Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialBalanceResult?.accounts?.map((acc: any) => (
                        <tr key={acc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 10px', fontSize: '13px', color: '#64748B' }}>{acc.account_code || '—'}</td>
                          <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{acc.name}</td>
                          <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>{acc.debit > 0 ? formatCurrency(acc.debit) : '—'}</td>
                          <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>{acc.credit > 0 ? formatCurrency(acc.credit) : '—'}</td>
                        </tr>
                      ))}
                      
                      {/* Totals */}
                      <tr style={{ borderTop: '2px solid #CBD5E1', borderBottom: '2px double #CBD5E1', background: '#F8FAFC', fontWeight: 800 }}>
                        <td colSpan={2} style={{ padding: '14px 10px', fontSize: '14px', color: '#0F172A' }}>TOTALS</td>
                        <td style={{ padding: '14px 10px', fontSize: '14px', color: '#0F172A', textAlign: 'right' }}>{formatCurrency(trialBalanceResult?.total_debit || 0)}</td>
                        <td style={{ padding: '14px 10px', fontSize: '14px', color: '#0F172A', textAlign: 'right' }}>{formatCurrency(trialBalanceResult?.total_credit || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 14. BALANCE SHEET */}
        {activeTab === 'balance_sheet' && (
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <TableHeader title="Balance Sheet" desc="Audit client capital holdings. Verifies Assets = Liabilities + Owner Equity." />
            
            {/* Cutoff Date */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>AS OF DATE</label>
                <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
              </div>
            </div>

            <div style={{ padding: '32px 48px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Balance Sheet</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>As of {formatDateString(asOfDate)}</p>
              </div>

              {loadingReport ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Generating Report...</p>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  
                  {/* Assets */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#1E293B', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Assets</span>
                      <span>Amount</span>
                    </h3>
                    {balanceSheetResult?.assets?.map((a: any) => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px' }}>
                        <span>{a.code ? `[${a.code}] ` : ''}{a.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(a.amount)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', padding: '8px 12px', fontWeight: 700, fontSize: '13.5px', background: '#F8FAFC' }}>
                      <span>Total Assets</span>
                      <span>{formatCurrency(balanceSheetResult?.total_assets || 0)}</span>
                    </div>
                  </div>

                  {/* Liabilities */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#1E293B', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Liabilities</span>
                      <span>Amount</span>
                    </h3>
                    {balanceSheetResult?.liabilities?.map((l: any) => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px' }}>
                        <span>{l.code ? `[${l.code}] ` : ''}{l.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(l.amount)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', padding: '8px 12px', fontWeight: 700, fontSize: '13.5px', background: '#F8FAFC' }}>
                      <span>Total Liabilities</span>
                      <span>{formatCurrency(balanceSheetResult?.total_liabilities || 0)}</span>
                    </div>
                  </div>

                  {/* Equity */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#1E293B', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Owner Equity</span>
                      <span>Amount</span>
                    </h3>
                    {balanceSheetResult?.equity?.map((e: any) => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px' }}>
                        <span>{e.code ? `[${e.code}] ` : ''}{e.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', padding: '8px 12px', fontWeight: 700, fontSize: '13.5px', background: '#F8FAFC' }}>
                      <span>Total Equity</span>
                      <span>{formatCurrency(balanceSheetResult?.total_equity || 0)}</span>
                    </div>
                  </div>

                  {/* Liabilities + Equity Sum */}
                  <div style={{ borderTop: '2px double #475569', borderBottom: '2px double #475569', padding: '12px 12px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', background: '#F8FAFC', color: '#1E293B' }}>
                    <span>TOTAL LIABILITIES & EQUITY</span>
                    <span>{formatCurrency(balanceSheetResult?.total_liabilities_equity || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================== MODALS ========================================== */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          
          {/* Add/Edit Account Modal */}
          {activeModal === 'add_account' && (
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>{accountForm.id ? 'Edit Account' : 'Add New Account'}</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
              </div>
              <form onSubmit={saveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Account Code (Optional)</label>
                  <input type="text" value={accountForm.account_code} onChange={e => setAccountForm({...accountForm, account_code: e.target.value})} placeholder="e.g. 1010" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Account Name</label>
                  <input type="text" value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} placeholder="e.g. Petty Cash" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Classification Type</label>
                    <select value={accountForm.type} onChange={e => setAccountForm({...accountForm, type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Subtype Classification</label>
                    <input type="text" value={accountForm.subtype} onChange={e => setAccountForm({...accountForm, subtype: e.target.value})} placeholder="e.g. bank, current, sales" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea value={accountForm.description} onChange={e => setAccountForm({...accountForm, description: e.target.value})} placeholder="Account details" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', minHeight: '60px' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Account</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Customer Modal */}
          {activeModal === 'add_customer' && (
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Add New Customer</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
              </div>
              <form onSubmit={createCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name / Company Name</label>
                  <input type="text" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} placeholder="e.g. John Doe Consulting" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} placeholder="customer@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone Number</label>
                  <input type="text" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Billing Address</label>
                  <textarea value={customerForm.billing_address} onChange={e => setCustomerForm({...customerForm, billing_address: e.target.value})} placeholder="Billing details" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', minHeight: '60px' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Customer</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Vendor Modal */}
          {activeModal === 'add_vendor' && (
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Add New Vendor</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
              </div>
              <form onSubmit={createVendor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Vendor / Company Name</label>
                  <input type="text" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} placeholder="e.g. Acme Supplier Ltd." required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={vendorForm.email} onChange={e => setVendorForm({...vendorForm, email: e.target.value})} placeholder="vendor@supplier.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone Number</label>
                  <input type="text" value={vendorForm.phone} onChange={e => setVendorForm({...vendorForm, phone: e.target.value})} placeholder="+1 (555) 111-2222" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Billing Address</label>
                  <textarea value={vendorForm.billing_address} onChange={e => setVendorForm({...vendorForm, billing_address: e.target.value})} placeholder="Supplier address" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', minHeight: '60px' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Vendor</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Invoice Modal */}
          {activeModal === 'add_invoice' && (
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Create Customer Invoice</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
              </div>
              <form onSubmit={createInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Select Customer</label>
                    <select value={invoiceForm.customer_id} onChange={e => setInvoiceForm({...invoiceForm, customer_id: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                      <option value="">Select a Customer...</option>
                      {salesData.customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Invoice Number</label>
                    <input type="text" value={invoiceForm.invoice_number} onChange={e => setInvoiceForm({...invoiceForm, invoice_number: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Issue Date</label>
                    <input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Due Date</label>
                    <input type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm({...invoiceForm, due_date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700 }}>Line Items</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ textAlign: 'left', fontSize: '11px', color: '#64748B', paddingBottom: '6px' }}>Description</th>
                        <th style={{ textAlign: 'left', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '150px' }}>Revenue Account</th>
                        <th style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '70px' }}>Qty</th>
                        <th style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '100px' }}>Unit Price</th>
                        <th style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '100px' }}>Total</th>
                        <th style={{ width: '30px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceForm.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '4px 0' }}>
                            <input type="text" value={line.description} onChange={e => {
                              const newLines = [...invoiceForm.lines];
                              newLines[idx].description = e.target.value;
                              setInvoiceForm({...invoiceForm, lines: newLines});
                            }} placeholder="Item description" style={{ width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                          </td>
                          <td style={{ padding: '4px 0' }}>
                            <select value={line.account_id} onChange={e => {
                              const newLines = [...invoiceForm.lines];
                              newLines[idx].account_id = e.target.value;
                              setInvoiceForm({...invoiceForm, lines: newLines});
                            }} style={{ width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white' }}>
                              <option value="">Select account...</option>
                              {accounts.filter(a => a.type === 'revenue').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '4px 0' }}>
                            <input type="number" min={1} value={line.quantity} onChange={e => {
                              const newLines = [...invoiceForm.lines];
                              newLines[idx].quantity = e.target.value;
                              setInvoiceForm({...invoiceForm, lines: newLines});
                            }} style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'right' }} />
                          </td>
                          <td style={{ padding: '4px 0' }}>
                            <input type="number" step="0.01" value={line.unit_price} onChange={e => {
                              const newLines = [...invoiceForm.lines];
                              newLines[idx].unit_price = e.target.value;
                              setInvoiceForm({...invoiceForm, lines: newLines});
                            }} style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'right' }} />
                          </td>
                          <td style={{ padding: '4px 0', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                            {formatCurrency(parseFloat(line.quantity || '0') * parseFloat(line.unit_price || '0'))}
                          </td>
                          <td style={{ padding: '4px 0', textAlign: 'center' }}>
                            {invoiceForm.lines.length > 1 && (
                              <button onClick={() => {
                                const newLines = invoiceForm.lines.filter((_, iIdx) => iIdx !== idx);
                                setInvoiceForm({...invoiceForm, lines: newLines});
                              }} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}><X size={16} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button 
                    type="button"
                    onClick={() => setInvoiceForm({...invoiceForm, lines: [...invoiceForm.lines, { description: '', account_id: '', quantity: '1', unit_price: '0' }]})}
                    style={{ color: '#0D9488', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <PlusCircle size={14} /> Add Line Item
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginRight: 8 }}>TAX RATE %</label>
                    <input type="number" value={invoiceForm.tax_rate} onChange={e => setInvoiceForm({...invoiceForm, tax_rate: e.target.value})} style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', textAlign: 'right' }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '13px', color: '#475569' }}>
                    <div>Subtotal: <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      {formatCurrency(invoiceForm.lines.reduce((s, l) => s + (parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0')), 0))}
                    </span></div>
                    <div>Tax: <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      {formatCurrency(invoiceForm.lines.reduce((s, l) => s + (parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0')), 0) * (parseFloat(invoiceForm.tax_rate || '0') / 100))}
                    </span></div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Total: <span>
                      {formatCurrency(
                        invoiceForm.lines.reduce((s, l) => s + (parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0')), 0) * (1 + parseFloat(invoiceForm.tax_rate || '0') / 100)
                      )}
                    </span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Invoice</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Bill Modal */}
          {activeModal === 'add_bill' && (
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Enter Vendor Bill</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
              </div>
              <form onSubmit={createBill} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Select Vendor</label>
                    <select value={billForm.vendor_id} onChange={e => setBillForm({...billForm, vendor_id: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                      <option value="">Select a Vendor...</option>
                      {purchasesData.vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Bill Number</label>
                    <input type="text" value={billForm.bill_number} onChange={e => setBillForm({...billForm, bill_number: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Issue Date</label>
                    <input type="date" value={billForm.date} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Due Date</label>
                    <input type="date" value={billForm.due_date} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700 }}>Line Items</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ textAlign: 'left', fontSize: '11px', color: '#64748B', paddingBottom: '6px' }}>Description</th>
                        <th style={{ textAlign: 'left', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '150px' }}>Expense Account</th>
                        <th style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '70px' }}>Qty</th>
                        <th style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '100px' }}>Unit Price</th>
                        <th style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', paddingBottom: '6px', width: '100px' }}>Total</th>
                        <th style={{ width: '30px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billForm.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '4px 0' }}>
                            <input type="text" value={line.description} onChange={e => {
                              const newLines = [...billForm.lines];
                              newLines[idx].description = e.target.value;
                              setBillForm({...billForm, lines: newLines});
                            }} placeholder="Item description" style={{ width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                          </td>
                          <td style={{ padding: '4px 0' }}>
                            <select value={line.account_id} onChange={e => {
                              const newLines = [...billForm.lines];
                              newLines[idx].account_id = e.target.value;
                              setBillForm({...billForm, lines: newLines});
                            }} style={{ width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white' }}>
                              <option value="">Select account...</option>
                              {accounts.filter(a => a.type === 'expense').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '4px 0' }}>
                            <input type="number" min={1} value={line.quantity} onChange={e => {
                              const newLines = [...billForm.lines];
                              newLines[idx].quantity = e.target.value;
                              setBillForm({...billForm, lines: newLines});
                            }} style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'right' }} />
                          </td>
                          <td style={{ padding: '4px 0' }}>
                            <input type="number" step="0.01" value={line.unit_price} onChange={e => {
                              const newLines = [...billForm.lines];
                              newLines[idx].unit_price = e.target.value;
                              setBillForm({...billForm, lines: newLines});
                            }} style={{ width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'right' }} />
                          </td>
                          <td style={{ padding: '4px 0', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                            {formatCurrency(parseFloat(line.quantity || '0') * parseFloat(line.unit_price || '0'))}
                          </td>
                          <td style={{ padding: '4px 0', textAlign: 'center' }}>
                            {billForm.lines.length > 1 && (
                              <button onClick={() => {
                                const newLines = billForm.lines.filter((_, iIdx) => iIdx !== idx);
                                setBillForm({...billForm, lines: newLines});
                              }} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}><X size={16} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button 
                    type="button"
                    onClick={() => setBillForm({...billForm, lines: [...billForm.lines, { description: '', account_id: '', quantity: '1', unit_price: '0' }]})}
                    style={{ color: '#0D9488', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <PlusCircle size={14} /> Add Line Item
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginRight: 8 }}>TAX RATE %</label>
                    <input type="number" value={billForm.tax_rate} onChange={e => setBillForm({...billForm, tax_rate: e.target.value})} style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', textAlign: 'right' }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '13px', color: '#475569' }}>
                    <div>Subtotal: <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      {formatCurrency(billForm.lines.reduce((s, l) => s + (parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0')), 0))}
                    </span></div>
                    <div>Tax: <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      {formatCurrency(billForm.lines.reduce((s, l) => s + (parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0')), 0) * (parseFloat(billForm.tax_rate || '0') / 100))}
                    </span></div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Total: <span>
                      {formatCurrency(
                        billForm.lines.reduce((s, l) => s + (parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0')), 0) * (1 + parseFloat(billForm.tax_rate || '0') / 100)
                      )}
                    </span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Bill</button>
                </div>
              </form>
            </div>
          )}

          {/* Record Invoice/Bill Payment Modal */}
          {activeModal === 'record_payment' && (
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                  Record {paymentForm.type === 'invoice' ? 'Inward Payment' : 'Bill Payment'}
                </h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Payment Date</label>
                  <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Payment Amount</label>
                  <input type="number" step="0.01" min={0.01} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Record</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Bank Transaction Modal */}
          {activeModal === 'add_bank_txn' && (
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '460px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Add Bank Transaction</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
              </div>
              <form onSubmit={createBankTxn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Transaction Date</label>
                  <input type="date" value={bankTxnForm.date} onChange={e => setBankTxnForm({...bankTxnForm, date: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Description / Payee</label>
                  <input type="text" value={bankTxnForm.description} onChange={e => setBankTxnForm({...bankTxnForm, description: e.target.value})} placeholder="e.g. Shell Gas Station" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Transaction Type</label>
                    <select value={bankTxnForm.type} onChange={e => setBankTxnForm({...bankTxnForm, type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                      <option value="deposit">Deposit (Inward)</option>
                      <option value="withdrawal">Withdrawal (Outward)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Amount</label>
                    <input type="number" step="0.01" min={0.01} value={bankTxnForm.amount} onChange={e => setBankTxnForm({...bankTxnForm, amount: e.target.value})} placeholder="0.00" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Category Account</label>
                  <select value={bankTxnForm.account_id} onChange={e => setBankTxnForm({...bankTxnForm, account_id: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                    <option value="">Select Category/Account...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Add Transaction</button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
