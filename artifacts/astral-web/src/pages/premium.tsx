import { PageWrapper } from '@/components/layout/page-wrapper';
import { useGetPremiumPlans, useGetPremiumStatus, useGetPremiumWhatsappLink } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Marketing copy for each plan lives here, not on the server — the API
// (/api/premium/plans) only ever sends { id, label, priceNaira, durationDays }.
const PLAN_DISPLAY: Record<string, { accent: string; name: string; features: string[] }> = {
  weekly: {
    accent: '#4e8fff',
    name: 'Weekly',
    features: ['Premium role & badge', 'Boosted drop rates', 'Priority support'],
  },
  monthly: {
    accent: '#3ecf8e',
    name: 'Monthly',
    features: ['Everything in Weekly', 'Exclusive frames', 'Bonus daily rewards'],
  },
  yearly: {
    accent: '#ffc94d',
    name: 'Yearly',
    features: ['Everything in Monthly', 'Best value per month', 'Early access to new features'],
  },
};
const DEFAULT_PLAN_DISPLAY = { accent: '#4e8fff', name: 'Premium', features: [] as string[] };

export function PremiumPage() {
  const { currentPlayer } = useAuth();
  const { data: plansResponse, isLoading: plansLoading } = useGetPremiumPlans();
  const { data: statusResponse } = useGetPremiumStatus({ query: { enabled: !!currentPlayer } });
  // Same envelope-unwrapping concern as plans above — server sends
  // { premium: { active, plan, expiresAt, ... } }.
  const status = (statusResponse as { premium?: any } | undefined)?.premium ?? statusResponse;

  // useGetPremiumPlans's `data` may come back either as the raw array or as
  // the raw API envelope { plans: [...] } depending on how the generated
  // client unwraps responses — normalize here so every read below can
  // safely assume `plans` is an array (or undefined). Same fix as home.tsx's
  // leaderboard normalization.
  const plans = Array.isArray(plansResponse)
    ? plansResponse
    : (plansResponse as { plans?: typeof plansResponse } | undefined)?.plans;

  function handleBuy(planId: string) {
    // Fetch WhatsApp link then redirect — no payment data touches this site
    fetch(`/api/premium/whatsapp-link/${planId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(({ url }) => {
        if (url) window.location.href = url;
      });
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-1.5 bg-[rgba(255,201,77,0.12)] border border-[rgba(255,201,77,0.28)] px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-4"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ffc94d' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1L6 3.5H8.5L6.5 5L7.5 7.5L5 6L2.5 7.5L3.5 5L1.5 3.5H4L5 1Z" fill="currentColor" />
          </svg>
          Premium Plans
        </div>
        <h1 className="text-5xl font-extrabold mb-3" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>
          Level Up
        </h1>
        <p className="text-[#9096a6] max-w-lg mx-auto text-lg">
          Unlock boosts, exclusive frames, and bonus content. Purchase by sending a WhatsApp message to our bot — no bank details required on this site.
        </p>

        {status?.active && (
          <div
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#3ecf8e1a', border: '1px solid #3ecf8e44', color: '#3ecf8e' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Active: {status.plan ?? 'Premium'}{status.expiresAt ? ` — expires ${new Date(status.expiresAt).toLocaleDateString()}` : ''}
          </div>
        )}
      </div>

      {/* Plans */}
      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map(plan => {
            const display = PLAN_DISPLAY[plan.id] ?? DEFAULT_PLAN_DISPLAY;
            const accent = display.accent;
            const isActive = status?.plan === plan.id && status?.active;

            return (
              <div
                key={plan.id}
                className="relative bg-[#0e1015] border rounded-2xl p-6 flex flex-col gap-5 transition-all hover:scale-[1.01]"
                style={{
                  borderColor: isActive ? `${accent}88` : '#23262f',
                  boxShadow: isActive ? `0 0 32px ${accent}22` : 'none',
                }}
              >
                {isActive && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{ background: accent, color: '#04070f', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    Current Plan
                  </div>
                )}

                <div>
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: accent, fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {plan.durationDays != null ? `${plan.durationDays} days` : plan.label}
                  </div>
                  <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {display.name}
                  </h2>
                  <div className="text-3xl font-extrabold" style={{ color: accent, fontFamily: 'Syne, sans-serif' }}>
                    ₦{(plan.priceNaira ?? 0).toLocaleString()}
                  </div>
                </div>

                <ul className="space-y-2 flex-1">
                  {display.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#9096a6]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0" style={{ color: accent }}>
                        <path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleBuy(plan.id)}
                  className="w-full font-semibold"
                  style={
                    isActive
                      ? { background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }
                      : { background: accent, color: '#04070f' }
                  }
                >
                  {isActive ? 'Active' : (
                    <span className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2c-.18.538.326 1.043.864.864l3.032-.892A9.958 9.958 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="currentColor" />
                      </svg>
                      Buy via WhatsApp
                    </span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-[#565b6b] mt-10 max-w-md mx-auto">
        Purchases are handled entirely through WhatsApp DM. This site never collects, displays, or stores any payment or bank details.
      </p>
    </PageWrapper>
  );
}
