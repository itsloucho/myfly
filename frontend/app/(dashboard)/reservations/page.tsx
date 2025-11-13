'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash, Plus } from '@phosphor-icons/react/dist/ssr';

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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    booking_type: '',
    status: '',
  });

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.booking_type) params.append('booking_type', filter.booking_type);
      if (filter.status) params.append('status', filter.status);

      const response = await api.get(`/reservations?${params.toString()}`);
      setReservations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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
  };

  const getTypeColor = (type: string) => {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2B2B2E' }}>Réservations</h1>
          <p className="text-gray-600">Manage all your reservations</p>
        </div>
        <Link href="/reservations/new">
          <Button>
            <Plus size={20} className="mr-2" weight="bold" />
            Add New Reservation
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div 
        className="bg-white rounded-lg p-4 mb-6 border border-gray-200"
        style={{ boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              value={filter.booking_type}
              onChange={(e) => setFilter({ ...filter, booking_type: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded-md"
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
              className="w-full h-10 px-3 border border-gray-300 rounded-md"
            >
              <option value="">Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select className="w-full h-10 px-3 border border-gray-300 rounded-md">
              <option value="">Total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div 
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        style={{ boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
      >
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  #{reservation.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reservation.customer_name}
                  </div>
                  <div className="text-sm text-gray-500">{reservation.customer_phone}</div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {reservation.total_amount.toFixed(2)} DA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Eye size={18} />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Pencil size={18} />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded text-red-600">
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reservations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

