'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProposalBrowser from '@/components/industry/ProposalBrowser';
import MyCommitments from '@/components/industry/MyCommitments';
import QuickLoginDrawer from '@/components/common/QuickLoginDrawer';
import { Building2, Search, Handshake, ShieldCheck } from 'lucide-react';

export default function IndustryDashboardPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'commitments'>('browse');

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    }
    loadUser();
  }, []);

  // Fallback profile for guest preview (Tata Steel Limited)
  const activeIndustry = userProfile?.role === 'industry'
    ? userProfile
    : {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Tata Steel Limited',
        org_name: 'Tata Steel Limited',
        district: 'East Singhbhum',
        domain_tags: ['Healthcare', 'Education', 'Rural Livelihoods', 'Urban Infrastructure'],
        interest_type: 'both'
      };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            National CSR & Industry Engagement Network
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeIndustry.org_name || activeIndustry.name}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            District Jurisdiction: <span className="font-semibold">{activeIndustry.district} District</span> • CSR Domains: {activeIndustry.domain_tags?.join(', ') || 'Rural Development & Infrastructure'}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Corporate Partnership Mode</div>
          <div className="text-sm font-bold text-[#1B5E20]">Funding & Industry Mentorship</div>
        </div>
      </div>

      {/* Demo Quick Login Notice if not logged in as industry */}
      {(!currentUser || userProfile?.role !== 'industry') && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-3">
          <p>
            <strong>⚠️ Evaluator Notice:</strong> You are currently browsing as a guest CSR partner (using Tata Steel defaults). You can use 1-Click Login below to switch to any seeded Industry account (Tata Steel, CCL, SAIL Bokaro, ECL, UCIL):
          </p>
          <QuickLoginDrawer />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeTab === 'browse'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <Search className="w-4 h-4" />
          Browse Vetted University Proposals
        </button>

        <button
          onClick={() => setActiveTab('commitments')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeTab === 'commitments'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <Handshake className="w-4 h-4" />
          My CSR Commitments & Sponsorships
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'browse' && (
          <ProposalBrowser industryId={activeIndustry.id} />
        )}

        {activeTab === 'commitments' && (
          <MyCommitments industryId={activeIndustry.id} />
        )}
      </div>
    </div>
  );
}
