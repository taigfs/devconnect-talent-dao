import { useState, useCallback } from 'react';

type WalletSource = 'lemon' | 'metamask' | 'none';

export interface AppWallet {
  address: string | null;
  source: WalletSource;
  isConnecting: boolean;
  error: string | null;
  isWebView: boolean;
}

interface AuthResult {
  result: string;
  data?: {
    wallet: string;
    message?: string;
    signature?: string;
  };
}

let isWebView: () => boolean;
let authenticate: () => Promise<AuthResult>;
let TransactionResult: { SUCCESS: string };

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sdk = require('@lemoncash/mini-app-sdk');
  isWebView = sdk.isWebView;
  authenticate = sdk.authenticate;
  TransactionResult = sdk.TransactionResult;
} catch (e) {
  isWebView = () => false;
  authenticate = async () => {
    throw new Error('Lemon SDK não disponível');
  };
  TransactionResult = { SUCCESS: 'SUCCESS' };
}

export function useAppWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [source, setSource] = useState<WalletSource>('none');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Prioridade 1: Lemon Wallet (se estiver no WebView)
      if (isWebView()) {
        const result = await authenticate();
        
        if (result.result === TransactionResult.SUCCESS && result.data?.wallet) {
          const wallet = result.data.wallet;
          setAddress(wallet);
          setSource('lemon');
          return wallet;
        } else {
          throw new Error('Autenticação Lemon falhou ou foi cancelada');
        }
      } 
      
      // Fallback: MetaMask (apenas para desenvolvimento local)
      const ethereum = (window as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
      if (ethereum) {
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts && accounts[0]) {
          setAddress(accounts[0]);
          setSource('metamask');
          return accounts[0];
        } else {
          throw new Error('Nenhuma conta encontrada no MetaMask');
        }
      } else {
        throw new Error('Nem WebView Lemon nem MetaMask disponíveis');
      }
    } catch (err) {
      const error = err as { code?: number; message?: string };
      
      if (error?.code === 4001) {
        setError('Conexão cancelada pelo usuário');
      } else {
        console.error('Erro ao conectar wallet:', err);
        setError(error?.message ?? 'Erro ao conectar carteira');
      }
      setAddress(null);
      setSource('none');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSource('none');
    setError(null);
  }, []);

  return {
    address,
    source,
    isConnecting,
    error,
    connect,
    disconnect,
    isWebView: isWebView(),
  };
}

