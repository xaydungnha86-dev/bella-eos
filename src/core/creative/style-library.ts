/**
 * BELLA EOS — Creative Planning Engine
 * style-library.ts
 *
 * Defines STYLE_LIBRARY: a registry of StyleGraph objects.
 * Each style is a fully-specified creative graph — not a flat string.
 * Adding a new style = adding one entry here. Pipeline unchanged.
 */

import type { StyleGraph } from './creative-plan';

export const STYLE_LIBRARY: Record<string, StyleGraph> = {

  // ── LUXURY ─────────────────────────────────────────────────────────────────
  luxury: {
    id: 'luxury',
    displayName: 'Luxury Premium',
    luxuryLevel: 5,
    palette: {
      surface:   '#0D0D0D',
      dominant:  '#D4AF37',
      highlight: '#F9F0D0',
      shadow:    '#1A1200',
    },
    material:    'ultra-polished Italian Calacatta marble with fine gold leaf inlay trim, warm organic stone surfaces',
    texture:     'smooth glassy reflection, subtle metallic sheen, soft velvet undertones',
    depth:       'very shallow depth of field, f/1.2 bokeh, creamy dreamy background separation, razor-sharp foreground',
    postProcess: 'warm Kodachrome cinematic LUT, rich shadow detail, HDR highlights, subtle warm film grain',
    lighting: {
      ambient: 'warm diffused golden hour ambient glow, soft 4200K color temperature',
      key:     'left-side Profoto B10 studio softbox, hard catchlight in reflective surfaces',
      rim:     'subtle gold rim highlight on right edge, separating subject from background',
      mood:    'opulent evening warmth, intimate luxury atmosphere, candlelit ambience',
    },
    camera: {
      body:    'Hasselblad H6D-100c medium format',
      lens:    '110mm f/2.0 equivalent, ultra-wide tonal range',
      angle:   'eye-level, slight 5-degree upward tilt, balanced frontal perspective',
      quality: '100MP photorealistic, commercial product photography standard, 8K resolution',
    },
    environment: 'ultra-premium executive spa wellness suite with floor-to-ceiling glass walls, polished marble floor, curated organic botanical arrangements, muted gold accents',
    negativeBase: 'text, words, letters, typography, logo, watermark, signature, cheap, plastic, cluttered, low quality, oversaturated, neon',
  },

  // ── MINIMALIST ────────────────────────────────────────────────────────────
  minimalist: {
    id: 'minimalist',
    displayName: 'Modern Minimalist',
    luxuryLevel: 2,
    palette: {
      surface:   '#F5F5F0',
      dominant:  '#1A1A1A',
      highlight: '#FFFFFF',
      shadow:    '#E0E0D8',
    },
    material:    'matte plaster walls, light Scandinavian white oak wood grain, raw brushed concrete, frosted glass',
    texture:     'clean flat surfaces, no ornamentation, precise geometric edges',
    depth:       'moderate depth of field, f/4.0, clean separation between subject and background',
    postProcess: 'neutral clean grade, slight desaturation, crisp white balance, architectural visualization aesthetic',
    lighting: {
      ambient: 'bright even natural daylight from north-facing window, 6500K cool white',
      key:     'large soft diffused light panel, shadow-less fill light',
      rim:     'very subtle cool rim, barely visible, preserving clean edges',
      mood:    'airy, open, breathing, high-key minimal atmosphere',
    },
    camera: {
      body:    'Sony A7R V full-frame mirrorless',
      lens:    '50mm f/4.0 prime lens, zero distortion, architect perspective',
      angle:   'perfectly level, eye-level, centered axis, no tilt',
      quality: '61MP clean architectural-grade photorealism, crisp fine detail',
    },
    environment: 'sterile clean Scandinavian interior, matte white plaster walls, light oak parquet floor, single minimal architectural accent element on right side',
    negativeBase: 'text, letters, words, logo, gold, busy, cluttered, dark shadows, warm tones, luxury ornament',
  },

  // ── CYBERPUNK ────────────────────────────────────────────────────────────
  cyberpunk: {
    id: 'cyberpunk',
    displayName: 'Tech Cyberpunk',
    luxuryLevel: 3,
    palette: {
      surface:   '#07061A',
      dominant:  '#7C3AED',
      highlight: '#22D3EE',
      shadow:    '#020215',
    },
    material:    'brushed titanium, dark anodized carbon fiber, polished tempered glass panels, LED-lit acrylic',
    texture:     'reflective metallic surfaces, micro-circuit-board texture, holographic diffraction grating',
    depth:       'cinematic anamorphic bokeh, f/1.8, strong lens flare streaks, atmospheric foreground haze',
    postProcess: 'high-contrast cyberpunk grade, teal-purple split tone, bloom glow on light sources, scanline vignette',
    lighting: {
      ambient: 'dark void ambience, deep navy-black base, 1200K very cold ambient',
      key:     'harsh cyan backlight from holographic display panel, hard specular on metal',
      rim:     'intense purple-magenta neon rim, strong separation, glow bleeding into fog',
      mood:    'dystopian futuristic corporate lab at 3am, electric, dangerous, ultra-modern',
    },
    camera: {
      body:    'Leica SL2 full-frame with anamorphic adapter',
      lens:    '35mm f/1.8 anamorphic, cinematic widescreen lens flares',
      angle:   'dynamic high-angle, 20-degree Dutch tilt, slightly above eye-level',
      quality: '8K raw cinematic, sci-fi feature film quality, raytraced reflections',
    },
    environment: 'futuristic AI research facility, glowing server rack arrays, 3D holographic data interfaces floating in air, dark metallic ceiling with exposed cable conduits, neon-lit fog',
    negativeBase: 'text, letters, logo, watermark, retro vintage, warm tones, sunlight, natural, plants, flowers',
  },

  // ── BENTO TECH ──────────────────────────────────────────────────────────
  bento: {
    id: 'bento',
    displayName: '3D Bento Tech',
    luxuryLevel: 3,
    palette: {
      surface:   '#0F172A',
      dominant:  '#6366F1',
      highlight: '#E2E8F0',
      shadow:    '#020617',
    },
    material:    'frosted glassmorphism UI panels, floating 3D isometric elements, smooth gradient plastic forms',
    texture:     'soft glass frosted blur, smooth rounded corners, subtle inner shadow',
    depth:       'isometric perspective with multi-plane depth, soft ambient occlusion, tilt-shift miniature effect',
    postProcess: 'pastel gradient color grade, soft purple-indigo tones, gentle bloom on surfaces',
    lighting: {
      ambient: 'flat soft 3D render ambient, even studio lighting without harsh shadows',
      key:     'top-left volumetric light source, clean ambient occlusion shadows',
      rim:     'subtle indigo highlight on floating glass elements',
      mood:    'clean modern SaaS product aesthetic, digital-first, professional',
    },
    camera: {
      body:    'Canon EOS R5 with macro lens',
      lens:    '85mm f/2.8 tilt-shift, isometric perspective control',
      angle:   '30-degree isometric elevated angle, looking down from upper right',
      quality: '45MP 3D render quality, Blender Cycles-style photorealism, smooth gradients',
    },
    environment: '3D abstract tech composition: glassmorphic dashboard UI tiles floating in dark space, glowing neon graph lines, geometric prism shapes, floating data spheres',
    negativeBase: 'text, signature, watermark, photorealistic human faces, noisy grain, chaotic layout, realistic outdoor background',
  },

  // ── CORPORATE ────────────────────────────────────────────────────────────
  corporate: {
    id: 'corporate',
    displayName: 'Corporate Professional',
    luxuryLevel: 2,
    palette: {
      surface:   '#F8FAFF',
      dominant:  '#1E40AF',
      highlight: '#DBEAFE',
      shadow:    '#CBD5E1',
    },
    material:    'tempered glass office partitions, polished aluminium desk surfaces, premium executive leather',
    texture:     'clean flat professional surfaces, subtle fabric weave, smooth glass',
    depth:       'moderate depth of field f/2.8, professional portrait separation, soft out-of-focus background',
    postProcess: 'clean corporate color grade, neutral professional tone, high-contrast edges, no creative processing',
    lighting: {
      ambient: 'bright professional office window light, 5500K neutral daylight',
      key:     'large diffused overhead panel light, clean even exposure across scene',
      rim:     'very subtle cool rim light from window reflection',
      mood:    'professional confidence, executive clarity, boardroom authority',
    },
    camera: {
      body:    'Nikon Z9 full-frame mirrorless',
      lens:    '85mm f/2.2 portrait prime, natural compression',
      angle:   'perfectly level eye-level, clean frontal perspective',
      quality: '45MP professional corporate photography standard, crisp neutral',
    },
    environment: 'modern executive boardroom, floor-to-ceiling glass walls overlooking city skyline, clean white minimalist table, premium leather chairs, subtle branded accent wall',
    negativeBase: 'text, letters, watermark, fantasy elements, neon, cyberpunk, excessive warmth, cartoon',
  },

  // ── NATURE / WELLNESS ────────────────────────────────────────────────────
  nature: {
    id: 'nature',
    displayName: 'Nature Wellness',
    luxuryLevel: 3,
    palette: {
      surface:   '#F0F4EE',
      dominant:  '#2D6A4F',
      highlight: '#B7E4C7',
      shadow:    '#1B4332',
    },
    material:    'smooth river stone, live-edge walnut wood, organic linen fabric, hand-thrown ceramic',
    texture:     'natural organic textures, visible wood grain, soft linen weave, smooth stone',
    depth:       'shallow f/2.0 bokeh, natural out-of-focus greenery background',
    postProcess: 'nature-grade warm earthy tone, soft green tint, gentle vignette, film-emulation',
    lighting: {
      ambient: 'warm forest dappled light, soft golden morning sun 5800K',
      key:     'natural window light from upper left, soft diffused through sheer curtain',
      rim:     'warm green nature rim glow',
      mood:    'serene, grounding, organic, slow-living wellness',
    },
    camera: {
      body:    'Sony A7C compact mirrorless',
      lens:    '85mm f/2.0, warm portrait rendering',
      angle:   'slightly elevated bird-eye, intimate product placement perspective',
      quality: '33MP warm organic photorealism, lifestyle product photography',
    },
    environment: 'serene zen wellness studio with natural materials, flowing sheer curtains, potted tropical plants, smooth stone accent wall, morning sunlight streaming in from left side',
    negativeBase: 'text, logo, watermark, urban elements, technology, dark, harsh shadows, neon',
  },

  // ── HIGH FASHION ─────────────────────────────────────────────────────────
  fashion: {
    id: 'fashion',
    displayName: 'High Fashion Editorial',
    luxuryLevel: 4,
    palette: {
      surface:   '#FAF9F7',
      dominant:  '#1C1C1E',
      highlight: '#F5F0E8',
      shadow:    '#2C2C2E',
    },
    material:    'brushed chrome display rack, polished terrazzo floor, high-gloss lacquered surfaces',
    texture:     'premium fabric drape, subtle embossing, high-polish reflective surfaces',
    depth:       'shallow editorial f/1.8 bokeh, magazine-style subject isolation',
    postProcess: 'fashion editorial grade, slight desaturation, strong contrast, Harper\'s Bazaar aesthetic',
    lighting: {
      ambient: 'clean bright studio strobe ambient, 5600K bright white',
      key:     'large Profoto octabox, hard fashion shadows',
      rim:     'hard white rim strip light, sharp edge definition',
      mood:    'cold luxury editorial, high-fashion severity, couture',
    },
    camera: {
      body:    'Phase One XF IQ4 150MP medium format',
      lens:    '80mm f/2.8 digital back lens, extreme detail capture',
      angle:   'eye-level or slightly below, editorial power angle',
      quality: '150MP ultra-high-res editorial fashion photography',
    },
    environment: 'luxury fashion boutique interior, minimalist chrome clothing display rack with premium neutral-tone garments on right, high-gloss terrazzo floor, soft spotlight halo from above',
    negativeBase: 'text, logo, watermark, casual, cheap fabric, busy background, colorful noise',
  },

};
