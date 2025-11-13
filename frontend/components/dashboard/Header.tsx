'use client';

import {
  MoonStars,
  BellSimple,
  CaretDown,
} from '@phosphor-icons/react/dist/ssr';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="h-16 pt-10 pb-10 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1"></div>

      <div className="flex items-center gap-3">
        {/* Theme toggle (Moon icon) */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-[100px] border transition-all cursor-pointer hover:bg-white"
          style={{ borderColor: '#EFF0F6' }}
        >
          <MoonStars size={20} weight="fill" color="rgb(117, 117, 117)" />
        </button>

        {/* Notifications (Bell icon) */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-[100px] border transition-all cursor-pointer hover:bg-white relative"
          style={{ borderColor: '#EFF0F6' }}
        >
          <BellSimple size={20} weight="fill" color="rgb(117, 117, 117)" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User dropdown */}
        <div className="relative user-dropdown">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-2 rounded-full border transition-all cursor-pointer hover:bg-white"
            style={{ borderColor: '#EFF0F6' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>

            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-gray-900">
                {user?.name || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.role || 'Agency'}
              </span>
            </div>

            <CaretDown
              size={18}
              weight="bold"
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50"
              style={{ borderColor: '#EFF0F6' }}
            >
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[#F9F9F9] rounded-t-xl cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
