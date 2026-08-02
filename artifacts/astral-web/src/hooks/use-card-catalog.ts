import { useQuery } from '@tanstack/react-query';

// Called directly from the browser — this is the same public Cards API
// the WhatsApp bot itself reads from (see lib/card-engine.js in the bot
// repo), not routed through animeastral.qzz.io. No auth needed; it's a
// read-only public catalog.
const CARDS_API_BASE = 'https://cards-api-seven.vercel.app';

export interface CatalogCard {
  title: string;
  imageUrl: string | null;
  tier: string;
  series: string;
}

interface RawCard {
  title?: string;
  imageUrl?: string;
  image?: string;
  tier?: string | number;
  series?: string;
  origin?: string;
}

function normalizeCard(raw: RawCard): CatalogCard {
  return {
    title: raw.title ?? 'Unknown',
    imageUrl: raw.imageUrl ?? raw.image ?? null,
    tier: String(raw.tier ?? '1'),
    series: raw.series ?? raw.origin ?? 'Unknown',
  };
}

async function fetchCardCatalogPage(page: number, limit: number): Promise<CatalogCard[]> {
  const res = await fetch(`${CARDS_API_BASE}/api/cards?page=${page}&limit=${limit}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to load card catalog (${res.status})`);
  const json = await res.json();
  const results: RawCard[] = Array.isArray(json?.results) ? json.results : [];
  return results.map(normalizeCard);
}

/** Browses a page of the live public card catalog directly from cards-api-seven.vercel.app. */
export function useCardCatalog(page: number, limit = 20) {
  return useQuery({
    queryKey: ['card-catalog', page, limit],
    queryFn: () => fetchCardCatalogPage(page, limit),
    staleTime: 60_000,
  });
}
