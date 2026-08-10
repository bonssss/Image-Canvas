import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { collectionService } from '../../services/collectionService';
import { useToast } from '../../context/ToastContext';

interface CreateCollectionModalProps {
  onClose: () => void;
  onCollectionCreated: () => void;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  onClose,
  onCollectionCreated,
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Please enter a collection title', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await collectionService.createCollection({
        title: title.trim(),
        description: description.trim() || undefined,
        isPrivate,
      });

      toast('Collection created successfully', { type: 'success' });
      onCollectionCreated();
      onClose();
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
        className="relative w-full max-w-md bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-xl shadow-2xl p-6 text-[#111111] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e5e5e5] dark:border-[#2e2e2e] mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-[#111111] dark:text-white" />
            <h3 className="text-sm font-bold tracking-tight">Create New Collection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#767676] hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#767676] block mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cyberpunk Architecture"
              className="w-full px-3 py-2 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#767676] block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your collection..."
              className="w-full px-3 py-2 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] dark:focus:border-white resize-none"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#555555] dark:text-[#cccccc]">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#111111]"
              />
              <span>Keep this collection private</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[#e5e5e5] dark:border-[#2e2e2e]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-lg bg-[#f5f5f5] dark:bg-[#242424] text-xs font-semibold text-[#111111] dark:text-white hover:bg-[#e8e8e8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
