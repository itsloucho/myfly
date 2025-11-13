'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  House,
  CalendarCheck,
  Users,
  Airplane,
  Ticket,
  Buildings,
  Wallet,
  FileText,
  NotePencil,
  ChartBar,
  ChatCircleText,
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
  { icon: House, label: 'Accueil', href: '/accueil', active: true },
  { icon: CalendarCheck, label: 'Réservations', href: '/reservations', active: true },
  { icon: Users, label: 'Clients', href: '/clients', active: false },
  { icon: Airplane, label: 'Voyages', href: '/voyages', active: true },
  { icon: Ticket, label: 'Billets', href: '/billets', active: false },
  { icon: Buildings, label: 'Hôtels', href: '/hotels', active: false },
];

const managementItems: MenuItem[] = [
  { icon: Wallet, label: 'Finances', href: '/finances', active: false },
  { icon: FileText, label: 'Documents', href: '/documents', active: false },
  { icon: NotePencil, label: 'Notes', href: '/notes', active: false },
];

const otherItems: MenuItem[] = [
  { icon: ChartBar, label: 'Analytics', href: '/analytics', active: false },
  { icon: ChatCircleText, label: 'Témoignages', href: '/temoignages', active: false },
  { icon: Gear, label: 'Settings', href: '/settings', active: false },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.active ? item.href : '#'}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          !item.active ? 'cursor-not-allowed' : ''
        } ${isActive ? 'bg-[#F6F4FF]' : ''}`}
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
          />
        </div>
        <span 
          className="font-medium"
          style={isActive ? {
            fontSize: '15px',
            background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } : {
            fontSize: '15px',
            color: !item.active ? '#757575' : '#1E1F24'
          }}
        >
          {item.label}
        </span>
        {!item.active && (
          <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded">Soon</span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center mb-12 mt-4 px-2 ">
        <Image
          src="/myfly-logo.svg"
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
          <h3 className="px-3 text-xs font-normal text-gray-500 uppercase tracking-wider mb-2">
            Management
          </h3>
          <div className="space-y-1">
            {managementItems.map(renderMenuItem)}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <h3 className="px-3 text-xs font-normal text-gray-500 uppercase tracking-wider mb-2">
            Autre
          </h3>
          <div className="space-y-1">
            {otherItems.map(renderMenuItem)}
          </div>
        </div>
      </nav>
    </aside>
  );
}

