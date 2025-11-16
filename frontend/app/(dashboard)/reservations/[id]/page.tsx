'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash, Pencil } from '@phosphor-icons/react/dist/ssr';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getStorageUrl } from '@/lib/utils';

interface Booking {
  id: number;
  booking_type: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_data: any;
  total_amount: number;
  admin_note: string | null;
  status_history: Array<{
    from: string;
    to: string;
    changed_by: string;
    changed_at: string;
  }> | null;
  created_at: string;
  trip?: {
    id: number;
    title: string;
    description: string | null;
    featured_image: string | null;
    gallery: string[] | null;
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });

  useEffect(() => {
    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/reservations/${params.id}`);
      setBooking(response.data);
      setNoteValue(response.data.admin_note || '');
      setSelectedStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!booking || selectedStatus === booking.status) return;

    try {
      await api.put(`/reservations/${booking.id}`, { status: selectedStatus });
      await fetchBooking();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleNoteSave = async () => {
    if (!booking) return;

    try {
      await api.put(`/reservations/${booking.id}`, { admin_note: noteValue });
      setEditingNote(false);
      await fetchBooking();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;

    try {
      await api.delete(`/reservations/${booking.id}`);
      router.push('/reservations');
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Booking not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/reservations')}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-[#4a3f5a] text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ArrowLeft size={20} weight="fill" />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>
            Booking #{booking.id}
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Content: 70/30 Layout */}
      <div className="grid grid-cols-10 gap-6">
        {/* Left Column: 70% */}
        <div className="col-span-7 space-y-6">
          {/* Client Info Box */}
          <div
            className={`rounded-lg border p-6 ${
              isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'
            }`}
            style={{
              boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Client Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {booking.customer_name}
                </p>
              </div>
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {booking.customer_phone}
                </p>
              </div>
              {booking.customer_email && (
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                  <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {booking.customer_email}
                  </p>
                </div>
              )}
              {booking.booking_data && Object.keys(booking.booking_data).length > 0 && (
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Additional Information
                  </p>
                  <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {Object.entries(booking.booking_data).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details Box */}
          {booking.trip && (
            <div
              className={`rounded-lg border p-6 ${
                isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'
              }`}
              style={{
                boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Trip Details
              </h2>
              <div className="space-y-3">
                {booking.trip.featured_image && getStorageUrl(booking.trip.featured_image) && (
                  <div className="mb-4">
                    <img
                      src={getStorageUrl(booking.trip.featured_image) ?? undefined}
                      alt={booking.trip.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Title</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {booking.trip.title}
                  </p>
                </div>
                {booking.trip.description && (
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Description
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {booking.trip.description}
                    </p>
                  </div>
                )}
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Type</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isDark
                        ? booking.booking_type === 'trip'
                          ? 'bg-purple-900/50 text-purple-300'
                          : booking.booking_type === 'ticket'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-orange-900/50 text-orange-300'
                        : booking.booking_type === 'trip'
                        ? 'bg-purple-100 text-purple-800'
                        : booking.booking_type === 'ticket'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {booking.booking_type}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Note Box */}
          <div
            className={`rounded-lg border p-6 ${
              isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'
            }`}
            style={{
              boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Booking Note
              </h2>
              {!editingNote && (
                <button
                  onClick={() => setEditingNote(true)}
                  className={`p-1.5 rounded transition-colors ${
                    isDark ? 'hover:bg-[#4a3f5a] text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Pencil size={16} weight="fill" />
                </button>
              )}
            </div>
            {editingNote ? (
              <div className="space-y-3">
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Add a note about this booking..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md resize-none ${
                    isDark
                      ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <div className="flex gap-2">
                  <Button onClick={handleNoteSave} size="sm">
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingNote(false);
                      setNoteValue(booking.admin_note || '');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {booking.admin_note || 'No note added yet. Click the edit icon to add one.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: 30% */}
        <div className="col-span-3 space-y-6">
          {/* Status Update & Delete Box */}
          <div
            className={`rounded-lg border p-6 ${
              isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'
            }`}
            style={{
              boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Actions
            </h2>
            <div className="space-y-4">
              <div>
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark
                      ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {selectedStatus !== booking.status && (
                  <Button onClick={handleStatusUpdate} className="w-full mt-2" size="sm">
                    Update Status
                  </Button>
                )}
              </div>
              <div className="pt-4 border-t" style={{ borderColor: isDark ? '#4a3f5a' : '#E5E7EB' }}>
                <Button
                  onClick={() => setDeleteConfirm({ isOpen: true })}
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  <Trash size={16} className="mr-2" weight="fill" />
                  Delete Booking
                </Button>
              </div>
            </div>
          </div>

          {/* Changes History Box */}
          <div
            className={`rounded-lg border p-6 ${
              isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'
            }`}
            style={{
              boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Changes History
            </h2>
            {booking.status_history && booking.status_history.length > 0 ? (
              <div className="space-y-3">
                {booking.status_history.map((change, index) => (
                  <div
                    key={index}
                    className={`pb-3 ${
                      index < booking.status_history!.length - 1
                        ? 'border-b'
                        : ''
                    }`}
                    style={{ borderColor: isDark ? '#4a3f5a' : '#E5E7EB' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${getStatusColor(
                          change.from
                        )}`}
                      >
                        {change.from}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>→</span>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${getStatusColor(
                          change.to
                        )}`}
                      >
                        {change.to}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      by {change.changed_by}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(change.changed_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No status changes yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
      />
    </div>
  );
}


