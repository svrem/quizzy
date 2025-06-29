import { useMemo } from 'react';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || '/ws';

export function useGameSocket() {
  const socket = useMemo(() => {
    return new WebSocket(WEBSOCKET_URL);
  }, []);

  return socket;
}
