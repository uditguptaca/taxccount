"use client";

import { useState, useEffect } from 'react';
import { Users, LayoutList, DollarSign, Clock } from 'lucide-react';

export default function TeamCapacityDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // In a full implementation, this calls an API executing aggregation queries on client_compliances, users, and time_entries.
    // For this demonstration, we load mock structural data representing the required Taxccount output expectations.
    setData({
      totalRevenue: 125000,
      totalWip: 18450,
      teamMembers: [
        { id: 1, name: "Frank Wilson", role: "Manager", activeJobs: 12, overdue: 3, revenueClocked: 45000, utilization: 85 },
        { id: 2, name: "Sarah Connor", role: "Senior", activeJobs: 18, overdue: 1, revenueClocked: 52000, utilization: 92 },
        { id: 3, name: "Luca Pacioli", role: "Junior", activeJobs: 8, overdue: 0, revenueClocked: 28000, utilization: 70 },
      ]
    });
  }, []);

  if (!data) return <div className="p-8">Loading Analytics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Team Capacity & Profitability</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Billed Revenue (YTD)</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-green-100 p-2 rounded-lg text-green-700"><DollarSign size={20} /></div>
            <h2 className="text-3xl font-bold">${data.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Unbilled WIP Tracker</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><Clock size={20} /></div>
            <h2 className="text-3xl font-bold">${data.totalWip.toLocaleString()}</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Firm Active Jobs</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-700"><LayoutList size={20} /></div>
            <h2 className="text-3xl font-bold">38</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total Team Size</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-700"><Users size={20} /></div>
            <h2 className="text-3xl font-bold">14</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Assignee Workload & Revenue Attribution</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Team Member</th>
                <th className="p-4 font-medium">Active Jobs</th>
                <th className="p-4 font-medium">Overdue Stages</th>
                <th className="p-4 font-medium">Revenue Clocked</th>
                <th className="p-4 font-medium">Time Utilization</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {data.teamMembers.map((tm: any) => (
                <tr key={tm.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{tm.name}</div>
                    <div className="text-xs text-gray-500">{tm.role}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-700">{tm.activeJobs} Jobs</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tm.overdue > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {tm.overdue} Overdue
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800">${tm.revenueClocked.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${tm.utilization > 90 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${tm.utilization}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{tm.utilization}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-blue-600 cursor-pointer hover:underline text-xs font-medium">View Assigned List</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
