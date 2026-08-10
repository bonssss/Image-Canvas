import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Check,
  Bookmark,
} from 'lucide-react';
import { Collection, ImageItem } from '../../types';
import { collectionService } from '../../services/collectionService';
import { useToast } from '../../context/ToastContext';

interface SaveToCollectionModalProps {
  image: ImageItem | null;
  collections: Collection[];
  onClose: () => void;
  onRefreshCollections: () => void;
}

export const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({
  image,
  collections,
  onClose,
  onRefreshCollections,
}) => {
  const { toast } = useToast();
  const [savedCollectionIds, setSavedCollectionIds] = useState<string[]>([]);

  // Inline create collection state
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (image) {
      collectionService
        .getSavedCollectionIdsForImage(image.id)
        .then((ids) => setSavedCollectionIds(ids))
        .catch(() => setSavedCollectionIds([]));
    }
  }, [image]);

  if (!image) return null;

  const handleToggleCollection = async (collection: Collection) => {
    const isSaved = savedCollectionIds.includes(collection.id);
    try {
      if (isSaved) {
        await collectionService.removeImageFromCollection(collection.id, image.id);
        setSavedCollectionIds((prev) => prev.filter((id) => id !== collection.id));
        toast(`Removed from "${collection.title}"`, { type: 'info' });
      } else {
        await collectionService.addImageToCollection(collection.id, image.id);
        setSavedCollectionIds((prev) => [...prev, collection.id]);
        toast(`Saved to "${collection.title}"`, { type: 'success' });
      }
      onRefreshCollections();
    } catch (err: any) {
      toast(err.message || 'Failed to update collection', { type: 'error' });
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast('Please enter a collection title', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await collectionService.createCollection({
        title: newTitle.trim(),
        description: newDesc.trim(),
        isPrivate: newIsPrivate,
      });

      await collectionService.addImageToCollection(created.id, image.id);
      setSavedCollectionIds((prev) => [...prev, created.id]);

      setNewTitle('');
      setNewDesc('');
      setIsCreatingInline(false);
      onRefreshCollections();
      toast(`Created & saved to "${created.title}"`, { type: 'success' });
    } catch (err: any) {
      toast(err.message || 'Failed to create collection', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-xl shadow-2xl p-5 text-[#111111] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e5e5e5] dark:border-[#2e2e2e] mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#111111] dark:text-white" />
            <h3 className="text-sm font-bold tracking-tight">Add to Collection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#767676] hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Image Mini Preview */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e] mb-4">
          <img
            src={image.thumbnailUrl || image.imageUrl}
            alt={image.title}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate">{image.title}</h4>
            <p className="text-[10px] text-[#767676] truncate">{image.prompt}</p>
          </div>
        </div>

        {/* Collection List */}
        {!isCreatingInline ? (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 mb-4">
            {collections.map((col) => {
              const isSaved = savedCollectionIds.includes(col.id);
              const preview = col.coverImage || (col.previewImages && col.previewImages[0]);

              return (
                <button
                  key={col.id}
                  onClick={() => handleToggleCollection(col)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors text-left ${
                    isSaved
                      ? 'border-[#111111] bg-[#f0f0f0] dark:border-white dark:bg-[#282828]'
                      : 'border-[#e5e5e5] dark:border-[#2e2e2e] hover:bg-[#f5f5f5] dark:hover:bg-[#242424]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded overflow-hidden bg-[#e0e0e0] dark:bg-[#2a2a2a] flex-shrink-0">
                      {preview && (
                        <img
                          src={preview.thumbnailUrl || preview.imageUrl}
                          alt={col.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{col.title}</p>
                      <p className="text-[10px] text-[#767676] truncate">
                        {col.imagesCount} items
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isSaved
                        ? 'bg-[#111111] border-[#111111] text-white dark:bg-white dark:border-white dark:text-[#111111]'
                        : 'border-[#cccccc] dark:border-[#444444]'
                    }`}
                  >
                    {isSaved && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}

            {collections.length === 0 && (
              <p className="text-xs text-center text-[#767676] py-3">No collections created yet.</p>
            )}
          </div>
        ) : (
          /* Inline Create Form */
          <form onSubmit={handleCreateCollection} className="space-y-3 mb-4 p-3.5 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e] animate-fadeIn">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#111111] dark:text-white">
              New Collection
            </h4>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 3D Renders"
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description..."
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-1.5 px-3 rounded-md bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create & Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingInline(false)}
                className="py-1.5 px-2.5 rounded-md bg-[#e5e5e5] dark:bg-[#333333] text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        {!isCreatingInline && (
          <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e5] dark:border-[#2e2e2e]">
            <button
              onClick={() => setIsCreatingInline(true)}
              className="flex items-center gap-1 text-xs font-bold text-[#111111] dark:text-white hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Collection</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-xs font-bold hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
