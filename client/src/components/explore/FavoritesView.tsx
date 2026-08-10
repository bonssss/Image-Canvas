import React, { useState, useEffect } from 'react';
import { Heart, Compass } from 'lucide-react';
import { ImageItem } from '../../types';
import { imageService } from '../../services/imageService';
import { ImageCard } from './ImageCard';
import { useToast } from '../../context/ToastContext';

interface FavoritesViewProps {
  onSelectImage: (image: ImageItem) => void;
  onOpenSaveModal: (image: ImageItem) => void;
  onRemix: (image: ImageItem) => void;
  onGoToExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onSelectImage,
  onOpenSaveModal,
  onRemix,
  onGoToExplore,
}) => {
  const { toast } = useToast();
  const [likedImages, setLikedImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    imageService
      .getLikedImages()
      .then(setLikedImages)
      .catch(() => {
        toast('Failed to load favorites', { type: 'error' });
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
        <h1 className="text-xl font-bold tracking-tight text-[#111111] dark:text-white uppercase font-sans">
          Favorite Photos ({likedImages.length})
        </h1>
        <p className="text-xs text-[#767676] mt-0.5">
          Your personal collection of liked artworks.
        </p>
      </div>

      {isLoading && (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="mb-6 break-inside-avoid rounded-lg overflow-hidden skeleton-shimmer"
              style={{ height: `${[260, 320, 380, 290][idx % 4]}px` }}
            />
          ))}
        </div>
      )}

      {!isLoading && likedImages.length === 0 && (
        <div className="py-20 text-center rounded-xl bg-white dark:bg-[#1a1a1a] p-8 max-w-md mx-auto border border-[#e5e5e5] dark:border-[#2a2a2a]">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#111111] dark:text-white mb-1">No liked photos yet</h3>
          <p className="text-xs text-[#767676] mb-4">
            Click the heart icon on any photo in the feed to save it here.
          </p>
          <button
            onClick={onGoToExplore}
            className="px-4 py-2 rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-xs font-bold"
          >
            Explore Photos
          </button>
        </div>
      )}

      {!isLoading && likedImages.length > 0 && (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
          {likedImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => onSelectImage(image)}
              onOpenSaveModal={onOpenSaveModal}
              onRemix={onRemix}
            />
          ))}
        </div>
      )}
    </div>
  );
};
