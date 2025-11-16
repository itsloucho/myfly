'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useAuthStore, useThemeStore } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, fetchUser } = useAuthStore();
  const { initTheme, isDark } = useThemeStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (mounted) {
      if (!token) {
        router.push('/auth');
      } else {
        fetchUser();
      }
    }
  }, [mounted, token, fetchUser, router]);

  // Prevent hydration mismatch: always render the same structure on server and initial client render
  if (!mounted) {
    return null;
  }

  // After mount, check token and redirect if needed
  if (!token) {
    return null;
  }

  return (
    <div className={`flex h-screen ${isDark ? 'bg-[#271f36]' : 'bg-gray-50'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#271f36]' : 'bg-gray-50'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

