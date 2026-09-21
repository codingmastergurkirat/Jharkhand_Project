'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import QuickLoginDrawer from '@/components/common/QuickLoginDrawer';
import { JHARKHAND_DISTRICTS, SUBMITTER_TYPES } from '@/lib/constants';
import { Lock, Mail, User, Building, GraduationCap, Key, ArrowRight, Smartphone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regRole, setRegRole] = useState<'citizen' | 'university' | 'industry'>('citizen');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDistrict, setRegDistrict] = useState<string>('Ranchi');
  const [regSubmitterType, setRegSubmitterType] = useState<string>('Citizen');
  const [regOrgName, setRegOrgName] = useState('');
  const [regAccessCode, setRegAccessCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginIdentifier.trim(),
        password: loginPassword,
      });

      if (error) {
        showToast(error.message, 'error');
      } else if (data.user) {
        showToast('Login successful! Redirecting...', 'success');

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role || 'citizen';
        if (role === 'admin') router.push('/admin');
        else if (role === 'university') router.push('/university');
        else if (role === 'industry') router.push('/industry');
        else router.push('/citizen');

        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpMock = () => {
    showToast('SMS OTP is disabled in demo mode; please use email/password.', 'warning');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (regRole === 'university' || regRole === 'industry') {
        if (!regAccessCode.trim()) {
          showToast('An 8-character Access Code is mandatory for institutional onboarding.', 'error');
          setLoading(false);
          return;
        }

        const { data: codeCheck, error: codeErr } = await supabase
          .from('access_codes')
          .select('*')
          .eq('code', regAccessCode.trim().toUpperCase())
          .eq('role_type', regRole)
          .single();

        if (codeErr || !codeCheck) {
          showToast('Invalid Access Code for ' + regRole + ' role.', 'error');
          setLoading(false);
          return;
        }

        if (codeCheck.is_used) {
          showToast('This Access Code has already been redeemed.', 'error');
          setLoading(false);
          return;
        }
      }

      const userMetadata: Record<string, any> = {
        name: regName,
        role: regRole,
        district: regDistrict,
      };

      if (regRole === 'citizen') {
        userMetadata.submitter_type = regSubmitterType;
      } else {
        userMetadata.org_name = regOrgName;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: userMetadata,
        },
      });

      if (signUpError) {
        showToast(signUpError.message, 'error');
        setLoading(false);
        return;
      }

      if ((regRole === 'university' || regRole === 'industry') && signUpData.user) {
        await supabase.rpc('redeem_access_code', {
          p_code: regAccessCode.trim().toUpperCase(),
          p_user_id: signUpData.user.id,
          p_role: regRole,
        });
      }

      showToast('Registration successful! Redirecting...', 'success');
      if (regRole === 'university') router.push('/university');
      else if (regRole === 'industry') router.push('/industry');
      else router.push('/citizen');

      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <QuickLoginDrawer />

      <div className="bg-white border rounded-xl shadow-md overflow-hidden max-w-xl mx-auto">
        <div className="grid grid-cols-2 border-b text-center font-bold text-sm">
          <button
            onClick={() => setActiveTab('login')}
            className={`py-4 transition min-h-[44px] flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'border-b-4 border-[#1B5E20] text-[#1B5E20] bg-green-50/50'
                : 'text-gray-500 hover:text-gray-900 bg-gray-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            Portal Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`py-4 transition min-h-[44px] flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'border-b-4 border-[#1B5E20] text-[#1B5E20] bg-green-50/50'
                : 'text-gray-500 hover:text-gray-900 bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            Register Account
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Email / Mobile Number <span className="text-[#B3261E]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. ramesh.citizen@gmail.com or official email"
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-base focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Password <span className="text-[#B3261E]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-base focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {loading ? 'Authenticating...' : 'Sign In with Password'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleOtpMock}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg border transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Smartphone className="w-4 h-4 text-gray-600" />
                  Login with OTP
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Admins and registered citizens may sign in directly with their credentials.
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Select User Role <span className="text-[#B3261E]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('citizen')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                      regRole === 'citizen'
                        ? 'bg-green-50 border-[#1B5E20] text-[#1B5E20] shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('university')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                      regRole === 'university'
                        ? 'bg-green-50 border-[#1B5E20] text-[#1B5E20] shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    University
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('industry')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                      regRole === 'industry'
                        ? 'bg-green-50 border-[#1B5E20] text-[#1B5E20] shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    Industry
                  </button>
                </div>
              </div>

              {regRole !== 'citizen' && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1 text-[#E65100]">
                    <Key className="w-4 h-4" />
                    Institutional Verification Required
                  </div>
                  <p className="mt-1">
                    Universities and Industries require a single-use 8-character Access Code issued by Portal Admin (e.g. <code>UNIV-JH-8821</code>).
                  </p>
                </div>
              )}

              {regRole !== 'citizen' && (
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Verification Access Code <span className="text-[#B3261E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regAccessCode}
                    onChange={(e) => setRegAccessCode(e.target.value.toUpperCase())}
                    placeholder="e.g. UNIV-JH-8821 or IND-JH-9132"
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm uppercase focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                  />
                </div>
              )}

              {regRole !== 'citizen' && (
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Institution / Company Name <span className="text-[#B3261E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regOrgName}
                    onChange={(e) => setRegOrgName(e.target.value)}
                    placeholder="e.g. Kolhan University or Hindalco Industries"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Full Name of Representative <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Verma or Priya Singh"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Official Email Address <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="contact@example.gov.in"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Create Password (min 6 characters) <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  District Jurisdiction <span className="text-[#B3261E]">*</span>
                </label>
                <select
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                >
                  {JHARKHAND_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} District
                    </option>
                  ))}
                </select>
              </div>

              {regRole === 'citizen' && (
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Submitter Category <span className="text-[#B3261E]">*</span>
                  </label>
                  <select
                    value={regSubmitterType}
                    onChange={(e) => setRegSubmitterType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-3 focus:ring-[#E65100] focus:outline-none"
                  >
                    {SUBMITTER_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                {loading ? 'Creating Profile...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-gray-500 text-center">
                Protected under the Digital Personal Data Protection Act, 2023 (DPDP Act 2023).
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
