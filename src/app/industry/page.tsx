'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProposalBrowser from '@/components/industry/ProposalBrowser';
import MyCommitments from '@/components/industry/MyCommitments';
import QuickLoginDrawer from '@/components/common/QuickLoginDrawer';
import { useToast } from '@/components/common/Toast';
import { PRESET_INDUSTRIES, PresetIndustry } from '@/lib/constants';
import { Building2, Search, Handshake, ShieldCheck, ArrowRightLeft, LogIn } from 'lucide-react';

export default function IndustryDashboardPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dbIndustries, setDbIndustries] = useState<any[]>([]);
  const [selectedIndustryEmail, setSelectedIndustryEmail] = useState<string>(PRESET_INDUSTRIES[0].email); // Default to Tata Steel
  const [activeTab, setActiveTab] = useState<'browse' | 'commitments'>('browse');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          if (profile.role === 'industry' && profile.email) {
            setSelectedIndustryEmail(profile.email.toLowerCase());
          }
        }
      }

      // Fetch all registered industry profiles from database
      const { data: dbInds } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'industry');

      if (dbInds && dbInds.length > 0) {
        setDbIndustries(dbInds);
      }
    } catch (err) {
      console.error('Failed to load industry dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to live Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserProfile(profile || null);
        if (profile?.role === 'industry' && profile.email) {
          setSelectedIndustryEmail(profile.email.toLowerCase());
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Merge preset industries with database records
  const availableIndustries: PresetIndustry[] = PRESET_INDUSTRIES.map((preset) => {
    const dbMatch = dbIndustries.find((dbI) => dbI.email?.toLowerCase() === preset.email.toLowerCase());
    if (dbMatch) {
      return {
        ...preset,
        id: dbMatch.id,
        name: dbMatch.name || preset.name,
        org_name: dbMatch.org_name || preset.org_name,
        district: dbMatch.district || preset.district,
        domain_tags: dbMatch.domain_tags?.length ? dbMatch.domain_tags : preset.domain_tags,
        expertise: dbMatch.expertise || preset.expertise,
        interest_type: dbMatch.interest_type || preset.interest_type,
      };
    }
    return preset;
  });

  // Determine active industry partner
  const activeIndustry: PresetIndustry = 
    availableIndustries.find((i) => i.email.toLowerCase() === selectedIndustryEmail.toLowerCase()) ||
    availableIndustries[0];

  const isAuthenticatedAsActive = 
    Boolean(currentUser && userProfile?.role === 'industry' && userProfile?.email?.toLowerCase() === activeIndustry.email.toLowerCase());

  // 1-Click login as selected corporate partner
  const handleQuickLoginAsSelected = async (targetInd: PresetIndustry) => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetInd.email,
        password: targetInd.pass,
      });

      if (error) {
        showToast(`Login failed: ${error.message}. Ensure database is seeded.`, 'error');
      } else {
        showToast(`Signed in as ${targetInd.name}!`, 'success');
        setSelectedIndustryEmail(targetInd.email.toLowerCase());
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Corporate Partner Switcher */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              National CSR & Industry Engagement Network
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeIndustry.org_name || activeIndustry.name}
            </h1>
            <p className="text-sm text-gray-600">
              District Jurisdiction: <span className="font-semibold text-gray-800">{activeIndustry.district} District</span> • CSR Domains: <span className="text-gray-800">{activeIndustry.domain_tags?.join(', ') || 'Rural Development & Infrastructure'}</span>
            </p>
          </div>

          {/* Interactive Corporate Switcher Dropdown */}
          <div className="bg-[#F8F9FA] border border-gray-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <label htmlFor="industry-select" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#1B5E20]" />
                Switch Corporate Partner:
              </label>
              <select
                id="industry-select"
                value={activeIndustry.email.toLowerCase()}
                onChange={(e) => setSelectedIndustryEmail(e.target.value.toLowerCase())}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] shadow-sm min-h-[38px]"
              >
                {availableIndustries.map((ind) => (
                  <option key={ind.email} value={ind.email.toLowerCase()}>
                    🏭 {ind.name} ({ind.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Auth Status & Quick Login Action Button */}
            <div className="flex items-end">
              {isAuthenticatedAsActive ? (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-green-100 border border-green-300 text-[#1B5E20] text-xs font-bold rounded-lg shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                  <span>Authenticated CSR Lead</span>
                </div>
              ) : (
                <button
                  onClick={() => handleQuickLoginAsSelected(activeIndustry)}
                  disabled={isAuthenticating}
                  className="px-3 py-2 bg-[#1B5E20] hover:bg-[#144718] text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 disabled:opacity-50 min-h-[38px]"
                  title={`Log in as CSR representative for ${activeIndustry.name}`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAuthenticating ? 'Signing In...' : `1-Click Login (${activeIndustry.district})`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Corporate Details Strip */}
        <div className="pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-lg">
          <div>
            <strong className="text-gray-800">CSR Focus:</strong> {activeIndustry.expertise}
          </div>
          <div>
            <strong className="text-gray-800">Engagement Mode:</strong> {activeIndustry.interest_type === 'both' ? 'Direct Funding + Mentorship & Pilot Facilities' : activeIndustry.interest_type === 'funding' ? 'Financial Grants & Sponsorships' : 'Mentorship & Technical Evaluation'}
          </div>
        </div>
      </div>

      {/* Evaluator Notice if viewing in preview mode */}
      {!isAuthenticatedAsActive && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
          <p>
            <strong>💡 Evaluator Notice:</strong> You are browsing as <strong>{activeIndustry.name}</strong>. Use the <em>"Switch Corporate Partner"</em> dropdown above to inspect CSR proposal matching across different industrial sectors, or click <em>"1-Click Login"</em> to authenticate as this enterprise partner.
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
