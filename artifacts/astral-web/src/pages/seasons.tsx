import { PageWrapper } from '@/components/layout/page-wrapper';
import { useGetCurrentSeason, useGetSeasonAbilities } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';

export function SeasonsPage() {
  const { data: seasonData, isLoading: seasonLoading } = useGetCurrentSeason();
  const { data: abilities, isLoading: abilitiesLoading } = useGetSeasonAbilities();

  const season = seasonData?.season;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-10">
        <div
          className="inline-flex items-center gap-1.5 bg-[rgba(78,143,255,0.12)] border border-[rgba(78,143,255,0.28)] px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-4"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4e8fff' }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <circle cx="4" cy="4" r="3" fill="currentColor" />
          </svg>
          Current Season
        </div>
        <h1 className="text-5xl font-extrabold mb-2" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>
          {seasonLoading ? <Skeleton className="h-12 w-64 rounded-xl" /> : season?.name ?? 'Seasons'}
        </h1>
        {season?.description && (
          <p className="text-[#9096a6] text-lg max-w-2xl">{season.description}</p>
        )}
      </div>

      {/* No active season */}
      {!seasonLoading && !seasonData?.active && (
        <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#23262f] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 4L16.5 11H24L18.5 15.5L21 22L14 17.5L7 22L9.5 15.5L4 11H11.5L14 4Z"
                stroke="#565b6b" strokeWidth="1.5" strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[#565b6b] font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Season lineup coming soon
          </p>
          <p className="text-[#3d4152] text-sm mt-1">Check back shortly for the next season reveal.</p>
        </div>
      )}

      {/* Active season */}
      {seasonLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </div>
      ) : season ? (
        <div className="space-y-8">
          {/* Season banner */}
          <div
            className="relative rounded-2xl overflow-hidden border p-8"
            style={{
              borderColor: `${season.themeColor}44`,
              background: `linear-gradient(135deg, ${season.themeColor}11, ${season.themeColor}05)`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: `radial-gradient(circle at 70% 30%, ${season.themeColor}60, transparent 60%)`,
              }}
            />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: season.themeColor, fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Active Season
                </div>
                <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {season.name}
                </h2>
              </div>
              <div className="text-right text-sm text-[#9096a6]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <div>{new Date(season.startDate).toLocaleDateString()} –</div>
                <div>{new Date(season.endDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Abilities */}
          {abilitiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : abilities && abilities.length > 0 ? (
            <section>
              <h3
                className="text-xs font-bold uppercase tracking-widest text-[#565b6b] mb-4"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Season Abilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {abilities.map(ability => (
                  <div
                    key={ability.id}
                    className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-5 flex items-start gap-4 hover:border-[#4e8fff44] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{ background: `${season.themeColor}1a`, color: season.themeColor }}
                    >
                      {ability.iconKey
                        ? ability.iconKey.charAt(0).toUpperCase()
                        : (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 2L10.5 6.5H15L11.5 9.5L13 14L9 11.5L5 14L6.5 9.5L3 6.5H7.5L9 2Z" fill="currentColor" />
                          </svg>
                        )
                      }
                    </div>
                    <div>
                      <div className="font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {ability.name}
                      </div>
                      {ability.description && (
                        <p className="text-sm text-[#9096a6]">{ability.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </PageWrapper>
  );
}
