import { useEffect, useState } from 'react';

export function useTimeSync() {
  const [serverTime, setServerTime] = useState<number | null>(null);
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
    if (serverTime !== null) {
      const currentTime = Date.now();
      setTimeOffset(serverTime - currentTime);
    }
  }, [serverTime]);

  return { timeOffset };
}
