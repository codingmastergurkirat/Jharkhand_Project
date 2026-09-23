'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './Toast';
import { Shield, User, GraduationCap, Building2, Key, Check, Copy } from 'lucide-react';

interface QuickAccount {
  role: 'admin' | 'citizen' | 'university' | 'industry';
  name: string;
  email: string;
  pass: string;
  badge: string;
  route: string;
}

const DEMO_ACCOUNTS: QuickAccount[] = [
  {
    role: 'admin',
    name: 'Jan Samadhan Administrator',
    email: 'admin@jansamadhan.gov.in',
    pass: 'Admin@JanSamadhan2026',
    badge: '👑 Portal Admin',
    route: '/admin'
  },
  {
    role: 'citizen',
    name: 'Ramesh Kumar',
    email: 'ramesh.citizen@gmail.com',
    pass: 'Citizen@2026',
    badge: '👤 Citizen (Ranchi)',
    route: '/citizen'
  },
  {
    role: 'university',
    name: 'IIT (ISM) Dhanbad',
    email: 'admin@iitism.ac.in',
    pass: 'Univ@IITISM2026',
    badge: '🎓 Univ (Dhanbad)',
    route: '/university'
  },
  {
    role: 'university',
    name: 'BIT Mesra',
    email: 'admin@bitmesra.ac.in',
    pass: 'Univ@BIT2026',
    badge: '🎓 Univ (Ranchi)',
    route: '/university'
  },
  {
    role: 'university',
    name: 'NIT Jamshedpur',
    email: 'admin@nitjsr.ac.in',
    pass: 'Univ@NIT2026',
    badge: '🎓 Univ (E. Singhbhum)',
    route: '/university'
  },
  {
    role: 'university',
    name: 'Central Univ of Jharkhand',
    email: 'admin@cuj.ac.in',
    pass: 'Univ@CUJ2026',
    badge: '🎓 Univ (Ranchi)',
    route: '/university'
  },
  {
    role: 'university',
    name: 'Usha Martin University',
    email: 'admin@umu.ac.in',
    pass: 'Univ@UMU2026',
    badge: '🎓 Univ (Ranchi)',
    route: '/university'
  },
  {
    role: 'industry',
    name: 'Tata Steel Limited',
    email: 'csr@tatasteel.com',
    pass: 'Ind@Tata2026',
    badge: '🏭 Industry Partner',
    route: '/industry'
  },
  {
    role: 'industry',
    name: 'Central Coalfields Ltd (CCL)',
    email: 'csr@centralcoalfields.in',
    pass: 'Ind@CCL2026',
    badge: '🏭 Industry Partner',
    route: '/industry'
  },
  {
    role: 'industry',
    name: 'Bokaro Steel Plant (SAIL)',
    email: 'csr@sailbokaro.in',
    pass: 'Ind@SAIL2026',
    badge: '🏭 Industry Partner',
    route: '/industry'
  },
  {
    role: 'industry',
    name: 'Eastern Coalfields Ltd (ECL)',
    email: 'csr@easterncoal.gov.in',
    pass: 'Ind@ECL2026',
    badge: '🏭 Industry Partner',
    route: '/industry'
  },
  {
    role: 'industry',
    name: 'Uranium Corp (UCIL)',
    email: 'contact@ucil.gov.in',
    pass: 'Ind@UCIL2026',
    badge: '🏭 Industry Partner',
    route: '/industry'
  }
];

export default function QuickLoginDrawer() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [loggingInEmail, setLoggingInEmail] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleQuickLogin = async (acc: QuickAccount) => {
    setLoggingInEmail(acc.email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: acc.email,
        password: acc.pass
      });

      if (error) {
        showToast(`Login failed: ${error.message}. Ensure database is seeded.`, 'error');
      } else {
        showToast(`Signed in as ${acc.name} (${acc.role})`, 'success');
        if (typeof window !== 'undefined' && window.location.pathname === acc.route) {
          window.location.reload();
        } else {
          router.push(acc.route);
          router.refresh();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoggingInEmail(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Access code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-white border-2 border-[#1B5E20] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#1B5E20] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#E65100]" />
            1-Click Demo Evaluation Logins
          </h2>
          <p className="text-xs text-[#49454F]">
            Instant credentials for all pre-seeded roles. Clicking will automatically authenticate via live secure Auth.
          </p>
        </div>
      </div>

      {/* Grid of quick accounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.email}
            onClick={() => handleQuickLogin(acc)}
            disabled={!!loggingInEmail}
            className={`text-left p-2.5 rounded-lg border text-xs transition min-h-[44px] flex flex-col justify-between ${
              acc.role === 'admin'
                ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-950 font-medium'
                : acc.role === 'citizen'
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-950'
                : acc.role === 'university'
                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-950'
                : 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-950'
            } ${loggingInEmail === acc.email ? 'opacity-50 cursor-wait' : ''}`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold truncate">{acc.badge}</span>
              {loggingInEmail === acc.email && (
                <span className="text-[10px] text-amber-700 animate-pulse font-bold">Signing in...</span>
              )}
            </div>
            <div className="truncate font-semibold text-gray-900">{acc.name}</div>
            <div className="text-[11px] text-gray-500 truncate">{acc.email}</div>
          </button>
        ))}
      </div>

      {/* Test Access Codes for Registration Demo */}
      <div className="mt-4 pt-3 border-t text-xs text-[#49454F] flex flex-wrap items-center justify-between gap-2 bg-[#F8F9FA] p-3 rounded-lg">
        <span className="font-semibold text-gray-800">
          Unused Access Codes for Registration Testing:
        </span>
        <div className="flex flex-wrap gap-2">
          {['UNIV-JH-8821', 'UNIV-JH-4409', 'IND-JH-9132'].map((code) => (
            <button
              key={code}
              onClick={() => copyCode(code)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border rounded font-mono text-xs font-bold text-[#E65100] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#E65100] min-h-[36px]"
              title="Click to copy code"
            >
              {copiedCode === code ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
