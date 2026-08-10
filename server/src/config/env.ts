import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/image_discovery',
  supabase: {
    url: process.env.SUPABASE_URL || 'https://demo-project.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'demo-anon-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key',
    storageBucket: process.env.STORAGE_BUCKET || 'images',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxGenerations: 20, // max 20 image generation requests per 15 min
  },
};
