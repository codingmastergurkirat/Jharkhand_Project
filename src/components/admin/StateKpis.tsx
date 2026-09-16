'use client';

import React from 'react';
import { AlertCircle, Clock, CheckCircle, Users, IndianRupee } from 'lucide-react';

interface StateKpisProps {
  metrics: {
    totalProblems: number;
    underResolution: number;
    completed: number;
    citizensBenefited: number;
    costSaved: number;
  };
}

export default function StateKpis({ metrics }: StateKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Problems */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Issues Logged
          </span>
          <AlertCircle className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2 font-mono">
          {metrics.totalProblems}
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Across all 24 Jharkhand districts</p>
      </div>

      {/* 2. Under Resolution */}
      <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Under Resolution
          </span>
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-blue-900 mt-2 font-mono">
          {metrics.underResolution}
        </div>
        <p className="text-[11px] text-blue-700 mt-1">Assigned to university faculty teams</p>
      </div>

      {/* 3. Completed & Verified */}
      <div className="bg-white p-5 rounded-xl border border-green-300 shadow-sm bg-green-50/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
            Completed & Verified
          </span>
          <CheckCircle className="w-4 h-4 text-[#1B5E20]" />
        </div>
        <div className="text-2xl font-bold text-[#1B5E20] mt-2 font-mono">
          {metrics.completed}
        </div>
        <p className="text-[11px] text-green-700 mt-1">Certified with ground proof</p>
      </div>

      {/* 4. Citizens Benefited */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Citizens Benefited
          </span>
          <Users className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2 font-mono">
          {metrics.citizensBenefited.toLocaleString()}
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Direct public beneficiaries</p>
      </div>

      {/* 5. Public Cost Saved */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Costs Avoided
          </span>
          <IndianRupee className="w-4 h-4 text-green-700" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2 font-mono">
          ₹{(metrics.costSaved / 100000).toFixed(1)}L
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Via student & CSR innovation</p>
      </div>
    </div>
  );
}
