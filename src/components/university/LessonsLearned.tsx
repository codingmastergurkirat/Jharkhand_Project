'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, AlertTriangle, Building, Tag, Calendar } from 'lucide-react';

export default function LessonsLearned() {
  const supabase = createClient();
  const [rejectedProposals, setRejectedProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select(`
            id,
            cancellation_reason,
            created_at,
            problem:problems(id, title, domain, district),
            university:profiles!university_id(name, org_name)
          `)
          .or('status.eq.rejected,cancellation_reason.not.is.null')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching lessons learned:', error);
        } else {
          setRejectedProposals(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#1B5E20]" />
          Open Knowledge Base: Lessons Learned & Technical Constraints
        </h2>
        <p className="text-xs text-gray-500">
          Open institutional archive capturing technical bottlenecks, pilot limitations, and feasibility constraints to accelerate future R&D.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border text-sm text-gray-500">
          Querying past institutional evaluation records...
        </div>
      ) : rejectedProposals.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500">
          <p className="text-sm font-semibold">No recorded technical failures or rejections.</p>
          <p className="text-xs mt-1">When an institution declines a challenge with technical reasoning, it is logged here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rejectedProposals.map((item) => (
            <div
              key={item.id}
              className="bg-white border-l-4 border-l-[#B3261E] border rounded-r-xl p-5 shadow-sm space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-700">
                    {item.problem?.domain || 'General'}
                  </span>
                  <span className="text-gray-500 font-medium">
                    {item.problem?.district || 'Registered'} District
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-base font-bold text-gray-900">
                {item.problem?.title || 'Untitled Challenge'}
              </h3>

              {/* Technical Limitation Box */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-950">
                <div className="font-bold flex items-center gap-1 text-[#B3261E] mb-1">
                  <span>⚠️</span> Technical Barrier / Reason for Cancellation:
                </div>
                <p className="leading-relaxed font-medium">
                  {item.cancellation_reason || 'Feasibility constraint logged during evaluation.'}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500 pt-1">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span>Documented by: </span>
                <span className="font-semibold text-gray-800">
                  {item.university?.org_name || item.university?.name || 'Assigned Institution'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
