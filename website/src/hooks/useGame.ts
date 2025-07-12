import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/hooks//useAudio';
import { useGameSocket } from '@/hooks/useGameSocket';
import { fireConfetti } from '@/utils/confetti';
import { useEffect, useRef, useState } from 'react';

import { quizzy as protobuf } from '@/protocol/quizzy.pb';

export function useGame() {
  const { authenticatedState, user } = useAuth();

  const winSound = useAudio(`${process.env.PUBLIC_URL}/audio/win.mp3`);
  const loseSound = useAudio(`${process.env.PUBLIC_URL}/audio/lose.mp3`);

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
  const [answerPercentages, setAnswerPercentages] = useState<number[] | null>(
    null,
  );
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

    // gameSocket.onmessage = async (event: MessageEvent) => {

    //   const buffer = new Uint8Array(event.data);
    //   const gameEvent = protobuf.GameEvent.decode(buffer);

    //   switch (gameEvent.type) {
    //     case protobuf.GameEventType.QUESTION: {
    //       const question = gameEvent.question;

    //       if (!question) throw new Error('Question data is missing');

    //       setQuestion(question.question || null);
    //       setDifficulty(question.difficulty || null);
    //       setCategory(question.category || null);
    //       setCategoryPossibilities(null);
    //       setAnswers([]);
    //       setAnswerPercentages(null);
    //       setVotePercentages(null);
    //       setSelectedCategory(null);
    //       setSelectedAnswerIndex(null);
    //       setTimerEndTime(null);
    //       setCorrectAnswerIndex(null);
    //       break;
    //     }
    //     case protobuf.GameEventType.START_ANSWER_PHASE: {
    //       setAnswers(gameEvent.answerPhase?.answers || []);

    //       setTimerEndTime(gameEvent.answerPhase?.answerShownAt || null);
    //       setDuration(gameEvent.answerPhase?.duration || 0);
    //       break;
    //     }
    //     case protobuf.GameEventType.UPDATE_USER_STATS: {
    //       setScore(gameEvent.updateUserStats?.score || 0);
    //       setStreak(gameEvent.updateUserStats?.streak || 0);
    //       break;
    //     }
    //     case protobuf.GameEventType.CATEGORY_SELECTION: {
    //       setQuestion(null);
    //       setDifficulty(null);
    //       setCategory(null);
    //       setAnswers([]);
    //       setSelectedAnswerIndex(null);
    //       setCorrectAnswerIndex(null);
    //       setCategoryPossibilities(
    //         gameEvent.categorySelection?.categories || null,
    //       );
    //       setTimerEndTime(gameEvent.categorySelection?.endTime || null);
    //       setDuration(gameEvent.categorySelection?.duration || 0);

    //       break;
    //     }
    //     case protobuf.GameEventType.CATEGORY_VOTES: {
    //       setVotePercentages(gameEvent.categoryVotes?.votePercentages || null);
    //       break;
    //     }
    //     case protobuf.GameEventType.SHOW_ANSWER: {
    //       setCorrectAnswerIndex(gameEvent.showAnswer?.correct || null);
    //       setAnswerPercentages(gameEvent.showAnswer?.percentages || null);

    //       if (selectedAnswerIndex === null) {
    //         setSelectedAnswerIndex(null);
    //         break;
    //       }

    //       if (selectedAnswerIndex !== gameEvent.showAnswer?.correct) {
    //         loseSound.play();
    //         setSelectedAnswerIndex(null);
    //         break;
    //       }

    //       setSelectedAnswerIndex(null);
    //       winSound.play();

    //       const source = selectedOptionRef.current?.getBoundingClientRect();

    //       if (!source) break;

    //       await fireConfetti({
    //         y: source.top / window.innerHeight,
    //       });

    //       break;
    //     }
    //   }
    // };
  }

  useEffect(() => {
    setQuestion('skibidi toilet?');
    setDifficulty('easy');
    setCategory('Music');
    setAnswers(['Yes', 'No', 'Sigma', 'Among us']);
    setAnswerPercentages([30, 70]);
    setCorrectAnswerIndex(0);
    // setCategoryPossibilities(['Music', 'Science', 'History']);
  }, []);

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
    answerPercentages,
    selectedCategory,
    votePercentages,
    setSelectedAnswerIndex,
    setSelectedCategory,
  };
}
