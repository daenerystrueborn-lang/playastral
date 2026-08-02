import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useGlobalSearch } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const { data, isFetching } = useGlobalSearch(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length >= 2 } }
  );

  const hasResults =
    !!data &&
    Array.isArray(data.players) &&
    Array.isArray(data.cards) &&
    Array.isArray(data.pokemon) &&
    (data.players.length + data.cards.length + data.pokemon.length) > 0;

  return (
    <PageWrapper>
      <h1 className="text-4xl font-extrabold mb-2" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px' }}>
        Search
      </h1>
      <p className="text-[#9096a6] mb-6">Find players, cards, and Pokemon</p>

      {/* Search input */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565b6b]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search players, cards, Pokemon..."
          className="pl-10 h-12 text-base rounded-2xl"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          autoFocus
        />
        {isFetching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#4e8fff44', borderTopColor: '#4e8fff' }} />
          </div>
        )}
      </div>

      {/* Empty state */}
      {query.length < 2 && (
        <div className="text-center py-20 text-[#3d4152]">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-4 opacity-40">
            <circle cx="17" cy="17" r="11" stroke="#565b6b" strokeWidth="2" />
            <path d="M26 26L36 36" stroke="#565b6b" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      )}

      {/* No results */}
      {debouncedQuery.length >= 2 && !isFetching && !hasResults && (
        <div className="text-center py-20 text-[#565b6b]">
          <p>No results for <span className="text-[#9096a6]">"{debouncedQuery}"</span></p>
        </div>
      )}

      {/* Results */}
      {data && hasResults && (
        <div className="space-y-8">
          {/* Players */}
          {data.players.length > 0 && (
            <section>
              <SectionLabel>Players</SectionLabel>
              <div className="space-y-2">
                {data.players.map(p => (
                  <Link
                    key={p.id}
                    href={`/profile/${p.id}`}
                    className="flex items-center gap-3 bg-[#0e1015] border border-[#23262f] rounded-xl p-3 hover:border-[#4e8fff] transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
                      style={{ background: '#4e8fff1a', color: '#4e8fff', fontFamily: 'Syne, sans-serif' }}
                    >
                      {(p.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {p.name ?? 'Unnamed Trainer'}
                      </div>
                      <div className="text-xs text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        Level {p.level}
                      </div>
                    </div>
                    {p.premiumActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#ffc94d22', color: '#ffc94d', border: '1px solid #ffc94d44' }}>
                        PRO
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Cards */}
          {data.cards.length > 0 && (
            <section>
              <SectionLabel>Cards</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.cards.map((card, i) => (
                  <Link
                    key={`${card.id}-${i}`}
                    href="/cards"
                    className="bg-[#0e1015] border border-[#23262f] rounded-xl overflow-hidden hover:border-[#4e8fff] transition-colors"
                  >
                    {card.imageUrl ? (
                      <div className="aspect-[3/4] bg-[#15171f]">
                        <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-[#15171f] flex items-center justify-center text-[#3d4152] text-2xl">?</div>
                    )}
                    <div className="p-2.5">
                      <div className="font-bold text-xs" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{card.title}</div>
                      {card.series && <div className="text-[10px] text-[#565b6b]">{card.series}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Pokemon */}
          {data.pokemon.length > 0 && (
            <section>
              <SectionLabel>Pokemon</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.pokemon.map(p => (
                  <Link
                    key={p.dexId}
                    href="/pokemon"
                    className="bg-[#0e1015] border border-[#23262f] rounded-xl p-4 flex flex-col items-center hover:border-[#4e8fff] transition-colors"
                  >
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-contain mb-2" />}
                    <div className="font-bold text-sm capitalize text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{p.name}</div>
                    <div className="text-[10px] text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>#{p.dexId}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest text-[#565b6b] mb-3"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    >
      {children}
    </h2>
  );
}
