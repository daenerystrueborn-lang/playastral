import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRequestOtp, useVerifyOtp } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMeQueryKey } from '@workspace/api-client-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { setCurrentPlayer } = useAuth();
  const queryClient = useQueryClient();

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    requestOtpMutation.mutate(
      { data: { phone: `234${phone.replace(/\D/g, '')}` } },
      {
        onSuccess: (result) => {
          setStep('otp');
          // In dev mode, the API echoes the OTP back as devCode instead of
          // relying on WhatsApp delivery — see config.js's devMode.
          if ((result as any)?.devCode) {
            console.log('OTP (dev mode):', (result as any).devCode);
          }
        },
        onError: (err: any) => {
          setError(err?.error || 'Failed to send OTP');
        },
      }
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    verifyOtpMutation.mutate(
      { data: { phone: `234${phone.replace(/\D/g, '')}`, code } },
      {
        onSuccess: (result) => {
          // POST /api/auth/verify-otp sends { ok, player: {...} } — unwrap it.
          const player = (result as any)?.player ?? result;
          setCurrentPlayer(player);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          onOpenChange(false);
          setStep('phone');
          setPhone('');
          setCode('');
        },
        onError: (err: any) => {
          setError(err?.error || 'Invalid code');
        },
      }
    );
  };

  const handleBack = () => {
    setStep('phone');
    setCode('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800 }}>
            {step === 'phone' ? 'Sign in to Astral' : 'Enter verification code'}
          </DialogTitle>
        </DialogHeader>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Phone number
              </label>
              <div className="flex gap-2">
                <div className="px-3 py-2 bg-muted rounded-lg border text-sm font-mono">+234</div>
                <Input
                  type="tel"
                  placeholder="8012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={requestOtpMutation.isPending}>
              {requestOtpMutation.isPending ? 'Sending...' : 'Send verification code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                6-digit code
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
              <p className="text-xs text-muted-foreground">Sent to +234{phone}</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
