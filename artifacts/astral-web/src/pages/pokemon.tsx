import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useGetWildPokemon, useGetPokeBalls, useCatchPokemon } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { getGetPokeBallsQueryKey, getGetWildPokemonQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { CatchAttemptBallType } from '@workspace/api-client-react';

export function PokemonPage() {
  const { currentPlayer } = useAuth();
  const [selectedBall, setSelectedBall] = useState<CatchAttemptBallType>('poke');
  const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null);

  const { data: wildPokemonResponse, isLoading: wildLoading } = useGetWildPokemon({ count: 6 });
  // GET /api/pokemon/wild sends { pokemon: [...] } — unwrap the same way
  // every other list endpoint in this app needed to be.
  const wildPokemon = Array.isArray(wildPokemonResponse)
    ? wildPokemonResponse
    : (wildPokemonResponse as { pokemon?: typeof wildPokemonResponse } | undefined)?.pokemon;
  const { data: balls } = useGetPokeBalls({ query: { enabled: !!currentPlayer } });
  const catchMutation = useCatchPokemon();
  const queryClient = useQueryClient();

  const handleCatch = () => {
    if (!selectedPokemon || !currentPlayer) return;

    // Server requires the FULL wild-encounter object here (not just a
    // dexId) — re-fetching by dexId server-side would re-roll shiny odds
    // independently of what the player saw in the encounter list. See the
    // comment on POST /api/pokemon/catch in api-server.js.
    catchMutation.mutate(
      { data: { pokemon: selectedPokemon, ballType: selectedBall } },
      {
        onSuccess: (result) => {
          queryClient.invalidateQueries({ queryKey: getGetPokeBallsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWildPokemonQueryKey({ count: 6 }) });
          setSelectedPokemon(null);
          alert(result.caught ? `Caught! ${result.shiny ? 'SHINY! ' : ''}Streak: ${result.streak}` : 'Escaped!');
        },
      }
    );
  };

  const ballTypes: { type: CatchAttemptBallType; name: string; color: string }[] = [
    { type: 'poke', name: 'Poké Ball', color: '#ff5470' },
    { type: 'great', name: 'Great Ball', color: '#4e8fff' },
    { type: 'ultra', name: 'Ultra Ball', color: '#ffc94d' },
    { type: 'master', name: 'Master Ball', color: '#8b6bff' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        <h1
          className="text-4xl font-extrabold mb-2"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px' }}
        >
          Pokémon Roll
        </h1>
        <p className="text-[#9096a6] mb-8">Encounter wild Pokémon and catch them with your Poké Balls</p>

        {/* Gacha orb section */}
        <div className="mb-8 p-8 bg-[#0e1015] border border-[#23262f] rounded-3xl text-center">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(78,143,255,0.3), rgba(78,143,255,0.05))',
                animation: 'orbPulse 3s ease-in-out infinite',
              }}
            />
            <div
              className="absolute inset-4 rounded-full border-4 flex items-center justify-center text-6xl"
              style={{
                borderColor: '#4e8fff',
                background: 'radial-gradient(circle, rgba(78,143,255,0.15), transparent)',
                animation: 'orbGlow 2s ease-in-out infinite',
              }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="30" stroke="#4e8fff" strokeWidth="3" fill="rgba(78,143,255,0.1)" />
                <circle cx="40" cy="40" r="8" fill="#4e8fff" />
              </svg>
            </div>
          </div>

          {currentPlayer && balls && (
            <div
              className="inline-flex items-center gap-2 bg-[rgba(78,143,255,0.14)] border border-[rgba(78,143,255,0.28)] px-3 py-1.5 rounded-full text-sm font-bold mb-4"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4e8fff' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 1L8.5 5.5H13L9.5 8.5L11 13L7 10L3 13L4.5 8.5L1 5.5H5.5L7 1Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
              Streak: {balls.poke || 0}
            </div>
          )}

          <div className="text-lg text-[#9096a6]">Roll to encounter wild Pokémon</div>
        </div>

        {/* Ball picker */}
        {currentPlayer && balls && (
          <div className="mb-8">
            <h3 className="font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Select your Ball
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ballTypes.map(({ type, name, color }) => (
                <button
                  key={type}
                  onClick={() => setSelectedBall(type)}
                  disabled={balls[type] === 0}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedBall === type
                      ? 'border-[#4e8fff] bg-[rgba(78,143,255,0.1)]'
                      : 'border-[#23262f] bg-[#15171f] hover:border-[#4e8fff]'
                  } ${balls[type] === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ background: color }} />
                  <div className="font-semibold text-sm mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {name}
                  </div>
                  <div className="text-xs text-[#9096a6]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {balls[type]} left
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wild encounters */}
        <div>
          <h3 className="font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Wild Encounters
          </h3>

          {wildLoading ? (
            <div className="text-center py-12 text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Finding Pokémon...
            </div>
          ) : !wildPokemon || wildPokemon.length === 0 ? (
            <div className="text-center py-12 text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              No wild Pokémon found
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {wildPokemon.map((pokemon) => (
                <div
                  key={pokemon.dexId}
                  className={`p-4 bg-[#0e1015] border rounded-2xl cursor-pointer transition-all ${
                    selectedPokemon?.dexId === pokemon.dexId
                      ? 'border-[#4e8fff] bg-[rgba(78,143,255,0.08)]'
                      : 'border-[#23262f] hover:border-[#4e8fff]'
                  }`}
                  onClick={() => setSelectedPokemon(pokemon)}
                >
                  <div className="aspect-square bg-gradient-to-br from-[#15171f] to-[#0e1015] rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    {pokemon.image ? (
                      <img src={pokemon.image} alt={pokemon.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-4xl text-[#565b6b]">?</div>
                    )}
                  </div>

                  <div className="font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {pokemon.name}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 bg-[#1e212c] border border-[#23262f] rounded-full text-[10px] font-bold uppercase"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {pokemon.isShiny && (
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(255,201,77,0.14)] border border-[rgba(255,201,77,0.35)] rounded-full text-[10px] font-bold"
                      style={{ color: '#ffc94d', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 1L6 3H8L6.5 4.5L7 6.5L5 5L3 6.5L3.5 4.5L2 3H4L5 1Z"
                          fill="currentColor"
                        />
                      </svg>
                      SHINY
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPokemon && currentPlayer && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleCatch}
              disabled={catchMutation.isPending || !balls || balls[selectedBall] === 0}
              size="lg"
            >
              {catchMutation.isPending ? 'Catching...' : `Catch with ${selectedBall} Ball`}
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
