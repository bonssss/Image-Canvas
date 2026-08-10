import React from 'react';
import {
  Sparkles,
  Terminal,
  Trees,
  Box,
  Palette,
  Building2,
  Wand2,
  User as UserIcon,
  Shapes,
  Feather,
  ChevronDown,
} from 'lucide-react';
import { Category, Style } from '../../types';

interface FilterBarProps {
  categories: Category[];
  styles: Style[];
  selectedCategory: string;
  selectedStyle: string;
  selectedColor: string;
  selectedAspectRatio: string;
  selectedSort: 'trending' | 'newest' | 'likes' | 'views';
  onCategoryChange: (slug: string) => void;
  onStyleChange: (slug: string) => void;
  onColorChange: (color: string) => void;
  onAspectRatioChange: (ratio: string) => void;
  onSortChange: (sort: 'trending' | 'newest' | 'likes' | 'views') => void;
  onResetFilters: () => void;
}

const COLOR_SWATCHES = [
  { name: 'All Colors', value: 'all', hex: 'transparent' },
  { name: 'Neon Cyan', value: '#06b6d4', hex: '#06b6d4' },
  { name: 'Cyber Purple', value: '#8b5cf6', hex: '#8b5cf6' },
  { name: 'Emerald Nature', value: '#10b981', hex: '#10b981' },
  { name: 'Sunset Amber', value: '#f59e0b', hex: '#f59e0b' },
  { name: 'Hot Pink', value: '#ec4899', hex: '#ec4899' },
  { name: 'Crimson Baroque', value: '#e11d48', hex: '#e11d48' },
  { name: 'Lime Botanical', value: '#84cc16', hex: '#84cc16' },
  { name: 'Monochrome', value: '#27272a', hex: '#27272a' },
];

const ASPECT_RATIOS = [
  { label: 'All Ratios', value: 'all' },
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Landscape', value: '16:9' },
  { label: '9:16 Portrait', value: '9:16' },
  { label: '4:5 Social', value: '4:5' },
  { label: '4:3 Classic', value: '4:3' },
  { label: '3:4 Vertical', value: '3:4' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  styles,
  selectedCategory,
  selectedStyle,
  selectedColor,
  selectedAspectRatio,
  selectedSort,
  onCategoryChange,
  onStyleChange,
  onColorChange,
  onAspectRatioChange,
  onSortChange,
  onResetFilters,
}) => {
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-3.5 h-3.5" />;
      case 'Trees':
        return <Trees className="w-3.5 h-3.5" />;
      case 'Box':
        return <Box className="w-3.5 h-3.5" />;
      case 'Palette':
        return <Palette className="w-3.5 h-3.5" />;
      case 'Building2':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'Wand2':
        return <Wand2 className="w-3.5 h-3.5" />;
      case 'User':
        return <UserIcon className="w-3.5 h-3.5" />;
      case 'Shapes':
        return <Shapes className="w-3.5 h-3.5" />;
      case 'Feather':
        return <Feather className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const hasActiveFilter =
    selectedCategory !== 'all' ||
    selectedStyle !== 'all' ||
    selectedColor !== 'all' ||
    selectedAspectRatio !== 'all' ||
    selectedSort !== 'trending';

  return (
    <div className="sticky top-16 z-30 w-full bg-white dark:bg-[#181818] border-b border-[#e5e5e5] dark:border-[#2a2a2a] py-3 px-4 sm:px-6 mb-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Row 1: Categories Horizontal Slider (Solid Unsplash tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-[#111111] text-white border-[#111111] dark:bg-white dark:text-[#111111] dark:border-white font-semibold'
                    : 'bg-[#f5f5f5] dark:bg-[#242424] text-[#555555] dark:text-[#cccccc] hover:bg-[#e8e8e8] dark:hover:bg-[#303030] border-transparent'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.name}</span>
                {cat.imagesCount !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                        : 'bg-[#e5e5e5] dark:bg-[#333333] text-[#767676] dark:text-[#999999]'
                    }`}
                  >
                    {cat.imagesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary Filters (Styles, Colors, Aspect Ratio, Sort) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f0f0f0] dark:border-[#252525] text-xs">
          {/* Styles Pill Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[#767676] font-semibold uppercase tracking-wider text-[10px] mr-1 hidden sm:inline">
              Style:
            </span>
            <button
              onClick={() => onStyleChange('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedStyle === 'all'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] dark:text-[#a0a0a0] hover:bg-[#e8e8e8] dark:hover:bg-[#303030]'
              }`}
            >
              All Styles
            </button>
            {styles.map((st) => (
              <button
                key={st.id}
                onClick={() => onStyleChange(st.slug)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedStyle === st.slug
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] dark:text-[#a0a0a0] hover:bg-[#e8e8e8] dark:hover:bg-[#303030]'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>

          {/* Controls: Color Swatches + Aspect Ratio + Sort + Clear */}
          <div className="flex items-center gap-3 flex-wrap ml-auto">
            {/* Color Palette Swatches */}
            <div className="flex items-center gap-1 bg-[#f5f5f5] dark:bg-[#242424] p-1 rounded-md border border-[#e5e5e5] dark:border-[#2e2e2e]">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  title={swatch.name}
                  onClick={() => onColorChange(swatch.value)}
                  className={`w-4 h-4 rounded-full transition-transform flex items-center justify-center ${
                    selectedColor === swatch.value
                      ? 'ring-2 ring-[#111111] dark:ring-white scale-110'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: swatch.hex === 'transparent' ? undefined : swatch.hex,
                  }}
                >
                  {swatch.hex === 'transparent' && (
                    <span className="text-[8px] font-bold text-[#767676]">ALL</span>
                  )}
                </button>
              ))}
            </div>

            {/* Aspect Ratio Selector */}
            <div className="relative">
              <select
                value={selectedAspectRatio}
                onChange={(e) => onAspectRatioChange(e.target.value)}
                className="appearance-none bg-[#f5f5f5] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-md pl-3 pr-7 py-1 text-xs text-[#111111] dark:text-white font-medium focus:outline-none focus:border-[#111111] dark:focus:border-white"
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar.value} value={ar.value} className="bg-white dark:bg-[#181818]">
                    {ar.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#767676] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="appearance-none bg-[#f5f5f5] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-md pl-3 pr-7 py-1 text-xs text-[#111111] dark:text-white font-medium focus:outline-none focus:border-[#111111] dark:focus:border-white"
              >
                <option value="trending" className="bg-white dark:bg-[#181818]">Trending</option>
                <option value="likes" className="bg-white dark:bg-[#181818]">Top Liked</option>
                <option value="views" className="bg-white dark:bg-[#181818]">Most Viewed</option>
                <option value="newest" className="bg-white dark:bg-[#181818]">Newest</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#767676] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilter && (
              <button
                onClick={onResetFilters}
                className="text-xs font-semibold text-[#111111] dark:text-white hover:underline ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
