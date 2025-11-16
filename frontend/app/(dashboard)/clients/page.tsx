'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

interface Client {
  id: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  total_reservations: number;
  total_spent: number;
  last_booking_date: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useThemeStore();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      const data = response.data.data || [];
      setAllClients(data);
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setClients(allClients);
      return;
    }

    const filtered = allClients.filter((client) => {
      const query = searchQuery.toLowerCase();
      return (
        client.customer_name.toLowerCase().includes(query) ||
        (client.customer_email && client.customer_email.toLowerCase().includes(query)) ||
        client.customer_phone.includes(query)
      );
    });
    setClients(filtered);
  }, [searchQuery, allClients]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>Clients</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your clients and customers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative" style={{ width: '200px' }}>
            <MagnifyingGlass
              size={18}
              weight="bold"
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-3 text-sm ${
                isDark
                  ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <Link href="/clients/new">
            <Button>
              <Plus size={20} className="mr-2" weight="fill" />
              Add New Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div 
        className={`rounded-lg border overflow-hidden ${
          isDark 
            ? 'bg-[#3a2f4a] border-[#3a2f4a]' 
            : 'bg-white border-gray-200'
        }`}
        style={{ boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
      >
        <table className="w-full">
          <thead className={`border-b ${
            isDark 
              ? 'bg-[#271f36] border-[#3a2f4a]' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Client
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Contact
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Bookings
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Total Spent
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Last Booking
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark 
              ? 'bg-[#3a2f4a] divide-[#4a3f5a]' 
              : 'bg-white divide-gray-200'
          }`}>
            {clients.map((client) => (
              <tr key={client.id} className={isDark ? 'hover:bg-[#4a3f5a]' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {/* Profile Image */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                      style={{
                        background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
                      }}
                    >
                      {getInitials(client.customer_name)}
                    </div>
                    {/* Name - Clickable */}
                    <Link 
                      href={`/clients/${client.id}`}
                      className={`text-sm font-medium hover:underline ${
                        isDark ? 'text-[#B09FFF] hover:text-[#8A77ED]' : 'text-gray-900 hover:text-[#8A77ED]'
                      }`}
                    >
                      {client.customer_name}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {client.customer_email || '—'}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {client.customer_phone}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {client.total_reservations}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {typeof client.total_spent === 'number' 
                    ? client.total_spent.toFixed(2) 
                    : parseFloat(client.total_spent || '0').toFixed(2)} DA
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {client.last_booking_date 
                    ? new Date(client.last_booking_date).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
