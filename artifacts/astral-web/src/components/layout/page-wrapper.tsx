import { useEffect, useState, ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const [showFlash, setShowFlash] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setShowFlash(true);
    setAnimate(true);

    const flashTimer = setTimeout(() => setShowFlash(false), 500);
    const animateTimer = setTimeout(() => setAnimate(false), 500);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(animateTimer);
    };
  }, [children]);

  return (
    <>
      {/* Warp flash effect */}
      {showFlash && (
        <div
          className="fixed inset-0 z-[500] pointer-events-none"
          style={{
            background:
              'linear-gradient(100deg, transparent 40%, rgba(255,255,255,0.35) 48%, rgba(78,143,255,0.35) 52%, transparent 60%)',
            animation: 'flashSweep 0.5s ease-out both',
          }}
        />
      )}

      {/* Page content */}
      <div
        className="max-w-[1200px] mx-auto px-5 py-10 min-h-[70vh]"
        style={animate ? { animation: 'warpIn 0.5s cubic-bezier(0.16,1,0.3,1) both' } : {}}
      >
        {children}
      </div>
    </>
  );
}
