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
  'MercadoLibre': 'https://logo.clearbit.com/mercadolibre.com',
  Rappi: 'https://logo.clearbit.com/rappi.com',
  Globant: 'https://logo.clearbit.com/globant.com',
};
