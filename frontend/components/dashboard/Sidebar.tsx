'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/lib/store';
import {
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
} from '@phosphor-icons/react/dist/ssr';

interface MenuItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active: boolean;
}

const menuItems: MenuItem[] = [
  { icon: HouseLine, label: 'Accueil', href: '/accueil', active: true },
  { icon: CalendarCheck, label: 'Bookings', href: '/reservations', active: true },
  { icon: Users, label: 'Clients', href: '/clients', active: true },
  { icon: Airplane, label: 'Trips', href: '/voyages', active: true },
  { icon: Ticket, label: 'Tickets', href: '/billets', active: true },
  { icon: Building, label: 'Hôtels', href: '/hotels', active: true },
];

const managementItems: MenuItem[] = [
  { icon: Wallet, label: 'Finances', href: '/finances', active: true },
  { icon: FileText, label: 'Documents', href: '/documents', active: true },
  { icon: PushPin, label: 'Notes', href: '/notes', active: true },
];

const otherItems: MenuItem[] = [
  { icon: ChartBar, label: 'Analytics', href: '/analytics', active: true },
  { icon: Star, label: 'Témoignages', href: '/temoignages', active: true },
  { icon: Gear, label: 'Settings', href: '/settings', active: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isDark } = useThemeStore();

  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive ? 'bg-[#F6F4FF] dark:bg-[#3a2f4a]' : 'hover:bg-gray-50 dark:hover:bg-[#3a2f4a]'
        }`}
      >
        <div className="relative inline-flex items-center justify-center">
          <Icon 
            size={18} 
            weight="fill" 
            style={isActive ? {
              background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: '#8A77ED', // Fallback
            } : {
              color: '#757575'
            }}
            className={!isActive ? 'dark:text-gray-400' : ''}
          />
        </div>
        <span 
          className={`font-medium ${!isActive ? 'dark:text-gray-300' : ''}`}
          style={isActive ? {
            fontSize: '15px',
            background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } : {
            fontSize: '15px',
            color: isDark ? '#F6F4FF' : '#1E1F24'
          }}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <aside className={`w-64 h-screen border-r p-4 flex flex-col ${
      isDark 
        ? 'bg-[#271f36] border-[#3a2f4a]' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Logo */}
      <div className="flex items-center mb-12 mt-4 px-2 ">
        <Image
          src={isDark ? "/darkmode logo.svg" : "/myfly-logo.svg"}
          alt="MyFly Logo"
          width={125}
          height={30}
          className="h-auto"
          style={{ maxWidth: '125px' }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-6">
        <div className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </div>

        <div style={{ marginTop: '16px' }}>
          <h3 className="px-3 text-xs font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Management
          </h3>
          <div className="space-y-1">
            {managementItems.map(renderMenuItem)}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <h3 className="px-3 text-xs font-normal text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Autre
          </h3>
          <div className="space-y-1">
            {otherItems.map(renderMenuItem)}
          </div>
        </div>
      </nav>

      {/* Subscription box */}
      <div className={`mt-4 p-3 rounded-xl border ${
        isDark ? 'border-[#3a2f4a] bg-[#20182e]' : 'border-[#EFF0F6] bg-[#F9F9FF]'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Plan</div>
            <div className="mt-1 inline-flex items-center gap-2">
              <span className="text-sm font-semibold">Pro</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e9e5ff] text-[#6b5ae0] dark:bg-[#4a3f5a] dark:text-[#cfc6ff]">
                Active
              </span>
            </div>
          </div>
          <a
            href="/settings"
            className="text-xs font-semibold px-3 py-1 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
              color: 'white',
            }}
          >
            Upgrade
          </a>
        </div>
        <div className={`mt-2 text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Explore Basic • Pro • Max plans
        </div>
      </div>
    </aside>
  );
}

