import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Bookmark,
  Download,
  Copy,
  Check,
  Wand2,
  Sparkles,
} from 'lucide-react';
import { ImageItem } from '../../types';
import { imageService } from '../../services/imageService';
import { useToast } from '../../context/ToastContext';

import { downloadImage } from '../../utils/download';

interface ImageDetailModalProps {
  image: ImageItem | null;
  onClose: () => void;
  onOpenSaveModal: (image: ImageItem) => void;
  onRemix: (image: ImageItem) => void;
  onSelectImage: (image: ImageItem) => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  onClose,
  onOpenSaveModal,
  onRemix,
  onSelectImage,
}) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [relatedImages, setRelatedImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (image) {
      setIsLiked(image.isLiked || false);
      setLikesCount(image.likesCount || 0);

      imageService
        .getRelatedImages(image.id, 6)
        .then((res) => setRelatedImages(res))
        .catch(() => setRelatedImages([]));
    }
  }, [image]);

  if (!image) return null;

  const handleLike = async () => {
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
      toast('Failed to like image', { type: 'error' });
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopiedPrompt(true);
    toast('Prompt copied to clipboard', { type: 'success' });
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast(`Copied ${hex} to clipboard`, { type: 'info' });
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleDownload = async () => {
    try {
      imageService.trackDownload(image.id);
      const filename = `${image.title.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()}-${image.id}.jpg`;
      toast('Downloading full resolution image...', { type: 'info' });
      await downloadImage(image.imageUrl, filename);
      toast('Download complete', { type: 'success' });
    } catch {
      toast('Download failed', { type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-xl shadow-2xl flex flex-col my-auto text-[#111111] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] dark:bg-[#2a2a2a] dark:hover:bg-[#383838] text-[#111111] dark:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Large Image Stage (7 cols) */}
          <div className="lg:col-span-7 bg-[#f8f8f8] dark:bg-[#141414] flex items-center justify-center p-4 sm:p-6 rounded-t-xl lg:rounded-tr-none lg:rounded-l-xl relative min-h-[400px]">
            <img
              src={image.imageUrl}
              alt={image.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=85';
              }}
              className="max-h-[72vh] w-auto max-w-full rounded-lg object-contain shadow-md"
            />
          </div>

          {/* Right Column: Metadata & Actions (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
            <div className="space-y-5">
              {/* Creator Header & Actions */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5] dark:border-[#2e2e2e]">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      image.creator?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={image.creator?.fullName || 'Creator'}
                    className="w-10 h-10 rounded-full object-cover border border-[#e5e5e5] dark:border-[#333333]"
                  />
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{image.creator?.fullName || 'Creator'}</h4>
                    <p className="text-xs text-[#767676]">
                      @{image.creator?.username || 'artisan'}
                    </p>
                  </div>
                </div>

                {/* Like & Save Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      isLiked
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-[#242424] text-[#111111] dark:text-white border-[#e5e5e5] dark:border-[#333333] hover:bg-[#f5f5f5]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    onClick={() => onOpenSaveModal(image)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] hover:bg-[#2c2c2c] dark:hover:bg-[#e0e0e0] transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Title & Prompt Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
                    Prompt Description
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-xs font-semibold text-[#111111] dark:text-white hover:underline"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e] text-xs leading-relaxed text-[#333333] dark:text-[#e0e0e0] font-mono select-all">
                  {image.prompt}
                </div>
              </div>

              {/* Negative Prompt (if any) */}
              {image.negativePrompt && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676] block mb-1">
                    Negative Prompt
                  </span>
                  <p className="p-2.5 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e] text-xs text-red-600 dark:text-red-400 font-mono">
                    {image.negativePrompt}
                  </p>
                </div>
              )}

              {/* Dominant Color Palette */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676] block mb-1.5">
                  Color Palette
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {image.palette?.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => handleCopyHex(hex)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e] text-[11px] font-mono hover:border-[#111111] dark:hover:border-white transition-colors"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{hex}</span>
                      {copiedColor === hex && <Check className="w-3 h-3 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e]">
                  <span className="text-[10px] uppercase font-bold text-[#767676] block">Model</span>
                  <span className="text-xs font-semibold truncate block mt-0.5">
                    {image.model || 'Flux.1'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e]">
                  <span className="text-[10px] uppercase font-bold text-[#767676] block">Ratio</span>
                  <span className="text-xs font-semibold block mt-0.5 truncate">
                    {image.aspectRatio}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e]">
                  <span className="text-[10px] uppercase font-bold text-[#767676] block">Seed</span>
                  <span className="text-xs font-mono font-semibold block mt-0.5 truncate">
                    {image.seed || 4920194}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Remix / Generate More Like This & Download */}
            <div className="pt-5 mt-5 border-t border-[#e5e5e5] dark:border-[#2e2e2e] flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => {
                  onRemix(image);
                  onClose();
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111] font-bold text-xs hover:bg-[#2c2c2c] dark:hover:bg-[#e0e0e0] transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate More Like This</span>
              </button>

              <button
                onClick={handleDownload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#f5f5f5] text-[#111111] dark:bg-[#282828] dark:text-white font-bold text-xs border border-[#e5e5e5] dark:border-[#333333] hover:bg-[#e8e8e8] dark:hover:bg-[#303030] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Images Section */}
        {relatedImages.length > 0 && (
          <div className="p-6 border-t border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#f8f8f8] dark:bg-[#161616]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#767676] mb-3">
              Related Artworks
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {relatedImages.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectImage(rel)}
                  className="group relative rounded-lg overflow-hidden aspect-square cursor-pointer bg-[#eeeeee] dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#2e2e2e]"
                >
                  <img src={rel.thumbnailUrl} alt={rel.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                    <p className="text-[10px] font-semibold text-white truncate">{rel.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
