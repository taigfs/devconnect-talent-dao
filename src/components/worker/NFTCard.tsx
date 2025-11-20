import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { WorkNFT, CATEGORY_LOGOS, COMPANY_LOGOS } from '@/types/nft';
import { getNftBackgroundColor } from '@/lib/staticNftImages';

interface NFTCardProps {
  nft: WorkNFT;
  onViewDetails: (nft: WorkNFT) => void;
  index: number;
}

export const NFTCard = ({ nft, onViewDetails, index }: NFTCardProps) => {
  const categoryLogo = CATEGORY_LOGOS[nft.category];
  const companyLogo = COMPANY_LOGOS[nft.company];
  
  // Get background color matching the NFT image
  const bgColor = nft.tokenId ? getNftBackgroundColor(nft.tokenId) : '#FF8C42';

  // Format date
  const formattedDate = new Date(nft.deliveredAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card
      className="group relative overflow-hidden border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`,
        backgroundColor: bgColor,
      }}
      onClick={() => onViewDetails(nft)}
    >
      {/* NFT Image - Portrait aspect ratio, not stretched */}
      <div className="relative w-full aspect-[3/4] overflow-hidden flex items-center justify-center">
        <img
          src={nft.imageUrl}
          alt={nft.title}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle gradient overlay at bottom */}
        <div 
          className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${bgColor}, transparent)`,
          }}
        />

        {/* Company Logo Badge - Top Right */}
        {companyLogo && (
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white border-2 border-white/20 overflow-hidden">
            <img
              src={companyLogo}
              alt={nft.company}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Category Logo Badge - Bottom Right */}
        {categoryLogo && (
          <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white border-2 border-white/20 overflow-hidden p-1.5">
            <img
              src={categoryLogo}
              alt={nft.category}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-lg text-white line-clamp-1 group-hover:text-primary transition-colors">
          {nft.title}
        </h3>

        {/* Company */}
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <span className="font-medium text-white/80">{nft.company}</span>
        </p>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            {nft.category}
          </Badge>
        </div>

        {/* Delivery Date */}
        <p className="text-xs text-muted-foreground">
          Delivered on {formattedDate}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(nft);
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View NFT
        </Button>
      </CardFooter>
    </Card>
  );
};
