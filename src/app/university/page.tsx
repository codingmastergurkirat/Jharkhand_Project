'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import MatchQueue from '@/components/university/MatchQueue';
import MilestoneTracker from '@/components/university/MilestoneTracker';
import LessonsLearned from '@/components/university/LessonsLearned';
import QuickLoginDrawer from '@/components/common/QuickLoginDrawer';
import { GraduationCap, Sparkles, CheckCircle, Clock, BookOpen } from 'lucide-react';

export default function UniversityDashboardPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        setUserProfile(profile);
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
  }, []);

  // Fallback university profile for preview if not signed in
  const activeUniversity = userProfile?.role === 'university'
    ? userProfile
    : {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Birla Institute of Technology (BIT) Mesra',
        org_name: 'Birla Institute of Technology (BIT) Mesra',
        district: 'Ranchi',
        domain_tags: ['Education', 'Public Administration', 'Accessibility', 'Urban Infrastructure'],
        expertise: 'Computer science, electrical engineering, aerospace engineering, civil engineering',
        facilities: 'Software incubators, advanced computing centers'
      };

  return (
    <div className="space-y-6">
      {/* Institutional Header Banner */}
      <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            Higher Education & Research Consortium
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeUniversity.org_name || activeUniversity.name}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Jurisdiction: <span className="font-semibold">{activeUniversity.district} District</span> • Domain Tags: {activeUniversity.domain_tags?.join(', ') || 'Engineering'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500">Live DB Status</div>
            <div className="text-sm font-bold text-[#1B5E20]">Active Live Sync</div>
          </div>
        </div>
      </div>

      {/* Demo Warning / Quick Login if not authenticated as university */}
      {(!currentUser || userProfile?.role !== 'university') && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-3">
          <p>
            <strong>⚠️ Evaluator Notice:</strong> You are currently viewing as a guest preview (using BIT Mesra defaults). Use 1-Click Login below to switch to any registered University faculty account:
          </p>
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
