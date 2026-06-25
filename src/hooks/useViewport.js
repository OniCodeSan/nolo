import { useEffect, useState } from 'react';

const DESKTOP_MIN = 900;

export function useViewport() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= DESKTOP_MIN
  );

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const handler = (e) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, []);

  return { isDesktop, isMobile: !isDesktop };
}
