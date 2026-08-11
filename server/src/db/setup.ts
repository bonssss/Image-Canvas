import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import {
  seedUsers,
  seedCategories,
  seedStyles,
  seedImages,
  seedCollections,
  seedCollectionImages,
} from './seedData';

async function setupDatabase() {
  const pool = new Pool({
    connectionString: config.databaseUrl,
  });

  try {
    console.log('Connecting to PostgreSQL database...', config.databaseUrl);
    const client = await pool.connect();
    console.log('Connected!');

    // 1. Run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Running schema.sql...');
    await client.query(schemaSql);
    console.log('Schema created successfully.');

    // 2. Insert seed data
    console.log('Inserting seed users...');
    for (const user of seedUsers) {
      await client.query(
        `INSERT INTO users (id, email, username, full_name, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, user.username, user.fullName, user.bio, user.avatarUrl]
      );
    }

    console.log('Inserting seed categories...');
    for (const cat of seedCategories) {
      await client.query(
        `INSERT INTO categories (id, name, slug)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.slug]
      );
    }

    console.log('Inserting seed styles...');
    for (const style of seedStyles) {
      await client.query(
        `INSERT INTO styles (id, name, slug)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [style.id, style.name, style.slug]
      );
    }

    console.log('Inserting seed images...');
    for (const img of seedImages) {
      await client.query(
        `INSERT INTO images (id, title, prompt, image_url, category_id, style_id, aspect_ratio, likes_count, views_count, created_at, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          img.id,
          img.title,
          img.prompt,
          img.imageUrl,
          img.categoryId,
          img.style?.id || null, // handle style relation
          img.aspectRatio,
          img.likesCount,
          img.viewsCount,
          img.createdAt,
          img.userId
        ]
      );
    }

    console.log('Inserting seed collections...');
    for (const col of seedCollections) {
      await client.query(
        `INSERT INTO collections (id, title, description, user_id, cover_image_id, is_private, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          col.id,
          col.title,
          col.description,
          col.userId,
          col.coverImageId,
          col.isPrivate,
          col.createdAt
        ]
      );
    }

    console.log('Inserting seed collection images...');
    let counter = 1;
    for (const ci of seedCollectionImages) {
      await client.query(
        `INSERT INTO collection_images (id, collection_id, image_id, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [`ci-seed-${counter++}`, ci.collectionId, ci.imageId, new Date().toISOString()]
      );
    }

    console.log('✅ Database setup and seeding complete!');
    client.release();
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
