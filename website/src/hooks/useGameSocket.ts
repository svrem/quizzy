import { useEffect, useRef, useState } from 'react';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || '/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // 1 second

export function useGameSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const connect = () => {
      const newSocket = new WebSocket(WEBSOCKET_URL);

      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        reconnectAttempts.current = 0; // Reset attempts on successful connection
      };
      newSocket.onclose = (event) => {
        console.log('WebSocket connection closed', event);
        if (reconnectAttempts.current > MAX_RECONNECT_ATTEMPTS) return;

        setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, RECONNECT_DELAY);
      };

      setSocket(newSocket);
    };

    if (!socket) {
      connect();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return socket;
}
