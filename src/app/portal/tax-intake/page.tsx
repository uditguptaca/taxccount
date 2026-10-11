'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Scope from '@/components/t1/Scope';
import { FileText, Plus, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { PROVINCE_NAMES } from '@/lib/tax-intake-types';

export default function TaxIntakePortalLanding() { return <Scope><TaxIntakePortalLandingInner /></Scope>; }

function TaxIntakePortalLandingInner() {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tax-intake')
      .then(res => res.json())
      .then(data => {
        setEngagements(data.engagements || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[70vh] bg-slate-50 text-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Canadian T1 Personal Tax Intake Portal</h1>
              <p className="text-sm text-slate-600">Complete your annual tax questionnaire for CRA and Revenu Québec</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading your tax intake returns...</div>
        ) : engagements.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
            <Clock className="w-12 h-12 text-indigo-700 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Active Tax Intake Found</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your tax preparer will send you an invitation link when your intake return is ready.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Your Tax Returns</h2>
            <div className="grid grid-cols-1 gap-4">
              {engagements.map(e => (
                <div key={e.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-300">
                        T1 Tax Return — {e.tax_year}
                      </span>
                      {e.province === 'QC' && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                          Québec TP-1
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{e.client_name || 'Personal Tax Intake'}</h3>
                    <p className="text-xs text-slate-600">
                      {e.province ? `Province: ${PROVINCE_NAMES[e.province as keyof typeof PROVINCE_NAMES] || e.province} • ` : ''}Progress: {e.progress_pct || 0}% • Status: <span className="text-amber-700 font-semibold">{String(e.status).replace(/_/g, ' ')}</span>
                    </p>
                  </div>

                  <Link
                    href={`/portal/tax-intake/${e.id}`}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition self-start md:self-auto"
                  >
                    Open my tax form
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
