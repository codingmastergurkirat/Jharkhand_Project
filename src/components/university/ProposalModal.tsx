'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import TeamBuilder, { StudentMember } from './TeamBuilder';
import { X, CheckCircle, AlertTriangle, Shield, User, FileText } from 'lucide-react';

interface ProposalModalProps {
  problem: any;
  universityId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProposalModal({
  problem,
  universityId,
  onClose,
  onSuccess
}: ProposalModalProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'accept' | 'reject'>('accept');
  const [submitting, setSubmitting] = useState(false);

  // Rejection Form State
  const [cancellationReason, setCancellationReason] = useState('');

  // Acceptance Form State
  const [mentorName, setMentorName] = useState('');
  const [mentorDepartment, setMentorDepartment] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState('6 Months');
  const [estimatedBudget, setEstimatedBudget] = useState('450000');
  const [ipAck, setIpAck] = useState(true);
  const [students, setStudents] = useState<StudentMember[]>([
    { student_name: '', student_roll_no: '' }
  ]);

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellationReason.trim()) {
      showToast('Please provide a reason or technical constraint for declining.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Record rejected proposal with cancellation reason for the Lessons Learned archive
      const { error: propErr } = await supabase
        .from('proposals')
        .insert({
          problem_id: problem.id,
          university_id: universityId,
          mentor_name: 'Department Evaluation Committee',
          mentor_department: 'Institutional Assessment Cell',
          mentor_email: 'academic@institution.ac.in',
          description: 'Institutional rejection during intake feasibility evaluation.',
          timeline: 'N/A',
          estimated_budget: 0,
          status: 'rejected',
          cancellation_reason: cancellationReason.trim()
        });

      if (propErr) {
        showToast(propErr.message, 'error');
      } else {
        // Reset problem status to pending so admin or another university can take it
        await supabase
          .from('problems')
          .update({
            assigned_university_id: null,
            status: 'pending'
          })
          .eq('id', problem.id);

        showToast('Problem declined. Technical rationale logged to Lessons Learned archive.', 'info');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentorName.trim() || !mentorEmail.trim() || !description.trim()) {
      showToast('Please fill all mandatory faculty mentor and solution details.', 'error');
      return;
    }

    const validStudents = students.filter(
      (s) => s.student_name.trim() && s.student_roll_no.trim()
    );

    if (validStudents.length === 0) {
      showToast('At least one student team member (Name and Roll No) is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert proposal
      const { data: proposal, error: propErr } = await supabase
        .from('proposals')
        .insert({
          problem_id: problem.id,
          university_id: universityId,
          mentor_name: mentorName.trim(),
          mentor_department: mentorDepartment.trim() || 'Engineering Department',
          mentor_email: mentorEmail.trim(),
          description: description.trim(),
          timeline: timeline.trim(),
          estimated_budget: parseFloat(estimatedBudget) || 0,
          ip_notice_ack: ipAck,
          status: 'approved'
        })
        .select()
        .single();

      if (propErr) {
        showToast(propErr.message, 'error');
        setSubmitting(false);
        return;
      }

      // 2. Insert student team rows into proposal_students
      const studentRows = validStudents.map((s) => ({
        proposal_id: proposal.id,
        student_name: s.student_name.trim(),
        student_roll_no: s.student_roll_no.trim()
      }));

      const { error: stErr } = await supabase
        .from('proposal_students')
        .insert(studentRows);

      if (stErr) {
        console.warn('Student roster insertion warning:', stErr.message);
      }

      // 3. Update problem status to in_progress and initialize default milestones if none exist
      await supabase
        .from('problems')
        .update({
          assigned_university_id: universityId,
          status: 'in_progress'
        })
        .eq('id', problem.id);

      // Create 3 standard milestones for tracking
      await supabase
        .from('milestones')
        .insert([
          {
            problem_id: problem.id,
            title: 'Field Investigation & Technical Specification Formulation',
            status: 'pending'
          },
          {
            problem_id: problem.id,
            title: 'Prototype Fabrication & Lab Environmental Testing',
            status: 'pending'
          },
          {
            problem_id: problem.id,
            title: 'On-Site Deployment & Citizen Demonstration Pilot',
            status: 'pending'
          }
        ]);

      showToast('Proposal submitted! Student team assigned and milestones generated.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Problem Header Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-1">
            <span>{problem.domain}</span>
            <span>•</span>
            <span>{problem.district} District</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-snug">
            {problem.title}
          </h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-3">
            {problem.description}
          </p>
        </div>

        {/* Citizen Evidence Photos */}
        {problem.photo_urls && problem.photo_urls.length > 0 && (
          <div className="mb-5 bg-gray-50 p-2.5 rounded-lg border">
            <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#1B5E20]" />
              Citizen Photographic Evidence ({problem.photo_urls.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {problem.photo_urls.map((url: string, idx: number) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-lg overflow-hidden border border-gray-300 hover:border-[#1B5E20] transition"
                  title="Click to view full image in new tab"
                >
                  <img
                    src={url}
                    alt={`Evidence ${idx + 1}`}
                    className="w-24 h-16 object-cover group-hover:scale-105 transition duration-200"
                  />
                  <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                    View Full ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Decision Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('accept')}
            className={`py-2.5 rounded-md transition min-h-[44px] flex items-center justify-center gap-1.5 ${
              mode === 'accept'
                ? 'bg-[#1B5E20] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Accept & Formulate Solution
          </button>
          <button
            type="button"
            onClick={() => setMode('reject')}
            className={`py-2.5 rounded-md transition min-h-[44px] flex items-center justify-center gap-1.5 ${
              mode === 'reject'
                ? 'bg-[#B3261E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span aria-label="Warning icon">⚠️</span>
            Decline with Technical Rationale
          </button>
        </div>

        {mode === 'reject' ? (
          /* DECLINE / FAILED ATTEMPT FORM */
          <form onSubmit={handleReject} className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
              <span className="font-bold flex items-center gap-1 text-[#B3261E]">
                <span>⚠️</span> Technical Feasibility Limitation:
              </span>
              <p className="mt-1">
                Your decline reason will be preserved in the public "Lessons Learned" knowledge base so researchers understand previous barriers and constraints.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Reason for Rejection / Technical Limitations <span className="text-[#B3261E]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Explain why this challenge cannot be resolved by current institutional facilities (e.g. requires specialized hazardous reagents, excessive geological drilling equipment, or lacks domain match)..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
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
                className="px-5 py-2 text-sm font-bold text-white bg-[#B3261E] hover:bg-red-800 rounded-lg shadow min-h-[44px]"
              >
                {submitting ? 'Recording...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        ) : (
          /* ACCEPTANCE FORM */
          <form onSubmit={handleAccept} className="space-y-4">
            {/* Faculty Mentor Details */}
            <div className="bg-green-50/60 border border-green-200 p-3.5 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Faculty Mentor In-Charge
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mentor Name *</label>
                  <input
                    type="text"
                    required
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    placeholder="Prof. / Dr. Name"
                    className="w-full px-2.5 py-1.5 border rounded bg-white text-xs focus:ring-2 focus:ring-[#E65100] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={mentorDepartment}
                    onChange={(e) => setMentorDepartment(e.target.value)}
                    placeholder="e.g. Civil / Environmental"
                    className="w-full px-2.5 py-1.5 border rounded bg-white text-xs focus:ring-2 focus:ring-[#E65100] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    placeholder="mentor@univ.ac.in"
                    className="w-full px-2.5 py-1.5 border rounded bg-white text-xs focus:ring-2 focus:ring-[#E65100] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Student Team Builder */}
            <TeamBuilder students={students} onChange={setStudents} />

            {/* Technical Proposal Description */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Technical Methodology & Approach <span className="text-[#B3261E]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline the engineering solution, lab tests to be conducted, and how the student team will execute field deployment..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
              />
            </div>

            {/* Timeline & Estimated Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Estimated Timeline <span className="text-[#B3261E]">*</span>
                </label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#E65100] focus:outline-none"
                >
                  <option value="3 Months">3 Months (Rapid Prototype)</option>
                  <option value="6 Months">6 Months (Full Field Deployment)</option>
                  <option value="9 Months">9 Months (Comprehensive Engineering)</option>
                  <option value="12 Months">12 Months (Large Scale Infrastructure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Estimated Budget (INR ₹) <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#E65100] focus:outline-none"
                />
              </div>
            </div>

            {/* IP Notice Acknowledgement */}
            <div className="p-3 bg-gray-50 border rounded-lg">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={ipAck}
                  onChange={(e) => setIpAck(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#1B5E20] rounded focus:ring-2 focus:ring-[#E65100]"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  <strong>Intellectual Property & Open Governance Policy:</strong> I acknowledge that any solution IP developed under this public grant adheres to institutional guidelines and the Jan Samadhan Open Innovation Framework.
                </span>
              </label>
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
                disabled={submitting || !ipAck}
                className="px-5 py-2 text-sm font-bold text-white bg-[#1B5E20] hover:bg-green-800 rounded-lg shadow min-h-[44px] flex items-center gap-1.5"
              >
                {submitting ? 'Submitting...' : 'Confirm Assignment & Launch Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
