-- ==============================================================================
-- AI Image Discovery & Generation Platform - PostgreSQL Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STYLES TABLE
CREATE TABLE IF NOT EXISTS styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    prompt_modifier TEXT NOT NULL,
    preview_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. IMAGES TABLE
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    aspect_ratio VARCHAR(20) NOT NULL DEFAULT '1:1',
    dominant_color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    palette JSONB DEFAULT '[]'::jsonb,
    model VARCHAR(100) DEFAULT 'Flux.1-Dev',
    seed BIGINT,
    guidance_scale NUMERIC(4, 2) DEFAULT 7.5,
    steps INTEGER DEFAULT 30,
    likes_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
    images_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. COLLECTION_IMAGES TABLE (Join table)
CREATE TABLE IF NOT EXISTS collection_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_collection_image UNIQUE (collection_id, image_id)
);

-- 7. LIKES TABLE
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_image_like UNIQUE (user_id, image_id)
);

-- 8. IMAGE_VIEWS TABLE
CREATE TABLE IF NOT EXISTS image_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & CURSOR PAGINATION
-- ==============================================================================

-- Composite index for cursor pagination on images
CREATE INDEX IF NOT EXISTS idx_images_created_at_id ON images (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_images_likes_count_id ON images (likes_count DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_images_views_count_id ON images (views_count DESC, id DESC);

-- Filtering indexes
CREATE INDEX IF NOT EXISTS idx_images_category_id ON images (category_id);
CREATE INDEX IF NOT EXISTS idx_images_style_id ON images (style_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images (user_id);
CREATE INDEX IF NOT EXISTS idx_images_dominant_color ON images (dominant_color);
CREATE INDEX IF NOT EXISTS idx_images_is_featured ON images (is_featured);

-- Full text search index on prompt and title
CREATE INDEX IF NOT EXISTS idx_images_search ON images USING gin(to_tsvector('english', title || ' ' || prompt));

-- Collection lookup indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections (user_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_collection_id ON collection_images (collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_image_id ON collection_images (image_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes (user_id);
CREATE INDEX IF NOT EXISTS idx_likes_image_id ON likes (image_id);
