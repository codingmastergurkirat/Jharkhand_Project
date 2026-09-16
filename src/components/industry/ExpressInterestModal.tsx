'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import { X, DollarSign, Users, Sparkles, Building, Send } from 'lucide-react';

interface ExpressInterestModalProps {
  proposal: any;
  industryId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpressInterestModal({
  proposal,
  industryId,
  onClose,
  onSuccess
}: ExpressInterestModalProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [interestType, setInterestType] = useState<'funding' | 'mentorship' | 'both'>('both');
  const [fundingAmount, setFundingAmount] = useState('250000');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('industry_interests')
        .insert({
          proposal_id: proposal.id,
          industry_id: industryId,
          interest_type: interestType,
          funding_amount: interestType !== 'mentorship' ? parseFloat(fundingAmount) || 0 : 0,
          message: message.trim() || 'CSR commitment submitted for student research prototype.'
        });

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Expression of interest transmitted directly to the university faculty mentor!', 'success');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Pledge submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-[#1B5E20] flex items-center gap-2 mb-1">
          <Building className="w-5 h-5 text-[#1B5E20]" />
          Express Corporate CSR Interest
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Proposal: <span className="font-bold text-gray-900">{proposal.problem?.title || 'Selected Project'}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Support Type Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Support Mode <span className="text-[#B3261E]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInterestType('funding')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  interestType === 'funding'
                    ? 'bg-green-50 border-[#1B5E20] text-[#1B5E20] shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Funding Grant
              </button>
              <button
                type="button"
                onClick={() => setInterestType('mentorship')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  interestType === 'mentorship'
                    ? 'bg-green-50 border-[#1B5E20] text-[#1B5E20] shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Mentorship
              </button>
              <button
                type="button"
                onClick={() => setInterestType('both')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  interestType === 'both'
                    ? 'bg-green-50 border-[#1B5E20] text-[#1B5E20] shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Both
              </button>
            </div>
          </div>

          {/* Funding Amount (if applicable) */}
          {interestType !== 'mentorship' && (
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Pledged CSR Capital Grant (INR ₹) <span className="text-[#B3261E]">*</span>
              </label>
              <input
                type="number"
                required
                min="10000"
                step="25000"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-3 focus:ring-[#E65100] focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Estimated university project budget: ₹{proposal.estimated_budget?.toLocaleString() || '4,50,000'}
              </p>
            </div>
          )}

          {/* Message to Faculty Team */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Communication & Strategic Guidance for Faculty Team
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Outline technical support, industrial lab testing facilities, or CSR disbursement terms your company offers..."
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
              className="px-5 py-2 text-sm font-bold text-white bg-[#1B5E20] hover:bg-green-800 rounded-lg shadow min-h-[44px] flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Transmitting...' : 'Submit CSR Pledge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
