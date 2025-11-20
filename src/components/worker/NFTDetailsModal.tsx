import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Award, Calendar, Building2 } from 'lucide-react';
import { WorkNFT, CATEGORY_LOGOS, COMPANY_LOGOS } from '@/types/nft';

interface NFTDetailsModalProps {
  nft: WorkNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NFTDetailsModal = ({ nft, open, onOpenChange }: NFTDetailsModalProps) => {
  if (!nft) return null;

  const categoryLogo = CATEGORY_LOGOS[nft.category];
  const companyLogo = COMPANY_LOGOS[nft.company];

  const formattedDate = new Date(nft.deliveredAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Work Credential NFT
          </DialogTitle>
          <DialogDescription>
            Your on-chain proof of work completion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT Image */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-primary/20">
            <img
              src={nft.imageUrl}
              alt={nft.title}
              className="w-full h-full object-cover"
            />

            {/* Logo Badges */}
            {companyLogo && (
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white border-2 border-white/20 overflow-hidden">
                <img
                  src={companyLogo}
                  alt={nft.company}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {categoryLogo && (
              <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white border-2 border-white/20 overflow-hidden p-2">
                <img
                  src={categoryLogo}
                  alt={nft.category}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* NFT Details */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{nft.title}</h3>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {nft.category}
              </Badge>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/50 rounded-lg p-4 border border-primary/10">
              {/* Company */}
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-medium text-white">{nft.company}</p>
                </div>
              </div>

              {/* Delivered Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <p className="font-medium text-white">{formattedDate}</p>
                </div>
              </div>

              {/* Token ID (Future) */}
              {nft.tokenId && (
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Token ID</p>
                    <p className="font-medium text-white font-mono">#{nft.tokenId}</p>
                  </div>
                </div>
              )}

              {/* Contract Address (Future) */}
              {nft.contractAddress && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <ExternalLink className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Contract Address</p>
                    <p className="font-medium text-white font-mono text-sm truncate">
                      {nft.contractAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {nft.description && (
              <div className="bg-background/30 rounded-lg p-4 border border-primary/10">
                <p className="text-sm text-muted-foreground">{nft.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary hover:text-primary-foreground"
                disabled
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary hover:text-primary-foreground"
                disabled
              >
                Share NFT
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Blockchain integration coming soon
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
