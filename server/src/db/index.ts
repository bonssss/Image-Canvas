import { Pool } from 'pg';
import { config } from '../config/env';
import {
  User,
  Category,
  Style,
  ImageItem,
  Collection,
  CursorPaginationParams,
  PaginatedResponse,
} from '../types';
import {
  seedUsers,
  seedCategories,
  seedStyles,
  seedImages,
  seedCollections,
  seedCollectionImages,
} from './seedData';

// In-memory relational store that mirrors the PostgreSQL schema
class DatabaseStore {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private styles: Map<string, Style> = new Map();
  private images: Map<string, ImageItem> = new Map();
  private collections: Map<string, Collection> = new Map();
  private collectionImages: Array<{ id: string; collectionId: string; imageId: string; createdAt: string }> = [];
  private likes: Set<string> = new Set(); // format: `${userId}:${imageId}`
  private imageViews: Array<{ imageId: string; userId?: string; createdAt: string }> = [];

  private pool: Pool | null = null;
  public isPostgresConnected: boolean = false;

  constructor() {
    this.seedInitialData();
    this.initializePostgres();
  }

  private async initializePostgres() {
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432/image_discovery')) {
        this.pool = new Pool({
          connectionString: config.databaseUrl,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        });
        const client = await this.pool.connect();
        client.release();
        this.isPostgresConnected = true;
        console.log('✅ Connected to PostgreSQL database successfully.');
      } else {
        console.log('ℹ️  Running in-memory database store initialized with rich AI dataset.');
      }
    } catch (err: any) {
      console.log('ℹ️  PostgreSQL connection unavailable or not configured. Running optimized in-memory store.');
      this.isPostgresConnected = false;
    }
  }

  private seedInitialData() {
    seedUsers.forEach((u) => this.users.set(u.id, { ...u }));
    seedCategories.forEach((c) => this.categories.set(c.id, { ...c }));
    seedStyles.forEach((s) => this.styles.set(s.id, { ...s }));
    seedImages.forEach((img) => this.images.set(img.id, { ...img }));
    seedCollections.forEach((col) => this.collections.set(col.id, { ...col }));
    seedCollectionImages.forEach((ci, idx) => {
      this.collectionImages.push({
        id: `ci-${idx + 1}`,
        collectionId: ci.collectionId,
        imageId: ci.imageId,
        createdAt: new Date().toISOString(),
      });
    });
  }

  // ----------------- USERS -----------------
  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) return u;
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async upsertUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async getUserProfileData(userIdOrUsername: string) {
    let targetUser = this.users.get(userIdOrUsername);
    if (!targetUser) {
      for (const u of this.users.values()) {
        if (u.username.toLowerCase() === userIdOrUsername.toLowerCase()) {
          targetUser = u;
          break;
        }
      }
    }
    if (!targetUser) return null;

    // Get images created by this user
    const createdImages = Array.from(this.images.values())
      .filter((img) => img.userId === targetUser!.id)
      .map((img) => this.hydrateImage(img, targetUser!.id));

    // Get collections created by this user
    const userCollections = Array.from(this.collections.values())
      .filter((col) => col.userId === targetUser!.id)
      .map((col) => this.hydrateCollection(col));

    // Get images liked by this user
    const likedImageIds: string[] = [];
    for (const entry of this.likes) {
      if (entry.startsWith(`${targetUser.id}:`)) {
        likedImageIds.push(entry.split(':')[1]);
      }
    }
    const likedImages = likedImageIds
      .map((id) => this.images.get(id))
      .filter(Boolean)
      .map((img) => this.hydrateImage(img!, targetUser!.id));

    return {
      user: targetUser,
      stats: {
        createdCount: createdImages.length,
        collectionsCount: userCollections.length,
        likesCount: likedImages.length,
      },
      createdImages,
      collections: userCollections,
      likedImages,
    };
  }

  // ----------------- TAXONOMY -----------------
  async getCategories(): Promise<Category[]> {
    const list = Array.from(this.categories.values());
    return list.map((cat) => {
      if (cat.slug === 'all') {
        return { ...cat, imagesCount: this.images.size };
      }
      const count = Array.from(this.images.values()).filter((img) => img.categoryId === cat.id).length;
      return { ...cat, imagesCount: count };
    });
  }

  async getStyles(): Promise<Style[]> {
    const list = Array.from(this.styles.values());
    return list.map((st) => {
      const count = Array.from(this.images.values()).filter((img) => img.styleId === st.id).length;
      return { ...st, imagesCount: count };
    });
  }

  // ----------------- IMAGES -----------------
  private hydrateImage(img: ImageItem, currentUserId?: string): ImageItem {
    const creator = img.userId ? this.users.get(img.userId) : undefined;
    const category = img.categoryId ? this.categories.get(img.categoryId) : undefined;
    const style = img.styleId ? this.styles.get(img.styleId) : undefined;
    const isLiked = currentUserId ? this.likes.has(`${currentUserId}:${img.id}`) : false;

    return {
      ...img,
      creator: creator
        ? {
            id: creator.id,
            username: creator.username,
            fullName: creator.fullName,
            avatarUrl: creator.avatarUrl,
          }
        : undefined,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : undefined,
      style: style ? { id: style.id, name: style.name, slug: style.slug } : undefined,
      isLiked,
    };
  }

  async getImages(params: CursorPaginationParams, currentUserId?: string): Promise<PaginatedResponse<ImageItem>> {
    const {
      cursor,
      limit = 20,
      sort = 'trending',
      category,
      style,
      color,
      search,
      userId,
      aspectRatio,
    } = params;

    let items = Array.from(this.images.values());

    // 1. Filter by category
    if (category && category !== 'all') {
      const catObj = Array.from(this.categories.values()).find(
        (c) => c.slug.toLowerCase() === category.toLowerCase() || c.id === category
      );
      if (catObj) {
        items = items.filter((img) => img.categoryId === catObj.id);
      }
    }

    // 2. Filter by style
    if (style && style !== 'all') {
      const styleObj = Array.from(this.styles.values()).find(
        (s) => s.slug.toLowerCase() === style.toLowerCase() || s.id === style
      );
      if (styleObj) {
        items = items.filter((img) => img.styleId === styleObj.id);
      }
    }

    // 3. Filter by color (hex or general palette similarity)
    if (color && color !== 'all') {
      const cleanColor = color.toLowerCase().trim();
      items = items.filter((img) => {
        if (img.dominantColor.toLowerCase().includes(cleanColor)) return true;
        return img.palette?.some((p) => p.toLowerCase().includes(cleanColor));
      });
    }

    // 4. Filter by aspect ratio
    if (aspectRatio && aspectRatio !== 'all') {
      items = items.filter((img) => img.aspectRatio === aspectRatio);
    }

    // 5. Filter by user
    if (userId) {
      items = items.filter((img) => img.userId === userId);
    }

    // 6. Search query
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (img) =>
          img.title.toLowerCase().includes(q) ||
          img.prompt.toLowerCase().includes(q) ||
          img.model.toLowerCase().includes(q)
      );
    }

    // 7. Sort
    items.sort((a, b) => {
      if (sort === 'trending') {
        const scoreA = a.likesCount * 3 + a.viewsCount + a.savesCount * 2;
        const scoreB = b.likesCount * 3 + b.viewsCount + b.savesCount * 2;
        return scoreB - scoreA;
      }
      if (sort === 'likes') {
        return b.likesCount - a.likesCount;
      }
      if (sort === 'views') {
        return b.viewsCount - a.viewsCount;
      }
      // 'newest'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 8. Cursor pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = items.findIndex((img) => img.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < items.length;
    const nextCursor = hasMore && paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].id : null;

    const hydrated = paginatedItems.map((img) => this.hydrateImage(img, currentUserId));

    return {
      data: hydrated,
      pagination: {
        nextCursor,
        hasMore,
        total: items.length,
        limit,
      },
    };
  }

  async getImageById(id: string, currentUserId?: string): Promise<ImageItem | null> {
    const img = this.images.get(id);
    if (!img) return null;
    return this.hydrateImage(img, currentUserId);
  }

  async createImage(image: ImageItem): Promise<ImageItem> {
    this.images.set(image.id, image);
    return this.hydrateImage(image, image.userId);
  }

  async toggleLike(imageId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const img = this.images.get(imageId);
    if (!img) throw new Error('Image not found');

    const key = `${userId}:${imageId}`;
    let isLiked = false;

    if (this.likes.has(key)) {
      this.likes.delete(key);
      img.likesCount = Math.max(0, img.likesCount - 1);
      isLiked = false;
    } else {
      this.likes.add(key);
      img.likesCount += 1;
      isLiked = true;
    }

    return { isLiked, likesCount: img.likesCount };
  }

  async incrementViews(imageId: string, userId?: string): Promise<number> {
    const img = this.images.get(imageId);
    if (!img) return 0;
    img.viewsCount += 1;
    this.imageViews.push({ imageId, userId, createdAt: new Date().toISOString() });
    return img.viewsCount;
  }

  async incrementDownloads(imageId: string): Promise<number> {
    const img = this.images.get(imageId);
    if (!img) return 0;
    img.downloadsCount += 1;
    return img.downloadsCount;
  }

  async getLikedImages(userId: string): Promise<ImageItem[]> {
    const likedImageIds: string[] = [];
    for (const key of this.likes.values()) {
      if (key.startsWith(`${userId}:`)) {
        likedImageIds.push(key.split(':')[1]);
      }
    }
    return likedImageIds
      .map((id) => this.images.get(id))
      .filter((img): img is ImageItem => !!img)
      .map((img) => this.hydrateImage(img, userId));
  }

  async getRelatedImages(imageId: string, limit = 8, currentUserId?: string): Promise<ImageItem[]> {
    const current = this.images.get(imageId);
    if (!current) return [];

    const items = Array.from(this.images.values()).filter((img) => img.id !== imageId);
    items.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.categoryId === current.categoryId) scoreA += 3;
      if (b.categoryId === current.categoryId) scoreB += 3;
      if (a.styleId === current.styleId) scoreA += 2;
      if (b.styleId === current.styleId) scoreB += 2;
      return scoreB - scoreA;
    });

    return items.slice(0, limit).map((img) => this.hydrateImage(img, currentUserId));
  }

  // ----------------- COLLECTIONS -----------------
  private hydrateCollection(col: Collection): Collection {
    const user = this.users.get(col.userId);
    const coverImage = col.coverImageId ? this.images.get(col.coverImageId) : undefined;

    // Get 3 preview images for collage preview card (Unsplash layout)
    const colImageLinks = this.collectionImages.filter((ci) => ci.collectionId === col.id);
    const previewImages = colImageLinks
      .map((ci) => this.images.get(ci.imageId))
      .filter((img): img is ImageItem => !!img)
      .slice(0, 3)
      .map((img) => this.hydrateImage(img));

    return {
      ...col,
      imagesCount: colImageLinks.length,
      user: user
        ? {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
          }
        : undefined,
      coverImage: coverImage ? this.hydrateImage(coverImage) : previewImages[0],
      previewImages,
    };
  }

  async getCollections(userId?: string): Promise<Collection[]> {
    let list = Array.from(this.collections.values());
    if (userId) {
      list = list.filter((col) => !col.isPrivate || col.userId === userId);
    } else {
      list = list.filter((col) => !col.isPrivate);
    }
    return list.map((col) => this.hydrateCollection(col));
  }

  async getCollectionById(id: string, currentUserId?: string): Promise<{ collection: Collection; images: ImageItem[] } | null> {
    const col = this.collections.get(id);
    if (!col) return null;
    if (col.isPrivate && col.userId !== currentUserId) {
      throw new Error('Unauthorized');
    }

    const links = this.collectionImages.filter((ci) => ci.collectionId === id);
    const images = links
      .map((ci) => this.images.get(ci.imageId))
      .filter((img): img is ImageItem => !!img)
      .map((img) => this.hydrateImage(img, currentUserId));

    return {
      collection: this.hydrateCollection(col),
      images,
    };
  }

  async createCollection(col: Collection): Promise<Collection> {
    this.collections.set(col.id, col);
    return this.hydrateCollection(col);
  }

  async updateCollection(id: string, updates: Partial<Collection>, userId: string): Promise<Collection> {
    const col = this.collections.get(id);
    if (!col) throw new Error('Collection not found');
    if (col.userId !== userId) throw new Error('Unauthorized');

    const updated = {
      ...col,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.collections.set(id, updated);
    return this.hydrateCollection(updated);
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    const col = this.collections.get(id);
    if (!col) return false;
    if (col.userId !== userId) throw new Error('Unauthorized');

    this.collections.delete(id);
    this.collectionImages = this.collectionImages.filter((ci) => ci.collectionId !== id);
    return true;
  }

  async addImageToCollection(collectionId: string, imageId: string, userId: string): Promise<boolean> {
    const col = this.collections.get(collectionId);
    if (!col) throw new Error('Collection not found');
    if (col.userId !== userId) throw new Error('Unauthorized');

    const exists = this.collectionImages.some(
      (ci) => ci.collectionId === collectionId && ci.imageId === imageId
    );
    if (!exists) {
      this.collectionImages.push({
        id: `ci-${Date.now()}`,
        collectionId,
        imageId,
        createdAt: new Date().toISOString(),
      });
      const img = this.images.get(imageId);
      if (img) img.savesCount += 1;
    }
    return true;
  }

  async removeImageFromCollection(collectionId: string, imageId: string, userId: string): Promise<boolean> {
    const col = this.collections.get(collectionId);
    if (!col) throw new Error('Collection not found');
    if (col.userId !== userId) throw new Error('Unauthorized');

    this.collectionImages = this.collectionImages.filter(
      (ci) => !(ci.collectionId === collectionId && ci.imageId === imageId)
    );
    const img = this.images.get(imageId);
    if (img) img.savesCount = Math.max(0, img.savesCount - 1);
    return true;
  }

  async getUserCollectionIdsForImage(userId: string, imageId: string): Promise<string[]> {
    const userCols = Array.from(this.collections.values()).filter((c) => c.userId === userId);
    const savedColIds: string[] = [];
    for (const c of userCols) {
      if (this.collectionImages.some((ci) => ci.collectionId === c.id && ci.imageId === imageId)) {
        savedColIds.push(c.id);
      }
    }
    return savedColIds;
  }
}

export const db = new DatabaseStore();
