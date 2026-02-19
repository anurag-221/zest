'use client';

import { useCallback } from 'react';

export const useHaptic = () => {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  }, []);

  const trigger = {
    soft: () => vibrate(10),
    medium: () => vibrate(50),
    heavy: () => vibrate(100),
    success: () => vibrate([10, 30, 10]),
    error: () => vibrate([50, 30, 50, 30, 50]),
  };

  return { trigger };
};
