'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Pencil, Trash } from '@phosphor-icons/react/dist/ssr';

interface Trip {
  id: number;
  title: string;
  slug: string;
  description: string;
  featured_image: string | null;
  status: string;
  created_at: string;
}

export default function VoyagesPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter((trip) => trip.id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
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
          <h1 className="text-2xl font-bold" style={{ color: '#2B2B2E' }}>Voyages</h1>
          <p className="text-gray-600">Manage your travel packages</p>
        </div>
        <Link href="/voyages/new">
          <Button>
            <Plus size={20} className="mr-2" weight="bold" />
            Add New Trip
          </Button>
        </Link>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            style={{ boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
          >
            {/* Image */}
            <div className="h-48 bg-gray-200 relative">
              {trip.featured_image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${trip.featured_image}`}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <span
                className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  trip.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {trip.status}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{trip.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {trip.description || 'No description'}
              </p>
              <div className="text-xs text-gray-500 mb-4">
                Created {new Date(trip.created_at).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href={`/voyages/${trip.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye size={16} className="mr-2" />
                    View
                  </Button>
                </Link>
                <Link href={`/voyages/${trip.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil size={16} />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTrip(trip.id)}
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
          <p className="text-gray-500 mb-4">No trips found</p>
          <Link href="/voyages/new">
            <Button>
              <Plus size={20} className="mr-2" weight="bold" />
              Create Your First Trip
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

