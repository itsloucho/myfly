'use client';

import api from '@/lib/api';

export interface Trip {
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
  gallery?: string[] | null;
  status: 'draft' | 'published';
  created_at: string;
}

type TripListResponse = {
  data?: Trip[];
};

export const tripsService = {
  async list() {
    const response = await api.get<TripListResponse>('/trips');
    return response.data?.data ?? [];
  },
  async get(id: number | string) {
    const response = await api.get<Trip>(`/trips/${id}`);
    return response.data;
  },
  create(formData: FormData) {
    return api.post('/trips', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update(id: number | string, formData: FormData) {
    return api.post(`/trips/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete(id: number | string) {
    return api.delete(`/trips/${id}`);
  },
};


