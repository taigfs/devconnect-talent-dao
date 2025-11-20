/**
 * Static NFT Images System
 * 
 * Uses pre-generated AI images from /public/NFTs/ instead of dynamic SVG generation.
 * Each tokenId maps to a specific image deterministically via modulo operation.
 */

interface NftImageConfig {
  path: string;
  bgColor: string; // Background color that matches the image
}

const STATIC_NFT_IMAGES: NftImageConfig[] = [
  { path: '/NFTs/NFT1.jpg', bgColor: '#FF8C42' }, // Orange
  { path: '/NFTs/NFT2.jpg', bgColor: '#D4A24A' }, // Golden/Yellowish
  { path: '/NFTs/NFT3.jpg', bgColor: '#3D8B7C' }, // Teal/Green
  { path: '/NFTs/NFT4.jpg', bgColor: '#CC7C3A' }, // Orange/Brown
  { path: '/NFTs/NFT5.png', bgColor: '#FF8547' }, // Vibrant Orange
  { path: '/NFTs/NFT6.png', bgColor: '#4A7C59' }, // Green (if exists)
];

/**
 * Get static NFT image path for a given tokenId
 * Uses modulo to ensure deterministic but "random-looking" selection
 * 
 * @param tokenId The NFT token ID
 * @returns Image path (e.g., '/NFTs/NFT1.jpg')
 */
export function getStaticNftImage(tokenId: number): string {
  if (STATIC_NFT_IMAGES.length === 0) {
    return '/NFTs/NFT1.jpg'; // Fallback
  }
  const index = tokenId % STATIC_NFT_IMAGES.length;
  return STATIC_NFT_IMAGES[index].path;
}

/**
 * Get background color for a given tokenId
 * Returns the color that matches the NFT image background
 * 
 * @param tokenId The NFT token ID
 * @returns Hex color code (e.g., '#FF8C42')
 */
export function getNftBackgroundColor(tokenId: number): string {
  if (STATIC_NFT_IMAGES.length === 0) {
    return '#FF8C42'; // Fallback
  }
  const index = tokenId % STATIC_NFT_IMAGES.length;
  return STATIC_NFT_IMAGES[index].bgColor;
}

/**
 * Get both image and background color for a given tokenId
 * 
 * @param tokenId The NFT token ID
 * @returns Object with image path and background color
 */
export function getNftImageConfig(tokenId: number): { image: string; bgColor: string } {
  if (STATIC_NFT_IMAGES.length === 0) {
    return { image: '/NFTs/NFT1.jpg', bgColor: '#FF8C42' };
  }
  const index = tokenId % STATIC_NFT_IMAGES.length;
  return {
    image: STATIC_NFT_IMAGES[index].path,
    bgColor: STATIC_NFT_IMAGES[index].bgColor,
  };
}

