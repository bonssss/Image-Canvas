import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Layers,
  Sun,
  Moon,
  Search,
  Heart,
  User as UserIcon,
  ChevronDown,
  Wand2,
  UploadCloud,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: 'explore' | 'generate' | 'collections' | 'favorites';
  setActiveTab: (tab: 'explore' | 'generate' | 'collections' | 'favorites') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenProfile: () => void;
  onOpenUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenProfile,
  onOpenUpload,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#181818] border-b border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo - Unsplash style clean black icon */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#111111] dark:bg-white flex items-center justify-center text-white dark:text-[#111111]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold tracking-tight text-[#111111] dark:text-white font-sans uppercase">
              PromptCanvas
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#767676] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'explore') setActiveTab('explore');
              }}
              placeholder="Search high-resolution AI artwork..."
              className="w-full pl-10 pr-4 py-2 bg-[#f5f5f5] dark:bg-[#242424] border border-transparent focus:border-[#111111] dark:focus:border-white rounded-full text-sm text-[#111111] dark:text-white placeholder-[#767676] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#767676] hover:text-[#111111] dark:hover:text-white px-1.5 py-0.5 rounded bg-[#e5e5e5] dark:bg-[#333333]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-4">
          <button
            onClick={() => setActiveTab('explore')}
            className={`text-sm font-medium transition-colors py-2 px-2 border-b-2 ${activeTab === 'explore'
                ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white font-semibold'
                : 'border-transparent text-[#767676] hover:text-[#111111] dark:hover:text-white'
              }`}
          >
            Photos
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            className={`text-sm font-medium transition-colors py-2 px-2 border-b-2 ${activeTab === 'collections'
                ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white font-semibold'
                : 'border-transparent text-[#767676] hover:text-[#111111] dark:hover:text-white'
              }`}
          >
            Collections
          </button>

          {/* Generate Studio Solid Button (No gradients) */}
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'generate'
                ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                : 'bg-[#111111] hover:bg-[#2b2b2b] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e0e0e0]'
              }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>

          <button
            onClick={() => {
              if (!user) {
                onOpenProfile();
                return;
              }
              if (onOpenUpload) onOpenUpload();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors text-[#767676] hover:text-[#111111] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#242424]"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </nav>

        {/* Right Actions: Theme Toggle & User Profile */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-[#767676] hover:text-[#111111] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#242424] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#f5f5f5]" /> : <Moon className="w-4 h-4 text-[#111111]" />}
          </button>

          {/* Profile Menu Dropdown or Auth Buttons */}
          <div className="relative flex items-center gap-2">
            {!user ? (
              <>
                <button
                  onClick={onOpenProfile}
                  className="px-3 py-1.5 text-sm font-semibold text-[#111111] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#242424] rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={onOpenProfile}
                  className="px-3 py-1.5 text-sm font-semibold bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2b2b2b] dark:hover:bg-[#e0e0e0] rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#242424] transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-[#e5e5e5] dark:border-[#333333]"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#767676]" />
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] shadow-xl p-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    {/* Active user preview */}
                    <div className="p-3 border-b border-[#e5e5e5] dark:border-[#2e2e2e]">
                      <p className="text-[11px] font-semibold text-[#767676] uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-[#111111] dark:text-white truncate mt-0.5">{user.fullName}</p>
                      <p className="text-xs text-[#767676] truncate font-mono">@{user.username}</p>
                    </div>

                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#111111] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#242424] transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#767676]" />
                        <span>Manage Account</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
