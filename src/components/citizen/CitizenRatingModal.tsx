'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import { Star, X, CheckCircle } from 'lucide-react';

interface CitizenRatingModalProps {
  problem: {
    id: string;
    title: string;
    district: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CitizenRatingModal({
  problem,
  onClose,
  onSuccess
}: CitizenRatingModalProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upsert into impact_metrics
      const { error } = await supabase
        .from('impact_metrics')
        .upsert({
          problem_id: problem.id,
          citizen_rating: rating,
          citizen_feedback: feedback.trim() || 'Citizen confirmed resolution satisfactorily.'
        }, {
          onConflict: 'problem_id'
        });

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Thank you! Your citizen satisfaction rating has been recorded.', 'success');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit rating', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="modal-title" className="text-lg font-bold text-[#1B5E20] flex items-center gap-2 mb-1">
          <CheckCircle className="w-5 h-5 text-[#1B5E20]" />
          Verify Problem Resolution & Rate Outcome
        </h3>
        <p className="text-xs text-gray-600 mb-4 font-medium">
          Issue: <span className="text-gray-900 font-bold">{problem.title}</span> ({problem.district})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Citizen Satisfaction Rating (1 to 5 Stars) <span className="text-[#B3261E]">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(rating)}
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-[#E65100] rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`${star} star rating`}
                >
                  <Star
                    className={`w-8 h-8 transition ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-gray-700 ml-2">
                {rating} of 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Field Feedback & Verification Notes
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe whether the university solution resolved the ground reality in your community..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-[#1B5E20] hover:bg-green-800 rounded-lg shadow min-h-[44px]"
            >
              {submitting ? 'Submitting...' : 'Submit Verification Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
