/**
 * Hook for fetching user's Work NFTs from blockchain
 */

import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { getUserWorkNfts, WorkNFTData } from '@/lib/web3/workNft';

export function useMyWorkNfts() {
  const { user } = useApp();
  const wallet = user?.wallet as `0x${string}` | undefined;

  return useQuery<WorkNFTData[], Error>({
    queryKey: ['my-work-nfts', wallet],
    enabled: !!wallet,
    queryFn: () => getUserWorkNfts(wallet!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

