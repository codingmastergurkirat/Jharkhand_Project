'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Handshake, DollarSign, Calendar, Building } from 'lucide-react';

interface MyCommitmentsProps {
  industryId: string;
}

export default function MyCommitments({ industryId }: MyCommitmentsProps) {
  const supabase = createClient();
  const [commitments, setCommitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommitments() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('industry_interests')
          .select(`
            *,
            proposal:proposals(
              id,
              mentor_name,
              mentor_department,
              problem:problems(title, domain, district),
              university:profiles!university_id(name, org_name)
            )
          `)
          .eq('industry_id', industryId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load industry commitments:', error);
        } else {
          setCommitments(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (industryId) {
      loadCommitments();
    }
  }, [industryId]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-[#1B5E20]" />
          My Pledged CSR Commitments & Sponsorships
        </h2>
        <p className="text-xs text-gray-500">
          Corporate Social Responsibility partnerships active with Jharkhand state universities.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border text-sm text-gray-500">
          Loading commitments from Supabase...
        </div>
      ) : commitments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500">
          <p className="text-sm font-semibold">No active sponsorships yet.</p>
          <p className="text-xs mt-1">Browse open university proposals and express interest via Funding or Mentorship.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {commitments.map((item) => {
            const proposal = item.proposal || {};
            const problem = proposal.problem || {};
            const university = proposal.university || {};

            return (
              <div
                key={item.id}
                className="bg-white border rounded-xl p-5 shadow-sm hover:border-[#1B5E20] transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-[#1B5E20] border border-green-200 uppercase">
                    Support Mode: {item.interest_type}
                  </span>
                  <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {problem.title || 'Collaborative Solution Proposal'}
                </h3>

                <div className="bg-[#F8F9FA] p-3 rounded-lg border text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">University: </span>
                    <span className="font-bold text-gray-900">
                      {university.org_name || university.name || 'Assigned University'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Faculty Lead: </span>
                    <span className="font-semibold text-gray-800">
                      {proposal.mentor_name} ({proposal.mentor_department})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
                  {item.interest_type !== 'mentorship' ? (
                    <div className="flex items-center gap-1 font-mono font-bold text-[#1B5E20] text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>Pledged Grant: ₹{item.funding_amount?.toLocaleString() || '0'}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Technical Industry Mentorship
                    </span>
                  )}

                  <span className="text-gray-500 italic">
                    "{item.message}"
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
