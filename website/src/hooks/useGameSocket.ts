import { useEffect, useRef, useState } from 'react';
import { useChallenge } from '@/hooks/useChallenge';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || '/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // 1 second

export function useGameSocket() {
  const { challengeToken, nonce } = useChallenge();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const connect = () => {
      const websocketUrl = new URL(WEBSOCKET_URL, window.location.origin);
      websocketUrl.searchParams.set('challenge_token', challengeToken || '');
      websocketUrl.searchParams.set('nonce', nonce?.toString() || '');

      const newSocket = new WebSocket(websocketUrl.toString());
      newSocket.binaryType = 'arraybuffer';

      newSocket.onopen = () => {
        reconnectAttempts.current = 0; // Reset attempts on successful connection
      };
      newSocket.onclose = (event) => {
        if (reconnectAttempts.current > MAX_RECONNECT_ATTEMPTS) return;

        setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, RECONNECT_DELAY);
      };

      setSocket(newSocket);
    };

    if (!socket && challengeToken && nonce) {
      connect();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket, challengeToken, nonce]);

  return socket;
}
