"use client";

import { useState } from 'react';
import { Clock, Plus, DollarSign, Filter, Search } from 'lucide-react';

export default function TimeAndWipLedger() {
  const [showLogModal, setShowLogModal] = useState(false);
  const [entries, setEntries] = useState([
    { id: '1', date: '2026-03-27', user: 'Frank Wilson', client: 'Acme Corp', duration: 1.5, rate: 150, description: 'Bank reconciliation Q1', isBilled: false },
    { id: '2', date: '2026-03-26', user: 'Sarah Connor', client: 'The Shield', duration: 3.0, rate: 200, description: 'T2 Corporate Tax prep', isBilled: true },
    { id: '3', date: '2026-03-26', user: 'Luca Pacioli', client: 'Frank Smith', duration: 0.75, rate: 100, description: 'Client meeting regarding CRA letter', isBilled: false },
  ]);

  const [newEntry, setNewEntry] = useState({ client: '', duration: '', description: '' });

  const totalUnbilledWip = entries.filter(e => !e.isBilled).reduce((acc, curr) => acc + (curr.duration * curr.rate), 0);

  const handleLogTime = () => {
    if (newEntry.client && newEntry.duration) {
      setEntries([{ 
        id: Math.random().toString(), 
        date: new Date().toISOString().split('T')[0], 
        user: 'Current User', 
        client: newEntry.client, 
        duration: Number(newEntry.duration), 
        rate: 150, 
        description: newEntry.description, 
        isBilled: false 
      }, ...entries]);
      setShowLogModal(false);
      setNewEntry({ client: '', duration: '', description: '' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto block xl:flex gap-6">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Time & WIP Ledger</h1>
          <button onClick={() => setShowLogModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus size={18} /> Log Time
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700"><DollarSign size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Unbilled WIP</p>
              <h2 className="text-2xl font-bold">${totalUnbilledWip.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-700"><Clock size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unbilled Hours</p>
              <h2 className="text-2xl font-bold">{entries.filter(e => !e.isBilled).reduce((acc, curr) => acc + curr.duration, 0)} hrs</h2>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="bg-white p-4 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
          <div className="relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input type="text" placeholder="Search entries..." className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-b-xl border border-t-0 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Team Member</th>
                <th className="p-4 font-medium">Client / Job</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium text-right">Duration</th>
                <th className="p-4 font-medium text-right">WIP Value</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-600 whitespace-nowrap">{entry.date}</td>
                  <td className="p-4 font-medium text-gray-800">{entry.user}</td>
                  <td className="p-4 text-blue-600 font-medium">{entry.client}</td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">{entry.description}</td>
                  <td className="p-4 text-right font-medium">{entry.duration}h</td>
                  <td className="p-4 text-right tabular-nums">${(entry.duration * entry.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entry.isBilled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {entry.isBilled ? 'Billed' : 'Unbilled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden slide-in-from-bottom-8">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
               <h3 className="font-bold text-lg flex items-center gap-2"><Clock size={20}/> Log Time</h3>
               <button onClick={() => setShowLogModal(false)} className="text-white hover:text-blue-200 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select 
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  value={newEntry.client} onChange={e => setNewEntry({...newEntry, client: e.target.value})}
                >
                  <option value="">-- Select Client --</option>
                  <option value="Acme Corp">Acme Corp</option>
                  <option value="The Shield">The Shield</option>
                  <option value="Frank Smith">Frank Smith</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
                <input 
                  type="number" step="0.25" placeholder="e.g. 1.5"
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  value={newEntry.duration} onChange={e => setNewEntry({...newEntry, duration: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3} placeholder="What did you work on?"
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  value={newEntry.description} onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
               <button onClick={() => setShowLogModal(false)} className="px-4 py-2 text-gray-600 bg-white border rounded hover:bg-gray-50">Cancel</button>
               <button onClick={handleLogTime} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium tracking-wide">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
