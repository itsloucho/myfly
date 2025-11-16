'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { getTenantSlug, publicApiClient } from '@/lib/public-api';
import { useThemeStore } from '@/lib/store';
import { Airplane } from '@phosphor-icons/react/dist/ssr';
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
  airlines: string | null;
  bagages_kg: number | null;
  featured_image: string | null;
  status: string;
  created_at: string;
}

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useThemeStore();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tenantSlug = getTenantSlug();
        if (tenantSlug) {
          const response = await publicApiClient.getTrips(tenantSlug, { page: 1 });
          setTrips(response.data?.slice(0, 6) || []); // Show first 6 trips on home
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  useEffect(() => {
    const { initTheme } = useThemeStore.getState();
    initTheme();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className={`${isDark ? 'bg-[#3F3651]' : 'bg-gray-50'}`}>
          {/* Hero Section */}
      <section className={`py-16 px-4 ${isDark ? 'bg-[#271f36]' : 'bg-white'}`}>
        <div className="container mx-auto text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? 'text-[#F6F4FF]' : 'text-gray-900'
          }`}>
            Discover Amazing Trips
          </h1>
          <p className={`text-lg mb-8 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Book your next adventure with us
          </p>
          <Link href="/trips">
            <button
              className="px-8 py-3 rounded-lg text-white font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
              }}
            >
              Browse All Trips
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className={`text-2xl font-bold mb-8 ${
            isDark ? 'text-[#F6F4FF]' : 'text-gray-900'
          }`}>
            Featured Trips
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No trips available yet</p>
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
                        <img
                          src={getStorageUrl(trip.featured_image) ?? undefined}
                          alt={trip.title}
                          className="w-full h-full object-cover"
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {trips.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/trips">
                <button
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'text-[#F6F4FF] hover:bg-[#3a2f4a]'
                      : 'text-[#8A77ED] hover:bg-gray-100'
                  }`}
                >
                  View All Trips →
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
