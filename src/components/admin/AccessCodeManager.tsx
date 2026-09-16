'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import { Key, Plus, Copy, Check, Trash2, ShieldCheck, Clock } from 'lucide-react';

export default function AccessCodeManager() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [roleType, setRoleType] = useState<'university' | 'industry'>('university');
  const [orgName, setOrgName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select(`
          *,
          redeemed_profile:profiles!redeemed_by(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch access codes:', error);
      } else {
        setCodes(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      showToast('Please specify the organization name.', 'error');
      return;
    }

    setGenerating(true);
    // Format: PREFIX-JH-####
    const prefix = roleType === 'university' ? 'UNIV' : 'IND';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${prefix}-JH-${randomNum}`;

    try {
      const { error } = await supabase
        .from('access_codes')
        .insert({
          code: newCode,
          role_type: roleType,
          org_name: orgName.trim(),
          is_used: false
        });

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast(`Verification code ${newCode} generated for ${orgName}!`, 'success');
        setOrgName('');
        fetchCodes();
      }
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string, code: string) => {
    if (!confirm(`Revoke unused access code ${code}?`)) return;

    try {
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', id);

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast(`Code ${code} revoked.`, 'info');
        fetchCodes();
      }
    } catch (err: any) {
      showToast(err.message || 'Revocation failed', 'error');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Code Generation Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#E65100]" />
            Generate Single-Use Institutional Access Code
          </h3>
          <p className="text-xs text-gray-500">
            Issues verified onboarding credentials formatted as <code>PREFIX-JH-####</code> with atomic race-condition prevention.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <select
            value={roleType}
            onChange={(e) => setRoleType(e.target.value as any)}
            className="text-xs border rounded-lg px-3 py-2 bg-white font-semibold focus:ring-2 focus:ring-[#E65100] focus:outline-none min-h-[44px]"
          >
            <option value="university">University Institution (UNIV-JH-####)</option>
            <option value="industry">CSR Industry Partner (IND-JH-####)</option>
          </select>

          <input
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Authorized Institution Name (e.g. Kolhan University)"
            className="flex-1 px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-[#E65100] focus:outline-none min-h-[44px]"
          />

          <button
            type="submit"
            disabled={generating}
            className="px-5 py-2 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg text-xs shadow flex items-center justify-center gap-1.5 min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            {generating ? 'Generating...' : 'Issue Access Code'}
          </button>
        </form>
      </div>

      {/* Access Codes Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Active & Redeemed Institutional Codes
          </h4>
          <span className="text-xs font-mono text-gray-500">{codes.length} Total Codes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b text-gray-600 font-bold uppercase text-[11px]">
                <th className="p-3 pl-4">Access Code</th>
                <th className="p-3">Designated Role</th>
                <th className="p-3">Assigned Organization</th>
                <th className="p-3">Status</th>
                <th className="p-3">Redeemed By</th>
                <th className="p-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 pl-4 font-mono font-bold text-gray-900 flex items-center gap-2">
                    <span>{c.code}</span>
                    <button
                      onClick={() => copyCode(c.code)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Copy code"
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                  <td className="p-3 capitalize font-medium text-gray-700">
                    {c.role_type}
                  </td>
                  <td className="p-3 font-semibold text-gray-900">
                    {c.org_name}
                  </td>
                  <td className="p-3">
                    {c.is_used ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600">
                        Redeemed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-[#1B5E20]">
                        Active (Unused)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-500">
                    {c.redeemed_profile?.name ? (
                      <span>{c.redeemed_profile.name} ({c.redeemed_profile.email})</span>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right pr-4">
                    {!c.is_used ? (
                      <button
                        onClick={() => handleRevoke(c.id, c.code)}
                        className="text-red-700 hover:text-red-900 font-semibold text-xs p-1"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
