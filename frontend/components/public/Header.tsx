'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { List, X } from '@phosphor-icons/react/dist/ssr';
import { useThemeStore } from '@/lib/store';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark } = useThemeStore();

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Trips', href: '/trips/voyage' },
    { label: 'Tickets', href: '/trips/ticket' },
    { label: 'Hotels', href: '/trips/hotel' },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b ${
      isDark
        ? 'bg-[#271f36] border-[#3a2f4a]'
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={isDark ? "/darkmode logo.svg" : "/myfly-logo.svg"}
              alt="MyFly Logo"
              width={120}
              height={30}
              className="h-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-gray-300 hover:text-[#F6F4FF]'
                    : 'text-gray-700 hover:text-[#8A77ED]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-gray-300 hover:bg-[#3a2f4a]'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {mobileMenuOpen ? (
              <X size={24} weight="regular" />
            ) : (
              <List size={24} weight="regular" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-[#3a2f4a]">
            <div className="flex flex-col gap-4 pt-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:text-[#F6F4FF]'
                      : 'text-gray-700 hover:text-[#8A77ED]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

