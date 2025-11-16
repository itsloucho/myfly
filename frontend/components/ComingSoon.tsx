'use client';

import { useThemeStore } from '@/lib/store';

export function ComingSoon({ title }: { title: string }) {
  const { isDark } = useThemeStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">This feature is coming soon</p>
        <div 
          className="inline-flex px-4 py-2 rounded-lg"
          style={{ 
            background: isDark 
              ? 'linear-gradient(180deg, rgba(176, 159, 255, 0.2) 7%, rgba(138, 119, 237, 0.2) 46%)'
              : 'linear-gradient(180deg, rgba(176, 159, 255, 0.1) 7%, rgba(138, 119, 237, 0.1) 46%)',
            color: isDark ? '#B09FFF' : '#8A77ED'
          }}
        >
          Under Development
        </div>
      </div>
    </div>
  );
}

