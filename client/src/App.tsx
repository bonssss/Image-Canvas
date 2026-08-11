import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/explore/HeroBanner';
import { FilterBar } from './components/explore/FilterBar';
import { MasonryGrid } from './components/explore/MasonryGrid';
import { ImageDetailModal } from './components/details/ImageDetailModal';
import { GenerationStudio } from './components/generate/GenerationStudio';
import { CollectionsView } from './components/collections/CollectionsView';
import { CollectionDetailView } from './components/collections/CollectionDetailView';
import { SaveToCollectionModal } from './components/collections/SaveToCollectionModal';
import { CreateCollectionModal } from './components/collections/CreateCollectionModal';
import { FavoritesView } from './components/explore/FavoritesView';
import { ProfileModal } from './components/profile/ProfileModal';
import { UserProfileView } from './components/profile/UserProfileView';
import { UploadModal } from './components/upload/UploadModal';
import { ImageItem, Collection, Category, Style } from './types';
import { imageService } from './services/imageService';
import { collectionService } from './services/collectionService';
import { generateService } from './services/generateService';
import { useToast } from './context/ToastContext';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { toast } = useToast();
  const { requireAuthAction } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'explore' | 'generate' | 'collections' | 'favorites'>('explore');

  // Explore & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'trending' | 'newest' | 'likes' | 'views'>('trending');

  // Data State
  const [images, setImages] = useState<ImageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Pagination & Loading
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Selected View State
  const [detailImage, setDetailImage] = useState<ImageItem | null>(null);
  const [saveImage, setSaveImage] = useState<ImageItem | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [activeUserIdentifier, setActiveUserIdentifier] = useState<string | null>(null);

  // Remix Generation Prep State
  const [remixPrompt, setRemixPrompt] = useState<string>('');
  const [remixStyle, setRemixStyle] = useState<string>('cinematic');
  const [remixAspectRatio, setRemixAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5' | '3:4' | '21:9'>('1:1');

  // Listen for auth required events
  useEffect(() => {
    const handleRequireLogin = () => {
      setShowProfileModal(true);
      toast('Please sign in to perform this action', { type: 'info' });
    };

    window.addEventListener('require-login', handleRequireLogin);
    return () => window.removeEventListener('require-login', handleRequireLogin);
  }, [toast]);

  // 1. Initial Taxonomies & Collections Load
  useEffect(() => {
    generateService.getCategories().then(setCategories).catch(console.error);
    generateService.getStyles().then(setStyles).catch(console.error);
    fetchCollections();
  }, []);

  const fetchCollections = () => {
    collectionService.getCollections().then(setCollections).catch(console.error);
  };

  // 2. Fetch Images based on filters
  const fetchImages = useCallback(
    async (cursor?: string, isAppend = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await imageService.getImages({
          cursor,
          limit: 16,
          sort: selectedSort,
          category: selectedCategory,
          style: selectedStyle,
          color: selectedColor,
          aspectRatio: selectedAspectRatio,
          search: searchQuery,
        });

        if (isAppend) {
          setImages((prev) => [...prev, ...res.data]);
        } else {
          setImages(res.data);
        }

        setNextCursor(res.pagination.nextCursor);
        setHasMore(res.pagination.hasMore);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch images');
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedCategory, selectedStyle, selectedColor, selectedAspectRatio, selectedSort]
  );

  // Trigger re-fetch on filter change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchImages();
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchImages]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoading && hasMore) {
      fetchImages(nextCursor, true);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStyle('all');
    setSelectedColor('all');
    setSelectedAspectRatio('all');
    setSelectedSort('trending');
  };

  const handleRemix = requireAuthAction((image: ImageItem) => {
    setRemixPrompt(image.prompt);
    setRemixStyle(image.style?.slug || 'cinematic');
    setRemixAspectRatio(
      (image.aspectRatio as '1:1' | '16:9' | '9:16' | '4:5' | '3:4' | '21:9') || '1:1'
    );
    setActiveTab('generate');
    toast('Preloaded prompt in Studio', { description: image.title, type: 'info' });
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212] text-[#111111] dark:text-[#f5f5f5] transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if ((tab === 'generate' || tab === 'collections' || tab === 'favorites')) {
            requireAuthAction(() => {
              setActiveTab(tab);
              setActiveCollectionId(null);
              setActiveUserIdentifier(null);
            })();
          } else {
            setActiveTab(tab);
            setActiveCollectionId(null);
            setActiveUserIdentifier(null);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenUpload={() => setShowUploadModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* VIEW: CREATOR PORTFOLIO */}
        {activeUserIdentifier ? (
          <UserProfileView
            userIdOrUsername={activeUserIdentifier}
            onBack={() => setActiveUserIdentifier(null)}
            onSelectImage={(img) => setDetailImage(img)}
            onOpenSaveModal={(img) => setSaveImage(img)}
            onRemix={handleRemix}
            onSelectCollection={(col) => {
              setActiveUserIdentifier(null);
              setActiveTab('collections');
              setActiveCollectionId(col.id);
            }}
            onOpenEditProfile={() => setShowProfileModal(true)}
          />
        ) : (
          <>
            {/* VIEW 1: EXPLORE / PHOTOS */}
            {activeTab === 'explore' && (
              <div>
                {/* Attractive & Simple Unsplash Hero Banner */}
                <HeroBanner
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectTrending={(tag) => setSearchQuery(tag)}
                />

                {/* Filter Bar */}
                <FilterBar
                  categories={categories}
                  styles={styles}
                  selectedCategory={selectedCategory}
                  selectedStyle={selectedStyle}
                  selectedColor={selectedColor}
                  selectedAspectRatio={selectedAspectRatio}
                  selectedSort={selectedSort}
                  onCategoryChange={setSelectedCategory}
                  onStyleChange={setSelectedStyle}
                  onColorChange={setSelectedColor}
                  onAspectRatioChange={setSelectedAspectRatio}
                  onSortChange={setSelectedSort}
                  onResetFilters={handleResetFilters}
                />

                {/* Masonry Grid */}
                <MasonryGrid
                  images={images}
                  isLoading={isLoading}
                  hasMore={hasMore}
                  error={error}
                  onLoadMore={handleLoadMore}
                  onSelectImage={(img) => setDetailImage(img)}
                  onOpenSaveModal={requireAuthAction((img: ImageItem) => setSaveImage(img))}
                  onRemix={handleRemix}
                  onRetry={() => fetchImages()}
                  onResetFilters={handleResetFilters}
                />
              </div>
            )}

            {/* VIEW 2: AI GENERATIVE STUDIO */}
            {activeTab === 'generate' && (
              <GenerationStudio
                initialPrompt={remixPrompt}
                initialStyle={remixStyle}
                initialAspectRatio={remixAspectRatio}
                onOpenSaveModal={(img) => setSaveImage(img)}
                onExploreImage={(img) => setDetailImage(img)}
              />
            )}

            {/* VIEW 3: COLLECTIONS */}
            {activeTab === 'collections' && (
              <div>
                {!activeCollectionId ? (
                  <CollectionsView
                    collections={collections}
                    onSelectCollection={(col) => setActiveCollectionId(col.id)}
                    onCreateNewCollection={() => setShowCreateCollection(true)}
                    onSelectImage={(img) => setDetailImage(img)}
                  />
                ) : (
                  <CollectionDetailView
                    collectionId={activeCollectionId}
                    onBack={() => {
                      setActiveCollectionId(null);
                      fetchCollections();
                    }}
                    onSelectImage={(img) => setDetailImage(img)}
                    onOpenSaveModal={(img) => setSaveImage(img)}
                    onRemix={handleRemix}
                    onCollectionDeleted={() => {
                      setActiveCollectionId(null);
                      fetchCollections();
                    }}
                  />
                )}
              </div>
            )}

            {/* VIEW 4: FAVORITES */}
            {activeTab === 'favorites' && (
              <FavoritesView
                onSelectImage={(img) => setDetailImage(img)}
                onOpenSaveModal={(img) => setSaveImage(img)}
                onRemix={handleRemix}
                onGoToExplore={() => setActiveTab('explore')}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      {detailImage && (
        <ImageDetailModal
          image={detailImage}
          onClose={() => setDetailImage(null)}
          onOpenSaveModal={requireAuthAction((img: ImageItem) => setSaveImage(img))}
          onRemix={handleRemix}
          onSelectImage={(img) => setDetailImage(img)}
        />
      )}

      {saveImage && (
        <SaveToCollectionModal
          image={saveImage}
          collections={collections}
          onClose={() => setSaveImage(null)}
          onRefreshCollections={fetchCollections}
        />
      )}

      {showCreateCollection && (
        <CreateCollectionModal
          onClose={() => setShowCreateCollection(false)}
          onCollectionCreated={fetchCollections}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onViewProfile={(identifier) => {
            setActiveUserIdentifier(identifier);
            setShowProfileModal(false);
          }}
        />
      )}

      {showUploadModal && (
        <UploadModal
          categories={categories}
          styles={styles}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchImages(); // Refresh the feed after upload
          }}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
