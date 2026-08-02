import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Mirrors src/main.tsx's API base URL resolution — see use-site-stats.ts
// for why this is separate from @workspace/api-client-react's generated
// hooks (that package is generated from a spec that doesn't include
// these newer /api/cards/* routes yet).
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://animeastral.qzz.io';

export interface CardTierPrice {
  tier: string;
  stars: string;
  price: number;
}

async function fetchCardPrices(): Promise<{ tiers: CardTierPrice[] }> {
  const res = await fetch(`${API_BASE}/api/cards/prices`);
  if (!res.ok) throw new Error(`Failed to load card prices (${res.status})`);
  return res.json();
}

/** Buyable card tiers and their Solars price (tiers 5 and S are earn-only, never returned here). */
export function useCardPrices() {
  return useQuery({
    queryKey: ['card-prices'],
    queryFn: fetchCardPrices,
    staleTime: 5 * 60_000, // prices rarely change
  });
}

export interface BuyTierResult {
  granted: { title: string; imageUrl: string | null; tier: string; series: string; tierStars: string };
  wallet: { solars: number; gems: number; [key: string]: unknown };
}

async function buyCardTier(tier: string): Promise<BuyTierResult> {
  const res = await fetch(`${API_BASE}/api/cards/buy-tier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send the session cookie, same as customFetch does
    body: JSON.stringify({ tier }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Purchase failed (${res.status})`);
  }
  return res.json();
}

/** Buy a guaranteed-tier card for its listed Solars price. */
export function useBuyCardTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: buyCardTier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-stats'] });
    },
  });
}
