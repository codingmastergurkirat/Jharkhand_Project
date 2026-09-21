'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import { CheckCircle, Circle, Plus, Clock, Award, ShieldAlert } from 'lucide-react';

interface MilestoneTrackerProps {
  problems: any[];
  onRefresh: () => void;
}

export default function MilestoneTracker({ problems, onRefresh }: MilestoneTrackerProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<{ [problemId: string]: string }>({});
  const [addingForProb, setAddingForProb] = useState<string | null>(null);

  const toggleMilestone = async (milestone: any) => {
    setTogglingId(milestone.id);
    const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          status: newStatus,
          completed_at: completedAt
        })
        .eq('id', milestone.id);

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast(`Milestone marked as ${newStatus}! Database trigger synced problem status.`, 'success');
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Milestone toggle failed', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddMilestone = async (problemId: string) => {
    const title = newMilestoneTitle[problemId]?.trim();
    if (!title) return;

    setAddingForProb(problemId);
    try {
      const { error } = await supabase
        .from('milestones')
        .insert({
          problem_id: problemId,
          title,
          status: 'pending'
        });

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('New milestone stage created successfully!', 'success');
        setNewMilestoneTitle((prev) => ({ ...prev, [problemId]: '' }));
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add milestone', 'error');
    } finally {
      setAddingForProb(null);
    }
  };

  // Filter for in_progress or testing or completed problems
  const activeProblems = problems.filter((p) =>
    ['assigned', 'in_progress', 'testing', 'completed'].includes(p.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Active Milestone Progression & Field Validation
          </h2>
          <p className="text-xs text-gray-500">
            Automated State Machine: Checking off all milestones triggers the automated database trigger to transition problem status to Completed.
          </p>
        </div>
      </div>

      {activeProblems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border text-gray-500">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No active projects undergoing resolution.</p>
          <p className="text-xs mt-1">Accept matched challenges from the queue to initialize student milestones.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeProblems.map((prob) => {
            const milestones = prob.milestones || [];
            const completedCount = milestones.filter((m: any) => m.status === 'completed').length;
            const totalCount = milestones.length;
            const isCompleted = prob.status === 'completed';

            return (
              <div
                key={prob.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition ${
                  isCompleted ? 'border-green-400 bg-green-50/20' : 'hover:border-[#1B5E20]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      {prob.domain} • {prob.district} District
                    </span>
                    <h3 className="text-base font-bold text-gray-900 leading-snug mt-0.5">
                      {prob.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        isCompleted
                          ? 'bg-green-100 text-[#1B5E20] border border-green-300'
                          : prob.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-[#E65100] border border-amber-300'
                      }`}
                    >
                      Status: {prob.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {completedCount} / {totalCount} Done
                    </span>
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2 border-t pt-3">
                  {milestones.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMilestone(m)}
                          disabled={togglingId === m.id}
                          className="focus:outline-none focus:ring-2 focus:ring-[#E65100] rounded min-h-[40px] min-w-[40px] flex items-center justify-center"
                          aria-label={m.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {m.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-[#1B5E20]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            m.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>

                      {m.completed_at && (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {new Date(m.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add New Milestone Row */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newMilestoneTitle[prob.id] || ''}
                      onChange={(e) =>
                        setNewMilestoneTitle((prev) => ({ ...prev, [prob.id]: e.target.value }))
                      }
                      placeholder="Add another project milestone stage..."
                      className="flex-1 px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-[#E65100] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddMilestone(prob.id)}
                      disabled={addingForProb === prob.id || !newMilestoneTitle[prob.id]?.trim()}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-xs flex items-center gap-1 min-h-[36px] border disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
