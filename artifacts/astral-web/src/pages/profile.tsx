import { useState } from 'react';
import { useRoute } from 'wouter';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
  useGetMe,
  useGetPlayer,
  useUpdatePlayer,
  useGetMyCards,
  useGetMyPokemon,
  getGetMeQueryKey,
} from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfilePage() {
  const { currentPlayer } = useAuth();
  const [, params] = useRoute('/profile/:id');
  const viewId = params?.id ?? null;

  // Own profile = no id param, or param matches current player
  const isOwn = !viewId || viewId === currentPlayer?.id;

  return isOwn ? <OwnProfile /> : <PublicProfile id={viewId!} />;
}

// ─── Own Profile ──────────────────────────────────────────────────────────────

function OwnProfile() {
  const { currentPlayer, setCurrentPlayer } = useAuth();
  const qc = useQueryClient();
  const updateMutation = useUpdatePlayer();

  const { data: cards } = useGetMyCards({ query: { enabled: !!currentPlayer } });
  const { data: pokemon } = useGetMyPokemon({ query: { enabled: !!currentPlayer } });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');

  if (!currentPlayer) {
    return (
      <PageWrapper>
        <div className="text-center py-24 text-[#565b6b]">
          <p className="text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>Sign in to view your profile</p>
        </div>
      </PageWrapper>
    );
  }

  function startEdit() {
    setName(currentPlayer!.name ?? '');
    setBio(currentPlayer!.bio ?? '');
    setAvatarUrl(currentPlayer!.avatarUrl ?? '');
    setError('');
    setEditing(true);
  }

  function saveEdit() {
    setError('');
    updateMutation.mutate(
      { data: { name: name || undefined, bio: bio || undefined, avatarUrl: avatarUrl || undefined } },
      {
        onSuccess: (updated) => {
          setCurrentPlayer(updated);
          qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setEditing(false);
        },
        onError: () => setError('Failed to save. Try again.'),
      }
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        {/* Banner */}
        <div
          className="w-full h-32 sm:h-44 rounded-2xl mb-[-2.5rem] overflow-hidden border"
          style={{ borderColor: '#23262f' }}
        >
          <img
            src={currentPlayer.bannerUrl || '/default-banner.png'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header */}
        <div className="flex items-start gap-5 mb-8 relative">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-extrabold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4e8fff22, #4e8fff44)',
              border: '2px solid #4e8fff44',
              fontFamily: 'Syne, sans-serif',
              color: '#4e8fff',
            }}
          >
            <img
              src={currentPlayer.avatarUrl || '/default-pfp.png'}
              alt=""
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="text-2xl font-extrabold"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {currentPlayer.name ?? 'Unnamed Trainer'}
              </h1>
              {currentPlayer.premiumActive && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  style={{ background: '#ffc94d22', color: '#ffc94d', border: '1px solid #ffc94d44', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {currentPlayer.premiumPlan ?? 'Premium'}
                </span>
              )}
            </div>
            <p className="text-[#9096a6] text-sm mt-1 mb-3">{currentPlayer.bio ?? 'No bio yet.'}</p>

            {!editing && (
              <Button size="sm" variant="outline" onClick={startEdit}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-5 mb-6 space-y-4">
            <h2 className="font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Edit Profile</h2>
            <div className="space-y-2">
              <label className="text-xs text-[#9096a6] uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Display Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your trainer name" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#9096a6] uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Bio</label>
              <Input value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#9096a6] uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Avatar URL</label>
              <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
              <Button onClick={saveEdit} disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Level" value={String(currentPlayer.level)} />
          <StatCard label="XP" value={(currentPlayer.xp ?? 0).toLocaleString()} />
          <StatCard label="Solars" value={(currentPlayer.wallet?.solars ?? 0).toLocaleString()} />
          <StatCard label="Streak" value={`${currentPlayer.dailyStreak ?? 0}d`} />
        </div>

        {/* Collections */}
        <div className="grid grid-cols-2 gap-4">
          <CollectionCard label="Cards Owned" count={cards?.length ?? 0} icon="cards" />
          <CollectionCard label="Pokemon Caught" count={pokemon?.length ?? 0} icon="pokemon" />
        </div>
      </div>
    </PageWrapper>
  );
}

// ─── Public Profile ───────────────────────────────────────────────────────────

function PublicProfile({ id }: { id: string }) {
  const { data: player, isLoading, error } = useGetPlayer(id);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !player) {
    return (
      <PageWrapper>
        <div className="text-center py-24">
          <p className="text-[#565b6b]">Player not found.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div
          className="w-full h-32 sm:h-44 rounded-2xl mb-[-2.5rem] overflow-hidden border"
          style={{ borderColor: '#23262f' }}
        >
          <img
            src={player.bannerUrl || '/default-banner.png'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-start gap-5 mb-8 relative">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-extrabold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4e8fff22, #4e8fff44)',
              border: '2px solid #4e8fff44',
              fontFamily: 'Syne, sans-serif',
              color: '#4e8fff',
            }}
          >
            <img
              src={player.avatarUrl || '/default-pfp.png'}
              alt=""
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
                {player.name ?? 'Unnamed Trainer'}
              </h1>
              {player.premiumActive && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  style={{ background: '#ffc94d22', color: '#ffc94d', border: '1px solid #ffc94d44', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {player.premiumPlan ?? 'Premium'}
                </span>
              )}
            </div>
            <p className="text-[#9096a6] text-sm mt-1">{player.bio ?? 'No bio.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Level" value={String(player.level)} />
          <StatCard label="XP" value={(player.xp ?? 0).toLocaleString()} />
          <StatCard label="Cards" value={String(player.cardCount)} />
          <StatCard label="Pokemon" value={String(player.pokemonCount)} />
        </div>
      </div>
    </PageWrapper>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-4">
      <div className="text-[11px] text-[#565b6b] uppercase tracking-wider mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
        {value}
      </div>
    </div>
  );
}

function CollectionCard({ label, count, icon }: { label: string; count: number; icon: string }) {
  return (
    <div className="bg-[#0e1015] border border-[#23262f] rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#4e8fff1a', border: '1px solid #4e8fff33' }}>
        {icon === 'cards' ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="12" height="14" rx="2" stroke="#4e8fff" strokeWidth="1.5" />
            <rect x="6" y="2" width="12" height="14" rx="2" stroke="#4e8fff44" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="7" stroke="#4e8fff" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="2.5" fill="#4e8fff" />
            <line x1="3" y1="10" x2="17" y2="10" stroke="#4e8fff" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      <div>
        <div className="text-xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>{count}</div>
        <div className="text-xs text-[#565b6b]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
      </div>
    </div>
  );
}
