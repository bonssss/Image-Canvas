-- Drop existing tables if they exist
DROP TABLE IF EXISTS collection_images CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS image_views CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS styles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires_at TIMESTAMP,
    bio TEXT,
    avatar_url TEXT
);

-- Categories Table
CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- Styles Table
CREATE TABLE styles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- Images Table
CREATE TABLE images (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(id),
    style_id VARCHAR(255) REFERENCES styles(id),
    aspect_ratio VARCHAR(50) NOT NULL,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL
);

-- Collections Table
CREATE TABLE collections (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_image_id VARCHAR(255),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collection Images Junction Table
CREATE TABLE collection_images (
    id VARCHAR(255) PRIMARY KEY,
    collection_id VARCHAR(255) NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    image_id VARCHAR(255) NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, image_id)
);

-- Likes Table
CREATE TABLE likes (
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_id VARCHAR(255) NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, image_id)
);

-- Image Views Tracking
CREATE TABLE image_views (
    id SERIAL PRIMARY KEY,
    image_id VARCHAR(255) NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
