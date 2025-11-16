import axios from 'axios';

// Public API client for storefront (no auth required)
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper to get tenant slug from subdomain
export function getTenantSlug(): string {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For local development (e.g., agency1.localhost:3000)
  if (parts.length >= 2) {
    const subdomain = parts[0];
    if (subdomain !== 'www' && subdomain !== 'localhost' && !subdomain.match(/^\d/)) {
      return subdomain;
    }
  }
  
  return '';
}

// Public API methods
export const publicApiClient = {
  // Get published trips for a tenant
  getTrips: async (tenantSlug: string, params?: { page?: number; search?: string; type?: string }) => {
    const response = await publicApi.get(`/public/${tenantSlug}/trips`, { params });
    return response.data;
  },

  // Get a single published trip
  getTrip: async (tenantSlug: string, tripSlug: string) => {
    const response = await publicApi.get(`/public/${tenantSlug}/trips/${tripSlug}`);
    return response.data;
  },

  // Create a reservation (booking)
  createReservation: async (data: {
    trip_id: number;
    customer_name: string;
    customer_phone: string;
    booking_type: 'trip' | 'ticket' | 'hotel';
    total_amount: number;
    adults?: number;
    children?: number;
    rooms?: number;
    departure_date?: string;
    return_date?: string;
  }) => {
    const response = await publicApi.post('/public/reservations', data);
    return response.data;
  },
};

export default publicApi;

