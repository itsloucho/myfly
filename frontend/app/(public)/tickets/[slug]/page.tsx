'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTenantSlug, publicApiClient } from '@/lib/public-api';
import { useThemeStore } from '@/lib/store';
import { User, Phone } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { getStorageUrl } from '@/lib/utils';

interface Ticket {
  id: number;
  title: string;
  slug: string;
  type: string;
  description: string;
  featured_image: string | null;
  gallery: string[] | null;
  status: string;
  created_at: string;
}

export default function SingleTicketPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    customer_phone: '',
  });
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [submitting, setSubmitting] = useState(false);
  const { isDark } = useThemeStore();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const tenantSlug = getTenantSlug();
        if (tenantSlug && slug) {
          const ticketData = await publicApiClient.getTrip(tenantSlug, slug);
          // Only show ticket type
          if (ticketData.type !== 'ticket') {
            setTicket(null);
            return;
          }
          setTicket(ticketData);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
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
        trip_id: ticket!.id,
        customer_name: bookingForm.customer_name,
        customer_phone: bookingForm.customer_phone,
        booking_type: 'ticket',
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
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket || ticket.type !== 'ticket') {
    return (
      <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#3F3651]' : 'bg-gray-50'}`}>
        <div className="container mx-auto text-center py-12">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Ticket not found</p>
        </div>
      </div>
    );
  }

  const images = ticket.featured_image
    ? [ticket.featured_image, ...(ticket.gallery || [])]
    : ticket.gallery || [];

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
              {ticket.featured_image && getStorageUrl(ticket.featured_image) ? (
                <img
                  src={getStorageUrl(ticket.featured_image) ?? undefined}
                  alt={ticket.title}
                  className="w-full h-[400px] object-cover"
                />
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {ticket.gallery && ticket.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {ticket.gallery.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-[#3a2f4a]"
                  >
                    {getStorageUrl(image) ? (
                      <img
                        src={getStorageUrl(image) ?? undefined}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Ticket Info & Booking Form */}
          <div>
            {/* Ticket Title */}
            <h1 className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-[#F6F4FF]' : 'text-gray-900'
            }`}>
              {ticket.title}
            </h1>

            {/* Ticket Description */}
            {ticket.description && (
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
                  {ticket.description}
                </p>
              </div>
            )}

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
                      aria-describedby={touched.name && nameError ? 'ticket-booking-name-error' : undefined}
                    />
                  </div>
                  {touched.name && nameError && (
                    <p
                      id="ticket-booking-name-error"
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
                      aria-describedby={touched.phone && phoneError ? 'ticket-booking-phone-error' : undefined}
                    />
                  </div>
                  {touched.phone && phoneError && (
                    <p
                      id="ticket-booking-phone-error"
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

