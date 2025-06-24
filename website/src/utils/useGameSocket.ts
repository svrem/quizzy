import { useMemo } from 'react';

export function useGameSocket() {
  const socket = useMemo(() => {
    return new WebSocket('ws://192.168.117.242:8080/ws');
  }, []);

  return socket;
}
