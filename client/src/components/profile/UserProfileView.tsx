import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  Layers,
  Heart,
  Edit3,
  Globe,
  Calendar,
} from 'lucide-react';
import { User, ImageItem, Collection } from '../../types';
import { authService, UserProfileData } from '../../services/authService';
import { ImageCard } from '../explore/ImageCard';
import { CollectionsView } from '../collections/CollectionsView';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface UserProfileViewProps {
  userIdOrUsername: string;
  onBack: () => void;
  onSelectImage: (image: ImageItem) => void;
  onOpenSaveModal: (image: ImageItem) => void;
  onRemix: (image: ImageItem) => void;
  onSelectCollection: (col: Collection) => void;
  onOpenEditProfile: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userIdOrUsername,
  onBack,
  onSelectImage,
  onOpenSaveModal,
  onRemix,
  onSelectCollection,
  onOpenEditProfile,
}) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'created' | 'collections' | 'likes'>('created');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    authService
      .getUserProfile(userIdOrUsername)
      .then(setProfileData)
      .catch((err) => {
        toast(err.message || 'Failed to load creator profile', { type: 'error' });
      })
      .finally(() => setIsLoading(false));
  }, [userIdOrUsername]);

  if (isLoading || !profileData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#111111] dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#767676]">Loading creator portfolio...</p>
      </div>
    );
  }

  const { user, stats, createdImages, collections, likedImages } = profileData;
  const isSelf = currentUser?.id === user.id;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f5f5f5] dark:bg-[#242424] text-[#111111] dark:text-white hover:bg-[#e8e8e8] dark:hover:bg-[#303030] text-xs font-semibold mb-6 transition-colors border border-[#e5e5e5] dark:border-[#2e2e2e]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Explore</span>
      </button>

      {/* Creator Profile Header */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Large Avatar */}
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
            alt={user.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#e5e5e5] dark:border-[#333333] shadow-md flex-shrink-0"
          />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white">
                  {user.fullName}
                </h1>
                <p className="text-sm font-mono text-[#767676] mt-0.5">@{user.username}</p>
              </div>

              {/* Action Button */}
              {isSelf ? (
                <button
                  onClick={onOpenEditProfile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e0e0e0] font-semibold text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => toast(`Followed ${user.fullName}`, { type: 'success' })}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-semibold text-xs transition-colors"
                >
                  <span>Follow Creator</span>
                </button>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-xs sm:text-sm text-[#555555] dark:text-[#a0a0a0] mt-3 max-w-2xl leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-5 pt-4 border-t border-[#f0f0f0] dark:border-[#252525] text-xs">
              <div className="flex items-center gap-1.5 text-[#767676]">
                <ImageIcon className="w-3.5 h-3.5 text-[#111111] dark:text-white" />
                <span className="font-bold text-[#111111] dark:text-white">{stats.createdCount}</span>
                <span>Artworks</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#767676]">
                <Layers className="w-3.5 h-3.5 text-[#111111] dark:text-white" />
                <span className="font-bold text-[#111111] dark:text-white">{stats.collectionsCount}</span>
                <span>Collections</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#767676]">
                <Heart className="w-3.5 h-3.5 text-[#111111] dark:text-white" />
                <span className="font-bold text-[#111111] dark:text-white">{stats.likesCount}</span>
                <span>Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Portfolio Navigation Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
        <button
          onClick={() => setActiveTab('created')}
          className={`flex items-center gap-2 py-3 px-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'created'
              ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white'
              : 'border-transparent text-[#767676] hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Created Artworks ({createdImages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 py-3 px-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'collections'
              ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white'
              : 'border-transparent text-[#767676] hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Collections ({collections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('likes')}
          className={`flex items-center gap-2 py-3 px-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'likes'
              ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white'
              : 'border-transparent text-[#767676] hover:text-[#111111] dark:hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Liked Photos ({likedImages.length})</span>
        </button>
      </div>

      {/* Tab 1: Created Artworks */}
      {activeTab === 'created' && (
        <div>
          {createdImages.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#767676]">
              No artworks created by this user yet.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
              {createdImages.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  onClick={() => onSelectImage(img)}
                  onOpenSaveModal={onOpenSaveModal}
                  onRemix={onRemix}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Collections */}
      {activeTab === 'collections' && (
        <CollectionsView
          collections={collections}
          onSelectCollection={onSelectCollection}
          onCreateNewCollection={() => {}}
          onSelectImage={onSelectImage}
        />
      )}

      {/* Tab 3: Liked Photos */}
      {activeTab === 'likes' && (
        <div>
          {likedImages.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#767676]">
              No liked photos yet.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
              {likedImages.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  onClick={() => onSelectImage(img)}
                  onOpenSaveModal={onOpenSaveModal}
                  onRemix={onRemix}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
