'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Airplane, CalendarCheck, Users, CurrencyDollar } from '@phosphor-icons/react/dist/ssr';

interface Stats {
  total_reservations: number;
  pending_reservations: number;
  confirmed_reservations: number;
  total_revenue: number;
}

export default function AccueilPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reservations/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Voyages',
      value: stats?.total_reservations || 0,
      icon: Airplane,
      color: '#8A77ED',
    },
    {
      title: 'Total Réservations',
      value: stats?.confirmed_reservations || 0,
      icon: CalendarCheck,
      color: '#10B981',
    },
    {
      title: 'Utilisateurs',
      value: 0, // This would come from a separate endpoint
      icon: Users,
      color: '#F59E0B',
    },
    {
      title: 'Revenu Total',
      value: `${stats?.total_revenue?.toFixed(2) || 0} DA`,
      icon: CurrencyDollar,
      color: '#EF4444',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#2B2B2E' }}>Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white p-6 hover:shadow-lg transition-shadow"
              style={{ 
                borderRadius: '20px',
                border: '1px solid #EFF0F6',
                boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#2B2B2E' }}>{stat.title}</p>
                  <p className="text-2xl font-bold" style={{ color: '#2B2B2E' }}>{stat.value}</p>
                </div>
                <div
                  className="flex items-center justify-center"
                  style={{ 
                    backgroundColor: '#F6F4FF',
                    minWidth: '34px',
                    minHeight: '34px',
                    padding: '12px',
                    borderRadius: '8px'
                  }}
                >
                  <Icon size={16} weight="fill" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart placeholder */}
      <div 
        className="bg-white p-6"
        style={{ 
          borderRadius: '20px',
          border: '1px solid #EFF0F6',
          boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#2B2B2E' }}>Recent Activity</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p>Charts and graphs coming soon</p>
            <p className="text-sm mt-2">Your analytics will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

