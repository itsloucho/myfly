'use client';

import { getStorageUrl } from '@/lib/utils';
import { useMemo } from 'react';

interface TripMediaUploaderProps {
  isDark: boolean;
  featuredImagePreview?: string | null;
  existingFeaturedImage?: string | null;
  onFeaturedImageChange: (file: File | null) => void;
  galleryFiles: File[];
  onGalleryChange: (files: File[]) => void;
  existingGallery?: string[] | null;
}

const formatFileInfo = (file: File) => {
  const sizeKB = file.size / 1024;
  if (sizeKB > 1024) {
    return `${file.name} • ${(sizeKB / 1024).toFixed(1)} MB`;
  }
  return `${file.name} • ${Math.round(sizeKB)} KB`;
};

export function TripMediaUploader({
  isDark,
  featuredImagePreview,
  existingFeaturedImage,
  onFeaturedImageChange,
  galleryFiles,
  onGalleryChange,
  existingGallery,
}: TripMediaUploaderProps) {
  const featuredImageUrl = useMemo(
    () => featuredImagePreview || getStorageUrl(existingFeaturedImage),
    [featuredImagePreview, existingFeaturedImage]
  );

  const existingGalleryUrls = useMemo(() => {
    if (!existingGallery) return [];
    return existingGallery.map((image) => getStorageUrl(image)).filter(Boolean) as string[];
  }, [existingGallery]);

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Featured Image
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              This image appears as the card cover.
            </p>
          </div>
        </div>

        {featuredImageUrl && (
          <div className="mb-4">
            <img
              src={featuredImageUrl}
              alt="Featured preview"
              className="w-full h-56 object-cover rounded-lg border"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFeaturedImageChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-white cursor-pointer file:cursor-pointer"
        />
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Recommended: 1600x900px JPG/PNG, max 2MB.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Gallery Images
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Upload additional visuals to showcase this package.
            </p>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onGalleryChange(Array.from(e.target.files || []))}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-white cursor-pointer file:cursor-pointer"
        />

        {galleryFiles.length > 0 && (
          <ul className={`text-sm mt-2 space-y-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {galleryFiles.map((file) => (
              <li key={file.name}>{formatFileInfo(file)}</li>
            ))}
          </ul>
        )}

        {galleryFiles.length === 0 && existingGalleryUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {existingGalleryUrls.slice(0, 4).map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="rounded-lg overflow-hidden border dark:border-[#3a2f4a]"
              >
                <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


