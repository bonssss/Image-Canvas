import React from 'react';
import { Plus, Lock, FolderPlus } from 'lucide-react';
import { Collection, ImageItem } from '../../types';

interface CollectionsViewProps {
  collections: Collection[];
  onSelectCollection: (col: Collection) => void;
  onCreateNewCollection: () => void;
  onSelectImage: (image: ImageItem) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  onSelectCollection,
  onCreateNewCollection,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header bar matching Unsplash collection reference */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-wider text-[#111111] dark:text-white uppercase font-sans">
            {collections.length} Collections
          </h1>
        </div>

        <button
          onClick={onCreateNewCollection}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e0e0e0] font-semibold text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Collection</span>
        </button>
      </div>

      {/* Empty State */}
      {collections.length === 0 && (
        <div className="py-24 text-center rounded-xl bg-white dark:bg-[#1a1a1a] p-8 max-w-md mx-auto border border-[#e5e5e5] dark:border-[#2a2a2a]">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] flex items-center justify-center mx-auto mb-3">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#111111] dark:text-white mb-1">No collections yet</h3>
          <p className="text-xs text-[#767676] mb-4">
            Start saving your favorite AI generated images into curated boards.
          </p>
          <button
            onClick={onCreateNewCollection}
            className="px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold"
          >
            Create Collection
          </button>
        </div>
      )}

      {/* Unsplash-Style 3-Image Collage Grid (Exact reference layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((col, index) => {
          const previews = col.previewImages || [];
          const mainImage = previews[0] || col.coverImage;
          const secondImage = previews[1];
          const thirdImage = previews[2];

          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col)}
              className="group cursor-pointer flex flex-col space-y-2.5"
            >
              {/* 3-Image Collage Container */}
              <div className="relative w-full h-64 overflow-hidden bg-[#f0f0f0] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-sm transition-opacity hover:opacity-95">
                <div className="grid grid-cols-3 h-full gap-[3px] bg-[#e5e5e5] dark:bg-[#2a2a2a]">
                  {/* Left Main Large Image (2 cols wide) */}
                  <div className="col-span-2 h-full overflow-hidden bg-[#e0e0e0] dark:bg-[#222222]">
                    {mainImage ? (
                      <img
                        src={mainImage.thumbnailUrl || mainImage.imageUrl}
                        alt={col.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#767676] text-xs">
                        No photos
                      </div>
                    )}
                  </div>

                  {/* Right Stacked 2 Images (1 col wide, 2 rows) */}
                  <div className="col-span-1 grid grid-rows-2 h-full gap-[3px]">
                    <div className="w-full h-full overflow-hidden bg-[#e0e0e0] dark:bg-[#222222]">
                      {secondImage ? (
                        <img
                          src={secondImage.thumbnailUrl || secondImage.imageUrl}
                          alt={col.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e8e8e8] dark:bg-[#1c1c1c]" />
                      )}
                    </div>
                    <div className="w-full h-full overflow-hidden bg-[#e0e0e0] dark:bg-[#222222]">
                      {thirdImage ? (
                        <img
                          src={thirdImage.thumbnailUrl || thirdImage.imageUrl}
                          alt={col.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e8e8e8] dark:bg-[#1c1c1c]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Privacy indicator */}
                {col.isPrivate && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Private</span>
                  </div>
                )}
              </div>

              {/* Bottom Caption (Matches Unsplash: COLLECTION #... / Photos · Curated by ...) */}
              <div>
                <h3 className="text-xs font-bold tracking-wider text-[#111111] dark:text-white uppercase font-sans truncate">
                  {col.title}
                </h3>
                <p className="text-[11px] text-[#767676] mt-0.5">
                  {col.imagesCount} Photos · Curated by{' '}
                  <span className="text-[#333333] dark:text-[#cccccc] font-medium">
                    {col.user?.fullName || 'Unsplash'}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
