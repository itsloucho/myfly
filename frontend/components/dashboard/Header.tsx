'use client';

import {
  MoonStars,
  SunDim,
  BellSimple,
  CaretDown,
  MagnifyingGlass,
  User as UserIcon,
  ChartBar as SubIcon,
  SignOut,
} from '@phosphor-icons/react/dist/ssr';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';

export function Header() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth');
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className={`h-16 pt-10 pb-10 border-b flex items-center justify-between px-6 ${
        isDark 
          ? 'bg-[#271f36] border-[#3a2f4a]' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Search Button - Left Side */}
        <button
          onClick={() => setSearchOpen(true)}
          className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
            isDark 
              ? 'bg-[#3a2f4a] hover:bg-[#4a3f5a] border-[#3a2f4a]' 
              : 'bg-white hover:bg-gray-50 border-[#EFF0F6]'
          }`}
          style={{ minWidth: '250px' }}
        >
          <div className="flex items-center gap-2">
            <MagnifyingGlass size={18} weight="bold" className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            <span className={`text-sm hidden sm:inline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Search...
            </span>
          </div>
          <kbd className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded border ${
            isDark 
              ? 'bg-[#271f36] text-gray-400 border-[#3a2f4a]' 
              : 'bg-gray-100 text-gray-500 border-[#EFF0F6]'
          }`}>
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Right Side Icons */}
        <div className="flex items-center gap-3">
          {/* Theme toggle (Moon/Sun icon) */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 flex items-center justify-center rounded-[100px] border transition-all cursor-pointer ${
              isDark 
                ? 'border-[#3a2f4a] hover:bg-[#3a2f4a]' 
                : 'border-[#EFF0F6] hover:bg-white'
            }`}
          >
            {isDark ? (
              <SunDim size={20} weight="fill" className="text-gray-400" />
            ) : (
              <MoonStars size={20} weight="fill" className="text-gray-600" />
            )}
          </button>

          {/* Notifications (Bell icon) */}
          <button
            className={`w-10 h-10 flex items-center justify-center rounded-[100px] border transition-all cursor-pointer relative ${
              isDark 
                ? 'border-[#3a2f4a] hover:bg-[#3a2f4a]' 
                : 'border-[#EFF0F6] hover:bg-white'
            }`}
          >
            <BellSimple size={20} weight="fill" className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User dropdown */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setOpen(!open)}
              className={`flex items-center gap-2 px-2 py-2 rounded-full border transition-all cursor-pointer ${
                isDark 
                  ? 'border-[#3a2f4a] hover:bg-[#3a2f4a]' 
                  : 'border-[#EFF0F6] hover:bg-white'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>

              <div className="flex flex-col items-start leading-tight">
                <span className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.role || 'Agency'}
                </span>
              </div>

              <CaretDown
                size={18}
                weight="fill"
                className={`transition-transform ${isDark ? 'text-gray-400' : 'text-gray-600'} ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div
                className={`absolute right-0 mt-2 w-60 rounded-xl shadow-lg border z-50 ${
                  isDark 
                    ? 'bg-[#3a2f4a] border-[#3a2f4a]' 
                    : 'bg-white border-[#EFF0F6]'
                }`}
              >
                <div className={`px-4 py-3 border-b ${isDark ? 'border-[#4a3f5a]' : 'border-[#EFF0F6]'}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden"
                      style={{ background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)' }}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {user?.name || 'User'}
                      </div>
                      <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.email || ''}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { router.push('/settings'); setOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                    isDark 
                      ? 'text-gray-200 hover:bg-[#4a3f5a]' 
                      : 'text-gray-900 hover:bg-[#F9F9F9]'
                  }`}
                >
                  <UserIcon size={16} weight="bold" className={isDark ? 'text-gray-300' : 'text-gray-700'} />
                  Profile
                </button>
                <button
                  onClick={() => { router.push('/settings'); setOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                    isDark 
                      ? 'text-gray-200 hover:bg-[#4a3f5a]' 
                      : 'text-gray-900 hover:bg-[#F9F9F9]'
                  }`}
                >
                  <SubIcon size={16} weight="bold" className={isDark ? 'text-gray-300' : 'text-gray-700'} />
                  Subscription
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#e9e5ff] text-[#6b5ae0] dark:bg-[#4a3f5a] dark:text-[#cfc6ff]">
                    Pro
                  </span>
                </button>
                <div className={`border-t ${isDark ? 'border-[#4a3f5a]' : 'border-[#EFF0F6]'}`} />
                <button
                  onClick={handleLogout}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 rounded-b-xl cursor-pointer transition-colors ${
                    isDark 
                      ? 'text-red-300 hover:bg-[#4a3f5a]' 
                      : 'text-red-600 hover:bg-[#FDECEC]'
                  }`}
                >
                  <SignOut size={16} weight="bold" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
