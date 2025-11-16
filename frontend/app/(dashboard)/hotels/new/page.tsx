'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function NewHotelPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'hotel', // Locked to hotel
    description: '',
    status: 'draft',
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('status', formData.status);

      if (featuredImage) {
        data.append('featured_image', featuredImage);
      }

      gallery.forEach((file) => {
        data.append('gallery[]', file);
      });

      await api.post('/trips', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/hotels');
    } catch (error: unknown) {
      console.error('Error creating hotel:', error);
      const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; message?: string };
      
      if (axiosError.response?.data?.errors) {
        // Show detailed validation errors
        const errorMessages = Object.entries(axiosError.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        alert(`Validation failed:\n${errorMessages}`);
      } else {
        const errorMessage = axiosError.response?.data?.message || 
                            axiosError.message || 
                            'Error creating hotel';
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/hotels"
          className={`inline-flex items-center text-sm mb-4 transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-gray-200' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Hotels
        </Link>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>
          Create New Hotel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Add a new hotel</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Status - Separate box at the top */}
        <div 
          className={`rounded-lg border p-4 mb-6 ${
            isDark 
              ? 'bg-[#3a2f4a] border-[#3a2f4a]' 
              : 'bg-white border-gray-200'
          }`}
          style={{ boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
        >
          <label htmlFor="status" className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 cursor-pointer ${
              isDark
                ? 'border-[#3a2f4a] bg-[#271f36] text-gray-100'
                : 'border-gray-300 text-gray-900'
            }`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Main Form */}
        <div 
          className={`rounded-lg border p-6 space-y-6 ${
            isDark 
              ? 'bg-[#3a2f4a] border-[#3a2f4a]' 
              : 'bg-white border-gray-200'
          }`}
          style={{ boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Title *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter hotel title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Description
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Enter hotel description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`flex w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isDark 
                  ? 'border-[#3a2f4a] bg-[#271f36] text-gray-100' 
                  : 'border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Featured Image */}
          <div>
            <label htmlFor="featured_image" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Featured Image
            </label>
            <input
              id="featured_image"
              type="file"
              accept="image/*"
              onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-white"
            />
          </div>

          {/* Gallery */}
          <div>
            <label htmlFor="gallery" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Gallery Images
            </label>
            <input
              id="gallery"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGallery(Array.from(e.target.files || []))}
              className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-white ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            {gallery.length > 0 && (
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {gallery.length} images selected
              </p>
            )}
          </div>

          {/* Type - Hidden, locked to hotel */}
          <input type="hidden" name="type" value="hotel" />

          {/* Actions */}
          <div className={`flex items-center gap-4 pt-4 ${
            isDark ? 'border-t border-[#3a2f4a]' : 'border-t border-gray-200'
          }`}>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Hotel'}
            </Button>
            <Link href="/hotels">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

