import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
  useGetMyPokemon,
  useStartPokemonBattle,
  useMakeBattleMove,
  type Battle,
  type PokemonOwned,
} from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

type BattleMove = 'attack' | 'defend' | 'flee';

export function BattlesPage() {
  const { currentPlayer } = useAuth();
  const { data: myPokemon, isLoading: pokemonLoading } = useGetMyPokemon({
    query: { enabled: !!currentPlayer },
  });

  const startMutation = useStartPokemonBattle();
  const moveMutation = useMakeBattleMove();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [startError, setStartError] = useState('');

  function handleStart() {
    if (!selectedId) return;
    setStartError('');
    startMutation.mutate(
      { data: { ownedPokemonId: selectedId } },
      {
        onSuccess: (b) => setBattle(b),
        onError: () => setStartError('Could not start battle. Try again.'),
      }
    );
  }

  function handleMove(move: BattleMove) {
    if (!battle) return;
    moveMutation.mutate(
      { battleId: battle.id, data: { move } },
      {
        onSuccess: (b) => setBattle(b),
        onError: () => {},
      }
    );
  }

  function handleReset() {
    setBattle(null);
    setSelectedId(null);
    setStartError('');
  }

  if (!currentPlayer) {
    return (
      <PageWrapper>
        <div className="text-center py-24 text-[#565b6b]">
          <p className="text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>Sign in to battle</p>
        </div>
      </PageWrapper>
    );
  }

  // Battle is active — show battle UI
  if (battle) {
    return (
      <PageWrapper>
        <BattleArena battle={battle} onMove={handleMove} onReset={handleReset} isMovePending={moveMutation.isPending} />
      </PageWrapper>
    );
  }

  // Pick a pokemon to battle with
  return (
    <PageWrapper>
      <h1 className="text-4xl font-extrabold mb-2" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px' }}>
        Battle Arena
      </h1>
      <p className="text-[#9096a6] mb-8">Select a Pokemon to battle a wild opponent</p>

      {pokemonLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : !myPokemon?.length ? (
        <div className="text-center py-24 bg-[#0e1015] border border-[#23262f] rounded-2xl text-[#565b6b]">
          <p className="mb-2">No Pokemon yet — catch some first!</p>
          <p className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Visit the Pokemon page to start catching.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {myPokemon.map(p => (
              <PokemonSelectCard
                key={p.id}
                pokemon={p}
                selected={selectedId === p.id}
                onSelect={() => setSelectedId(p.id)}
              />
            ))}
          </div>

          {startError && <p className="text-sm text-destructive mb-4">{startError}</p>}

          <Button
            size="lg"
            onClick={handleStart}
            disabled={!selectedId || startMutation.isPending}
            className="px-10"
          >
            {startMutation.isPending ? 'Starting...' : 'Start Battle'}
          </Button>
        </>
      )}
    </PageWrapper>
  );
}

// ─── Pokemon select card ──────────────────────────────────────────────────────

function PokemonSelectCard({
  pokemon,
  selected,
  onSelect,
}: {
  pokemon: PokemonOwned;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left bg-[#0e1015] border rounded-2xl p-4 transition-all hover:border-[#4e8fff] w-full"
      style={{ borderColor: selected ? '#4e8fff' : '#23262f', boxShadow: selected ? '0 0 20px #4e8fff22' : 'none' }}
    >
      {pokemon.imageUrl && (
        <img src={pokemon.imageUrl} alt={pokemon.name} className="w-16 h-16 object-contain mx-auto mb-2" />
      )}
      <div className="font-bold text-sm capitalize text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {pokemon.name}
      </div>
      <div className="text-center text-xs text-[#565b6b] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        Lv.{pokemon.level} · {pokemon.hp} HP
      </div>
      {(pokemon.isShiny || pokemon.isLegendary) && (
        <div className="flex justify-center gap-1 mt-1.5">
          {pokemon.isShiny && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#ffc94d22', color: '#ffc94d', border: '1px solid #ffc94d44' }}>
              SHINY
            </span>
          )}
          {pokemon.isLegendary && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#ff5470' + '22', color: '#ff5470', border: '1px solid #ff547044' }}>
              LGND
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Battle arena ─────────────────────────────────────────────────────────────

function BattleArena({
  battle,
  onMove,
  onReset,
  isMovePending,
}: {
  battle: Battle;
  onMove: (move: BattleMove) => void;
  onReset: () => void;
  isMovePending: boolean;
}) {
  const player = battle.playerPokemon;
  const opponent = battle.opponentPokemon;
  const ended = battle.result !== 'ongoing';

  // Get current HP from last log entries
  const visibleLog = battle.log.filter(e => e.actor !== '_state').slice(-6);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
        {ended
          ? battle.result === 'win'
            ? 'Victory!'
            : 'Defeated'
          : 'Battle'}
      </h1>

      {/* Arena */}
      <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-6 mb-5">
        <div className="grid grid-cols-2 gap-6">
          {/* Player pokemon */}
          <div>
            <div className="text-xs text-[#9096a6] mb-1 uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Your Pokemon
            </div>
            {player ? (
              <>
                {player.imageUrl && <img src={player.imageUrl} alt={player.name} className="w-24 h-24 object-contain mb-2" />}
                <div className="font-bold capitalize" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{player.name}</div>
                <HpBar current={player.hp} max={player.maxHp ?? player.hp} color="#4e8fff" />
                <div className="text-xs text-[#565b6b] mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {player.hp} / {player.maxHp ?? player.hp} HP
                </div>
              </>
            ) : <p className="text-[#565b6b] text-sm">—</p>}
          </div>

          {/* Opponent pokemon */}
          <div className="text-right">
            <div className="text-xs text-[#9096a6] mb-1 uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Wild Pokemon
            </div>
            {opponent ? (
              <>
                {opponent.imageUrl && <img src={opponent.imageUrl} alt={opponent.name} className="w-24 h-24 object-contain mb-2 ml-auto" />}
                <div className="font-bold capitalize" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{opponent.name}</div>
                <HpBar current={opponent.hp ?? 0} max={opponent.maxHp ?? opponent.hp ?? 1} color="#ff5470" />
                <div className="text-xs text-[#565b6b] mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {opponent.hp ?? 0} / {opponent.maxHp ?? opponent.hp ?? '?'} HP
                </div>
              </>
            ) : <p className="text-[#565b6b] text-sm">—</p>}
          </div>
        </div>
      </div>

      {/* Battle log */}
      {visibleLog.length > 0 && (
        <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-4 mb-5 max-h-40 overflow-y-auto space-y-1">
          {visibleLog.map((entry, i) => (
            <div key={i} className="text-sm flex justify-between items-center">
              <span className="text-[#9096a6]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: entry.actor === 'player' ? '#4e8fff' : '#ff5470' }}>
                  [{entry.actor === 'player' ? 'You' : 'Foe'}]
                </span>
                {' '}{entry.move}
              </span>
              {entry.damage > 0 && (
                <span className="text-xs font-bold" style={{ color: entry.actor === 'player' ? '#3ecf8e' : '#ff5470' }}>
                  -{entry.damage} HP
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      {ended ? (
        <div className="text-center space-y-3">
          <div
            className="text-lg font-bold py-3 rounded-2xl"
            style={{
              background: battle.result === 'win' ? '#3ecf8e1a' : '#ff54701a',
              color: battle.result === 'win' ? '#3ecf8e' : '#ff5470',
              border: `1px solid ${battle.result === 'win' ? '#3ecf8e44' : '#ff547044'}`,
            }}
          >
            {battle.result === 'win' ? 'You won the battle!' : 'Your Pokemon fainted.'}
          </div>
          <Button onClick={onReset} size="lg" className="px-10">
            Battle Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <MoveButton label="Attack" icon="sword" onClick={() => onMove('attack')} disabled={isMovePending} color="#ff5470" />
          <MoveButton label="Defend" icon="shield" onClick={() => onMove('defend')} disabled={isMovePending} color="#4e8fff" />
          <MoveButton label="Flee" icon="run" onClick={() => onMove('flee')} disabled={isMovePending} color="#9096a6" />
        </div>
      )}
    </div>
  );
}

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(max, 1)) * 100));
  return (
    <div className="w-full h-2 bg-[#23262f] rounded-full overflow-hidden mt-1.5">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function MoveButton({
  label,
  icon,
  onClick,
  disabled,
  color,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="py-4 rounded-2xl border font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: `${color}11`,
        borderColor: `${color}44`,
        color,
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <MoveIcon icon={icon} color={color} />
        {label}
      </div>
    </button>
  );
}

function MoveIcon({ icon, color }: { icon: string; color: string }) {
  if (icon === 'sword') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color }}>
        <path d="M3 17L10 10M10 10L14 3L17 6L10 10ZM10 10L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'shield') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color }}>
        <path d="M10 2L17 5V10C17 14 10 18 10 18C10 18 3 14 3 10V5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color }}>
      <path d="M4 10H16M16 10L12 6M16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
