'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from './Toast';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, Globe, Landmark } from 'lucide-react';

export default function Header() {
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLanguageClick = (lang: 'en' | 'hi') => {
    if (lang === 'hi') {
      showToast('Hindi localization is simulated for this MVP demo.', 'info');
      setLanguage('hi');
    } else {
      setLanguage('en');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('Logged out successfully.', 'info');
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/citizen', label: 'Citizen Portal' },
    { href: '/university', label: 'University Portal' },
    { href: '/industry', label: 'Industry CSR' },
    { href: '/admin', label: 'Admin Command' },
  ];

  return (
    <header className="w-full bg-[#1B5E20] text-white shadow-md">
      {/* Top Accessibility Strip */}
      <div className="bg-[#144718] text-xs px-4 py-1.5 border-b border-green-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide">जन समाधान | Jan Samadhan</span>
            <span className="text-green-300">|</span>
            <span className="text-green-200">National Citizen Problem Resolution Platform</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-xs" role="group" aria-label="Language Selector">
              <Globe className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              <button
                onClick={() => handleLanguageClick('en')}
                className={`px-1.5 py-0.5 rounded font-medium transition ${
                  language === 'en' ? 'bg-white text-[#1B5E20] font-bold' : 'text-gray-200 hover:text-white'
                }`}
                aria-pressed={language === 'en'}
              >
                English
              </button>
              <span className="text-green-400">|</span>
              <button
                onClick={() => handleLanguageClick('hi')}
                className={`px-1.5 py-0.5 rounded font-medium transition ${
                  language === 'hi' ? 'bg-white text-[#1B5E20] font-bold' : 'text-gray-200 hover:text-white'
                }`}
                aria-pressed={language === 'hi'}
              >
                हिन्दी
              </button>
            </div>

            {/* Live Profile Indicator */}
            {currentUser && userProfile && (
              <div className="flex items-center gap-1.5 text-xs bg-green-900/60 px-2 py-0.5 rounded border border-green-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="capitalize font-semibold text-amber-300">
                  {userProfile.role}: {userProfile.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-3 focus-visible:ring-[#E65100]">
          <div className="w-11 h-11 rounded-full bg-white text-[#1B5E20] flex items-center justify-center font-bold text-xl shadow-inner border-2 border-amber-400">
            <Landmark className="w-6 h-6 text-[#1B5E20]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              Jan Samadhan (जन समाधान)
            </h1>
            <p className="text-xs text-green-200 font-medium">
              Collaborative Public Challenge Resolution & Innovation Portal
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav aria-label="Main Navigation" className="flex flex-wrap items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded text-sm font-semibold transition min-h-[44px] flex items-center ${
                  isActive
                    ? 'bg-white text-[#1B5E20] shadow-sm font-bold'
                    : 'text-white hover:bg-green-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Auth State Button */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 bg-red-800/80 hover:bg-red-800 text-white rounded text-sm font-semibold flex items-center gap-1.5 transition min-h-[44px]"
              aria-label="Log Out from platform"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-bold flex items-center gap-1.5 transition shadow-sm min-h-[44px]"
            >
              <User className="w-4 h-4" />
              <span>Login / Register</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
