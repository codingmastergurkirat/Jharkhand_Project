'use client';

import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';

export interface StudentMember {
  student_name: string;
  student_roll_no: string;
}

interface TeamBuilderProps {
  students: StudentMember[];
  onChange: (students: StudentMember[]) => void;
}

export default function TeamBuilder({ students, onChange }: TeamBuilderProps) {
  const addStudent = () => {
    onChange([...students, { student_name: '', student_roll_no: '' }]);
  };

  const removeStudent = (index: number) => {
    if (students.length === 1) return;
    onChange(students.filter((_, i) => i !== index));
  };

  const updateStudent = (index: number, field: keyof StudentMember, value: string) => {
    const updated = [...students];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#1B5E20]" />
          Assigned Student Team Roster <span className="text-[#B3261E]">*</span>
        </label>
        <button
          type="button"
          onClick={addStudent}
          className="px-3 py-1 bg-green-50 text-[#1B5E20] hover:bg-green-100 border border-green-300 rounded text-xs font-bold flex items-center gap-1 min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Student Member
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {students.map((st, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border">
            <span className="text-xs font-bold text-gray-500 w-5">#{idx + 1}</span>
            <input
              type="text"
              required
              value={st.student_name}
              onChange={(e) => updateStudent(idx, 'student_name', e.target.value)}
              placeholder="Student Full Name"
              className="flex-1 px-3 py-1.5 border rounded text-xs focus:ring-2 focus:ring-[#E65100] focus:outline-none"
            />
            <input
              type="text"
              required
              value={st.student_roll_no}
              onChange={(e) => updateStudent(idx, 'student_roll_no', e.target.value)}
              placeholder="Roll No / Student ID"
              className="w-36 px-3 py-1.5 border rounded text-xs font-mono focus:ring-2 focus:ring-[#E65100] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeStudent(idx)}
              disabled={students.length === 1}
              className={`p-1.5 rounded text-gray-400 hover:text-red-600 focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center ${
                students.length === 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Remove student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-500">
        Team members will be credited in the State Innovation Registry and certified upon completion.
      </p>
    </div>
  );
}
