import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Download,
  Bookmark,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { Style, Category, ImageItem, GenerateImagePayload } from '../../types';
import { generateService } from '../../services/generateService';
import { useToast } from '../../context/ToastContext';
import { downloadImage } from '../../utils/download';

interface GenerationStudioProps {
  initialPrompt?: string;
  initialStyle?: string;
  initialAspectRatio?: '1:1' | '16:9' | '9:16' | '4:5' | '3:4' | '21:9';
  onOpenSaveModal: (image: ImageItem) => void;
  onExploreImage: (image: ImageItem) => void;
}

const SURPRISE_PROMPTS = [
  'A neon-lit cyberpunk samurai meditating beneath a holographic cherry blossom tree in Neo Tokyo rain',
  'An ethereal floating crystalline island with waterfalls pouring into golden clouds, Makoto Shinkai style',
  '3D isometric diorama of a cozy greenhouse bookstore at sunset with miniature glowing lanterns, octane render',
  'Hyper-detailed portrait of a celestial queen with starlight flowing from her hair, porcelain skin, 8k uhd',
  'A futuristic electric supercar speeding on a glowing violet synthwave wireframe highway towards twin moons',
  'An ancient arcane library hidden inside a gigantic hollow redwood tree, floating spellbooks and blue wisps',
];

const ASPECT_RATIO_PRESETS = [
  { label: '1:1', name: 'Square', iconW: 24, iconH: 24 },
  { label: '16:9', name: 'Landscape', iconW: 30, iconH: 17 },
  { label: '9:16', name: 'Story', iconW: 17, iconH: 30 },
  { label: '4:5', name: 'Social', iconW: 20, iconH: 25 },
  { label: '3:4', name: 'Vertical', iconW: 19, iconH: 25 },
  { label: '21:9', name: 'Cinema', iconW: 34, iconH: 15 },
];

export const GenerationStudio: React.FC<GenerationStudioProps> = ({
  initialPrompt = '',
  initialStyle = 'cinematic',
  initialAspectRatio = '1:1',
  onOpenSaveModal,
  onExploreImage,
}) => {
  const { toast } = useToast();

  const [prompt, setPrompt] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5' | '3:4' | '21:9'>(
    initialAspectRatio
  );
  const [batchCount, setBatchCount] = useState<number>(1);
  const [seed, setSeed] = useState<string>('');

  const [styles, setStyles] = useState<Style[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generatedResults, setGeneratedResults] = useState<ImageItem[]>([]);

  useEffect(() => {
    generateService.getStyles().then(setStyles).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialStyle) setSelectedStyle(initialStyle);
    if (initialAspectRatio) setSelectedAspectRatio(initialAspectRatio);
  }, [initialPrompt, initialStyle, initialAspectRatio]);

  const handleSurpriseMe = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(random);
    toast('Prompt loaded', { description: random, type: 'info' });
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      handleSurpriseMe();
      return;
    }
    const enhancers = [
      'volumetric lighting, detailed textures, 8k uhd, sharp focus',
      'vivid atmospheric sky, award winning visual, detailed composition',
      'highly detailed concept art, realistic reflections, 8k resolution',
    ];
    const chosen = enhancers[Math.floor(Math.random() * enhancers.length)];
    setPrompt((prev) => `${prev.trim()}, ${chosen}`);
    toast('Prompt enhanced', { type: 'success' });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast('Please enter a prompt to generate imagery', { type: 'error' });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(15);
    setGenerationStep('Analyzing prompt tokens & style parameters...');

    const timer1 = setTimeout(() => {
      setGenerationProgress(45);
      setGenerationStep('Synthesizing image latents...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setGenerationProgress(80);
      setGenerationStep('Denoising diffusion steps (24/30)...');
    }, 2400);

    try {
      const payload: GenerateImagePayload = {
        prompt: prompt.trim(),
        negativePrompt: showNegative && negativePrompt.trim() ? negativePrompt.trim() : undefined,
        styleSlug: selectedStyle,
        aspectRatio: selectedAspectRatio,
        numImages: batchCount,
        seed: seed ? parseInt(seed, 10) : undefined,
      };

      const images = await generateService.generateImages(payload);

      clearTimeout(timer1);
      clearTimeout(timer2);

      setGenerationProgress(100);
      setGenerationStep('Artwork synthesis complete!');

      setTimeout(() => {
        setGeneratedResults((prev) => [...images, ...prev]);
        setIsGenerating(false);
        toast(`Generated ${images.length} new artwork(s)`, { type: 'success' });
      }, 500);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      toast(err.message || 'Generation failed', { type: 'error' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Studio Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5] dark:border-[#2e2e2e]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-white uppercase font-sans">
            AI Generative Studio
          </h1>
          <p className="text-xs text-[#767676] mt-0.5">
            Create high-resolution AI art with custom styles and aspect ratios.
          </p>
        </div>

        {/* Action presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSurpriseMe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f5f5] dark:bg-[#242424] hover:bg-[#e8e8e8] dark:hover:bg-[#303030] text-xs font-semibold text-[#111111] dark:text-white border border-[#e5e5e5] dark:border-[#2e2e2e] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>

          <button
            onClick={handleEnhancePrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111] hover:bg-[#2c2c2c] dark:hover:bg-[#e0e0e0] text-xs font-semibold transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Enhance Prompt</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Prompt Input */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
                Prompt
              </label>
              <span className="text-[10px] text-[#767676] font-mono">{prompt.length}/1000</span>
            </div>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene: '3D isometric diorama of a cozy greenhouse bookstore at sunset'..."
              className="w-full p-3 bg-[#f8f8f8] dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#333333] rounded-lg text-xs leading-relaxed text-[#111111] dark:text-white placeholder-[#767676] focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors resize-none"
            />

            {/* Negative Prompt Toggle */}
            <div className="mt-2">
              <button
                onClick={() => setShowNegative(!showNegative)}
                className="text-[11px] font-medium text-[#767676] hover:text-[#111111] dark:hover:text-white"
              >
                <span>{showNegative ? '− Hide Negative Prompt' : '+ Add Negative Prompt'}</span>
              </button>

              {showNegative && (
                <div className="mt-1.5 animate-fadeIn">
                  <textarea
                    rows={2}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Avoid: blurry, bad anatomy, low quality, watermark..."
                    className="w-full p-2.5 bg-[#f8f8f8] dark:bg-[#222222] border border-red-200 dark:border-red-900/40 rounded-lg text-xs text-[#111111] dark:text-white placeholder-[#767676] focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Visual Style Presets */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#767676] block mb-2">
              Style Preset
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {styles.map((st) => {
                const isSelected = selectedStyle === st.slug;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStyle(st.slug)}
                    className={`rounded-lg overflow-hidden p-2 text-left border transition-colors ${
                      isSelected
                        ? 'border-[#111111] bg-[#f0f0f0] dark:border-white dark:bg-[#2c2c2c] text-[#111111] dark:text-white font-bold'
                        : 'border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#f8f8f8] dark:bg-[#222222] hover:border-[#cccccc] dark:hover:border-[#444444] text-[#555555] dark:text-[#a0a0a0]'
                    }`}
                  >
                    {st.previewUrl && (
                      <div className="w-full h-10 rounded overflow-hidden mb-1.5">
                        <img src={st.previewUrl} alt={st.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-[11px] block truncate">{st.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Aspect Ratio Picker */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#767676] block mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIO_PRESETS.map((ar) => {
                const isSelected = selectedAspectRatio === ar.label;
                return (
                  <button
                    key={ar.label}
                    onClick={() => setSelectedAspectRatio(ar.label as any)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-[#111111] bg-[#f0f0f0] dark:border-white dark:bg-[#2c2c2c] text-[#111111] dark:text-white font-bold'
                        : 'border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#f8f8f8] dark:bg-[#222222] text-[#767676] dark:text-[#a0a0a0] hover:border-[#cccccc]'
                    }`}
                  >
                    <div
                      className="border border-current rounded-sm mb-1.5"
                      style={{ width: `${ar.iconW}px`, height: `${ar.iconH}px` }}
                    />
                    <span className="text-xs">{ar.label}</span>
                    <span className="text-[9px] text-[#767676] truncate">{ar.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Batch Count & Seed */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
                Outputs
              </label>
              <div className="flex items-center gap-1 bg-[#f5f5f5] dark:bg-[#242424] p-0.5 rounded-md border border-[#e5e5e5] dark:border-[#2e2e2e]">
                {[1, 2, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBatchCount(num)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      batchCount === num
                        ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                        : 'text-[#767676] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] uppercase tracking-wider block mb-1">
                Seed (Optional)
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random seed..."
                className="w-full px-3 py-1.5 bg-[#f8f8f8] dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#333333] rounded-lg text-xs text-[#111111] dark:text-white placeholder-[#767676] focus:outline-none focus:border-[#111111] dark:focus:border-white"
              />
            </div>
          </div>

          {/* Generate Primary Button (Solid color, no gradient) */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3.5 px-5 rounded-lg font-bold text-sm text-white dark:text-[#111111] flex items-center justify-center gap-2 transition-colors ${
              isGenerating
                ? 'bg-[#555555] dark:bg-[#777777] cursor-not-allowed'
                : 'bg-[#111111] hover:bg-black dark:bg-white dark:hover:bg-[#e0e0e0]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Artwork...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Artwork ({batchCount}x)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Generation Canvas & Output Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Progress Card (Solid) */}
          {isGenerating && (
            <div className="p-6 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] text-center animate-fadeIn shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#242424] text-[#111111] dark:text-white flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-[#111111] dark:text-white mb-1">
                Creating AI Artwork
              </h3>
              <p className="text-xs text-[#767676] font-mono mb-4">{generationStep}</p>

              {/* Solid Progress Bar (No gradient) */}
              <div className="w-full max-w-sm mx-auto bg-[#f0f0f0] dark:bg-[#242424] h-2 rounded-full overflow-hidden mb-1.5">
                <div
                  className="bg-[#111111] dark:bg-white h-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#767676]">{generationProgress}%</span>
            </div>
          )}

          {/* Results Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111111] dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Generated Artworks</span>
                {generatedResults.length > 0 && (
                  <span className="text-xs px-2 py-0.2 rounded-full bg-[#f0f0f0] dark:bg-[#242424] text-[#767676]">
                    {generatedResults.length}
                  </span>
                )}
              </h3>
            </div>

            {generatedResults.length === 0 && !isGenerating && (
              <div className="py-20 text-center rounded-xl bg-white dark:bg-[#1a1a1a] p-6 border border-dashed border-[#e5e5e5] dark:border-[#2e2e2e]">
                <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[#242424] text-[#767676] flex items-center justify-center mx-auto mb-3">
                  <Wand2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#111111] dark:text-white mb-1">
                  No artworks generated yet
                </h4>
                <p className="text-xs text-[#767676] max-w-xs mx-auto mb-4">
                  Enter a prompt and click Generate to create high-resolution images.
                </p>
                <button
                  onClick={handleSurpriseMe}
                  className="px-3.5 py-1.5 rounded-lg bg-[#f5f5f5] dark:bg-[#242424] text-[#111111] dark:text-white text-xs font-semibold border border-[#e5e5e5] dark:border-[#2e2e2e]"
                >
                  Try an Inspiration Prompt
                </button>
              </div>
            )}

            {/* Generated Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generatedResults.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-sm flex flex-col justify-between"
                >
                  {/* Artwork Preview */}
                  <div
                    className="relative overflow-hidden cursor-pointer bg-black/40"
                    onClick={() => onExploreImage(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-auto object-cover hover:opacity-95 transition-opacity"
                    />
                  </div>

                  {/* Metadata & Actions */}
                  <div className="p-3.5 space-y-2">
                    <p className="text-xs font-medium text-[#333333] dark:text-[#dddddd] line-clamp-2">
                      {item.prompt}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0f0f0] dark:border-[#252525]">
                      <span className="text-[10px] uppercase font-bold text-[#767676]">
                        {item.aspectRatio} • {item.model}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenSaveModal(item)}
                          className="p-1.5 rounded-md bg-[#f5f5f5] dark:bg-[#242424] hover:bg-[#e8e8e8] dark:hover:bg-[#303030] text-[#111111] dark:text-white transition-colors"
                          title="Save to Collection"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const filename = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()}-${item.id}.jpg`;
                              toast('Downloading high-resolution artwork...', { type: 'info' });
                              await downloadImage(item.imageUrl, filename);
                              toast('Download complete', { type: 'success' });
                            } catch {
                              toast('Download failed', { type: 'error' });
                            }
                          }}
                          className="p-1.5 rounded-md bg-[#f5f5f5] dark:bg-[#242424] hover:bg-[#e8e8e8] dark:hover:bg-[#303030] text-[#111111] dark:text-white transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
