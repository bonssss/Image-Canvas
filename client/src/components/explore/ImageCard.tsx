import React, { useState } from 'react';
import { Heart, Bookmark, Download, Wand2 } from 'lucide-react';
import { ImageItem } from '../../types';
import { imageService } from '../../services/imageService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

import { downloadImage } from '../../utils/download';

interface ImageCardProps {
  image: ImageItem;
  onClick: () => void;
  onOpenSaveModal: (image: ImageItem) => void;
  onRemix: (image: ImageItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onClick,
  onOpenSaveModal,
  onRemix,
}) => {
  const { toast } = useToast();
  const { requireAuthAction } = useAuth();
  const [isLiked, setIsLiked] = useState(image.isLiked || false);
  const [likesCount, setLikesCount] = useState(image.likesCount || 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLikeClick = requireAuthAction(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await imageService.toggleLike(image.id);
      setIsLiked(res.isLiked);
      setLikesCount(res.likesCount);
    } catch {
      setIsLiked(!newLiked);
      setLikesCount((prev) => (newLiked ? Math.max(0, prev - 1) : prev + 1));
      toast('Failed to update like', { type: 'error' });
    }
  });

  const handleDownload = requireAuthAction(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      imageService.trackDownload(image.id);
      const filename = `${image.title.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()}-${image.id}.jpg`;
      toast('Downloading high-resolution photo...', { description: image.title, type: 'info' });
      await downloadImage(image.imageUrl, filename);
      toast('Download complete', { description: image.title, type: 'success' });
    } catch {
      toast('Download failed', { type: 'error' });
    }
  });

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative mb-6 break-inside-avoid rounded-lg overflow-hidden cursor-zoom-in bg-[#f0f0f0] dark:bg-[#1a1a1a] transition-transform duration-200 glow-card"
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div
          className="w-full skeleton-shimmer"
          style={{
            aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : '4/5',
          }}
        />
      )}

      {/* Image Artwork */}
      <img
        src={image.thumbnailUrl || image.imageUrl}
        alt={image.title}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setIsLoaded(true);
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
        }}
        className={`w-full h-auto object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-90'
          }`}
      />

      {/* Subtle Style Tag (Permanent) */}
      <div className="absolute top-2.5 left-2.5 z-10 opacity-90 group-hover:opacity-0 transition-opacity">
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white uppercase tracking-wider">
          {image.style?.name || image.model}
        </span>
      </div>

      {/* Hover Overlay - Solid clean Unsplash actions */}
      <div
        className={`absolute inset-0 bg-black/35 z-20 flex flex-col justify-between p-3.5 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/50 text-white">
            {image.category?.name || 'AI Art'}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Remix / Generate More Like This */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemix(image);
              }}
              title="Generate More Like This"
              className="p-1.5 rounded-md bg-white hover:bg-[#f0f0f0] text-[#111111] transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
            </button>

            {/* Save to Collection Modal Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSaveModal(image);
              }}
              title="Save to Collection"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-[#f0f0f0] text-[#111111] text-xs font-semibold transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Bottom Details */}
        <div className="flex items-center justify-between pt-2">
          {/* Creator */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={
                image.creator?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={image.creator?.fullName || 'Creator'}
              className="w-6 h-6 rounded-full object-cover border border-white/40"
            />
            <span className="text-xs font-semibold text-white truncate drop-shadow-sm">
              {image.creator?.fullName || 'Creator'}
            </span>
          </div>

          {/* Like Counter & Download */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${isLiked
                  ? 'bg-red-600 text-white'
                  : 'bg-white/90 hover:bg-white text-[#111111]'
                }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleDownload}
              title="Download image"
              className="p-1.5 rounded-md bg-white/90 hover:bg-white text-[#111111] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
