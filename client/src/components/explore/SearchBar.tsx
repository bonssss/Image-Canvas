import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggested: (query: string) => void;
}

const TRENDING_SEARCHES = [
  'Cyberpunk Neo Tokyo',
  'Ethereal Alpine Lake',
  'Glass Pavilion',
  '3D Isometric Diorama',
  'Anime Golden Hour',
  'Bioluminescent Forest',
  'Retro Synthwave Grid',
];

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSelectSuggested }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    onChange(val);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      {/* Search Input Box (Clean Unsplash style, no gradient blur) */}
      <div className="relative flex items-center bg-[#f5f5f5] dark:bg-[#1f1f1f] border border-[#e5e5e5] dark:border-[#2e2e2e] focus-within:border-[#111111] dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-[#181818] rounded-full transition-all">
        <div className="pl-4 pr-2 text-[#767676]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder="Search AI photos by prompt, style, architecture, or colors..."
          className="w-full py-3 pr-4 text-sm bg-transparent text-[#111111] dark:text-white placeholder-[#767676] focus:outline-none"
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="mr-3 p-1 rounded-full text-[#767676] hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trending Search Suggestions */}
      <div className="flex items-center gap-2 mt-3 px-1 overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-1 text-xs font-semibold text-[#767676] uppercase tracking-wider flex-shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-[#111111] dark:text-white" />
          <span>Trending:</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TRENDING_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => onSelectSuggested(item)}
              className="px-2.5 py-1 rounded-md text-xs font-normal bg-[#f5f5f5] dark:bg-[#222222] hover:bg-[#e8e8e8] dark:hover:bg-[#303030] text-[#555555] dark:text-[#cccccc] hover:text-[#111111] dark:hover:text-white transition-colors flex-shrink-0 border border-[#e5e5e5] dark:border-[#2e2e2e]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
