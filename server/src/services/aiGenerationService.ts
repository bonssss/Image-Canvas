import { v4 as uuidv4 } from 'uuid';
import { GenerateImagePayload, ImageItem } from '../types';
import { db } from '../db';

// Aspect ratio to resolution mapping
const ASPECT_RATIO_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '4:5': { width: 864, height: 1080 },
  '3:4': { width: 768, height: 1024 },
  '21:9': { width: 1344, height: 576 },
};

// Color palettes based on style/subject
const COLOR_PRESETS: Array<{ dominant: string; palette: string[] }> = [
  { dominant: '#06b6d4', palette: ['#06b6d4', '#ec4899', '#3b82f6', '#0f172a', '#e2e8f0'] },
  { dominant: '#8b5cf6', palette: ['#8b5cf6', '#ec4899', '#38bdf8', '#18181b', '#f43f5e'] },
  { dominant: '#10b981', palette: ['#10b981', '#0284c7', '#1e293b', '#67e8f9', '#f8fafc'] },
  { dominant: '#f59e0b', palette: ['#f59e0b', '#fb7185', '#60a5fa', '#fef08a', '#1e1b4b'] },
  { dominant: '#ec4899', palette: ['#ec4899', '#8b5cf6', '#06b6d4', '#111827', '#e0e7ff'] },
  { dominant: '#d97706', palette: ['#d97706', '#991b1b', '#1c1917', '#fbbf24', '#f5f5f4'] },
];

export class AiGenerationService {
  async generate(payload: GenerateImagePayload, userId: string = 'u-101'): Promise<ImageItem[]> {
    const {
      prompt,
      negativePrompt,
      styleSlug = 'cinematic',
      aspectRatio = '1:1',
      categorySlug = 'scifi',
      seed = Math.floor(Math.random() * 100000000),
      numImages = 1,
      guidanceScale = 7.5,
      steps = 30,
      model = 'Flux.1-Dev',
    } = payload;

    const styles = await db.getStyles();
    const categories = await db.getCategories();

    const selectedStyle = styles.find((s) => s.slug === styleSlug) || styles[0];
    const selectedCategory = categories.find((c) => c.slug === categorySlug) || categories[1];

    const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio] || { width: 1024, height: 1024 };

    // Combine user prompt with style modifier for enhanced fidelity
    const enhancedPrompt = `${prompt}, ${selectedStyle.promptModifier}`;
    const generatedImages: ImageItem[] = [];

    for (let i = 0; i < Math.min(numImages, 4); i++) {
      const currentSeed = seed + i * 1337;
      const colorPreset = COLOR_PRESETS[(seed + i) % COLOR_PRESETS.length];

      // Generate public CDN AI image via Pollinations AI / Flux endpoint with fallback
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.width}&height=${dims.height}&seed=${currentSeed}&model=flux&nologo=true`;
      const thumbnailUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${Math.round(dims.width / 2)}&height=${Math.round(dims.height / 2)}&seed=${currentSeed}&model=flux&nologo=true`;

      // Extract a clean title from the prompt (first 5-7 words)
      const cleanTitle = prompt
        .split(' ')
        .slice(0, 6)
        .join(' ')
        .replace(/[^\w\s]/gi, '')
        .trim();
      const title = cleanTitle.length > 0 ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'AI Generative Artwork';

      const newImage: ImageItem = {
        id: `gen-${uuidv4()}`,
        title,
        prompt,
        negativePrompt: negativePrompt || undefined,
        imageUrl: generatedImageUrl,
        thumbnailUrl,
        width: dims.width,
        height: dims.height,
        aspectRatio,
        dominantColor: colorPreset.dominant,
        palette: colorPreset.palette,
        model,
        seed: currentSeed,
        guidanceScale,
        steps,
        likesCount: 0,
        savesCount: 0,
        viewsCount: 1,
        downloadsCount: 0,
        isFeatured: false,
        userId,
        categoryId: selectedCategory.id,
        styleId: selectedStyle.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await db.createImage(newImage);
      generatedImages.push(saved);
    }

    return generatedImages;
  }
}

export const aiGenerationService = new AiGenerationService();
