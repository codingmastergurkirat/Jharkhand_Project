'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import { rankUniversities, UniversityProfile } from '@/lib/matching';
import { Sparkles, ArrowRightLeft, ShieldAlert, CheckCircle, MapPin, Building } from 'lucide-react';

interface OverrideCenterProps {
  problems: any[];
  universities: UniversityProfile[];
  adminId: string;
  onRefresh: () => void;
}

export default function OverrideCenter({
  problems,
  universities,
  adminId,
  onRefresh
}: OverrideCenterProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [selectedUnivByProblem, setSelectedUnivByProblem] = useState<{ [probId: string]: string }>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Focus on pending or assigned problems that admin may want to reassign
  const candidateProblems = problems.filter((p) =>
    ['pending', 'assigned'].includes(p.status)
  );

  const handleOverride = async (problemId: string) => {
    const targetUnivId = selectedUnivByProblem[problemId];
    if (!targetUnivId) {
      showToast('Please select a destination university.', 'error');
      return;
    }

    setUpdatingId(problemId);
    try {
      const { error } = await supabase
        .from('problems')
        .update({
          assigned_university_id: targetUnivId,
          status: 'assigned'
        })
        .eq('id', problemId);

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Administrative assignment override applied successfully!', 'success');
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Override failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#1B5E20]" />
          Assignment Override Center (Explainable Matching)
        </h3>
        <p className="text-xs text-gray-500">
          Transparent algorithmic matching suggests top institutions. Administrators hold statutory authority to override or re-assign based on ground priorities.
        </p>
      </div>

      {candidateProblems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500 text-xs">
          No problems currently requiring allocation or reassignment.
        </div>
      ) : (
        <div className="space-y-3">
          {candidateProblems.map((prob) => {
            // Rank all available universities deterministically
            const ranked = rankUniversities(prob, universities);
            const topMatch = ranked[0];
            const currentSelected = selectedUnivByProblem[prob.id] || prob.assigned_university_id || topMatch?.universityId;

            return (
              <div
                key={prob.id}
                className="bg-white border rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-700">
                        {prob.domain}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {prob.district} District
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mt-1">
                      {prob.title}
                    </h4>
                  </div>

                  <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-[#E65100] border border-amber-300 font-bold capitalize">
                    Status: {prob.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {prob.description}
                </p>

                {/* Citizen Photographic Evidence */}
                {prob.photo_urls && prob.photo_urls.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      📷 Citizen Photographic Evidence ({prob.photo_urls.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prob.photo_urls.map((url: string, pIdx: number) => (
                        <a
                          key={pIdx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative rounded overflow-hidden border border-gray-200 hover:border-[#1B5E20] transition bg-gray-50"
                          title="Open photo evidence in new tab"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${pIdx + 1}`}
                            className="w-16 h-12 object-cover group-hover:scale-105 transition"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Algorithmic Match Banner */}
                {topMatch && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#1B5E20] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#E65100]" />
                        Top Algorithmic Match: {topMatch.universityName} ({topMatch.district})
                      </div>
                      <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        Score: {topMatch.totalScore}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 italic">
                      Reasoning: {topMatch.reasoning}
                    </p>
                  </div>
                )}

                {/* Administrative Override Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="font-bold text-gray-700 shrink-0">
                      Allocate to University:
                    </label>
                    <select
                      value={currentSelected}
                      onChange={(e) =>
                        setSelectedUnivByProblem((prev) => ({ ...prev, [prob.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-1.5 border rounded-lg bg-white focus:ring-2 focus:ring-[#E65100] focus:outline-none text-xs font-semibold text-gray-900"
                    >
                      {universities.map((u) => {
                        const score = ranked.find((r) => r.universityId === u.id)?.totalScore || 0;
                        return (
                          <option key={u.id} value={u.id}>
                            {u.org_name || u.name} ({u.district}) — Match: {score} pts
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    onClick={() => handleOverride(prob.id)}
                    disabled={updatingId === prob.id}
                    className="px-4 py-2 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg shadow text-xs min-h-[40px] flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {updatingId === prob.id ? 'Applying...' : 'Confirm Assignment'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
