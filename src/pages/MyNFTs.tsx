import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Package, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { NFTCard } from '@/components/worker/NFTCard';
import { NFTDetailsModal } from '@/components/worker/NFTDetailsModal';
import { WorkNFT, detectCompaniesFromText } from '@/types/nft';
import Navbar from '@/components/Navbar';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { useMyWorkNfts } from '@/hooks/useMyWorkNfts';
import { Link } from 'react-router-dom';
import { WORK_NFT_ADDRESS } from '@/lib/web3/constants';
import { getStaticNftImage } from '@/lib/staticNftImages';

const MyNFTsContent = () => {
  const { user } = useApp();
  const { data: nftData, isLoading, error, refetch } = useMyWorkNfts();
  const [selectedNFT, setSelectedNFT] = useState<WorkNFT | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (nft: WorkNFT) => {
    setSelectedNFT(nft);
    setModalOpen(true);
  };

  // Convert blockchain NFT data to UI format
  const nfts: WorkNFT[] =
    nftData?.map((nft, index) => {
      const metadata = nft.metadata;
      if (!metadata) return null;

      const searchText = `${metadata.name || ''} ${metadata.description || ''}`;
      const detectedCompanies = detectCompaniesFromText(searchText);
      const company = detectedCompanies[0]?.name || 'Unknown';

      // Extract category from metadata name (title) OR description using [CATEGORY:XXX] tag
      const nameMatch = metadata.name.match(/\[CATEGORY:(FRONTEND|BACKEND|DESIGN|MARKETING)\]/i);
      const descMatch = metadata.description?.match(/\[CATEGORY:(FRONTEND|BACKEND|DESIGN|MARKETING)\]/i);
      let extractedCategory = nameMatch ? nameMatch[1].toUpperCase() : (descMatch ? descMatch[1].toUpperCase() : null);
      
      // Fallback: try to find category in attributes
      if (!extractedCategory) {
        const categoryAttr = metadata.attributes?.find((attr) => attr.trait_type === 'Category');
        extractedCategory = categoryAttr ? String(categoryAttr.value).toUpperCase() : null;
      }
      
      const rawCategory = extractedCategory || 'BACKEND';
      const normalizedCategory = rawCategory.toUpperCase().trim();
      
      type ValidCategory = 'FRONTEND' | 'BACKEND' | 'DESIGN' | 'MARKETING';
      const validCategories: ValidCategory[] = ['FRONTEND', 'BACKEND', 'DESIGN', 'MARKETING'];
      const category: ValidCategory = validCategories.includes(normalizedCategory as ValidCategory) ? (normalizedCategory as ValidCategory) : 'BACKEND';

      // Use static NFT image instead of generated SVG
      const tokenIdNumber = Number(nft.tokenId);
      const imageUrl = getStaticNftImage(tokenIdNumber);

      // Clean title and description (remove category tags)
      const cleanTitle = metadata.name.replace(/\[CATEGORY:(FRONTEND|BACKEND|DESIGN|MARKETING)\]/gi, '').trim();
      const cleanDescription = metadata.description?.replace(/\[CATEGORY:(FRONTEND|BACKEND|DESIGN|MARKETING)\]/gi, '').trim();

      return {
        id: tokenIdNumber,
        title: cleanTitle || `Work Credential #${tokenIdNumber}`,
        company,
        category: category as WorkNFT['category'],
        imageUrl, // Use static image
        deliveredAt: new Date().toISOString().split('T')[0],
        tokenId: tokenIdNumber,
        contractAddress: WORK_NFT_ADDRESS,
        description: cleanDescription,
      };
    }).filter(Boolean) as WorkNFT[] || [];

  // Calculate stats
  const totalNFTs = nfts.length;
  const nftsByCategory = nfts.reduce((acc, nft) => {
    acc[nft.category] = (acc[nft.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-4 text-muted-foreground hover:text-white"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1 className="text-4xl font-bold text-white">My Work Credentials</h1>
              <p className="text-muted-foreground mt-1">
                Your on-chain work credentials from Scroll Sepolia
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8"> 
        {!user && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-card/50 rounded-full border border-primary/20 mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Please connect your wallet to view your work credential NFTs.
            </p>
            <Button asChild variant="outline" className="border-primary/30">
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
        )}

        {user && isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading your NFTs from blockchain...</p>
          </div>
        )}

        {user && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-card/50 rounded-full border border-red-500/20 mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Failed to Load NFTs
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {error.message || 'An error occurred while fetching your NFTs'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-primary/30">
              Try Again
            </Button>
          </div>
        )}

        {user && !isLoading && !error && nfts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-card/50 rounded-full border border-primary/20 mb-6">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No Work Credentials Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Complete jobs to earn work credential NFTs that prove your skills
              on-chain.
            </p>
            <Button asChild variant="outline" className="border-primary/30">
              <Link to="/">Browse Available Jobs</Link>
            </Button>
          </div>
        )}

        {user && !isLoading && !error && nfts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft, index) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onViewDetails={handleViewDetails}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <NFTDetailsModal
        nft={selectedNFT}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default function MyNFTs() {
  return (
    <AppProvider>
      <MyNFTsContent />
    </AppProvider>
  );
}
