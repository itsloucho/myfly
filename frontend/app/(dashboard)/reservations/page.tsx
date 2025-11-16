'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Pencil, Trash, Plus, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: number;
  booking_type: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total_amount: number;
  created_at: string;
  trip?: {
    title: string;
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [allBookings, setAllBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useThemeStore();
  const [filter, setFilter] = useState({
    booking_type: '',
    status: '',
  });

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.booking_type) params.append('booking_type', filter.booking_type);
      if (filter.status) params.append('status', filter.status);

      const response = await api.get(`/reservations?${params.toString()}`);
      const data = response.data.data || [];
      setAllBookings(data);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setBookings(allBookings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allBookings.filter((booking) => {
      return (
        booking.customer_name.toLowerCase().includes(query) ||
        booking.customer_phone.includes(query) ||
        booking.booking_type.toLowerCase().includes(query) ||
        (booking.trip?.title && booking.trip.title.toLowerCase().includes(query))
      );
    });
    setBookings(filtered);
  }, [searchQuery, allBookings]);

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'confirmed':
          return 'bg-green-900/50 text-green-300';
        case 'processing':
          return 'bg-blue-900/50 text-blue-300';
        case 'pending':
          return 'bg-yellow-900/50 text-yellow-300';
        case 'cancelled':
          return 'bg-red-900/50 text-red-300';
        default:
          return 'bg-[#4a3f5a] text-gray-300';
      }
    } else {
      switch (status) {
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'processing':
          return 'bg-blue-100 text-blue-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getTypeColor = (type: string) => {
    if (isDark) {
      switch (type) {
        case 'trip':
          return 'bg-purple-900/50 text-purple-300';
        case 'ticket':
          return 'bg-blue-900/50 text-blue-300';
        case 'hotel':
          return 'bg-orange-900/50 text-orange-300';
        default:
          return 'bg-[#4a3f5a] text-gray-300';
      }
    } else {
      switch (type) {
        case 'trip':
          return 'bg-purple-100 text-purple-800';
        case 'ticket':
          return 'bg-blue-100 text-blue-800';
        case 'hotel':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all your bookings</p>
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
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-3 text-sm ${
                isDark
                  ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <Link href="/reservations/new">
            <Button>
              <Plus size={20} className="mr-2" weight="fill" />
              Add New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div 
        className={`rounded-lg p-4 mb-6 border ${
          isDark 
            ? 'bg-[#3a2f4a] border-[#3a2f4a]' 
            : 'bg-white border-gray-200'
        }`}
        style={{ boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              value={filter.booking_type}
              onChange={(e) => setFilter({ ...filter, booking_type: e.target.value })}
              className={`w-full h-10 px-3 border rounded-md ${
                isDark 
                  ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All dates</option>
              <option value="trip">Trip</option>
              <option value="ticket">Ticket</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>
          <div>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className={`w-full h-10 px-3 border rounded-md ${
                isDark 
                  ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select className={`w-full h-10 px-3 border rounded-md ${
              isDark 
                ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option value="">Total</option>
            </select>
          </div>
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
                #ID
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Customer
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Type
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Date
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Total
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark 
              ? 'bg-[#3a2f4a] divide-[#4a3f5a]' 
              : 'bg-white divide-gray-200'
          }`}>
            {bookings.map((reservation) => (
              <tr key={reservation.id} className={isDark ? 'hover:bg-[#4a3f5a]' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  #{reservation.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => router.push(`/reservations/${reservation.id}`)}
                    className="text-left hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {reservation.customer_name}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {reservation.customer_phone}
                    </div>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      reservation.booking_type
                    )}`}
                  >
                    {reservation.booking_type}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(reservation.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      reservation.status
                    )}`}
                  >
                    {reservation.status}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {typeof reservation.total_amount === 'number' 
                    ? reservation.total_amount.toFixed(2) 
                    : parseFloat(reservation.total_amount || '0').toFixed(2)} DA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/reservations/${reservation.id}`)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isDark 
                          ? 'hover:bg-[#4a3f5a] text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => router.push(`/reservations/${reservation.id}`)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isDark 
                          ? 'hover:bg-[#4a3f5a] text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Pencil size={18} />
                    </button>
                    <button className={`p-1.5 rounded transition-colors cursor-pointer ${
                      isDark 
                        ? 'hover:bg-red-900/30 text-red-400' 
                        : 'hover:bg-red-50 text-red-600'
                    }`}>
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

