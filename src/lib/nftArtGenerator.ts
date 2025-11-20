/**
 * NFT Art Generator - Creates beautiful, unique SVG art for Work NFTs
 * Inspired by OpenSea's dynamic NFT visuals
 */

// ⚠️ [DEPRECATED] ⚠️
// This file is no longer used in the UI.
// NFT images now come from static files in /public/NFTs/
// See: src/lib/staticNftImages.ts

import { JobCategory } from '@/contexts/AppContext';

interface NFTArtConfig {
  tokenId: number;
  category: JobCategory;
  company: string;
  title: string;
}

const BACKGROUND_GRADIENTS = [
  { from: '#0f0c29', via: '#302b63', to: '#24243e' },
  { from: '#134e5e', via: '#71b280', to: '#134e5e' },
  { from: '#3a1c71', via: '#d76d77', to: '#ffaf7b' },
  { from: '#1a2a6c', via: '#b21f1f', to: '#fdbb2d' },
  { from: '#2c3e50', via: '#3498db', to: '#2c3e50' },
  { from: '#093028', via: '#237a57', to: '#093028' },
  { from: '#4b134f', via: '#c94b4b', to: '#4b134f' },
  { from: '#283c86', via: '#45a247', to: '#283c86' },
  { from: '#000428', via: '#004e92', to: '#000428' },
  { from: '#1e3c72', via: '#2a5298', to: '#1e3c72' },
];

const CATEGORY_COLORS: Record<JobCategory, { primary: string; secondary: string; accent: string; dark: string }> = {
  FRONTEND: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    dark: '#1a1a2e',
  },
  BACKEND: {
    primary: '#0f2027',
    secondary: '#203a43',
    accent: '#2c5364',
    dark: '#0a0e27',
  },
  DESIGN: {
    primary: '#ff6b6b',
    secondary: '#ee5a6f',
    accent: '#c44569',
    dark: '#1a0b1e',
  },
  MARKETING: {
    primary: '#141e30',
    secondary: '#243b55',
    accent: '#4b79a1',
    dark: '#0a0e1a',
  },
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pickBackground(seed: number): { from: string; via: string; to: string } {
  const index = seed % BACKGROUND_GRADIENTS.length;
  return BACKGROUND_GRADIENTS[index];
}

function generateStars(seed: number): string {
  const stars = [];
  const numStars = 20 + (seed % 15);
  
  for (let i = 0; i < numStars; i++) {
    const starSeed = seed + i * 97;
    const x = (starSeed % 380) + 10;
    const y = ((starSeed * 67) % 280) + 10;
    const size = 1 + (starSeed % 3);
    const opacity = 0.3 + (starSeed % 7) / 10;
    
    stars.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}"/>`);
  }
  
  return stars.join('');
}

function generateFloatingShapes(seed: number): string {
  const shapes = [];
  const numShapes = 5 + (seed % 4);
  
  for (let i = 0; i < numShapes; i++) {
    const shapeSeed = seed + i * 137;
    const x = (shapeSeed % 350) + 25;
    const y = ((shapeSeed * 73) % 250) + 25;
    const size = 40 + (shapeSeed % 60);
    const rotation = shapeSeed % 360;
    const opacity = 0.03 + (shapeSeed % 8) / 100;
    
    const shapeType = shapeSeed % 3;
    
    if (shapeType === 0) {
      shapes.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}"/>`);
    } else if (shapeType === 1) {
      shapes.push(`<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="white" opacity="${opacity}" rx="8" transform="rotate(${rotation} ${x} ${y})"/>`);
    } else {
      shapes.push(`<polygon points="${x},${y - size} ${x + size * 0.9},${y + size} ${x - size * 0.9},${y + size}" fill="white" opacity="${opacity}" transform="rotate(${rotation} ${x} ${y})"/>`);
    }
  }
  
  return shapes.join('');
}

function generateMeshGradient(tokenId: number, colors: { primary: string; secondary: string; accent: string }): string {
  const meshId = `mesh-${tokenId}`;
  return `<radialGradient id="${meshId}" cx="50%" cy="50%">
    <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.4"/>
    <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:0.2"/>
    <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:0"/>
  </radialGradient>`;
}

function generateCategoryIcon(category: JobCategory): string {
  const icons = {
    FRONTEND: `<g transform="translate(200, 150)">
      <circle r="50" fill="rgba(255,255,255,0.1)" filter="url(#iconBlur)"/>
      <circle r="45" fill="rgba(255,255,255,0.15)"/>
      <path d="M -15 -10 L 0 0 L -15 10" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 15 -10 L 0 0 L 15 10" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,
    BACKEND: `<g transform="translate(200, 150)">
      <circle r="50" fill="rgba(255,255,255,0.1)" filter="url(#iconBlur)"/>
      <circle r="45" fill="rgba(255,255,255,0.15)"/>
      <rect x="-18" y="-18" width="36" height="36" rx="4" stroke="white" stroke-width="3" fill="none"/>
      <circle cx="0" cy="-8" r="3" fill="white"/>
      <circle cx="0" cy="0" r="3" fill="white"/>
      <circle cx="0" cy="8" r="3" fill="white"/>
    </g>`,
    DESIGN: `<g transform="translate(200, 150)">
      <circle r="50" fill="rgba(255,255,255,0.1)" filter="url(#iconBlur)"/>
      <circle r="45" fill="rgba(255,255,255,0.15)"/>
      <path d="M -15 -15 L 15 -15 L 15 0 L 0 15 L -15 0 Z" stroke="white" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <circle cx="0" cy="-5" r="4" fill="white"/>
    </g>`,
    MARKETING: `<g transform="translate(200, 150)">
      <circle r="50" fill="rgba(255,255,255,0.1)" filter="url(#iconBlur)"/>
      <circle r="45" fill="rgba(255,255,255,0.15)"/>
      <path d="M -12 0 L 0 -15 L 12 0 L 0 15 Z" stroke="white" stroke-width="3" fill="none"/>
      <circle cx="0" cy="0" r="6" fill="white"/>
    </g>`,
  };
  
  return icons[category];
}

export function generateNFTArt(config: NFTArtConfig): string {
  console.log('[NFTArt] Generating art for:', config);
  const colors = CATEGORY_COLORS[config.category];
  const seed = hashCode(`${config.tokenId}-${config.title}`);
  const background = pickBackground(config.tokenId);
  
  const gradientId = `grad-${config.tokenId}`;
  const meshId = `mesh-${config.tokenId}`;
  const blurId = `blur-${config.tokenId}`;
  const iconBlurId = `iconBlur`;
  
  const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${background.from};stop-opacity:1"/>
        <stop offset="50%" style="stop-color:${background.via};stop-opacity:1"/>
        <stop offset="100%" style="stop-color:${background.to};stop-opacity:1"/>
      </linearGradient>
      ${generateMeshGradient(config.tokenId, colors)}
      <filter id="${blurId}"><feGaussianBlur in="SourceGraphic" stdDeviation="3"/></filter>
      <filter id="${iconBlurId}"><feGaussianBlur in="SourceGraphic" stdDeviation="2"/></filter>
    </defs>
    
    <rect width="400" height="300" fill="url(#${gradientId})"/>
    
    <ellipse cx="100" cy="80" rx="180" ry="160" fill="url(#${meshId})" opacity="0.6"/>
    <ellipse cx="300" cy="220" rx="160" ry="140" fill="url(#${meshId})" opacity="0.5"/>
    
    ${generateStars(seed)}
    
    ${generateFloatingShapes(seed)}
    
    ${generateCategoryIcon(config.category)}
    
    <g opacity="0.95">
      <text x="200" y="250" font-family="'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle" letter-spacing="1">${config.category}</text>
      <text x="200" y="270" font-family="'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" font-size="11" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="0.5">TOKEN #${config.tokenId}</text>
    </g>
    
    <rect width="400" height="300" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  </svg>`;
  
  try {
    const encoded = `data:image/svg+xml;base64,${btoa(svg)}`;
    console.log('[NFTArt] Successfully generated art, length:', encoded.length);
    return encoded;
  } catch (error) {
    console.error('[NFTArt] Failed to encode SVG:', error);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}

export function generateNFTArtURL(config: NFTArtConfig): string {
  return generateNFTArt(config);
}

