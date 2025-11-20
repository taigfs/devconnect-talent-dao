import { JobCategory } from '@/contexts/AppContext';

export interface WorkNFT {
  id: number;
  title: string;
  company: string;
  category: JobCategory;
  imageUrl: string;
  deliveredAt: string;
  tokenId?: number; // For future blockchain integration
  contractAddress?: string; // For future blockchain integration
  description?: string;
}

export const CATEGORY_LOGOS: Record<JobCategory, string> = {
  FRONTEND: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
  BACKEND: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg',
  DESIGN: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
  MARKETING: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Ads_logo.svg',
};

export const COMPANY_LOGOS: Record<string, string> = {
  Nubank: 'https://logo.clearbit.com/nubank.com.br',
  'C6 Bank': 'https://logo.clearbit.com/c6bank.com.br',
  'Itaú': 'https://logo.clearbit.com/itau.com.br',
  'MercadoLibre': 'https://logo.clearbit.com/mercadolibre.com',
  Rappi: 'https://logo.clearbit.com/rappi.com',
  Globant: 'https://logo.clearbit.com/globant.com',
  Coinbase: 'https://logo.clearbit.com/coinbase.com',
  Scroll: 'https://scroll.io/logo.svg',
  Base: 'https://logo.clearbit.com/base.org',
  Chainlink: 'https://logo.clearbit.com/chain.link',
  Aave: 'https://logo.clearbit.com/aave.com',
  Uniswap: 'https://logo.clearbit.com/uniswap.org',
};

/**
 * Company tag mapping for detection
 * Maps lowercase search terms to official company names
 */
const COMPANY_TAG_TO_NAME: Record<string, string> = {
  'nubank': 'Nubank',
  'c6 bank': 'C6 Bank',
  'c6bank': 'C6 Bank',
  'c6': 'C6 Bank',
  'itau': 'Itaú',
  'itaú': 'Itaú',
  'itaã': 'Itaú',
  'itaãº': 'Itaú',
  'mercadolibre': 'MercadoLibre',
  'mercado libre': 'MercadoLibre',
  'rappi': 'Rappi',
  'globant': 'Globant',
  'coinbase': 'Coinbase',
  'scroll': 'Scroll',
  'base': 'Base',
  'chainlink': 'Chainlink',
  'aave': 'Aave',
  'uniswap': 'Uniswap',
};

/**
 * Detect companies from text (title + description)
 * Returns array of detected companies with their logos
 * 
 * @param text Combined text to search (usually title + description)
 * @returns Array of detected companies with logo URLs
 */
export function detectCompaniesFromText(text: string): Array<{ tag: string; logo: string; name: string }> {
  const lower = text.toLowerCase();
  const detected: Array<{ tag: string; logo: string; name: string }> = [];
  const seen = new Set<string>();

  console.log('[detectCompanies] Searching in text:', lower);

  Object.entries(COMPANY_TAG_TO_NAME).forEach(([tag, companyName]) => {
    if (lower.includes(tag) && !seen.has(companyName)) {
      const logo = COMPANY_LOGOS[companyName];
      console.log(`[detectCompanies] Found "${tag}" -> ${companyName}, logo:`, logo);
      if (logo) {
        detected.push({ tag, logo, name: companyName });
        seen.add(companyName);
      }
    }
  });

  console.log('[detectCompanies] Total detected:', detected.length);
  return detected;
}
