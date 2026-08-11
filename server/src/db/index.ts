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

class DatabaseStore {
  public pool: Pool;
  public isPostgresConnected: boolean = false;

  constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
    });
    this.initializePostgres();
  }

  private async initializePostgres() {
    try {
      const client = await this.pool.connect();
      client.release();
      this.isPostgresConnected = true;
      console.log('✅ Connected to PostgreSQL database successfully.');
    } catch (err: any) {
      console.error('❌ PostgreSQL connection failed:', err);
      this.isPostgresConnected = false;
    }
  }

  // ----------------- USERS -----------------
  async getUser(id: string): Promise<User | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapUser(res.rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) return null;
    return this.mapUser(res.rows[0]);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (res.rows.length === 0) return null;
    return this.mapUser(res.rows[0]);
  }

  async getAllUsers(): Promise<User[]> {
    const res = await this.pool.query('SELECT * FROM users');
    return res.rows.map(this.mapUser);
  }

  async upsertUser(user: User): Promise<User> {
    await this.pool.query(
      `INSERT INTO users (id, email, username, full_name, bio, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email, username = EXCLUDED.username, full_name = EXCLUDED.full_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url`,
      [user.id, user.email, user.username, user.fullName, user.bio, user.avatarUrl]
    );
    return user;
  }

  async getUserProfileData(userIdOrUsername: string) {
    let targetUser = await this.getUser(userIdOrUsername);
    if (!targetUser) {
      targetUser = await this.getUserByUsername(userIdOrUsername);
    }
    if (!targetUser) return null;

    const createdRes = await this.pool.query(`
      SELECT i.*, 
        u.id as user_id, u.username as user_username, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        s.id as style_id, s.name as style_name, s.slug as style_slug,
        EXISTS(SELECT 1 FROM likes l WHERE l.image_id = i.id AND l.user_id = $1) as is_liked
      FROM images i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN styles s ON i.style_id = s.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC`, [targetUser.id]);
    
    const createdImages = createdRes.rows.map(this.mapImageRow);

    const colsRes = await this.pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM collection_images ci WHERE ci.collection_id = c.id) as images_count
      FROM collections c
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC`, [targetUser.id]);
    const collections = colsRes.rows.map(this.mapCollectionRow);

    const likedRes = await this.pool.query(`
      SELECT i.*, 
        u.id as user_id, u.username as user_username, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        s.id as style_id, s.name as style_name, s.slug as style_slug,
        true as is_liked
      FROM images i
      JOIN likes l ON i.id = l.image_id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN styles s ON i.style_id = s.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC`, [targetUser.id]);
    
    const likedImages = likedRes.rows.map(this.mapImageRow);

    return {
      user: targetUser,
      stats: {
        createdCount: createdImages.length,
        collectionsCount: collections.length,
        likesCount: likedImages.length,
      },
      createdImages,
      collections,
      likedImages,
    };
  }

  // ----------------- TAXONOMY -----------------
  async getCategories(): Promise<Category[]> {
    const res = await this.pool.query(`
      SELECT c.*, COUNT(i.id) as images_count
      FROM categories c
      LEFT JOIN images i ON c.id = i.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    
    // For 'all' category, get total images
    const totalRes = await this.pool.query(`SELECT COUNT(*) FROM images`);
    const total = parseInt(totalRes.rows[0].count);

    return res.rows.map((r) => {
      if (r.slug === 'all') return { ...this.mapCategory(r), imagesCount: total };
      return { ...this.mapCategory(r), imagesCount: parseInt(r.images_count) };
    });
  }

  async getStyles(): Promise<Style[]> {
    const res = await this.pool.query(`
      SELECT s.*, COUNT(i.id) as images_count
      FROM styles s
      LEFT JOIN images i ON s.id = i.style_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    return res.rows.map((r) => ({ ...this.mapStyle(r), imagesCount: parseInt(r.images_count) }));
  }

  // ----------------- IMAGES -----------------
  async getImages(params: CursorPaginationParams, currentUserId?: string): Promise<PaginatedResponse<ImageItem>> {
    const { cursor, limit = 20, sort = 'trending', category, style, search, userId, aspectRatio } = params;

    let query = `
      SELECT i.*, 
        u.id as user_id, u.username as user_username, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        s.id as style_id, s.name as style_name, s.slug as style_slug,
        EXISTS(SELECT 1 FROM likes l WHERE l.image_id = i.id AND l.user_id = $1) as is_liked
      FROM images i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN styles s ON i.style_id = s.id
      WHERE 1=1
    `;
    const values: any[] = [currentUserId || null];
    let vIndex = 2;

    if (category && category !== 'all') {
      query += ` AND (c.slug = $${vIndex} OR c.id = $${vIndex})`;
      values.push(category);
      vIndex++;
    }
    if (style && style !== 'all') {
      query += ` AND (s.slug = $${vIndex} OR s.id = $${vIndex})`;
      values.push(style);
      vIndex++;
    }
    if (aspectRatio && aspectRatio !== 'all') {
      query += ` AND i.aspect_ratio = $${vIndex}`;
      values.push(aspectRatio);
      vIndex++;
    }
    if (userId) {
      query += ` AND i.user_id = $${vIndex}`;
      values.push(userId);
      vIndex++;
    }
    if (search && search.trim().length > 0) {
      query += ` AND (i.title ILIKE $${vIndex} OR i.prompt ILIKE $${vIndex})`;
      values.push(`%${search}%`);
      vIndex++;
    }

    if (sort === 'trending') {
      query += ` ORDER BY i.likes_count DESC, i.created_at DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY i.created_at DESC`;
    }

    // Since we're replacing cursor pagination with offset, we'll just pull everything and slice (for simplicity)
    // or properly implement offset.
    const res = await this.pool.query(query, values);
    let items = res.rows.map(this.mapImageRow);

    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < items.length ? (startIndex + limit).toString() : undefined;

    return {
      data: paginatedItems,
      pagination: {
        nextCursor: nextCursor || null,
        hasMore: !!nextCursor,
        total: items.length,
        limit,
      }
    };
  }

  async getImageById(id: string, currentUserId?: string): Promise<ImageItem | null> {
    const query = `
      SELECT i.*, 
        u.id as user_id, u.username as user_username, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        s.id as style_id, s.name as style_name, s.slug as style_slug,
        EXISTS(SELECT 1 FROM likes l WHERE l.image_id = i.id AND l.user_id = $1) as is_liked
      FROM images i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN styles s ON i.style_id = s.id
      WHERE i.id = $2
    `;
    const res = await this.pool.query(query, [currentUserId || null, id]);
    if (res.rows.length === 0) return null;
    return this.mapImageRow(res.rows[0]);
  }

  async trackImageView(imageId: string, userId?: string) {
    await this.pool.query(
      `INSERT INTO image_views (image_id, user_id) VALUES ($1, $2)`,
      [imageId, userId || null]
    );
    await this.pool.query(
      `UPDATE images SET views_count = views_count + 1 WHERE id = $1`,
      [imageId]
    );
  }

  async toggleLike(imageId: string, userId: string): Promise<boolean> {
    const res = await this.pool.query(
      `SELECT 1 FROM likes WHERE user_id = $1 AND image_id = $2`,
      [userId, imageId]
    );
    if (res.rows.length > 0) {
      await this.pool.query(`DELETE FROM likes WHERE user_id = $1 AND image_id = $2`, [userId, imageId]);
      await this.pool.query(`UPDATE images SET likes_count = likes_count - 1 WHERE id = $1`, [imageId]);
      return false; // unliked
    } else {
      await this.pool.query(`INSERT INTO likes (user_id, image_id) VALUES ($1, $2)`, [userId, imageId]);
      await this.pool.query(`UPDATE images SET likes_count = likes_count + 1 WHERE id = $1`, [imageId]);
      return true; // liked
    }
  }

  async getLikedImages(userId: string): Promise<ImageItem[]> {
    const res = await this.pool.query(`
      SELECT i.*, 
        u.id as user_id, u.username as user_username, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        s.id as style_id, s.name as style_name, s.slug as style_slug,
        true as is_liked
      FROM images i
      JOIN likes l ON i.id = l.image_id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN styles s ON i.style_id = s.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [userId]);
    return res.rows.map(this.mapImageRow);
  }

  async addGeneratedImages(images: ImageItem[]) {
    for (const img of images) {
      await this.pool.query(
        `INSERT INTO images (id, title, prompt, image_url, category_id, style_id, aspect_ratio, created_at, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [img.id, img.title, img.prompt, img.imageUrl, img.categoryId, img.style?.id, img.aspectRatio, img.createdAt, img.userId]
      );
    }
  }

  // ----------------- COLLECTIONS -----------------
  async getCollections(userId?: string): Promise<Collection[]> {
    const res = await this.pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM collection_images ci WHERE ci.collection_id = c.id) as images_count
      FROM collections c
      WHERE (c.is_private = false OR c.user_id = $1)
      ORDER BY c.created_at DESC
    `, [userId || null]);
    return res.rows.map(this.mapCollectionRow);
  }

  async getCollectionById(id: string, currentUserId?: string): Promise<(Collection & { images: ImageItem[] }) | null> {
    const colRes = await this.pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM collection_images ci WHERE ci.collection_id = c.id) as images_count
      FROM collections c
      WHERE c.id = $1 AND (c.is_private = false OR c.user_id = $2)
    `, [id, currentUserId || null]);
    
    if (colRes.rows.length === 0) return null;
    const collection = this.mapCollectionRow(colRes.rows[0]);

    const imgRes = await this.pool.query(`
      SELECT i.*, 
        u.id as user_id, u.username as user_username, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        s.id as style_id, s.name as style_name, s.slug as style_slug,
        EXISTS(SELECT 1 FROM likes l WHERE l.image_id = i.id AND l.user_id = $1) as is_liked
      FROM images i
      JOIN collection_images ci ON i.id = ci.image_id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN styles s ON i.style_id = s.id
      WHERE ci.collection_id = $2
      ORDER BY ci.created_at DESC
    `, [currentUserId || null, id]);

    return {
      ...collection,
      images: imgRes.rows.map(this.mapImageRow),
    };
  }

  async createCollection(data: Partial<Collection>): Promise<Collection> {
    const id = `col-${Date.now()}`;
    await this.pool.query(
      `INSERT INTO collections (id, title, description, user_id, is_private)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, data.title, data.description, data.userId, data.isPrivate || false]
    );
    return { ...data, id, imagesCount: 0 } as Collection;
  }

  async saveImageToCollection(collectionId: string, imageId: string, userId: string): Promise<boolean> {
    // Check ownership
    const colRes = await this.pool.query('SELECT user_id FROM collections WHERE id = $1', [collectionId]);
    if (colRes.rows.length === 0 || colRes.rows[0].user_id !== userId) return false;

    await this.pool.query(
      `INSERT INTO collection_images (id, collection_id, image_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [`ci-${Date.now()}`, collectionId, imageId]
    );
    
    // update cover image if needed
    const imgRes = await this.pool.query('SELECT image_url FROM images WHERE id = $1', [imageId]);
    await this.pool.query(
      `UPDATE collections SET cover_image_id = $1 WHERE id = $2 AND cover_image_id IS NULL`,
      [imageId, collectionId]
    );

    return true;
  }

  async removeImageFromCollection(collectionId: string, imageId: string, userId: string): Promise<boolean> {
    const colRes = await this.pool.query('SELECT user_id FROM collections WHERE id = $1', [collectionId]);
    if (colRes.rows.length === 0 || colRes.rows[0].user_id !== userId) return false;

    await this.pool.query(`DELETE FROM collection_images WHERE collection_id = $1 AND image_id = $2`, [collectionId, imageId]);
    return true;
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    const res = await this.pool.query(`DELETE FROM collections WHERE id = $1 AND user_id = $2`, [id, userId]);
    return res.rowCount !== null && res.rowCount > 0;
  }

  // --- MAPPERS ---
  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      fullName: row.full_name,
      bio: row.bio,
      avatarUrl: row.avatar_url,
    };
  }

  private mapCategory(row: any): Category {
    return { id: row.id, name: row.name, slug: row.slug, icon: 'LayoutGrid' };
  }

  private mapStyle(row: any): Style {
    return { id: row.id, name: row.name, slug: row.slug };
  }

  private mapCollectionRow(row: any): Collection {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      userId: row.user_id,
      coverImageId: row.cover_image_id,
      isPrivate: row.is_private,
      imagesCount: parseInt(row.images_count || '0'),
      createdAt: row.created_at,
    };
  }

  private mapImageRow = (row: any): ImageItem => {
    return {
      id: row.id,
      title: row.title,
      prompt: row.prompt,
      imageUrl: row.image_url,
      aspectRatio: row.aspect_ratio,
      categoryId: row.category_id,
      styleId: row.style_id,
      likesCount: row.likes_count,
      viewsCount: row.views_count,
      createdAt: row.created_at,
      userId: row.user_id,
      creator: row.user_id ? {
        id: row.user_id,
        username: row.user_username,
        fullName: row.user_full_name,
        avatarUrl: row.user_avatar_url,
      } : undefined,
      category: row.category_id ? { id: row.category_id, name: row.category_name, slug: row.category_slug } : undefined,
      style: row.style_id ? { id: row.style_id, name: row.style_name, slug: row.style_slug } : undefined,
      isLiked: row.is_liked || false,
      dominantColor: '#121212', // stub
      palette: [], // stub
    };
  };
}

export const db = new DatabaseStore();
