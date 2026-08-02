import { useQuery } from '@tanstack/react-query';

// Mirrors src/main.tsx's API base URL resolution — kept local here rather
// than importing from @workspace/api-client-react since that package's
// hooks are OpenAPI-generated and /api/stats isn't in the spec it was
// generated from. Uses the same env var so both stay in sync if the API
// origin ever changes.
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://animeastral.qzz.io';

export interface SiteStats {
  trainersRegistered: number;
  legendaryDrops: number;
}

async function fetchSiteStats(): Promise<SiteStats> {
  const res = await fetch(`${API_BASE}/api/stats`);
  if (!res.ok) throw new Error(`Failed to load site stats (${res.status})`);
  return res.json();
}

/** Homepage headline numbers: active groups, cards in circulation, trainers registered, legendary drops. */
export function useSiteStats() {
  return useQuery({
    queryKey: ['site-stats'],
    queryFn: fetchSiteStats,
    staleTime: 60_000, // these are slow-moving headline numbers, no need to refetch aggressively
  });
}
