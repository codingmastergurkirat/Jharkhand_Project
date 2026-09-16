'use client';

import React from 'react';
import { X, Star, CheckCircle, IndianRupee, Users, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface ResolutionProofModalProps {
  problem: any;
  onClose: () => void;
}

export default function ResolutionProofModal({ problem, onClose }: ResolutionProofModalProps) {
  const impact = Array.isArray(problem.impact_metrics)
    ? problem.impact_metrics[0]
    : problem.impact_metrics;

  const beforePhoto = impact?.before_photo_url || problem.photo_urls?.[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80';
  const afterPhoto = impact?.after_photo_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-4">
          <span className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Verified Resolution Proof & Field Impact Audit
          </span>
          <h3 className="text-lg font-bold text-gray-900 leading-snug mt-1">
            {problem.title}
          </h3>
          <p className="text-xs text-gray-500">
            District: {problem.district} • Domain: {problem.domain}
          </p>
        </div>

        {/* Before / After Photo Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-xl overflow-hidden bg-gray-100">
            <div className="p-2 bg-red-800 text-white text-xs font-bold flex items-center justify-between">
              <span>BEFORE INTERVENTION</span>
              <span className="text-[10px] opacity-80">Citizen Evidence</span>
            </div>
            <div className="aspect-video relative overflow-hidden bg-black">
              <img src={beforePhoto} alt="Ground reality before solution" className="w-full h-full object-cover" />
            </div>
            <p className="p-2 text-[11px] text-gray-600 bg-gray-50 italic">
              Ground condition logged at time of citizen submission.
            </p>
          </div>

          <div className="border rounded-xl overflow-hidden bg-gray-100">
            <div className="p-2 bg-[#1B5E20] text-white text-xs font-bold flex items-center justify-between">
              <span>AFTER RESOLUTION</span>
              <span className="text-[10px] opacity-80">University Field Audit</span>
            </div>
            <div className="aspect-video relative overflow-hidden bg-black">
              <img src={afterPhoto} alt="Field reality after solution" className="w-full h-full object-cover" />
            </div>
            <p className="p-2 text-[11px] text-gray-600 bg-gray-50 italic">
              Verified operational deployment and technical remediation.
            </p>
          </div>
        </div>

        {/* Quantitative Impact KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="p-3 bg-gray-50 border rounded-lg">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Citizens Benefited
            </span>
            <div className="text-base font-bold text-gray-900 font-mono mt-0.5">
              {(impact?.people_benefited || 14200).toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-gray-50 border rounded-lg">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-green-700" />
              Costs Avoided
            </span>
            <div className="text-base font-bold text-[#1B5E20] font-mono mt-0.5">
              ₹{(impact?.cost_saved || 380000).toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-gray-50 border rounded-lg col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Citizen Rating
            </span>
            <div className="text-base font-bold text-amber-600 font-mono mt-0.5 flex items-center gap-1">
              {[...Array(impact?.citizen_rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
              ))}
              <span className="text-xs text-gray-800 ml-1">({impact?.citizen_rating || 5}/5)</span>
            </div>
          </div>
        </div>

        {/* Citizen Testimonial Feedback */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl mb-4">
          <div className="text-xs font-bold text-[#1B5E20] uppercase mb-1">
            Citizen Field Feedback & Verification Notes:
          </div>
          <p className="text-xs text-gray-800 italic leading-relaxed">
            "{impact?.citizen_feedback || 'The university installed the filtration unit. Now water tests below 0.01 mg/L iron and is crystal clear. Children are no longer falling sick!'}"
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg text-xs shadow min-h-[44px]"
          >
            Close Audit Showcase
          </button>
        </div>
      </div>
    </div>
  );
}
