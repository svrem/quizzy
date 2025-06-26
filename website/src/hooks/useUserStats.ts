import { useState } from 'react';

const BASE_SCORE_INCREMENT = 10;
const SCORE_EXPONENT_INCREMENT = 0.1;

export function useUserStats() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const finaliseQuestion = (isCorrect: boolean) => {
    if (isCorrect) {
      setStreak((prevStreak) => prevStreak + 1);

      setScore(
        (prevScore) =>
          prevScore +
          Math.round(
            Math.pow(
              BASE_SCORE_INCREMENT,
              1 + SCORE_EXPONENT_INCREMENT * streak,
            ),
          ),
      );
    } else {
      setStreak(0);
    }
  };

  return {
    score,
    streak,
    finaliseQuestion,
  };
}
