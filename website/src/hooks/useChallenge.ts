import { useEffect, useState } from 'react';

export function useChallenge() {
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number | null>(null);

  async function solveChallenge() {
    const t = performance.now();

    const res = await fetch('/api/challenge');
    if (!res.ok) {
      throw new Error('Failed to fetch challenge token');
    }
    const data = await res.json();

    const challengeWorker = new Worker('/js/solve-challenge.js');

    challengeWorker.onmessage = (event) => {
      const workerData = event.data;

      const { nonce } = workerData;
      setChallengeToken(data.token);
      setNonce(nonce);
      challengeWorker.terminate();

      const elapsed = performance.now() - t;
      console.log(
        `Challenge solved in ${elapsed.toFixed(2)} ms with nonce: ${nonce}`,
      );
    };

    challengeWorker.onerror = (error) => {
      console.error('Challenge worker error:', error);
      challengeWorker.terminate();
    };

    challengeWorker.postMessage([data.code]);
  }

  useEffect(() => {
    solveChallenge().catch((error) => {
      console.error('Error solving challenge:', error);
    });
  }, []);

  return {
    challengeToken,
    nonce,
  };
}
