'use client';

import React from 'react';
import Link from 'next/link';
import QuickLoginDrawer from '@/components/common/QuickLoginDrawer';
import { 
  PlusCircle, 
  ListChecks, 
  BarChart3, 
  Award, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-10 py-2">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1B5E20] to-[#144718] text-white rounded-2xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold backdrop-blur-sm border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>SIH26043 • Team LIMITLESS • Live Supabase Governance Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Connecting Citizen Challenges with Jharkhand Innovation.
          </h1>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl">
            A collaborative governance platform where citizens report ground challenges, a transparent scoring engine pairs issues with Universities, Industries offer CSR funding, and Government oversees statewide resolution.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              href="/citizen"
              className="px-6 py-3 bg-[#E65100] hover:bg-orange-700 text-white font-bold rounded-xl text-sm shadow transition flex items-center gap-2 min-h-[44px]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report a Societal Problem</span>
            </Link>

            <Link
              href="/citizen"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/30 backdrop-blur-sm transition flex items-center gap-2 min-h-[44px]"
            >
              <ListChecks className="w-5 h-5" />
              <span>Track Reports</span>
            </Link>

            <Link
              href="/admin"
              className="px-6 py-3 bg-white text-[#1B5E20] hover:bg-gray-100 font-bold rounded-xl text-sm shadow transition flex items-center gap-2 min-h-[44px]"
            >
              <BarChart3 className="w-5 h-5 text-[#1B5E20]" />
              <span>View State Impact</span>
            </Link>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Task-Oriented Navigation Cards */}
      <section aria-labelledby="portal-directory-title">
        <h2 id="portal-directory-title" className="text-xl font-bold text-gray-900 mb-4">
          Direct Role Portals & Tasks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Citizen Portal */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#1B5E20] transition flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-green-50 text-[#1B5E20] flex items-center justify-center font-bold mb-3 border border-green-200">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Citizen Portal</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Report local societal bottlenecks, upvote similar district issues (+1 Support), and verify resolution with 1-5 star ratings under DPDP Act 2023.
              </p>
            </div>
            <Link
              href="/citizen"
              className="text-xs font-bold text-[#1B5E20] hover:underline flex items-center gap-1 pt-2"
            >
              <span>Enter Citizen Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2. University Portal */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#1B5E20] transition flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#1B5E20] flex items-center justify-center font-bold mb-3 border border-emerald-200">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">University Dashboard</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Review algorithmically matched challenges, assign faculty mentors and dynamic student teams, manage milestones, and log research learnings.
              </p>
            </div>
            <Link
              href="/university"
              className="text-xs font-bold text-[#1B5E20] hover:underline flex items-center gap-1 pt-2"
            >
              <span>Enter University Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. Industry CSR */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#1B5E20] transition flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3 border border-purple-200">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Industry CSR Network</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Filter vetted university proposals by domain & district. Pledge CSR capital funding, technical mentorship, or equipment access directly.
              </p>
            </div>
            <Link
              href="/industry"
              className="text-xs font-bold text-purple-800 hover:underline flex items-center gap-1 pt-2"
            >
              <span>Enter Industry Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4. Gov Admin */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#1B5E20] transition flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#E65100] flex items-center justify-center font-bold mb-3 border border-amber-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Government Admin</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Oversee state-wide impact analytics, override algorithmic assignments, issue single-use institutional access codes, and audit Before/After proofs.
              </p>
            </div>
            <Link
              href="/admin"
              className="text-xs font-bold text-[#E65100] hover:underline flex items-center gap-1 pt-2"
            >
              <span>Enter Admin Command</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 1-Click Evaluation Drawer */}
      <section aria-labelledby="demo-logins-heading">
        <QuickLoginDrawer />
      </section>

      {/* Transparent Governance Architecture Explanation */}
      <section className="bg-white rounded-xl border p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E65100]" />
          Transparent, Explainable Rule-Based Matching Algorithm
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Unlike opaque AI models, this platform employs a 100% deterministic, explainable scoring engine to allocate public problems to academic institutions across Jharkhand:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-gray-50 rounded-lg border text-xs space-y-1">
            <span className="font-bold text-[#1B5E20] text-sm">1. Domain Specialization (+50)</span>
            <p className="text-gray-600">
              Evaluates direct overlap between problem category (e.g. Water Management, Urban Infrastructure) and university domain tags.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border text-xs space-y-1">
            <span className="font-bold text-[#1B5E20] text-sm">2. District Proximity (+30)</span>
            <p className="text-gray-600">
              Awards proximity bonus when the institution is physically located in the challenge district, ensuring rapid ground field validation.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border text-xs space-y-1">
            <span className="font-bold text-[#1B5E20] text-sm">3. Research Facility Overlap (+20)</span>
            <p className="text-gray-600">
              Extracts technical keywords from title and description, matching against university testing facilities and faculty expertise.
            </p>
          </div>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900 font-medium">
          <strong>Administrative Governance Rule:</strong> While top scoring universities are suggested automatically, the State Administrator can review scoring transparency and override assignments with one click.
        </div>
      </section>
    </div>
  );
}
