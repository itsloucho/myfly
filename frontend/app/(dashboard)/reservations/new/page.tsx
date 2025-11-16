'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

interface Trip {
  id: number;
  title: string;
  slug: string;
  type: string;
}

export default function NewReservationPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [formData, setFormData] = useState({
    booking_type: '',
    trip_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    booking_data: {} as Record<string, any>,
  });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get('/trips');
        setTrips(response.data.data || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchTrips();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.trip-search-container')) {
        setShowSearchDropdown(false);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchDropdown]);

  // Filter trips based on booking type and search query
  // Map booking_type 'trip' to trip.type 'voyage'
  const filteredTrips = trips.filter((trip) => {
    const typeMap: Record<string, string> = {
      'trip': 'voyage',
      'ticket': 'ticket',
      'hotel': 'hotel',
    };
    const expectedType = typeMap[formData.booking_type] || formData.booking_type;
    const matchesType = !formData.booking_type || trip.type === expectedType;
    const matchesSearch = !searchQuery || 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        booking_type: formData.booking_type,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
      };

      // Only include trip_id if it's not empty
      if (formData.trip_id && formData.trip_id !== '') {
        payload.trip_id = parseInt(formData.trip_id);
      }

      // Only include customer_email if it's not empty
      if (formData.customer_email && formData.customer_email.trim() !== '') {
        payload.customer_email = formData.customer_email.trim();
      }

      // Only include booking_data if it has values
      if (Object.keys(formData.booking_data).length > 0) {
        payload.booking_data = formData.booking_data;
      }

      await api.post('/reservations', payload);

      router.push('/reservations');
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      
      // Show validation errors if available
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error creating reservation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedTrip = trips.find(t => t.id.toString() === formData.trip_id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/reservations"
          className={`inline-flex items-center text-sm mb-4 transition-colors ${
            isDark
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Bookings
        </Link>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>
          Create New Booking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Add a new booking</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div
          className={`rounded-lg border p-6 space-y-6 ${
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
          {/* Step 1: Booking Type */}
          <div>
            <label htmlFor="booking_type" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Reservation Type *
            </label>
            <select
              id="booking_type"
              required
              value={formData.booking_type}
              onChange={(e) => {
                setFormData({ ...formData, booking_type: e.target.value, trip_id: '' });
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A77ED] focus-visible:ring-offset-2 ${
                isDark
                  ? 'border-[#3a2f4a] bg-[#271f36] text-gray-100'
                  : 'border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select reservation type</option>
              <option value="trip">Trip</option>
              <option value="ticket">Ticket</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>

          {/* Step 2: Searchable Trip/Package Selection */}
          {formData.booking_type && (
            <div className="relative trip-search-container">
              <label htmlFor="trip_search" className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Select {formData.booking_type.charAt(0).toUpperCase() + formData.booking_type.slice(1)} (Optional)
              </label>
              {loadingTrips ? (
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading...
                </div>
              ) : (
                <>
                  <div className="relative">
                    <MagnifyingGlass
                      size={20}
                      weight="fill"
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      id="trip_search"
                      type="text"
                      placeholder={`Search ${formData.booking_type}s...`}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      className={`flex h-10 w-full rounded-md border bg-transparent pl-10 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A77ED] focus-visible:ring-offset-2 ${
                        isDark
                          ? 'border-[#3a2f4a] bg-[#271f36] text-gray-100 placeholder-gray-400'
                          : 'border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    {selectedTrip && (
                      <div className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Selected: <strong>{selectedTrip.title}</strong>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {showSearchDropdown && filteredTrips.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md border ${
                      isDark
                        ? 'bg-[#3a2f4a] border-[#3a2f4a]'
                        : 'bg-white border-gray-300'
                    } shadow-lg`}>
                      {filteredTrips.map((trip) => (
                        <button
                          key={trip.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, trip_id: trip.id.toString() });
                            setSearchQuery(trip.title);
                            setShowSearchDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-opacity-50 transition-colors cursor-pointer ${
                            isDark
                              ? 'hover:bg-[#4a3f5a] text-gray-100'
                              : 'hover:bg-gray-100 text-gray-900'
                          } ${formData.trip_id === trip.id.toString() ? (isDark ? 'bg-[#4a3f5a]' : 'bg-gray-100') : ''}`}
                        >
                          <div className="font-medium">{trip.title}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {trip.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showSearchDropdown && searchQuery && filteredTrips.length === 0 && (
                    <div className={`absolute z-10 w-full mt-1 rounded-md border p-4 text-sm ${
                      isDark
                        ? 'bg-[#3a2f4a] border-[#3a2f4a] text-gray-400'
                        : 'bg-white border-gray-300 text-gray-500'
                    }`}>
                      No {formData.booking_type}s found matching "{searchQuery}"
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Customer Details Section */}
          {formData.booking_type && (
            <>
              <div className={`pt-4 border-t ${
                isDark ? 'border-[#3a2f4a]' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Customer Details
                </h3>
              </div>

              {/* Customer Name */}
              <div>
                <label htmlFor="customer_name" className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Customer Name *
                </label>
                <Input
                  id="customer_name"
                  type="text"
                  required
                  placeholder="Enter customer name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label htmlFor="customer_phone" className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Customer Phone *
                </label>
                <Input
                  id="customer_phone"
                  type="tel"
                  required
                  placeholder="Enter customer phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>

              {/* Customer Email */}
              <div>
                <label htmlFor="customer_email" className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Customer Email
                </label>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="Enter customer email (optional)"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Actions */}
          {formData.booking_type && (
            <div className={`flex items-center gap-4 pt-4 ${
              isDark ? 'border-t border-[#3a2f4a]' : 'border-t border-gray-200'
            }`}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Reservation'}
              </Button>
              <Link href="/reservations">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
