'use client';

import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';

interface AnalyticsChartsProps {
  domainCounts: Record<string, number>;
  districtCounts: Record<string, number>;
}

export default function AnalyticsCharts({ domainCounts, districtCounts }: AnalyticsChartsProps) {
  const domainEntries = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
  const districtEntries = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);

  const maxDomainVal = Math.max(...domainEntries.map((e) => e[1]), 1);
  const maxDistrictVal = Math.max(...districtEntries.map((e) => e[1]), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Domain-wise Distribution */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1B5E20]" />
              Domain-Wise Societal Challenges Breakdown
            </h3>
            <p className="text-xs text-gray-500">Distribution across 11 official governance verticals</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {domainEntries.map(([domain, count]) => {
            const percentage = Math.round((count / maxDomainVal) * 100);
            return (
              <div key={domain} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-gray-800">{domain}</span>
                  <span className="font-mono font-bold text-[#1B5E20]">{count} Issues</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1B5E20] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={maxDomainVal}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* District-Wise Activity */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#E65100]" />
              District-Wise Citizen Reporting Volume
            </h3>
            <p className="text-xs text-gray-500">Top active jurisdictions in Jharkhand</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {districtEntries.slice(0, 7).map(([dist, count]) => {
            const percentage = Math.round((count / maxDistrictVal) * 100);
            return (
              <div key={dist} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-gray-800">{dist} District</span>
                  <span className="font-mono font-bold text-[#E65100]">{count} Reports</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E65100] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={maxDistrictVal}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
