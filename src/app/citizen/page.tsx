'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ProblemSubmissionWizard from '@/components/citizen/ProblemSubmissionWizard';
import TrackReports from '@/components/citizen/TrackReports';
import QuickLoginDrawer from '@/components/common/QuickLoginDrawer';
import { PlusCircle, ListChecks, Award, UserCheck, ShieldCheck } from 'lucide-react';

export default function CitizenPortalPage() {
  const supabase = createClient();
  const [activeView, setActiveView] = useState<'submit' | 'track' | 'browse'>('submit');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function getUser() {
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
    getUser();
  }, []);

  const handleSubmissionSuccess = () => {
    setActiveView('track');
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Direct Citizen Empowerment | DPDP Act 2023 Compliant
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Citizen Public Challenge Portal
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Report societal bottlenecks in your village, ward, or district. Universities engineer the solution, industries provide CSR funding, and government monitors completion.
          </p>
        </div>

        {currentUser ? (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-900 shrink-0">
            <div className="font-bold flex items-center gap-1.5 text-[#1B5E20]">
              <UserCheck className="w-4 h-4" />
              Logged in: {userProfile?.name || currentUser.email}
            </div>
            <p className="mt-0.5 text-emerald-800">
              District: {userProfile?.district || 'Ranchi'} ({userProfile?.role || 'citizen'})
            </p>
          </div>
        ) : (
          <div className="shrink-0 flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 bg-[#1B5E20] hover:bg-green-800 text-white font-bold text-xs rounded-lg shadow min-h-[44px] flex items-center"
            >
              Sign In to Track My Reports
            </Link>
          </div>
        )}
      </div>

      {/* Task-Oriented Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          onClick={() => setActiveView('submit')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeView === 'submit'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Report a Societal Problem
        </button>

        <button
          onClick={() => setActiveView('track')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeView === 'track'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Track My Reports
        </button>

        <button
          onClick={() => setActiveView('browse')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition min-h-[44px] ${
            activeView === 'browse'
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          <Award className="w-4 h-4" />
          Browse Solved Projects & Evidence
        </button>
      </div>

      {/* Active View Container */}
      <div>
        {activeView === 'submit' && (
          <div className="space-y-6">
            {!currentUser && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                <span className="font-bold">⚠️ Quick Demo Note:</span> To submit a challenge, please sign in. You can use the 1-Click Quick Login below to instantly authenticate as <strong>Ramesh Kumar (Citizen)</strong>.
                <div className="mt-3">
                  <QuickLoginDrawer />
                </div>
              </div>
            )}
            <ProblemSubmissionWizard
              userId={currentUser?.id}
              onSuccess={handleSubmissionSuccess}
            />
          </div>
        )}

        {activeView === 'track' && (
          <TrackReports
            userId={currentUser?.id}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeView === 'browse' && (
          <TrackReports
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </div>
  );
}
