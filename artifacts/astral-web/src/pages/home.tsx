import { PageWrapper } from '@/components/layout/page-wrapper';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { useSiteStats } from '@/hooks/use-site-stats';
import { Link } from 'wouter';

export function HomePage() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({ limit: 10 });
  const { data: siteStats } = useSiteStats();

  return (
    <PageWrapper>
      {/* Hero section */}
      <section
        className="relative px-5 sm:px-8 md:px-10 py-14 sm:py-16 md:py-20 mb-12 rounded-[28px] overflow-hidden border flex flex-col items-center text-center"
        style={{
          borderColor: '#23262f',
          background: 'linear-gradient(135deg, rgba(78,143,255,0.08), rgba(78,143,255,0.03))',
        }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(78,143,255,0.4), transparent 50%), radial-gradient(circle at 20% 80%, rgba(62,207,142,0.2), transparent 40%)',
          }}
        />
        <div className="relative z-10 max-w-3xl">
          <div
            className="inline-flex items-center gap-1.5 bg-[rgba(78,143,255,0.14)] border border-[rgba(78,143,255,0.28)] px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-4"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4e8fff' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="3" fill="currentColor" />
            </svg>
            WhatsApp RPG
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 break-words"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px', lineHeight: 1.1 }}
          >
            Collect. Battle. <br />
            <span style={{ color: '#4e8fff' }}>Conquer.</span>
          </h1>

          <p className="text-lg text-[#9096a6] mb-8 max-w-2xl mx-auto">
            Your favorite Pokémon card game, now on WhatsApp. Catch rare Pokémon, build your deck, and battle trainers
            worldwide—all from your chat.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/your-bot-number"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                background: '#4e8fff',
                color: '#04070f',
                boxShadow: '0 0 0 1px rgba(78,143,255,0.25), 0 0 28px rgba(78,143,255,0.16)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2c-.18.538.326 1.043.864.864l3.032-.892A9.958 9.958 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                  fill="currentColor"
                />
                <path
                  d="M9.5 9.5c0-.828.895-1.5 2-1.5s2 .672 2 1.5c0 .552-.224 1.024-.586 1.414-.362.39-.914.586-1.414.586"
                  stroke="#04070f"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="9.5" cy="15.5" r="0.5" fill="#04070f" />
                <circle cx="14.5" cy="15.5" r="0.5" fill="#04070f" />
              </svg>
              Add to WhatsApp
            </a>
            <Link
              href="/cards"
              className="px-6 py-3 rounded-xl bg-[#15171f] border border-[#23262f] font-semibold transition-all hover:bg-[#1e212c]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              See commands
            </Link>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Active Groups" value="Multiple" />
        <StatCard label="Cards In Circulation" value="22K+" />
        <StatCard label="Trainers Registered" value={siteStats?.trainersRegistered.toLocaleString() ?? '—'} />
        <StatCard label="Legendary Drops" value={siteStats?.legendaryDrops.toLocaleString() ?? '—'} />
      </div>

      {/* How it works */}
      <section className="mb-16">
        <h2
          className="text-3xl font-extrabold mb-2"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.3px' }}
        >
          Three commands to get started
        </h2>
        <p className="text-[#9096a6] mb-6">Everything you need in your WhatsApp chat</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CommandCard
            command="/catch"
            description="Encounter and catch wild Pokémon using your Poké Balls. Build your collection one encounter at a time."
          />
          <CommandCard
            command="/battle"
            description="Challenge other trainers or AI opponents. Strategy and type advantage win fights."
          />
          <CommandCard
            command="/cards"
            description="View your collection, check card rarity, and see what you've unlocked. Trade with friends."
          />
        </div>
      </section>

      {/* Live leaderboard */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-1"
              style={{ letterSpacing: '-0.3px' }}
            >
              Live Leaderboard
            </h2>
            <p className="text-[#9096a6] text-sm">Top trainers by XP</p>
          </div>
          <Link
            href="/shop"
            className="text-[#4e8fff] text-sm font-semibold hover:underline shrink-0"
          >
            View all →
          </Link>
        </div>

        <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Loading...
            </div>
          ) : !Array.isArray(leaderboard) || leaderboard.length === 0 ? (
            <div className="p-8 text-center text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              No players yet
            </div>
          ) : (
            <div className="divide-y divide-[#171920]">
              {leaderboard.map((entry) => (
                <div key={entry.playerId} className="flex items-center gap-4 p-4 hover:bg-[#15171f] transition-colors">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm"
                    style={{
                      background:
                        entry.rank <= 3
                          ? 'linear-gradient(135deg, rgba(255,201,77,0.2), rgba(255,159,90,0.1))'
                          : '#1e212c',
                      color: entry.rank <= 3 ? '#ffc94d' : '#9096a6',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    #{entry.rank}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {entry.name || 'Trainer'}
                      </span>
                      {entry.premiumActive && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: 'linear-gradient(90deg, #ff3d81, #8b6bff)',
                            color: '#fff',
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      Level {entry.level} • {(entry.xp ?? 0).toLocaleString()} XP
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {(entry.xp ?? 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-[#565b6b]">Score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-5">
      <div
        className="text-[11.5px] text-[#565b6b] uppercase tracking-wider mb-2"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        {label}
      </div>
      <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
        {value}
      </div>
    </div>
  );
}

function CommandCard({ command, description }: { command: string; description: string }) {
  return (
    <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-6 hover:border-[#4e8fff] transition-all group">
      <div
        className="text-[#4e8fff] text-xl font-bold mb-3 group-hover:scale-105 transition-transform"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        {command}
      </div>
      <p className="text-sm text-[#9096a6]">{description}</p>
    </div>
  );
}
