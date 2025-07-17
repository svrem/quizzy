import { DemoState, useDemoContext } from '@/context/DemoContext';
import { useEffect, useState } from 'react';

export function useTimeSync() {
  const { demoState } = useDemoContext();

  const [serverTime, setServerTime] = useState<number | null>(null);
  const [clientTime, setClientTime] = useState<number | null>(null);
  const [timeOffset, setTimeOffset] = useState<number | null>(null);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await fetch('/api/time');
        const data = await response.text();
        setServerTime(parseInt(data, 10));
      } catch (error) {
        console.error('Failed to fetch server time:', error);
      }
    };

    fetchServerTime();
  }, []);

  useEffect(() => {
    if (demoState !== DemoState.Normal) {
      setTimeOffset(0);
      return;
    }

    if (serverTime !== null) {
      const currentTime = Date.now();
      setClientTime(currentTime);
      setTimeOffset(serverTime - currentTime);
    }
  }, [serverTime]);

  // if (demoState !== DemoState.Normal) return { timeOffset: 0 };

  return { timeOffset };
}
