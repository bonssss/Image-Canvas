import React, { useEffect, useRef } from 'react';
import { Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { ImageItem } from '../../types';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
  images: ImageItem[];
  isLoading: boolean;
  hasMore: boolean;
  error?: string | null;
  onLoadMore: () => void;
  onSelectImage: (image: ImageItem) => void;
  onOpenSaveModal: (image: ImageItem) => void;
  onRemix: (image: ImageItem) => void;
  onRetry: () => void;
  onResetFilters: () => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  images,
  isLoading,
  hasMore,
  error,
  onLoadMore,
  onSelectImage,
  onOpenSaveModal,
  onRemix,
  onRetry,
  onResetFilters,
}) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // Error State
  if (error && images.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unable to load images</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // Empty State
  if (!isLoading && images.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-brand-500/10 dark:bg-white/5 text-brand-500 flex items-center justify-center mx-auto mb-5 border border-brand-500/20">
          <Sparkles className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
          No masterpieces found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          We couldn't find any artworks matching your active filters. Try adjusting your prompt search or resetting filter options.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-all shadow-lg"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* CSS Column Masonry Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => onSelectImage(image)}
            onOpenSaveModal={onOpenSaveModal}
            onRemix={onRemix}
          />
        ))}

        {/* Loading Skeletons */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="mb-5 break-inside-avoid rounded-2xl overflow-hidden skeleton-shimmer"
              style={{
                height: `${[260, 340, 420, 300, 380, 290][idx % 6]}px`,
              }}
            />
          ))}
      </div>

      {/* Infinite Scroll Intersection Anchor */}
      <div ref={observerRef} className="h-10 w-full flex items-center justify-center my-8">
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
            <span>Discovering more images...</span>
          </div>
        )}
        {!hasMore && images.length > 0 && (
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            ✦ You have reached the end of the universe ✦
          </p>
        )}
      </div>
    </div>
  );
};
