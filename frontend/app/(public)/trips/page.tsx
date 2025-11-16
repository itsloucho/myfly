'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTenantSlug, publicApiClient } from '@/lib/public-api';
import { useThemeStore } from '@/lib/store';
import { Airplane, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { getStorageUrl } from '@/lib/utils';

interface Trip {
  id: number;
  title: string;
  slug: string;
  type: string;
  description: string;
  price: string | null;
  min_price: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  duration_nights: number | null;
  destination: string | null;
  featured_image: string | null;
  status: string;
  created_at: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useThemeStore();

  const formatPrice = (value?: string | null) => {
    if (!value) return null;
    const amount = Number(value);
    if (Number.isNaN(amount)) return null;
    return `${amount.toLocaleString('fr-DZ')} DZD`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-GB');
  };

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tenantSlug = getTenantSlug();
        if (tenantSlug) {
          const response = await publicApiClient.getTrips(tenantSlug, {
            search: searchQuery || undefined,
          });
          setTrips(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [searchQuery]);

  return (
    <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#3F3651]' : 'bg-gray-50'}`}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-[#F6F4FF]' : 'text-gray-900'
          }`}>
            All Trips
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <MagnifyingGlass
              size={20}
              weight="bold"
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-[#3a2f4a] border-[#3a2f4a] text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#8A77ED]`}
            />
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {searchQuery ? 'No trips found matching your search' : 'No trips available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.type}/${trip.slug}`}>
                <div
                  className={`rounded-lg border overflow-hidden hover:shadow-lg transition-shadow ${
                    isDark
                      ? 'bg-[#3a2f4a] border-[#3a2f4a]'
                      : 'bg-white border-gray-200'
                  }`}
                  style={{
                    boxShadow: isDark
                      ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)'
                      : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {/* Image */}
                  <div className={`h-48 relative ${
                    isDark ? 'bg-[#271f36]' : 'bg-gray-200'
                  }`}>
                    {trip.featured_image && getStorageUrl(trip.featured_image) ? (
                      <Image
                        src={getStorageUrl(trip.featured_image) ?? ''}
                        alt={trip.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Airplane size={48} weight="fill" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className={`font-semibold text-lg mb-2 line-clamp-1 ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {trip.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {trip.description || 'No description available'}
                    </p>
                    <div className="space-y-1 mt-4 text-sm">
                      {formatPrice(trip.price) && (
                        <p className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {formatPrice(trip.price)}
                        </p>
                      )}
                      {formatPrice(trip.min_price) && (
                        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                          Minor price: {formatPrice(trip.min_price)}
                        </p>
                      )}
                      {trip.destination && (
                        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                          Destination: {trip.destination}
                        </p>
                      )}
                      {(trip.duration_days || trip.duration_nights) && (
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {trip.duration_days ? `${trip.duration_days} days` : ''}
                          {trip.duration_nights ? ` / ${trip.duration_nights} nights` : ''}
                        </p>
                      )}
                      {trip.start_date && trip.end_date && (
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

