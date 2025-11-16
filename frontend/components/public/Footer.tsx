'use client';

import { useEffect, useState } from 'react';
import { getTenantSlug } from '@/lib/public-api';
import api from '@/lib/api';
import { useThemeStore } from '@/lib/store';

export function PublicFooter() {
  const [tenantName, setTenantName] = useState<string>('MyFly');
  const { isDark } = useThemeStore();

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const tenantSlug = getTenantSlug();
        if (tenantSlug) {
          // We'll need to add a public endpoint to get tenant info
          // For now, we'll extract from slug or use a default
          const formattedName = tenantSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setTenantName(formattedName || 'MyFly');
        }
      } catch (error) {
        console.error('Error fetching tenant info:', error);
      }
    };

    fetchTenantInfo();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t py-8 mt-16 ${
      isDark
        ? 'bg-[#271f36] border-[#3a2f4a]'
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <p className={`text-center text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          © {currentYear} {tenantName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}


