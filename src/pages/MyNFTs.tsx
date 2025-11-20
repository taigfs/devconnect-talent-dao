import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Package } from 'lucide-react';
import { NFTCard } from '@/components/worker/NFTCard';
import { NFTDetailsModal } from '@/components/worker/NFTDetailsModal';
import { WorkNFT } from '@/types/nft';
import Navbar from '@/components/Navbar';
import { AppProvider } from '@/contexts/AppContext';

// Mock NFT data
const mockNFTs: WorkNFT[] = [
  {
    id: 1,
    title: 'React Landing Page',
    company: 'Nubank',
    category: 'FRONTEND',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    deliveredAt: '2024-11-19',
    description: 'Built a modern, responsive landing page using React and Tailwind CSS with animations and mobile-first approach.',
  },
  {
    id: 2,
    title: 'Checkout API',
    company: 'MercadoLibre',
    category: 'BACKEND',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop',
    deliveredAt: '2024-11-18',
    description: 'Developed a scalable checkout API with payment gateway integration, security best practices, and comprehensive testing.',
  },
  {
    id: 3,
    title: 'Mobile App Design',
    company: 'Globant',
    category: 'DESIGN',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    deliveredAt: '2024-11-17',
    description: 'Created a complete mobile app design system in Figma with component library, prototypes, and design tokens.',
  },
  {
    id: 4,
    title: 'Social Media Campaign',
    company: 'Rappi',
    category: 'MARKETING',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    deliveredAt: '2024-11-16',
    description: 'Executed a multi-platform social media campaign with creative assets, targeting strategy, and performance analytics.',
  },
];

const MyNFTsContent = () => {
  const [selectedNFT, setSelectedNFT] = useState<WorkNFT | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (nft: WorkNFT) => {
    setSelectedNFT(nft);
    setModalOpen(true);
  };

  // Calculate stats
  const totalNFTs = mockNFTs.length;
  const nftsByCategory = mockNFTs.reduce((acc, nft) => {
    acc[nft.category] = (acc[nft.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl border-b border-primary/10">
        <div className="container mx-auto px-4 py-8">
          {/* Title Section */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">My NFTs</h1>
              <p className="text-muted-foreground mt-1">
                Your on-chain work credentials
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge
              variant="outline"
              className="px-4 py-2 border-primary/30 bg-primary/5 text-white"
            >
              <Award className="w-4 h-4 mr-2 text-primary" />
              Total: {totalNFTs}
            </Badge>

            {Object.entries(nftsByCategory).map(([category, count]) => (
              <Badge
                key={category}
                variant="outline"
                className="px-4 py-2 border-primary/20 bg-card/50"
              >
                {category}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {mockNFTs.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-card/50 rounded-full border border-primary/20 mb-6">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No NFTs Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Complete jobs to earn work credential NFTs that prove your skills
              on-chain.
            </p>
            <Button variant="outline" className="border-primary/30">
              Browse Available Jobs
            </Button>
          </div>
        ) : (
          // NFT Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockNFTs.map((nft, index) => (
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

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Animation Styles */}
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
