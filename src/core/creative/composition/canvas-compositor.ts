/**
 * Canvas Compositor - Overlay text & design elements lên ảnh AI
 * Dùng Sharp (cross-platform, dễ cài hơn @napi-rs/canvas)
 */

import sharp from 'sharp';
import type { CreativeBrief } from '@/types/creative-intelligence';
import fs from 'fs';
import path from 'path';

interface CompositorInput {
  backgroundImagePath: string;  // Local file path in /public/temp-banners
  creativeBrief: CreativeBrief;
  brandDna: {
    brandName: string;
    brandColors: {
      primary: string;
      accent: string;
    };
  };
  format: '16:9' | '1:1' | '9:16';
}

interface CompositorOutput {
  imageBuffer: Buffer;
  format: string;
}

export class CanvasCompositor {
  private static DIMENSIONS = {
    '16:9': { width: 1200, height: 630 },
    '1:1': { width: 1080, height: 1080 },
    '9:16': { width: 1080, height: 1920 }
  };

  static async compose(input: CompositorInput): Promise<CompositorOutput> {
    const { backgroundImagePath, creativeBrief, brandDna, format } = input;
    const { width, height } = this.DIMENSIONS[format];

    console.log('[CanvasCompositor] Starting Sharp composition...');
    console.log(`[CanvasCompositor] Size: ${width}x${height}`);
    console.log(`[CanvasCompositor] Background: ${backgroundImagePath}`);

    // 1. Load and resize background
    let backgroundBuffer;
    try {
      const fullPath = path.join(process.cwd(), 'public', backgroundImagePath);
      backgroundBuffer = await sharp(fullPath)
        .resize(width, height, { fit: 'cover' })
        .toBuffer();
      console.log('[CanvasCompositor] ✓ Background loaded');
    } catch (e) {
      console.error('[CanvasCompositor] Failed to load background:', e);
      throw new Error('Failed to load background image');
    }

    // 2. Create SVG overlay với text
    const headline = creativeBrief.posterHeadline || creativeBrief.campaignGoal;
    const svgOverlay = this.generateSVGOverlay(headline, brandDna, width, height, creativeBrief);
    
    // Debug: Log SVG content
    console.log('[CanvasCompositor] Generated SVG (first 500 chars):');
    console.log(svgOverlay.substring(0, 500));
    console.log('[CanvasCompositor] Headline being used:', headline);

    // 3. Composite background + SVG overlay
    try {
      const composited = await sharp(backgroundBuffer)
        .composite([{
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0
        }])
        .png()
        .toBuffer();

      console.log('[CanvasCompositor] ✓ Composition complete');

      return {
        imageBuffer: composited,
        format: 'image/png'
      };
    } catch (svgError: any) {
      console.error('[CanvasCompositor] SVG composition failed:', svgError.message);
      console.error('[CanvasCompositor] SVG content that caused error:');
      console.error(svgOverlay);
      
      // Fallback: Return background without overlay
      console.log('[CanvasCompositor] Falling back to background without overlay');
      return {
        imageBuffer: backgroundBuffer,
        format: 'image/png'
      };
    }
  }

  private static generateSVGOverlay(
    headline: string, 
    brandDna: any, 
    width: number, 
    height: number,
    creativeBrief?: any
  ): string {
    const { brandName, brandColors, targetSegment } = brandDna;
    const accentColor = brandColors.accent || '#D4AF37';

    // Wrap headline nếu quá dài
    const maxCharsPerLine = 30;
    const words = headline.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length > maxCharsPerLine && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    const headlineY = height / 2 - 80;
    const headlineElements = lines.map((line, i) => 
      `<text x="60" y="${headlineY + i * 65}" font-size="52" font-weight="bold" fill="white" font-family="Arial, sans-serif" style="text-shadow: 2px 2px 10px rgba(0,0,0,0.8);">${this.escapeXml(line)}</text>`
    ).join('\n');

    // Extract bullets from creative brief or use intelligent defaults
    const bullets = this.extractBulletPoints(creativeBrief, targetSegment);

    
    // Render bullet points dynamically
    const bulletY = height / 2 + 20;
    const bulletElements = bullets.map((bullet, i) => 
      `<text x="60" y="${bulletY + i * 40}" font-size="22" fill="white" font-family="Arial, sans-serif">${this.escapeXml(`» ${bullet}`)}</text>`
    ).join('\n');

    // Extract CTA from brief or use default
    const ctaText = creativeBrief?.callToAction || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0.3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.6);stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#E91E63;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF4081;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Overlay gradient -->
  <rect width="${width}" height="${height}" fill="url(#grad1)" />
  
  <!-- Logo badge (top-left) -->
  <rect x="50" y="50" width="220" height="45" rx="22" fill="${accentColor}" />
  <text x="160" y="78" font-size="18" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">${this.escapeXml(brandName.toUpperCase())}</text>
  
  <!-- Offer badge (top-right) -->
  <rect x="${width - 320}" y="50" width="270" height="45" rx="22" fill="rgba(255,255,255,0.95)" />
  <text x="${width - 185}" y="78" font-size="16" font-weight="bold" fill="#E91E63" text-anchor="middle" font-family="Arial, sans-serif">${this.escapeXml('NHẬN TƯ VẤN MIỄN PHÍ')}</text>
  
  <!-- Headline -->
  ${headlineElements}
  
  <!-- Bullet points (dynamic) -->
  ${bulletElements}
  
  <!-- CTA Button -->
  <rect x="${(width - 380) / 2}" y="${height - 100}" width="380" height="60" rx="30" fill="url(#grad2)" filter="drop-shadow(0 4px 20px rgba(233, 30, 99, 0.5))" />
  <text x="${width / 2}" y="${height - 62}" font-size="24" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">${this.escapeXml('› ' + ctaText)}</text>
</svg>
    `.trim();
  }

  private static escapeXml(unsafe: string): string {
    if (!unsafe) return '';
    // Escape & FIRST to avoid double-escaping
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Extract 3 key bullet points from creative brief or generate intelligent defaults
   */
  private static extractBulletPoints(creativeBrief: any, targetSegment: string): string[] {
    // Try to extract from creative brief first
    if (creativeBrief?.keyBenefits && Array.isArray(creativeBrief.keyBenefits)) {
      return creativeBrief.keyBenefits.slice(0, 3);
    }

    // Try to extract from design direction
    if (creativeBrief?.designDirection) {
      const text = creativeBrief.designDirection;
      const bulletMatches = text.match(/[•\-\*]\s*([^\n•\-\*]{10,80})/g);
      if (bulletMatches && bulletMatches.length >= 3) {
        return bulletMatches
          .slice(0, 3)
          .map((m: string) => m.replace(/^[•\-\*]\s*/, '').trim());
      }
    }

    // Intelligent domain-based defaults
    const segment = (targetSegment || '').toLowerCase();
    
    if (segment.includes('spa') || segment.includes('thẩm mỹ') || segment.includes('beauty')) {
      return [
        'Tối ưu xếp lịch & phân ca KTV',
        'Báo cáo doanh thu thời gian thực',
        'Giữ chân 95% khách hàng VIP'
      ];
    }
    
    if (segment.includes('nhà hàng') || segment.includes('restaurant') || segment.includes('f&b')) {
      return [
        'Quản lý đặt bàn & thực đơn thông minh',
        'Tối ưu hóa chi phí nguyên liệu',
        'Tăng 40% hiệu suất phục vụ'
      ];
    }
    
    if (segment.includes('bất động sản') || segment.includes('real estate')) {
      return [
        'Quản lý danh mục BĐS toàn diện',
        'Tự động hóa tiếp thị đa kênh',
        'Phân tích xu hướng thị trường'
      ];
    }
    
    if (segment.includes('doanh nghiệp') || segment.includes('enterprise') || segment.includes('sme')) {
      return [
        'Tự động hóa 80% quy trình vận hành',
        'Quản lý tập trung & theo dõi KPI',
        'Tăng 300% hiệu suất làm việc'
      ];
    }

    // Generic fallback
    return [
      'Tự động hóa quy trình vận hành',
      'Báo cáo phân tích thời gian thực',
      'Tăng trưởng doanh thu bền vững'
    ];
  }
}
