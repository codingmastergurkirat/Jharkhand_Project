import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/common/Toast';
import SkipLink from '@/components/common/SkipLink';
import Header from '@/components/common/Header';

export const metadata: Metadata = {
  title: 'Jharkhand Pragati Setu | Collaborative Governance Portal',
  description: 'Government of Jharkhand platform connecting citizens, universities, and industries to solve societal challenges (SIH26043 - Team LIMITLESS).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8F9FA] text-[#1C1B1F] min-h-screen flex flex-col font-sans">
        <ToastProvider>
          <SkipLink />
          <Header />
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8" tabIndex={-1}>
            {children}
          </main>
          
          <footer className="w-full bg-[#1C1B1F] text-gray-300 text-xs py-6 mt-12 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-semibold text-white">
                  Government of Jharkhand | Collaborative Governance Platform
                </p>
                <p className="text-gray-400 mt-1">
                  Built for Smart India Hackathon (SIH26043) by Team LIMITLESS. Designed in compliance with GIGW & WCAG 2.0 AA.
                </p>
                <p className="text-gray-400 mt-0.5">
                  Statutory citizen data processing compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act 2023).
                </p>
              </div>
              <div className="text-right text-gray-400 flex flex-col items-center sm:items-end">
                <span className="inline-block px-2.5 py-1 bg-green-950 text-emerald-400 rounded border border-green-800 text-[11px] font-mono">
                  State-Wide Live Supabase Sync
                </span>
                <span className="mt-1 text-[11px]">Primary: #1B5E20 | Contrast: ≥4.5:1</span>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
