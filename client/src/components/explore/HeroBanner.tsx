import React from 'react';
import { Search, X, TrendingUp } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTrending: (query: string) => void;
}

const TRENDING_TAGS = [
  'Cyberpunk',
  'Architecture',
  '3D Isometric',
  'Anime Sky',
  'Minimalist',
  'Watercolor',
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onSelectTrending,
}) => {
  return (
    <div className="relative w-full h-[380px] sm:h-[420px] mb-6 overflow-hidden flex items-center justify-center bg-[#111111] select-none">
      {/* Background Hero Image */}
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=85"
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
      />

      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Center Content Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 text-left sm:text-center text-white">
        {/* Simple & Bold Title */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2 font-sans">
          PromptCanvas
        </h1>

        {/* Minimal Subtitle */}
        <p className="text-sm sm:text-base text-gray-200 mb-6 font-normal max-w-lg mx-auto">
          The internet’s source for freely usable AI art. Powered by creators everywhere.
        </p>

        {/* Large Unsplash-style Search Bar */}
        <div className="relative flex items-center bg-white text-[#111111] rounded-lg shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-white">
          <div className="pl-4 pr-2 text-[#767676]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search high-resolution AI photos, prompts, styles..."
            className="w-full py-3.5 pr-4 text-sm sm:text-base bg-transparent text-[#111111] placeholder-[#767676] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="mr-3 p-1 rounded-full text-[#767676] hover:text-[#111111] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Trending Searches Tags */}
        <div className="flex items-center justify-start sm:justify-center gap-2 mt-4 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Trending:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTrending(tag)}
                className="px-2.5 py-1 rounded-md text-xs bg-white/15 hover:bg-white/30 text-white font-medium transition-colors border border-white/20 flex-shrink-0 backdrop-blur-none"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Attribution on bottom-right (Unsplash signature touch) */}
      <div className="absolute bottom-3 right-4 z-10 hidden sm:flex items-center gap-1 text-[11px] text-white/70">
        <span>Photo by</span>
        <span className="font-semibold text-white">Elena Rostova</span>
      </div>
    </div>
  );
};
