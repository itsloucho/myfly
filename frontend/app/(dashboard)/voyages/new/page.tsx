'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useThemeStore } from '@/lib/store';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import {
  TripDetailsForm,
  type TripFormValues,
  type TripFormErrors,
} from '@/components/dashboard/trips/TripDetailsForm';
import { TripMediaUploader } from '@/components/dashboard/trips/TripMediaUploader';
import { TripActionsPanel } from '@/components/dashboard/trips/TripActionsPanel';
import { tripsService } from '@/lib/services/trips';

export default function NewTripPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();

  const [saving, setSaving] = useState(false);
  type TripState = TripFormValues & { status: 'draft' | 'published'; type: 'voyage' };

  const initialFormState: TripState = {
    title: '',
    description: '',
    price: '',
    min_price: '',
    start_date: '',
    end_date: '',
    duration_days: '',
    duration_nights: '',
    destination: '',
    hotel_enabled: false,
    hotel_stars: '',
    hotel_name: '',
    airlines: '',
    bagages_kg: '',
    lunch_meal: 'included',
    transport: '',
    status: 'draft',
    type: 'voyage',
  };

  const [formData, setFormData] = useState<TripState>(initialFormState);
  const [formErrors, setFormErrors] = useState<TripFormErrors>({});
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!featuredImageFile) {
      setFeaturedImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(featuredImageFile);
    setFeaturedImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredImageFile]);

  const cardClasses = useMemo(
    () =>
      `rounded-lg border ${isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'}`,
    [isDark]
  );
  const cardShadow = useMemo(
    () => ({
      boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
    }),
    [isDark]
  );

  const handleFieldChange = (values: Partial<TripFormValues>) => {
    setFormData((prev) => {
      const next = { ...prev, ...values };
      if ('hotel_enabled' in values && values.hotel_enabled === false) {
        next.hotel_stars = '';
        next.hotel_name = '';
      }
      return next;
    });
  };

  const validateForm = () => {
    const errors: TripFormErrors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0.';
    }
    if (formData.min_price) {
      const minPrice = Number(formData.min_price);
      if (Number.isNaN(minPrice) || minPrice < 0) {
        errors.min_price = 'Minor price must be positive.';
      } else if (formData.price && minPrice > Number(formData.price)) {
        errors.min_price = 'Minor price cannot exceed adult price.';
      }
    }
    if (!formData.start_date) {
      errors.start_date = 'Start date is required.';
    }
    if (!formData.end_date) {
      errors.end_date = 'End date is required.';
    } else if (
      formData.start_date &&
      new Date(formData.end_date).getTime() < new Date(formData.start_date).getTime()
    ) {
      errors.end_date = 'End date cannot be before start date.';
    }
    if (!formData.duration_days || Number(formData.duration_days) <= 0) {
      errors.duration_days = 'Days must be at least 1.';
    }
    if (formData.duration_nights === '' || Number(formData.duration_nights) < 0) {
      errors.duration_nights = 'Nights cannot be negative.';
    }
    if (!formData.destination.trim()) {
      errors.destination = 'Destination is required.';
    }
    if (formData.hotel_enabled) {
      if (!formData.hotel_stars) {
        errors.hotel_stars = 'Stars required.';
      } else {
        const stars = Number(formData.hotel_stars);
        if (Number.isNaN(stars) || stars < 1 || stars > 5) {
          errors.hotel_stars = 'Stars must be between 1 and 5.';
        }
      }
      if (!formData.hotel_name.trim()) {
        errors.hotel_name = 'Hotel name required.';
      }
    }
    if (!formData.lunch_meal) {
      errors.lunch_meal = 'Select an option.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', 'voyage');
      data.append('description', formData.description);
      data.append('status', formData.status);
      data.append('price', formData.price);
      data.append('min_price', formData.min_price);
      data.append('start_date', formData.start_date);
      data.append('end_date', formData.end_date);
      data.append('duration_days', formData.duration_days);
      data.append('duration_nights', formData.duration_nights);
      data.append('destination', formData.destination);
      data.append('hotel_enabled', formData.hotel_enabled ? '1' : '0');
      if (formData.hotel_enabled) {
        data.append('hotel_stars', formData.hotel_stars);
        data.append('hotel_name', formData.hotel_name);
      }
      data.append('airlines', formData.airlines);
      data.append('bagages_kg', formData.bagages_kg);
      data.append('lunch_meal', formData.lunch_meal);
      data.append('transport', formData.transport);

      if (featuredImageFile) {
        data.append('featured_image', featuredImageFile);
      }
      galleryFiles.forEach((file) => data.append('gallery[]', file));

      await tripsService.create(data);
      router.push('/voyages');
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Unable to create trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/voyages"
          className={`inline-flex items-center text-sm mb-4 transition-colors ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Trips
        </Link>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>
          Create New Trip
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Add a new travel package</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${cardClasses} p-6`} style={cardShadow}>
            <TripDetailsForm isDark={isDark} values={formData} onChange={handleFieldChange} errors={formErrors} />
          </div>
          <div className={`${cardClasses} p-6`} style={cardShadow}>
            <TripMediaUploader
              isDark={isDark}
              featuredImagePreview={featuredImagePreview}
              existingFeaturedImage={null}
              onFeaturedImageChange={setFeaturedImageFile}
              galleryFiles={galleryFiles}
              onGalleryChange={setGalleryFiles}
              existingGallery={null}
            />
          </div>
        </div>

        <div className={`${cardClasses} p-6`} style={cardShadow}>
          <TripActionsPanel
            isDark={isDark}
            status={formData.status}
            onStatusChange={(status) => setFormData((prev) => ({ ...prev, status }))}
            onSave={handleSave}
            saving={saving}
            saveLabel="Create Trip"
          />
          <button
            type="button"
            onClick={() => router.push('/voyages')}
            className={`mt-4 w-full h-10 rounded-md border transition-colors cursor-pointer ${
              isDark
                ? 'border-[#3a2f4a] text-gray-100 hover:bg-[#4a3f5a]'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

