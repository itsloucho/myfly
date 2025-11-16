'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTenantSlug, publicApiClient } from '@/lib/public-api';
import { useThemeStore } from '@/lib/store';
import {
  User,
  Phone,
  AirplaneTakeoff,
  AirplaneLanding,
  MapPin,
  Clock,
  CarSimple,
  Ticket,
  Sun,
  Moon,
  Buildings,
  Airplane,
  ForkKnife,
  SuitcaseRolling,
  CaretUp,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
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
  hotel_enabled: boolean;
  hotel_stars: number | null;
  hotel_name: string | null;
  airlines: string | null;
  bagages_kg: number | null;
  lunch_meal: 'included' | 'not_included' | null;
  transport: string | null;
  featured_image: string | null;
  gallery: string[] | null;
  status: string;
  created_at: string;
}

export default function SingleTripPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    customer_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false });
  const { isDark } = useThemeStore();
  const formatCurrency = (value?: string | null) => {
    if (!value) return null;
    const amount = Number(value);
    if (Number.isNaN(amount)) return null;
    return `${amount.toLocaleString('fr-DZ')} DZD`;
  };
  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString('en-GB');
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tenantSlug = getTenantSlug();
        if (tenantSlug && slug) {
          const tripData = await publicApiClient.getTrip(tenantSlug, slug);
          // Only show trip type, not ticket or hotel
          if (tripData.type !== 'voyage') {
            setTrip(null);
            return;
          }
          setTrip(tripData);
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [slug]);

  const nameError = useMemo(() => {
    return bookingForm.customer_name.trim() ? '' : 'Name is required.';
  }, [bookingForm.customer_name]);

  const phoneError = useMemo(() => {
    if (!bookingForm.customer_phone.trim()) return 'Phone number is required.';
    return /^[+]?[\d\s().-]{7,}$/.test(bookingForm.customer_phone.trim())
      ? ''
      : 'Enter a valid phone number.';
  }, [bookingForm.customer_phone]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    if (nameError || phoneError) return;
    setSubmitting(true);

    try {
      await publicApiClient.createReservation({
        trip_id: trip!.id,
        customer_name: bookingForm.customer_name,
        customer_phone: bookingForm.customer_phone,
        booking_type: 'trip',
        total_amount: 0,
      });

      alert('Booking request submitted! You will be contacted soon.');
      setBookingForm({
        customer_name: '',
        customer_phone: '',
      });
      setTouched({ name: false, phone: false });
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error submitting booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#3F3651]' : 'bg-gray-50'}`}>
        <div className="container mx-auto text-center py-12">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip || trip.type !== 'voyage') {
    return (
      <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#3F3651]' : 'bg-gray-50'}`}>
        <div className="container mx-auto text-center py-12">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Trip not found</p>
        </div>
      </div>
    );
  }

  const images = trip.featured_image
    ? [trip.featured_image, ...(trip.gallery || [])]
    : trip.gallery || [];

  return (
    <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#3F3651]' : 'bg-gray-50'}`}>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            {/* Main Featured Image */}
            <div className={`rounded-lg overflow-hidden mb-4 ${
              isDark ? 'bg-[#271f36]' : 'bg-gray-200'
            }`}>
              {trip.featured_image && getStorageUrl(trip.featured_image) ? (
                <img
                  src={getStorageUrl(trip.featured_image) ?? undefined}
                  alt={trip.title}
                  className="w-full h-[400px] object-cover"
                />
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {trip.gallery && trip.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {trip.gallery.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-[#3a2f4a]"
                  >
                    <img
                      src={getStorageUrl(image) ?? undefined}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Trip Info & Booking Form */}
          <div>
            {/* Trip Title */}
            <h1 className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-[#F6F4FF]' : 'text-gray-900'
            }`}>
              {trip.title}
            </h1>

            {/* Trip Description */}
            {trip.description && (
              <div className={`mb-6 p-4 rounded-lg ${
                isDark
                  ? 'bg-[#3a2f4a] border border-[#3a2f4a]'
                  : 'bg-white border border-gray-200'
              }`}>
                <h2 className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Description
                </h2>
                <p className={`text-sm whitespace-pre-line ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {trip.description}
                </p>
              </div>
            )}

            <TripFactsCard trip={trip} isDark={isDark} />

            {/* Booking Form */}
            <div className={`rounded-lg border p-6 ${
              isDark
                ? 'bg-[#3a2f4a] border-[#3a2f4a]'
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Book Now
              </h2>
              <p className={`text-sm mb-6 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Fill in your details and we'll contact you to confirm your booking.
              </p>

              <form onSubmit={handleBooking} className="space-y-4">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    Name
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      weight="fill"
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={bookingForm.customer_name}
                      onChange={(e) => setBookingForm({ ...bookingForm, customer_name: e.target.value })}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#8A77ED]`}
                      aria-invalid={touched.name && Boolean(nameError)}
                      aria-describedby={touched.name && nameError ? 'booking-name-error' : undefined}
                    />
                  </div>
                  {touched.name && nameError && (
                    <p
                      id="booking-name-error"
                      className={`text-xs mt-2 ${isDark ? 'text-red-300' : 'text-red-600'}`}
                    >
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      size={20}
                      weight="fill"
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Enter your phone number"
                      value={bookingForm.customer_phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, customer_phone: e.target.value })}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#8A77ED]`}
                      aria-invalid={touched.phone && Boolean(phoneError)}
                      aria-describedby={touched.phone && phoneError ? 'booking-phone-error' : undefined}
                    />
                  </div>
                  {touched.phone && phoneError && (
                    <p
                      id="booking-phone-error"
                      className={`text-xs mt-2 ${isDark ? 'text-red-300' : 'text-red-600'}`}
                    >
                      {phoneError}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                  style={{
                    background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Book Now'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TripFactsCardProps {
  trip: Trip;
  isDark: boolean;
}

function TripFactsCard({ trip, isDark }: TripFactsCardProps) {
  const gradient = 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)';

  const formatDateValue = (value?: string | null) => {
    if (!value) return 'Not set';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Not set';
    return parsed.toLocaleDateString('en-GB');
  };

  const padValue = (value?: number | null) => {
    if (value === null || value === undefined) return '—';
    return String(value).padStart(2, '0');
  };

  const hotelValue =
    trip.hotel_enabled && trip.hotel_name
      ? `${trip.hotel_name}${trip.hotel_stars ? ` • ${trip.hotel_stars}★` : ''}`
      : 'Not specified';

  const hasDuration = typeof trip.duration_days === 'number' || typeof trip.duration_nights === 'number';
  const durationSummary = hasDuration
    ? `${trip.duration_days ?? 0} days / ${trip.duration_nights ?? 0} nights`
    : 'Not specified';

  const gradientIconClass = 'text-transparent bg-clip-text';
  const gradientIconStyle = { backgroundImage: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)' };

  const factRows = [
    [
      {
        label: 'Departure',
        value: formatDateValue(trip.start_date),
        icon: (
          <AirplaneTakeoff
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
      {
        label: 'Return',
        value: formatDateValue(trip.end_date),
        icon: (
          <AirplaneLanding
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
    ],
    [
      {
        label: 'Destination',
        value: trip.destination?.trim() || 'Not specified',
        icon: (
          <MapPin
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
      {
        label: 'Duration',
        value: durationSummary,
        icon: (
          <Clock
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
    ],
    [
      {
        label: 'Transfer',
        value: trip.transport?.trim() || 'Not specified',
        icon: (
          <CarSimple
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
      {
        label: 'Ticket',
        value: 'Included',
        icon: (
          <Ticket
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
    ],
    [
      {
        label: 'Days',
        value: padValue(trip.duration_days),
        icon: (
          <Sun
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
      {
        label: 'Nights',
        value: padValue(trip.duration_nights),
        icon: (
          <Moon
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
    ],
    [
      {
        label: 'Airline',
        value: trip.airlines?.trim() || 'Not specified',
        icon: (
          <Airplane
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
      {
        label: 'Hotel',
        value: hotelValue,
        icon: (
          <Buildings
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
    ],
    [
      {
        label: 'Baggage',
        value: trip.bagages_kg !== null && trip.bagages_kg !== undefined ? `${trip.bagages_kg} kg` : 'Not specified',
        icon: (
          <SuitcaseRolling
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
      {
        label: 'Lunch Meal',
        value: trip.lunch_meal === 'not_included' ? 'Not included' : 'Included',
        icon: (
          <ForkKnife
            size={20}
            weight="fill"
            className={gradientIconClass}
            style={gradientIconStyle}
          />
        ),
      },
    ],
  ];

  return (
    <div
      className={`mb-6 rounded-2xl border p-5 ${
        isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'
      } shadow-sm`}
    >
      <div className="space-y-4">
        {factRows.map((row, rowIndex) => (
          <div key={rowIndex} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {row.map((item, itemIndex) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 ${
                    itemIndex === 0
                      ? 'sm:border-r sm:border-gray-200 dark:sm:border-[#4a3f5a] sm:pr-4'
                      : 'sm:pl-4'
                  }`}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-[#4a3f5a]"
                  >
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium uppercase ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {rowIndex < factRows.length - 1 && (
              <div className="border-t border-dashed border-gray-200 dark:border-[#4a3f5a]" />
            )}
          </div>
        ))}
      </div>
      <div
        className={`mt-6 flex items-center justify-center text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        <CaretUp size={16} className="mr-1" />
        Show less
      </div>
    </div>
  );
}

