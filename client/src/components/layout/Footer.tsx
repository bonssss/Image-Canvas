import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#181818] py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#111111] dark:text-white uppercase font-sans">
              PromptCanvas
            </span>
            <span className="text-xs text-[#767676]">
              • High-Resolution AI Image Discovery
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#767676]">
            <span>Photos</span>
            <span>Collections</span>
            <span>AI Studio</span>
            <span>PostgreSQL API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
