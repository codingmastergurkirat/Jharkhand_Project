'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ExpressInterestModal from './ExpressInterestModal';
import { JHARKHAND_DISTRICTS, OFFICIAL_DOMAINS } from '@/lib/constants';
import { Filter, Search, Building2, MapPin, Calendar, DollarSign, UserCheck, Handshake, ChevronRight } from 'lucide-react';

interface ProposalBrowserProps {
  industryId: string;
}

export default function ProposalBrowser({ industryId }: ProposalBrowserProps) {
  const supabase = createClient();

  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);

  // Filters
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProposals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          problem:problems(*),
          university:profiles!university_id(name, org_name, district),
          proposal_students(id, student_name, student_roll_no),
          industry_interests(id, interest_type, funding_amount)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Failed to load proposals:', error);
      } else {
        setProposals(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const filtered = proposals.filter((p) => {
    const prob = p.problem || {};
    const matchesDomain = domainFilter === 'all' || prob.domain?.toLowerCase() === domainFilter.toLowerCase();
    const matchesDistrict = districtFilter === 'all' || prob.district?.toLowerCase() === districtFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      prob.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDomain && matchesDistrict && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposals by keyword or technology (e.g. solar, filtration, traffic)..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#E65100] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="text-xs border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#E65100] focus:outline-none"
            >
              <option value="all">All Domain Categories</option>
              {OFFICIAL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="text-xs border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#E65100] focus:outline-none"
            >
              <option value="all">All 24 Districts</option>
              {JHARKHAND_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-xl border text-sm text-gray-500">
          Loading vetted university proposals from Supabase...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500">
          <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No active proposals match the selected filters.</p>
          <p className="text-xs mt-1">Try resetting the domain category or district filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const prob = p.problem || {};
            const universityName = p.university?.org_name || p.university?.name || 'Assigned Institution';
            const studentCount = p.proposal_students?.length || 0;
            const existingInterests = p.industry_interests?.length || 0;

            return (
              <div
                key={p.id}
                className="bg-white border rounded-xl p-5 shadow-sm hover:border-[#1B5E20] transition flex flex-col justify-between"
              >
                <div>
                  {/* Category & District Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-[#1B5E20] border border-green-200 font-bold">
                        {prob.domain}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {prob.district}
                      </span>
                    </div>

                    {existingInterests > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-[#E65100] border border-amber-200 font-semibold">
                        {existingInterests} CSR Interest Pledged
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                    {p.description}
                  </p>

                  {/* University & Mentor Strip */}
                  <div className="bg-[#F8F9FA] p-3 rounded-lg border text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Institution:</span>
                      <span className="font-bold text-gray-900">{universityName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Faculty Mentor:</span>
                      <span className="font-semibold text-gray-800">
                        {p.mentor_name} ({p.mentor_department})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Student Team:</span>
                      <span className="font-semibold text-[#1B5E20]">{studentCount} Members Assigned</span>
                    </div>
                  </div>
                </div>

                {/* Budget, Timeline & Express Interest Trigger */}
                <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] text-gray-500">Estimated Project Budget</div>
                    <div className="text-sm font-mono font-bold text-gray-900">
                      ₹{p.estimated_budget?.toLocaleString() || '4,50,000'}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProposal(p)}
                    className="px-4 py-2 bg-[#1B5E20] hover:bg-green-800 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition min-h-[44px]"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>Express CSR Interest</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Express Interest Modal */}
      {selectedProposal && (
        <ExpressInterestModal
          proposal={selectedProposal}
          industryId={industryId}
          onClose={() => setSelectedProposal(null)}
          onSuccess={fetchProposals}
        />
      )}
    </div>
  );
}
