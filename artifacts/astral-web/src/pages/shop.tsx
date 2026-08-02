import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
  useGetShopItems,
  useBuyShopItem,
  useBuyCardPack,
  getGetMeQueryKey,
} from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { useCardCatalog } from '@/hooks/use-card-catalog';
import { useCardPrices, useBuyCardTier } from '@/hooks/use-card-shop';
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
  const [tab, setTab] = useState<'items' | 'cards'>('items');

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

  const grouped = (items ?? []).reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category ?? 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(item);
    return acc;
  }, {});

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-1" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px' }}>
            Shop
          </h1>
          <p className="text-[#9096a6]">Spend your Solars and Gems on packs, cards, items, and upgrades</p>
        </div>

        {currentPlayer && (
          <div className="flex items-center gap-3">
            <CurrencyBadge label="Solars" value={currentPlayer.wallet?.solars ?? 0} color="#4e8fff" />
            <CurrencyBadge label="Gems" value={currentPlayer.wallet?.gems ?? 0} color="#3ecf8e" />
          </div>
        )}
      </div>

      {!currentPlayer && (
        <div className="mb-6 p-4 rounded-2xl border text-sm text-[#9096a6]" style={{ borderColor: '#23262f', background: '#0e1015' }}>
          Sign in to purchase items.
        </div>
      )}

      <div className="inline-flex gap-0.5 bg-[#0e1015] border border-[#23262f] rounded-full p-[3px] mb-6">
        {(['items', 'cards'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t ? 'bg-[#f3f4f8] text-[#07080b]' : 'text-[#9096a6] hover:text-[#f3f4f8]'
            }`}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {t === 'items' ? 'Items' : 'Cards'}
          </button>
        ))}
      </div>

      {tab === 'items' ? (
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : items?.length === 0 ? (
          <div className="text-center py-24 text-[#565b6b]"><p>No items available yet.</p></div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, catItems]) => (
              <section key={category}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#565b6b] mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {CATEGORY_LABELS[category] ?? category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(catItems) && catItems.map(item => (
                    <div key={item.id} className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#4e8fff44] transition-colors">
                      <div className="flex-1">
                        <div className="font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.name}</div>
                        {item.description && <p className="text-sm text-[#9096a6]">{item.description}</p>}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {(item.priceSolars ?? 0) > 0 && (
                            <span className="text-sm font-bold" style={{ color: '#4e8fff', fontFamily: 'JetBrains Mono, monospace' }}>
                              {item.priceSolars?.toLocaleString()} Sol
                            </span>
                          )}
                          {(item.priceGems ?? 0) > 0 && (
                            <span className="text-sm font-bold" style={{ color: '#3ecf8e', fontFamily: 'JetBrains Mono, monospace' }}>
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
                      {errors[item.id] && <p className="text-xs text-destructive">{errors[item.id]}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <CardsShopTab currentPlayer={currentPlayer} />
      )}
    </PageWrapper>
  );
}

function CardsShopTab({ currentPlayer }: { currentPlayer: any }) {
  const [page, setPage] = useState(1);
  const { data: catalog, isLoading: catalogLoading } = useCardCatalog(page);
  const { data: prices, isLoading: pricesLoading } = useCardPrices();
  const buyTierMutation = useBuyCardTier();
  const buyPackMutation = useBuyCardPack();

  const [tierMsg, setTierMsg] = useState('');
  const [packMsg, setPackMsg] = useState('');

  function handleBuyTier(tier: string) {
    setTierMsg('');
    buyTierMutation.mutate(tier, {
      onSuccess: (res) => setTierMsg(`Got ${res.granted.title} (${res.granted.tierStars})!`),
      onError: (err: any) => setTierMsg(err?.message ?? 'Purchase failed'),
    });
  }

  function handleBuyPack() {
    setPackMsg('');
    buyPackMutation.mutate(undefined, {
      onSuccess: (res: any) => setPackMsg(`Got ${res.granted?.length ?? 0} cards!`),
      onError: (err: any) => setPackMsg(err?.error ?? 'Purchase failed'),
    });
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#565b6b] mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Card Packs
        </h2>
        <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Random Pack (5 cards)</div>
            <p className="text-sm text-[#9096a6]">5 random cards, any tier — could include rare pulls.</p>
            {packMsg && <p className="text-xs mt-2 text-[#4e8fff]">{packMsg}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-bold" style={{ color: '#4e8fff', fontFamily: 'JetBrains Mono, monospace' }}>800 Sol</span>
            <Button size="sm" onClick={handleBuyPack} disabled={!currentPlayer || buyPackMutation.isPending}>
              {buyPackMutation.isPending ? '...' : 'Buy'}
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#565b6b] mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Buy a Card by Tier
        </h2>
        {tierMsg && <p className="text-xs mb-3 text-[#4e8fff]">{tierMsg}</p>}
        {pricesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.isArray(prices?.tiers) && prices.tiers.map(t => (
              <div key={t.tier} className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                <div className="text-sm" style={{ color: t.tier === '6' ? '#ffc94d' : '#4e8fff' }}>{t.stars}</div>
                <div className="text-xs text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Tier {t.tier}</div>
                <div className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.price.toLocaleString()} Sol</div>
                <Button size="sm" className="w-full" onClick={() => handleBuyTier(t.tier)} disabled={!currentPlayer || buyTierMutation.isPending}>
                  {buyTierMutation.isPending ? '...' : 'Buy'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#565b6b] mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Browse Catalog
        </h2>
        {catalogLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[9/16] rounded-2xl" />)}
          </div>
        ) : !Array.isArray(catalog) || catalog.length === 0 ? (
          <div className="text-center py-12 text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>No cards found</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {catalog.map((card, i) => (
                <div key={i} className="bg-[#0e1015] border border-[#23262f] rounded-2xl overflow-hidden hover:border-[#4e8fff] transition-all">
                  <div className="aspect-[9/16] bg-gradient-to-br from-[#15171f] to-[#0e1015] flex items-center justify-center">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[#565b6b] text-4xl">?</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-sm mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{card.title}</div>
                    <div className="text-xs text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{card.series}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function CurrencyBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold" style={{ borderColor: `${color}44`, background: `${color}11`, color, fontFamily: 'JetBrains Mono, monospace' }}>
      <span>{value.toLocaleString()}</span>
      <span className="text-[10px] uppercase opacity-70">{label}</span>
    </div>
  );
}
