/**
 * Transaction Types for TalentDAO Mini App
 * 
 * Tracks all internal app transactions for user history
 */

interface AppTransaction {
  id: string;                        // uuid
  user: string;                      // wallet address
  type:
    | "deposit"
    | "job_creation"
    | "job_application"
    | "job_submission"
    | "job_approval"
    | "payment_release"
    | "nft_mint";

  amount?: number;
  jobId?: number;
  timestamp: number;                 // Date.now()
  metadata?: Record<string, unknown>;  // opcional
}

export type { AppTransaction };

