import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
  useGetShopItems,
  useBuyShopItem,
  useGetMe,
  getGetMeQueryKey,
} from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_LABELS: Record<string, string> = {
  cards: 'Cards',
  pokemon: 'Pokemon',
  cosmetics: 'Cosmetics',
  boosts: 'Boosts',
  utility: 'Utility',
};

export function ShopPage() {
  const { currentPlayer, setCurrentPlayer } = useAuth();
  const qc = useQueryClient();
  const { data: items, isLoading } = useGetShopItems();
  const buyMutation = useBuyShopItem();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  function handleBuy(itemId: string) {
    setErrors(e => ({ ...e, [itemId]: '' }));
    setSuccess(s => ({ ...s, [itemId]: false }));

    buyMutation.mutate(
      { itemId },
      {
        onSuccess: (result) => {
          setSuccess(s => ({ ...s, [itemId]: true }));
          // Update player currency in auth context immediately
          if (currentPlayer) {
            setCurrentPlayer({ ...currentPlayer, solars: result.newSolars, gems: result.newGems });
          }
          qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setTimeout(() => setSuccess(s => ({ ...s, [itemId]: false })), 2000);
        },
        onError: (err: unknown) => {
          const msg = (err as { error?: string })?.error ?? 'Purchase failed';
          setErrors(e => ({ ...e, [itemId]: msg }));
        },
      }
    );
  }

  // Group items by category
  const grouped = (items ?? []).reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category ?? 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(item);
    return acc;
  }, {});

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-1" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px' }}>
            Shop
          </h1>
          <p className="text-[#9096a6]">Spend your Solars and Gems on packs, items, and upgrades</p>
        </div>

        {currentPlayer && (
          <div className="flex items-center gap-3">
            <CurrencyBadge label="Solars" value={currentPlayer.solars} color="#4e8fff" />
            <CurrencyBadge label="Gems" value={currentPlayer.gems} color="#3ecf8e" />
          </div>
        )}
      </div>

      {!currentPlayer && (
        <div
          className="mb-6 p-4 rounded-2xl border text-sm text-[#9096a6]"
          style={{ borderColor: '#23262f', background: '#0e1015' }}
        >
          Sign in to purchase items.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : items?.length === 0 ? (
        <div className="text-center py-24 text-[#565b6b]">
          <p>No items available yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catItems]) => (
            <section key={category}>
              <h2
                className="text-xs font-bold uppercase tracking-widest text-[#565b6b] mb-3"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catItems?.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#4e8fff44] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {item.name}
                      </div>
                      {item.description && (
                        <p className="text-sm text-[#9096a6]">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {(item.priceSolars ?? 0) > 0 && (
                          <span
                            className="text-sm font-bold"
                            style={{ color: '#4e8fff', fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {item.priceSolars?.toLocaleString()} Sol
                          </span>
                        )}
                        {(item.priceGems ?? 0) > 0 && (
                          <span
                            className="text-sm font-bold"
                            style={{ color: '#3ecf8e', fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {item.priceGems?.toLocaleString()} Gem
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleBuy(item.id)}
                        disabled={!currentPlayer || buyMutation.isPending || success[item.id]}
                        className="shrink-0"
                        style={success[item.id] ? { background: '#3ecf8e', color: '#04140c' } : {}}
                      >
                        {success[item.id] ? 'Bought!' : buyMutation.isPending ? '...' : 'Buy'}
                      </Button>
                    </div>

                    {errors[item.id] && (
                      <p className="text-xs text-destructive">{errors[item.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

function CurrencyBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold"
      style={{ borderColor: `${color}44`, background: `${color}11`, color, fontFamily: 'JetBrains Mono, monospace' }}
    >
      <span>{value.toLocaleString()}</span>
      <span className="text-[10px] uppercase opacity-70">{label}</span>
    </div>
  );
}
