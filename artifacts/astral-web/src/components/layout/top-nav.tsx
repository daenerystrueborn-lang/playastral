import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { AuthModal } from '@/components/auth/auth-modal';

export function TopNav() {
  const [location] = useLocation();
  const { currentPlayer } = useAuth();
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/pokemon', label: 'Pokémon' },
    { path: '/battle', label: 'Battle' },
    { path: '/shop', label: 'Shop' },
    { path: '/premium', label: 'Premium' },
    { path: '/seasons', label: 'Seasons' },
    { path: '/search', label: 'Search' },
  ];

  if (currentPlayer) {
    navLinks.push({ path: '/profile', label: 'Profile' });
  }

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <nav
        className="sticky top-0 z-[300] h-[52px] px-5 flex items-center border-b"
        style={{
          background: 'rgba(7,8,11,0.78)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          borderColor: '#23262f',
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto flex items-center gap-2.5">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.2px' }}
          >
            <span>
              Astr<span style={{ color: '#4e8fff' }}>al</span>
            </span>
          </Link>

          {/* Desktop nav pills */}
          <div className="hidden md:flex items-center gap-0.5 mx-auto bg-[#0e1015] border border-[#23262f] rounded-full p-[3px]">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-[13px] py-[6px] rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all duration-[180ms]`}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: location === link.path ? '#07080b' : '#9096a6',
                  background: location === link.path ? '#f3f4f8' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentPlayer && (
              <div
                className="flex items-center gap-1.5 bg-[#15171f] border border-[#23262f] px-2.5 py-[5px] rounded-full text-[12px] font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 1L7 4H10L7.5 6L8.5 9L6 7L3.5 9L4.5 6L2 4H5L6 1Z"
                    fill="#4e8fff"
                    stroke="#4e8fff"
                    strokeWidth="0.8"
                  />
                </svg>
                {(currentPlayer.wallet?.solars ?? 0).toLocaleString()}
              </div>
            )}

            {currentPlayer ? (
              <Link
                href="/profile"
                className="w-[30px] h-[30px] rounded-lg bg-[#1e212c] border border-[#23262f] flex items-center justify-center text-[12px] font-bold cursor-pointer hover:bg-[#23262f] transition-colors"
              >
                {getInitials(currentPlayer.name)}
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#4e8fff] text-[#04070f] text-[12.5px] font-semibold transition-all hover:bg-[#6ba0ff]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Sign in
              </button>
            )}

            {/* Hamburger menu */}
            <div className="relative md:hidden">
              <button
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#15171f] border border-[#23262f]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {hamburgerOpen && (
                <div
                  className="absolute top-[calc(100%+8px)] right-0 min-w-[190px] bg-[#0e1015] border border-[#23262f] rounded-2xl p-[5px] flex flex-col gap-px z-[350]"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                >
                  {navLinks.map((link, idx) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setHamburgerOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all ${
                        location === link.path
                          ? 'bg-[rgba(78,143,255,0.14)] text-[#4e8fff]'
                          : 'text-[#9096a6] hover:bg-[#15171f] hover:text-[#f3f4f8]'
                      }`}
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!currentPlayer && (
                    <>
                      <div className="h-px bg-[#171920] my-1 mx-0.5" />
                      <button
                        onClick={() => {
                          setHamburgerOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium text-[#9096a6] hover:bg-[#15171f] hover:text-[#f3f4f8] transition-all text-left w-full"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
