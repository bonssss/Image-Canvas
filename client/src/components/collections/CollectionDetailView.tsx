import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Lock,
  Globe,
  Compass,
  X,
  Check,
} from 'lucide-react';
import { Collection, ImageItem } from '../../types';
import { collectionService } from '../../services/collectionService';
import { ImageCard } from '../explore/ImageCard';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface CollectionDetailViewProps {
  collectionId: string;
  onBack: () => void;
  onSelectImage: (image: ImageItem) => void;
  onOpenSaveModal: (image: ImageItem) => void;
  onRemix: (image: ImageItem) => void;
  onCollectionDeleted: () => void;
}

export const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  collectionId,
  onBack,
  onSelectImage,
  onOpenSaveModal,
  onRemix,
  onCollectionDeleted,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const fetchCollection = async () => {
    try {
      setIsLoading(true);
      const res = await collectionService.getCollectionById(collectionId);
      setCollection(res.collection);
      setImages(res.images);
      setEditTitle(res.collection.title);
      setEditDesc(res.collection.description || '');
    } catch (err: any) {
      toast(err.message || 'Failed to load collection', { type: 'error' });
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [collectionId]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast('Title is required', { type: 'error' });
      return;
    }
    try {
      const updated = await collectionService.updateCollection(collectionId, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
      setCollection(updated);
      setIsEditing(false);
      toast('Collection updated', { type: 'success' });
    } catch (err: any) {
      toast(err.message || 'Failed to update collection', { type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await collectionService.deleteCollection(collectionId);
        toast('Collection deleted', { type: 'info' });
        onCollectionDeleted();
      } catch (err: any) {
        toast(err.message || 'Failed to delete collection', { type: 'error' });
      }
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      await collectionService.removeImageFromCollection(collectionId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast('Image removed from collection', { type: 'info' });
    } catch (err: any) {
      toast(err.message || 'Failed to remove image', { type: 'error' });
    }
  };

  if (isLoading || !collection) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#111111] dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#767676]">Loading collection gallery...</p>
      </div>
    );
  }

  const isOwner = user?.id === collection.userId;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f5f5f5] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#e8e8e8] dark:hover:bg-[#303030] text-xs font-semibold mb-6 transition-colors border border-[#e5e5e5] dark:border-[#2e2e2e]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Collections</span>
      </button>

      {/* Collection Details Header */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3 max-w-md">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-base font-bold text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                />
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Collection description..."
                  className="w-full p-2 rounded-lg bg-white dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-md bg-[#f5f5f5] dark:bg-[#242424] text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-2xl font-bold text-[#111111] dark:text-white uppercase font-sans tracking-tight">
                    {collection.title}
                  </h1>
                  {collection.isPrivate ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] border border-[#e5e5e5] dark:border-[#2e2e2e]">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] border border-[#e5e5e5] dark:border-[#2e2e2e]">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </span>
                  )}
                </div>

                {collection.description && (
                  <p className="text-xs text-[#767676] max-w-xl leading-relaxed mb-3">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-[#767676]">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={
                        collection.user?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={collection.user?.fullName || 'User'}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="font-semibold text-[#111111] dark:text-white">
                      {collection.user?.fullName}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{images.length} photos</span>
                </div>
              </div>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-md bg-[#f5f5f5] dark:bg-[#242424] hover:bg-[#e8e8e8] dark:hover:bg-[#303030] text-[#111111] dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#e5e5e5] dark:border-[#2e2e2e]"
                title="Edit Title"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={handleDelete}
                className="p-2 rounded-md bg-[#f5f5f5] dark:bg-[#242424] hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#e5e5e5] dark:border-[#2e2e2e]"
                title="Delete Collection"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gallery of Collection Images */}
      {images.length === 0 ? (
        <div className="py-20 text-center rounded-xl bg-white dark:bg-[#1a1a1a] p-8 max-w-md mx-auto border border-[#e5e5e5] dark:border-[#2a2a2a]">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#111111] dark:text-white mb-1">
            This collection is empty
          </h3>
          <p className="text-xs text-[#767676] mb-4">
            Browse Photos and click "Save" on any artwork to add it here.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold"
          >
            Explore Photos
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <ImageCard
                image={image}
                onClick={() => onSelectImage(image)}
                onOpenSaveModal={onOpenSaveModal}
                onRemix={onRemix}
              />
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(image.id);
                  }}
                  title="Remove from collection"
                  className="absolute top-2 right-2 z-30 p-1.5 rounded-md bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
