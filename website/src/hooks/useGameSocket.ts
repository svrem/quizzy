import { useMemo } from 'react';

export function useGameSocket() {
  const socket = useMemo(() => {
    return new WebSocket('/ws');
  }, []);

  return socket;
}
