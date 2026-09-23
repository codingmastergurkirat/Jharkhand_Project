'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import MatchQueue from '@/components/university/MatchQueue';
import MilestoneTracker from '@/components/university/MilestoneTracker';
import LessonsLearned from '@/components/university/LessonsLearned';
import QuickLoginDrawer from '@/components/common/QuickLoginDrawer';
import { useToast } from '@/components/common/Toast';
import { PRESET_UNIVERSITIES, PresetUniversity } from '@/lib/constants';
import { GraduationCap, Sparkles, CheckCircle, Clock, BookOpen, ArrowRightLeft, ShieldCheck, LogIn } from 'lucide-react';

export default function UniversityDashboardPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dbUniversities, setDbUniversities] = useState<any[]>([]);
  const [selectedUnivEmail, setSelectedUnivEmail] = useState<string>(PRESET_UNIVERSITIES[1].email); // Default to BIT Mesra
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<'match' | 'milestones' | 'lessons'>('match');

  const loadData = async () => {
    setLoading(true);
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
          if (profile.role === 'university' && profile.email) {
            setSelectedUnivEmail(profile.email.toLowerCase());
          }
        }
      }

      // Fetch all registered university profiles from database
      const { data: dbUnivs } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'university');

      if (dbUnivs && dbUnivs.length > 0) {
        setDbUniversities(dbUnivs);
      }

      // Fetch problems with milestones
      const { data: probData } = await supabase
        .from('problems')
        .select(`
          *,
          milestones(*)
        `)
        .order('created_at', { ascending: false });

      setProblems(probData || []);
    } catch (err) {
      console.error('Failed to load university dashboard:', err);
    } finally {
      setLoading(false);
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
        if (profile?.role === 'university' && profile.email) {
          setSelectedUnivEmail(profile.email.toLowerCase());
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Merge pre-set universities with real database profile records (matching by email)
  const availableUniversities: PresetUniversity[] = PRESET_UNIVERSITIES.map((preset) => {
    const dbMatch = dbUniversities.find((dbU) => dbU.email?.toLowerCase() === preset.email.toLowerCase());
    if (dbMatch) {
      return {
        ...preset,
        id: dbMatch.id,
        name: dbMatch.name || preset.name,
        org_name: dbMatch.org_name || preset.org_name,
        district: dbMatch.district || preset.district,
        domain_tags: dbMatch.domain_tags?.length ? dbMatch.domain_tags : preset.domain_tags,
        expertise: dbMatch.expertise || preset.expertise,
        facilities: dbMatch.facilities || preset.facilities,
      };
    }
    return preset;
  });

  // Determine active university based on selectedUnivEmail or authenticated profile
  const activeUniversity: PresetUniversity = 
    availableUniversities.find((u) => u.email.toLowerCase() === selectedUnivEmail.toLowerCase()) ||
    availableUniversities[1] || // Fallback to BIT Mesra
    availableUniversities[0];

  const isAuthenticatedAsActive = 
    Boolean(currentUser && userProfile?.role === 'university' && userProfile?.email?.toLowerCase() === activeUniversity.email.toLowerCase());

  // 1-Click login as the selected university faculty
  const handleQuickLoginAsSelected = async (targetUniv: PresetUniversity) => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetUniv.email,
        password: targetUniv.pass,
      });

      if (error) {
        showToast(`Login failed: ${error.message}. Ensure database is seeded.`, 'error');
      } else {
        showToast(`Successfully authenticated as ${targetUniv.name}!`, 'success');
        setSelectedUnivEmail(targetUniv.email.toLowerCase());
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
      {/* Institutional Header Banner with Dynamic University Switcher */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              Higher Education & Research Consortium
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeUniversity.org_name || activeUniversity.name}
            </h1>
            <p className="text-sm text-gray-600">
              Jurisdiction: <span className="font-semibold text-gray-800">{activeUniversity.district} District</span> • Domain Focus: <span className="text-gray-800">{activeUniversity.domain_tags?.join(', ') || 'Engineering'}</span>
            </p>
          </div>

          {/* Interactive Institution Switcher Dropdown */}
          <div className="bg-[#F8F9FA] border border-gray-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <label htmlFor="university-select" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#1B5E20]" />
                Switch Institution:
              </label>
              <select
                id="university-select"
                value={activeUniversity.email.toLowerCase()}
                onChange={(e) => setSelectedUnivEmail(e.target.value.toLowerCase())}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] shadow-sm min-h-[38px]"
              >
                {availableUniversities.map((univ) => (
                  <option key={univ.email} value={univ.email.toLowerCase()}>
                    🎓 {univ.name} ({univ.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Auth Status & Quick Login Action Button */}
            <div className="flex items-end">
              {isAuthenticatedAsActive ? (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-green-100 border border-green-300 text-[#1B5E20] text-xs font-bold rounded-lg shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
                  <span>Authenticated Faculty</span>
                </div>
              ) : (
                <button
                  onClick={() => handleQuickLoginAsSelected(activeUniversity)}
                  disabled={isAuthenticating}
                  className="px-3 py-2 bg-[#1B5E20] hover:bg-[#144718] text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 disabled:opacity-50 min-h-[38px]"
                  title={`Log in as faculty for ${activeUniversity.name}`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAuthenticating ? 'Signing In...' : `1-Click Login (${activeUniversity.district})`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Institutional Facilities & Expertise Strip */}
        <div className="pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-lg">
          <div>
            <strong className="text-gray-800">Key Expertise:</strong> {activeUniversity.expertise}
          </div>
          <div>
            <strong className="text-gray-800">Facilities:</strong> {activeUniversity.facilities}
          </div>
        </div>
      </div>

      {/* Evaluator Notice if viewing in preview mode */}
      {!isAuthenticatedAsActive && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center justify-between">
            <p>
              <strong>💡 Evaluator Mode:</strong> You are viewing <strong>{activeUniversity.name}</strong>. Use the <em>"Switch Institution"</em> dropdown above to test algorithm re-scoring across different Jharkhand universities, or click <em>"1-Click Login"</em> to authenticate as this institution's faculty.
            </p>
          </div>
          <QuickLoginDrawer />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('match')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeTab === 'match'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Matched Problem Queue
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeTab === 'milestones'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <Clock className="w-4 h-4" />
          Milestones & State Sync
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeTab === 'lessons'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Lessons Learned Archive
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'match' && (
          <MatchQueue
            problems={problems}
            university={activeUniversity}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestoneTracker
            problems={problems}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsLearned />
        )}
      </div>
    </div>
  );
}
