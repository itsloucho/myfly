'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useThemeStore, useAuthStore } from '@/lib/store';
import { getStorageUrl, buildTenantTripUrl } from '@/lib/utils';
import { tripsService, type Trip } from '@/lib/services/trips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Eye, Pencil, Trash, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; tripId: number | null }>({
    isOpen: false,
    tripId: null,
  });
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = (await tripsService.list()).filter((trip) => trip.type === 'voyage');
      setAllTrips(data);
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTrips(allTrips);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allTrips.filter((trip) => {
      return (
        trip.title.toLowerCase().includes(query) ||
        (trip.description && trip.description.toLowerCase().includes(query))
      );
    });
    setTrips(filtered);
  }, [searchQuery, allTrips]);

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ isOpen: true, tripId: id });
  };

  const deleteTrip = async () => {
    if (!deleteConfirm.tripId) return;

    try {
      await tripsService.delete(deleteConfirm.tripId);
      setTrips(trips.filter((trip) => trip.id !== deleteConfirm.tripId));
      setDeleteConfirm({ isOpen: false, tripId: null });
    } catch (error) {
      console.error('Error deleting trip:', error);
      setDeleteConfirm({ isOpen: false, tripId: null });
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>Trips</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your travel packages</p>
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
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-3 text-sm ${
                isDark
                  ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <Link href="/voyages/new">
            <Button>
              <Plus size={20} className="mr-2" weight="fill" />
              Add New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className={`rounded-lg border overflow-hidden hover:shadow-lg transition-shadow ${
              isDark 
                ? 'bg-[#3a2f4a] border-[#3a2f4a]' 
                : 'bg-white border-gray-200'
            }`}
            style={{ boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
          >
            {/* Image */}
            <div className={`h-48 relative ${
              isDark ? 'bg-[#271f36]' : 'bg-gray-200'
            }`}>
              {trip.featured_image && getStorageUrl(trip.featured_image) ? (
                <img
                  src={getStorageUrl(trip.featured_image) ?? undefined}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  No image
                </div>
              )}
              <span
                className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  trip.status === 'published'
                    ? isDark
                      ? 'bg-green-900/50 text-green-300'
                      : 'bg-green-100 text-green-800'
                    : isDark
                      ? 'bg-[#4a3f5a] text-gray-300'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {trip.status}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className={`font-semibold text-lg mb-2 line-clamp-1 ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {trip.title}
              </h3>
              <p className={`text-sm mb-4 line-clamp-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {trip.description || 'No description'}
              </p>
              <div className={`text-xs mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Created {new Date(trip.created_at).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={buildTenantTripUrl(trip.slug, user?.tenant?.slug) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye size={16} className="mr-2" />
                    View
                  </Button>
                </a>
                <Link href={`/voyages/${trip.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil size={16} />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(trip.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12">
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No trips found</p>
          <Link href="/voyages/new">
            <Button>
              <Plus size={20} className="mr-2" weight="fill" />
              Create Your First Trip
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={deleteTrip}
        onCancel={() => setDeleteConfirm({ isOpen: false, tripId: null })}
        variant="destructive"
      />
    </div>
  );
}

