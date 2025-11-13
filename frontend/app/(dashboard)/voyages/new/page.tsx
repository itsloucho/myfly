'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
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

      router.push('/voyages');
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Error creating trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/voyages"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Voyages
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: '#2B2B2E' }}>Create New Trip</h1>
        <p className="text-gray-600">Add a new travel package</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div 
          className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
          style={{ boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)' }}
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: '#2B2B2E' }}>
              Title *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter trip title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: '#2B2B2E' }}>
              Description
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Enter trip description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: '#E0E0E0' }}
            />
          </div>

          {/* Featured Image */}
          <div>
            <label htmlFor="featured_image" className="block text-sm font-medium mb-2" style={{ color: '#2B2B2E' }}>
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
            <label htmlFor="gallery" className="block text-sm font-medium mb-2" style={{ color: '#2B2B2E' }}>
              Gallery Images
            </label>
            <input
              id="gallery"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGallery(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-white"
            />
            {gallery.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">{gallery.length} images selected</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: '#2B2B2E' }}>
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              style={{ borderColor: '#E0E0E0' }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Trip'}
            </Button>
            <Link href="/voyages">
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

