'use client';

import React from 'react';
import { Table, Building, GraduationCap } from 'lucide-react';

export interface LeaderboardEntry {
  id: string;
  name: string;
  category: 'University' | 'Industry';
  district: string;
  undertaken: number;
  completed: number;
  resolutionRate: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const sorted = [...entries].sort((a, b) => b.completed - a.completed || b.resolutionRate - a.resolutionRate);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Institutional & Corporate Performance Ledger
          </h3>
          <p className="text-xs text-gray-500">
            Official audit of societal projects undertaken, completed, and resolution efficiency across Jharkhand.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8F9FA] border-b text-gray-700 font-bold uppercase text-[11px] tracking-wider">
              <th className="p-3.5 pl-5">Institution / Corporation</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">District</th>
              <th className="p-3.5 text-center">Projects Undertaken</th>
              <th className="p-3.5 text-center">Completed & Verified</th>
              <th className="p-3.5 text-right pr-5">Resolution Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="p-3.5 pl-5 font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-gray-400 font-mono text-[11px] w-4">#{idx + 1}</span>
                  {item.category === 'University' ? (
                    <GraduationCap className="w-4 h-4 text-[#1B5E20]" />
                  ) : (
                    <Building className="w-4 h-4 text-purple-700" />
                  )}
                  <span>{item.name}</span>
                </td>
                <td className="p-3.5 text-gray-600 font-medium">
                  {item.category}
                </td>
                <td className="p-3.5 text-gray-600">
                  {item.district}
                </td>
                <td className="p-3.5 text-center font-mono font-semibold text-gray-800">
                  {item.undertaken}
                </td>
                <td className="p-3.5 text-center font-mono font-bold text-[#1B5E20]">
                  {item.completed}
                </td>
                <td className="p-3.5 text-right pr-5 font-mono font-bold">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                      item.resolutionRate >= 70
                        ? 'bg-green-100 text-[#1B5E20]'
                        : item.resolutionRate >= 40
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.resolutionRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
