'use client';

import React, { useState } from 'react';
import { calculateMatchScore, UniversityProfile } from '@/lib/matching';
import ProposalModal from './ProposalModal';
import { Sparkles, MapPin, CheckCircle2, ChevronRight, Filter, AlertCircle } from 'lucide-react';

interface MatchQueueProps {
  problems: any[];
  university: UniversityProfile;
  onRefresh: () => void;
}

export default function MatchQueue({ problems, university, onRefresh }: MatchQueueProps) {
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const [filterDomain, setFilterDomain] = useState<string>('all');

  // Compute deterministic match score for every candidate problem
  const scoredProblems = problems.map((prob) => {
    const match = calculateMatchScore(prob, university);
    return {
      ...prob,
      matchResult: match,
    };
  }).sort((a, b) => b.matchResult.totalScore - a.matchResult.totalScore);

  const filteredProblems = filterDomain === 'all'
    ? scoredProblems
    : scoredProblems.filter((p) => p.domain.toLowerCase() === filterDomain.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E65100]" />
            Algorithmic Matching Queue (Explainable Scoring)
          </h2>
          <p className="text-xs text-gray-500">
            Ranked deterministically: Domain Specialization (+50) + District Proximity (+30) + Lab Facility Keyword Overlap (+20).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="text-xs border rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-[#E65100] focus:outline-none font-medium"
          >
            <option value="all">All Domain Categories</option>
            <option value="Water Management">Water Management</option>
            <option value="Urban Infrastructure">Urban Infrastructure</option>
            <option value="Environment">Environment</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Energy">Energy</option>
            <option value="Accessibility">Accessibility</option>
          </select>
        </div>
      </div>

      {filteredProblems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500">
          <p className="text-sm font-semibold">No problems currently pending allocation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProblems.map((prob) => {
            const { totalScore, breakdown, reasoning } = prob.matchResult;
            const isAssignedToMe = prob.assigned_university_id === university.id;

            return (
              <div
                key={prob.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition hover:shadow-md ${
                  isAssignedToMe ? 'border-2 border-[#1B5E20]' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isAssignedToMe && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-[#1B5E20] border border-green-300">
                          Assigned to Your Institution
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                        {prob.domain}
                      </span>
                      {prob.sdg_goal && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium flex items-center gap-1">
                          🎯 {prob.sdg_goal}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {prob.district} District
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {prob.title}
                    </h3>
                  </div>

                  {/* Match Score Display */}
                  <div className="text-right shrink-0">
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        totalScore >= 70
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : totalScore >= 40
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span>Match Score: {totalScore} / 100</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {prob.description}
                </p>

                {/* Citizen Photographic Evidence */}
                {prob.photo_urls && prob.photo_urls.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      📷 Citizen Ground Evidence ({prob.photo_urls.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prob.photo_urls.map((url: string, pIdx: number) => (
                        <a
                          key={pIdx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative rounded-md overflow-hidden border border-gray-200 hover:border-[#1B5E20] transition bg-gray-50"
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

                {/* Explainable Scoring Breakdown Banner */}
                <div className="bg-[#F8F9FA] rounded-lg p-3 text-xs border space-y-1.5 mb-3">
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        breakdown.domainMatch ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      Domain Match: {breakdown.domainPoints} pts
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        breakdown.districtMatch ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      District Proximity: {breakdown.districtPoints} pts
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        breakdown.keywordPoints > 0 ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      Facility Overlap: {breakdown.keywordPoints} pts
                    </span>
                  </div>

                  <p className="text-gray-600 italic text-[11px]">
                    {reasoning}
                  </p>
                </div>

                {/* Action Trigger */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setSelectedProblem(prob)}
                    className="px-4 py-2 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg text-xs shadow flex items-center gap-1.5 transition min-h-[44px]"
                  >
                    <span>Review Challenge & Formulate Proposal</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proposal Acceptance / Decline Modal */}
      {selectedProblem && (
        <ProposalModal
          problem={selectedProblem}
          universityId={university.id}
          onClose={() => setSelectedProblem(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
