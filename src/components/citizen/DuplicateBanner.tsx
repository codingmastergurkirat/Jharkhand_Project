'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import { ThumbsUp, Check, AlertTriangle } from 'lucide-react';

interface DuplicateBannerProps {
  matchedProblem: {
    id: string;
    title: string;
    district: string;
    support_count?: number;
  };
  similarityScore: number;
  userId?: string;
  onSupported?: () => void;
}

export default function DuplicateBanner({
  matchedProblem,
  similarityScore,
  userId,
  onSupported
}: DuplicateBannerProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [supported, setSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(matchedProblem.support_count || 0);
  const [loading, setLoading] = useState(false);

  const handleSupport = async () => {
    if (!userId) {
      showToast('Please sign in to upvote this issue.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('toggle_problem_support', {
        p_problem_id: matchedProblem.id,
        p_user_id: userId
      });

      if (error) {
        showToast(error.message, 'error');
      } else {
        setSupported(data.supported);
        setSupportCount(data.support_count);
        showToast(data.message, 'success');
        if (onSupported) onSupported();
      }
    } catch (err: any) {
      showToast(err.message || 'Support action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-amber-50 border-2 border-[#E65100] rounded-xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm" role="alert">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5" aria-label="Duplicate warning">⚠️</span>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-[#E65100]">
              Similar Problem Already Reported ({similarityScore}% match in {matchedProblem.district})
            </h4>
          </div>
          <p className="text-xs text-gray-800 mt-1 font-medium">
            "{matchedProblem.title}"
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Support this existing report to increase government resolution priority instead of submitting a duplicate!
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSupport}
        disabled={loading}
        className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition min-h-[44px] shrink-0 ${
          supported
            ? 'bg-[#1B5E20] text-white shadow-inner'
            : 'bg-[#E65100] hover:bg-orange-700 text-white shadow'
        }`}
      >
        {supported ? (
          <>
            <Check className="w-4 h-4" />
            <span>Supported ({supportCount})</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-4 h-4" />
            <span>+1 Support Issue ({supportCount})</span>
          </>
        )}
      </button>
    </div>
  );
}
