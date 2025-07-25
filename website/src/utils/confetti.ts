import confetti from 'canvas-confetti';

const count = 200;

async function fire(particleRatio: number, opts: confetti.Options) {
  await confetti({
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  });
}

export function fireConfetti(origin: { x?: number; y?: number }) {
  return Promise.all([
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin,
    }),
    fire(0.2, {
      spread: 60,
      origin,
    }),
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin,
    }),
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin,
    }),
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin,
    }),
  ]);
}
