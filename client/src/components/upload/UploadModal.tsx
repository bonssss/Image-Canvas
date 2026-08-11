import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Category, Style } from '../../types';
import { imageService } from '../../services/imageService';

interface UploadModalProps {
  categories: Category[];
  styles: Style[];
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ categories, styles, onClose, onSuccess }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast('File is too large (max 10MB)', { type: 'error' });
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast('Please select an image', { type: 'error' });
      return;
    }
    if (!categoryId) {
      toast('Please select a category', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', title.trim());
      formData.append('prompt', prompt.trim() || 'Uploaded Image');
      formData.append('categoryId', categoryId);
      formData.append('styleId', styleId);
      formData.append('aspectRatio', aspectRatio);

      await imageService.uploadImage(formData);
      toast('Image uploaded successfully!', { type: 'success' });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast(err.message || 'Failed to upload image', { type: 'error' });
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
        className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-xl shadow-2xl p-5 text-[#111111] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-[#767676] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 tracking-tight">Upload Image</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${previewUrl ? 'border-[#e5e5e5] dark:border-[#333333]' : 'border-[#111111] dark:border-white hover:bg-[#f8f8f8] dark:hover:bg-[#242424]'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2 text-[#767676]" />
                <p className="text-sm font-semibold">Click to browse or drag and drop</p>
                <p className="text-xs text-[#767676]">JPG, PNG, WebP up to 10MB</p>
              </>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#767676] block mb-1 uppercase tracking-wider">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Neon Cyberpunk City"
              className="w-full px-3 py-2 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#767676] block mb-1 uppercase tracking-wider">Prompt / Description</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Prompt or description of the image"
              className="w-full px-3 py-2 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1 uppercase tracking-wider">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1 uppercase tracking-wider">Style (Optional)</label>
              <select
                value={styleId}
                onChange={(e) => setStyleId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none"
              >
                <option value="">None</option>
                {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#767676] block mb-1 uppercase tracking-wider">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none"
            >
              <option value="1:1">1:1 Square</option>
              <option value="16:9">16:9 Landscape</option>
              <option value="9:16">9:16 Portrait</option>
              <option value="4:5">4:5 Portrait</option>
              <option value="3:4">3:4 Portrait</option>
              <option value="21:9">21:9 Ultrawide</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-sm font-bold hover:bg-black transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Uploading...</span>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload Image
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
