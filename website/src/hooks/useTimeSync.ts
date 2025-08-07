import { useEffect, useState } from 'react';

export function useTimeSync() {
  const [serverTime, setServerTime] = useState<number | null>(null);
  const [timeOffset, setTimeOffset] = useState<number | null>(null);

  useEffect(() => {
    if (!serverTime) return;

    const currentTime = Date.now();
    setTimeOffset(serverTime - currentTime);
  }, [serverTime]);

  return { timeOffset, setServerTime };
}
