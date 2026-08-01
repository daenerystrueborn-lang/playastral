import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useGetCardCatalog, useGetMyCards } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CardsPage() {
  const { currentPlayer } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'owned'>('catalog');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: catalogResponse, isLoading: catalogLoading } = useGetCardCatalog({
    page,
    limit: 20,
    tier: tierFilter === 'all' ? undefined : tierFilter,
  });
  // GET /api/cards/catalog sends { cards, total, page, limit } directly —
  // no extra envelope here, but normalize defensively anyway in case the
  // generated client ever wraps it differently, same as every other list
  // endpoint in this app.
  const catalogPage = catalogResponse as { cards?: any[]; total?: number } | undefined;

  const { data: myCardsResponse, isLoading: myCardsLoading } = useGetMyCards({
    query: { enabled: !!currentPlayer && activeTab === 'owned' },
  });
  // GET /api/players/me/cards sends { cards: [...] } — unwrap the same way
  // home.tsx's leaderboard and premium.tsx's plans/status needed to be.
  const myCards = Array.isArray(myCardsResponse)
    ? myCardsResponse
    : (myCardsResponse as { cards?: any[] } | undefined)?.cards;

  const tiers = ['all', '1', '2', '3', '4', '5', '6', 'S'];

  const filteredMyCards = myCards?.filter(
    (card) =>
      (tierFilter === 'all' || card.tier === tierFilter) &&
      (searchQuery === '' || card.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageWrapper>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-4xl font-extrabold mb-1"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px' }}
          >
            Card Collection
          </h1>
          <p className="text-[#9096a6]">Browse the full catalog or view your owned cards</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-0.5 bg-[#0e1015] border border-[#23262f] rounded-full p-[3px] mb-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'catalog' ? 'bg-[#f3f4f8] text-[#07080b]' : 'text-[#9096a6] hover:text-[#f3f4f8]'
          }`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Catalog
        </button>
        {currentPlayer && (
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'owned' ? 'bg-[#f3f4f8] text-[#07080b]' : 'text-[#9096a6] hover:text-[#f3f4f8]'
            }`}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            My Cards
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Input
          type="search"
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                tierFilter === tier
                  ? 'bg-[#f3f4f8] text-[#07080b] border-[#f3f4f8]'
                  : 'bg-[#15171f] text-[#9096a6] border-[#23262f] hover:text-[#f3f4f8]'
              }`}
            >
              {tier === 'all' ? 'All Tiers' : `Tier ${tier}`}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      {activeTab === 'catalog' ? (
        <>
          {catalogLoading ? (
            <div className="text-center py-12 text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Loading cards...
            </div>
          ) : !catalogPage?.cards || catalogPage.cards.length === 0 ? (
            <div className="text-center py-12 text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              No cards found
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {catalogPage.cards.map((card) => (
                  <CardTile key={card.id} card={card} />
                ))}
              </div>

              {catalogPage.total > catalogPage.cards.length && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setPage(page + 1)}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {myCardsLoading ? (
            <div className="text-center py-12 text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Loading your cards...
            </div>
          ) : !filteredMyCards || filteredMyCards.length === 0 ? (
            <div className="text-center py-12 text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              No cards owned yet
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMyCards.map((card) => (
                <CardTile key={card.id} card={card} owned />
              ))}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}

function CardTile({ card, owned }: { card: any; owned?: boolean }) {
  return (
    <div className="group relative bg-[#0e1015] border border-[#23262f] rounded-2xl overflow-hidden hover:border-[#4e8fff] transition-all">
      <div className="aspect-[9/16] bg-gradient-to-br from-[#15171f] to-[#0e1015] flex items-center justify-center relative overflow-hidden">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-[#565b6b] text-4xl">?</div>
        )}

        {card.tier && (
          <div className="absolute top-2 right-2 flex gap-0.5">
            {Array.from({ length: card.tier === 'S' ? 5 : parseInt(card.tier) }).map((_, i) => (
              <svg
                key={i}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ animation: `tierStarGlint ${1 + i * 0.1}s ease-in-out infinite` }}
              >
                <path
                  d="M6 1L7 4H10L7.5 6L8.5 9L6 7L3.5 9L4.5 6L2 4H5L6 1Z"
                  fill={card.tier === 'S' ? '#ffc94d' : '#4e8fff'}
                  stroke={card.tier === 'S' ? '#ffc94d' : '#4e8fff'}
                  strokeWidth="0.5"
                />
              </svg>
            ))}
          </div>
        )}

        {owned && (
          <div
            className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#3ecf8e] text-[#04140c]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            OWNED
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="font-bold text-sm mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {card.title}
        </div>
        {card.series && (
          <div className="text-xs text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {card.series}
          </div>
        )}
      </div>
    </div>
  );
}
