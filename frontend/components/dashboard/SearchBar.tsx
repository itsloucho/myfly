'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  X,
  HouseLine,
  CalendarCheck,
  Users,
  Airplane,
  Ticket,
  Building,
  Wallet,
  FileText,
  PushPin,
  ChartBar,
  Star,
  Gear,
  User,
  Palette,
} from '@phosphor-icons/react/dist/ssr';

interface SearchItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  category: 'suggestion' | 'settings' | 'page';
}

const searchItems: SearchItem[] = [
  // Suggestions
  { id: 'dashboard', label: 'Dashboard', href: '/accueil', icon: HouseLine, category: 'suggestion' },
  { id: 'settings', label: 'Default Settings', href: '/settings', icon: Gear, category: 'suggestion' },
  
  // Pages
  { id: 'reservations', label: 'Bookings', href: '/reservations', icon: CalendarCheck, category: 'page' },
  { id: 'voyages', label: 'Trips', href: '/voyages', icon: Airplane, category: 'page' },
  { id: 'clients', label: 'Clients', href: '/clients', icon: Users, category: 'page' },
  { id: 'billets', label: 'Tickets', href: '/billets', icon: Ticket, category: 'page' },
  { id: 'hotels', label: 'Hôtels', href: '/hotels', icon: Building, category: 'page' },
  { id: 'finances', label: 'Finances', href: '/finances', icon: Wallet, category: 'page' },
  { id: 'documents', label: 'Documents', href: '/documents', icon: FileText, category: 'page' },
  { id: 'notes', label: 'Notes', href: '/notes', icon: PushPin, category: 'page' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: ChartBar, category: 'page' },
  { id: 'temoignages', label: 'Témoignages', href: '/temoignages', icon: Star, category: 'page' },
  
  // Settings
  { id: 'profile', label: 'Profile', href: '/settings', icon: User, category: 'settings' },
  { id: 'appearance', label: 'Appearance', href: '/settings', icon: Palette, category: 'settings' },
];

const filterChips = [
  { label: 'Bookings', filter: 'reservations' },
  { label: 'Trips', filter: 'voyages' },
  { label: 'Clients', filter: 'clients' },
  { label: 'Settings', filter: 'settings' },
];

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // This will be handled by Header component
        } else {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = searchItems.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || item.category === activeFilter || 
      (activeFilter === 'reservations' && item.id === 'reservations') ||
      (activeFilter === 'voyages' && item.id === 'voyages') ||
      (activeFilter === 'clients' && item.id === 'clients') ||
      (activeFilter === 'settings' && item.category === 'settings');
    
    return matchesSearch && matchesFilter;
  });

  const suggestions = filteredItems.filter(item => item.category === 'suggestion');
  const settings = filteredItems.filter(item => item.category === 'settings');
  const pages = filteredItems.filter(item => item.category === 'page');

  const handleItemClick = (href: string) => {
    router.push(href);
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
        <div
          className="bg-white dark:bg-[#3a2f4a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border dark:border-[#3a2f4a]"
          style={{ border: '1px solid #EFF0F6' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b dark:border-[#3a2f4a]" style={{ borderColor: '#EFF0F6' }}>
            <div className="relative">
              <MagnifyingGlass
                size={20}
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border dark:border-[#3a2f4a] dark:bg-[#271f36] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8A77ED] placeholder-gray-500 dark:placeholder-gray-400"
                style={{ borderColor: '#EFF0F6' }}
              />
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-[#4a3f5a] transition-colors cursor-pointer"
              >
                <X size={16} weight="regular" className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {filterChips.map((chip) => (
                <button
                  key={chip.filter}
                  onClick={() => setActiveFilter(activeFilter === chip.filter ? null : chip.filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeFilter === chip.filter
                      ? 'bg-[#F6F4FF] dark:bg-[#4a3f5a] text-[#8A77ED] dark:text-[#B09FFF]'
                      : 'bg-gray-100 dark:bg-[#271f36] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3a2f5a]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Suggestions
                </h3>
                <div className="space-y-1">
                  {suggestions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#4a3f5a] transition-colors text-left cursor-pointer"
                      >
                        <Icon size={20} weight="fill" className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Settings */}
            {settings.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Settings
                </h3>
                <div className="space-y-1">
                  {settings.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#4a3f5a] transition-colors text-left cursor-pointer"
                      >
                        <Icon size={20} weight="fill" className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pages */}
            {pages.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Pages
                </h3>
                <div className="space-y-1">
                  {pages.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#4a3f5a] transition-colors text-left cursor-pointer"
                      >
                        <Icon size={20} weight="fill" className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No results found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

