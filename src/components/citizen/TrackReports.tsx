'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import CitizenRatingModal from './CitizenRatingModal';
import { Clock, MapPin, Tag, ThumbsUp, CheckCircle, AlertCircle, Award, ChevronRight, Image as ImageIcon, X } from 'lucide-react';

interface TrackReportsProps {
  userId?: string;
  refreshTrigger?: number;
}

export default function TrackReports({ userId, refreshTrigger }: TrackReportsProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingProblem, setRatingProblem] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('problems')
        .select(`
          *,
          assigned_university:profiles!assigned_university_id(name, org_name),
          milestones(*),
          impact_metrics(*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('submitted_by', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Failed to load reports:', error);
      } else {
        setProblems(data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [userId, refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-[#1B5E20] border border-green-300">
            <CheckCircle className="w-3.5 h-3.5" /> Resolved & Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case 'testing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Testing & Field Validation
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            Assigned to University
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#E65100] border border-amber-300">
            Pending Assessment
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {userId ? 'My Submitted Public Reports' : 'Recent Societal Reports'}
          </h2>
          <p className="text-xs text-gray-500">
            Live database tracking with transparent milestone progression.
          </p>
        </div>
        <button
          onClick={fetchProblems}
          className="text-xs font-bold text-[#1B5E20] hover:underline min-h-[44px] flex items-center"
        >
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-xl border">
          Loading report milestones...
        </div>
      ) : problems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500">
          <p className="text-sm font-semibold">No issues found.</p>
          <p className="text-xs mt-1">
            {userId ? "You haven't submitted any problems yet. Use the form above to report a challenge." : "No reports recorded yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {problems.map((prob) => {
            const completedMilestones = prob.milestones?.filter((m: any) => m.status === 'completed').length || 0;
            const totalMilestones = prob.milestones?.length || 0;
            const impact = Array.isArray(prob.impact_metrics) ? prob.impact_metrics[0] : prob.impact_metrics;

            return (
              <div
                key={prob.id}
                className="bg-white border rounded-xl p-5 shadow-sm hover:border-[#1B5E20] transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(prob.status)}
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                      {prob.domain}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {prob.district} District
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#E65100]" />
                    <span className="font-bold">{prob.support_count || 0}</span> Supporters
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {prob.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {prob.description}
                </p>

                {/* Photographic Evidence Gallery */}
                {prob.photo_urls && prob.photo_urls.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                      Citizen Photo Evidence ({prob.photo_urls.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prob.photo_urls.map((url: string, pIdx: number) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setSelectedImage(url)}
                          className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20] transition bg-gray-50"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${pIdx + 1}`}
                            className="w-20 h-14 object-cover group-hover:scale-105 transition duration-200"
                          />
                          <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                            Zoom
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Institution & Milestone Progress */}
                <div className="bg-[#F8F9FA] rounded-lg p-3 text-xs space-y-2 border">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-gray-500">Executing University: </span>
                      <span className="font-bold text-[#1B5E20]">
                        {prob.assigned_university?.org_name || prob.assigned_university?.name || 'Awaiting Allocation'}
                      </span>
                    </div>

                    {totalMilestones > 0 && (
                      <div className="font-medium text-gray-700">
                        Milestones: <span className="font-bold text-[#1B5E20]">{completedMilestones}/{totalMilestones} Completed</span>
                      </div>
                    )}
                  </div>

                  {/* Milestone list if active */}
                  {prob.milestones && prob.milestones.length > 0 && (
                    <div className="pt-1 border-t space-y-1">
                      {prob.milestones.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-2 text-gray-600">
                          {m.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          )}
                          <span className={m.status === 'completed' ? 'line-through text-gray-400' : ''}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification Rating Trigger if Completed */}
                {prob.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                    {impact?.citizen_rating ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                        <span>⭐ Verified Rating: {impact.citizen_rating}/5 Stars</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingProblem(prob)}
                        className="px-3 py-1.5 bg-[#1B5E20] hover:bg-green-800 text-white rounded text-xs font-bold flex items-center gap-1.5 transition min-h-[44px]"
                      >
                        <Award className="w-4 h-4" />
                        Verify Resolution & Submit Citizen Rating
                      </button>
                    )}

                    {impact?.people_benefited > 0 && (
                      <span className="text-xs text-gray-500">
                        {impact.people_benefited.toLocaleString()} citizens benefited
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Citizen Rating Modal */}
      {ratingProblem && (
        <CitizenRatingModal
          problem={ratingProblem}
          onClose={() => setRatingProblem(null)}
          onSuccess={fetchProblems}
        />
      )}

      {/* Evidence Image Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#1B5E20]" />
                Ground Problem Evidence (DPDP Act 2023 Compliant)
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Evidence Full View"
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
