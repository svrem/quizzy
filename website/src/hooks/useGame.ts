import { useAuth } from '@/context/AuthContext';
import { useGameSocket } from '@/hooks/useGameSocket';
import { fireConfetti } from '@/utils/confetti';
import { useEffect, useRef, useState } from 'react';

const winSound = new Audio(`${process.env.PUBLIC_URL}/audio/win.mp3`);
winSound.preload = 'auto';
winSound.volume = 0.5;

const loseSound = new Audio(`${process.env.PUBLIC_URL}/audio/lose.mp3`);
loseSound.preload = 'auto';
loseSound.volume = 0.5;

export function useGame() {
  const { authenticatedState, user } = useAuth();

  const gameSocket = useGameSocket();
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  const [question, setQuestion] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null,
  );
  const [categoryPossiblities, setCategoryPossibilities] = useState<
    string[] | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [votePercentages, setVotePercentages] = useState<number[] | null>(null);

  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (authenticatedState === 'loading' || user === null) return;

    setScore(user.startingScore);
  }, [authenticatedState, user]);

  useEffect(() => {
    if (selectedAnswerIndex === null || gameSocket === null) return;

    gameSocket.send(
      JSON.stringify({
        type: 'select-answer',
        answer: selectedAnswerIndex,
      }),
    );
  }, [selectedAnswerIndex, gameSocket]);

  useEffect(() => {
    if (selectedCategory === null || gameSocket === null) return;

    gameSocket.send(
      JSON.stringify({
        type: 'select-category',
        category: selectedCategory,
      }),
    );
  }, [selectedCategory, gameSocket]);

  if (gameSocket !== null) {
    gameSocket.onopen = () => {
      gameSocket.send(
        JSON.stringify({
          type: 'hello',
        }),
      );
    };

    gameSocket.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'question': {
          setQuestion(data.data.question);
          setDifficulty(data.data.difficulty);
          setCategory(data.data.category);
          setCategoryPossibilities(null);
          setAnswers([]);
          setVotePercentages(null);
          setSelectedCategory(null);
          setSelectedAnswerIndex(null);
          setTimerEndTime(null);
          setCorrectAnswerIndex(null);
          break;
        }
        case 'start-answer-phase': {
          setAnswers(data.data.answers);

          setTimerEndTime(data.data.answer_shown_at);
          setDuration(data.data.duration);
          break;
        }
        case 'update-user-stats': {
          setScore(data.data.score);
          setStreak(data.data.streak);
          break;
        }
        case 'category-selection': {
          setQuestion(null);
          setDifficulty(null);
          setCategory(null);
          setAnswers([]);
          setSelectedAnswerIndex(null);
          setCorrectAnswerIndex(null);

          setCategoryPossibilities(data.data.categories);
          setTimerEndTime(data.data.end_time);
          setDuration(data.data.duration);

          break;
        }
        case 'category-votes': {
          setVotePercentages(data.data.vote_percentages);
          break;
        }
        case 'show-answer': {
          setCorrectAnswerIndex(data.data);

          if (selectedAnswerIndex === null) {
            setSelectedAnswerIndex(null);
            return;
          }

          if (selectedAnswerIndex !== data.data) {
            loseSound.play();
            setSelectedAnswerIndex(null);
            return;
          }

          setSelectedAnswerIndex(null);
          winSound.play();

          const source = selectedOptionRef.current?.getBoundingClientRect();

          if (!source) return;

          await fireConfetti({
            y: source.top / window.innerHeight,
          });

          break;
        }
      }
    };
  }
  return {
    question,
    difficulty,
    category,
    answers,
    selectedAnswerIndex,
    correctAnswerIndex,
    timerEndTime,
    duration,
    selectedOptionRef,
    score,
    streak,
    categoryPossiblities,
    selectedCategory,
    votePercentages,
    setSelectedAnswerIndex,
    setSelectedCategory,
  };
}
