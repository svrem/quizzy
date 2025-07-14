import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/hooks//useAudio';
import { useGameSocket } from '@/hooks/useGameSocket';
import { fireConfetti } from '@/utils/confetti';
import { use, useEffect, useRef, useState } from 'react';

import { quizzy as protobuf } from '@/protocol/quizzy.pb';
import { useTimer } from './useTimer';
import { DemoState, useDemoContext } from '@/context/DemoContext';

export function useGame() {
  const { authenticatedState, user } = useAuth();
  const { demoState, setDemoState, setExplainer, setNextForExplainer } =
    useDemoContext();

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
  const [votePercentages, setVotePercentages] = useState<number[] | null>(null);

  const { duration, resetTimer, setTimer, timerEndTime } = useTimer();

  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (
      authenticatedState === 'loading' ||
      user === null ||
      demoState !== DemoState.Normal
    )
      return;

    setScore(user.startingScore);
  }, [authenticatedState, user]);

  useEffect(() => {
    if (selectedAnswerIndex === null || gameSocket === null) return;

    const selectAnswerEvent = protobuf.UserEvent.create({
      type: protobuf.UserEventType.SELECT_ANSWER,
      selectAnswer: {
        answerIndex: selectedAnswerIndex,
      },
    });

    gameSocket.send(protobuf.UserEvent.encode(selectAnswerEvent).finish());
  }, [selectedAnswerIndex, gameSocket]);

  useEffect(() => {
    if (
      selectedCategory === null ||
      gameSocket === null ||
      demoState !== DemoState.Normal
    )
      return;

    const selectCategoryEvent = protobuf.UserEvent.create({
      type: protobuf.UserEventType.SELECT_CATEGORY,
      selectCategory: {
        categoryIndex: selectedCategory,
      },
    });

    gameSocket.send(protobuf.UserEvent.encode(selectCategoryEvent).finish());
  }, [selectedCategory, gameSocket, demoState]);

  useEffect(() => {
    if (demoState !== DemoState.Normal) return;

    const helloEvent = protobuf.UserEvent.create({
      type: protobuf.UserEventType.HELLO,
    });

    if (gameSocket !== null) {
      gameSocket.send(protobuf.UserEvent.encode(helloEvent).finish());
    }
  }, [demoState]);

  if (gameSocket !== null && demoState === DemoState.Normal) {
    gameSocket.onopen = () => {
      const helloEvent = protobuf.UserEvent.create({
        type: protobuf.UserEventType.HELLO,
      });

      gameSocket.send(protobuf.UserEvent.encode(helloEvent).finish());
    };

    gameSocket.onmessage = async (event: MessageEvent) => {
      const buffer = new Uint8Array(event.data);
      const gameEvent = protobuf.GameEvent.decode(buffer);

      switch (gameEvent.type) {
        case protobuf.GameEventType.QUESTION: {
          const question = gameEvent.question;

          if (!question) throw new Error('Question data is missing');

          setQuestion(question.question || null);
          setDifficulty(question.difficulty || null);
          setCategory(question.category || null);
          setCategoryPossibilities(null);
          setAnswers([]);
          setAnswerPercentages(null);
          setVotePercentages(null);
          setSelectedCategory(null);
          setSelectedAnswerIndex(null);
          resetTimer();
          setCorrectAnswerIndex(null);
          break;
        }
        case protobuf.GameEventType.START_ANSWER_PHASE: {
          setAnswers(gameEvent.answerPhase?.answers || []);

          setTimer(
            gameEvent.answerPhase?.answerShownAt || null,
            gameEvent.answerPhase?.duration || 0,
          );
          break;
        }
        case protobuf.GameEventType.UPDATE_USER_STATS: {
          setScore(gameEvent.updateUserStats?.score || 0);
          setStreak(gameEvent.updateUserStats?.streak || 0);
          break;
        }
        case protobuf.GameEventType.CATEGORY_SELECTION: {
          setQuestion(null);
          setDifficulty(null);
          setCategory(null);
          setAnswers([]);
          setSelectedAnswerIndex(null);
          setCorrectAnswerIndex(null);
          setCategoryPossibilities(
            gameEvent.categorySelection?.categories || null,
          );
          setTimer(
            gameEvent.categorySelection?.endTime || null,
            gameEvent.categorySelection?.duration || 0,
          );

          break;
        }
        case protobuf.GameEventType.CATEGORY_VOTES: {
          setVotePercentages(gameEvent.categoryVotes?.votePercentages || null);
          break;
        }
        case protobuf.GameEventType.SHOW_ANSWER: {
          setCorrectAnswerIndex(gameEvent.showAnswer?.correct || 0);
          setAnswerPercentages(gameEvent.showAnswer?.percentages || null);

          if (selectedAnswerIndex === null) {
            setSelectedAnswerIndex(null);
            break;
          }

          if (selectedAnswerIndex !== gameEvent.showAnswer?.correct) {
            loseSound.play();
            setSelectedAnswerIndex(null);
            break;
          }

          setSelectedAnswerIndex(null);
          winSound.play();

          const source = selectedOptionRef.current?.getBoundingClientRect();

          if (!source) break;

          await fireConfetti({
            y: source.top / window.innerHeight,
          });

          break;
        }
      }
    };
  }

  useEffect(() => {
    switch (demoState) {
      case DemoState.CategoryExplainer: {
        setExplainer(
          'At the start of the game, you can choose a category. For that category, 10 questions are shown. Quizzy is a multiplayer game, so the category with the most votes is selected. This demo selects a category for you, but in the normal game you can choose yourself.',
        );
        break;
      }
      case DemoState.CategorySelector: {
        if (categoryPossiblities === null) {
          setCategoryPossibilities(['Geography', 'Science', 'History']);
          setTimer(Date.now() + 5000, 5);
        }

        setTimeout(() => {
          setSelectedCategory(0);
        }, 2000);

        setTimeout(() => {
          const p = [0, 20, 35];
          p[selectedCategory || 0] = 45;
          setVotePercentages(p);
        }, 5000);

        setTimeout(() => {
          setDemoState(DemoState.QuestionExplainer);
          setCategoryPossibilities(null);
        }, 8000);
        break;
      }
      case DemoState.QuestionExplainer: {
        setExplainer(
          'Now you will see a question. You can select an answer, and after the time runs out you will see the correct answer and how other people answered. Again, this demo selects an answer for you.',
        );
        setNextForExplainer(DemoState.Question);
        break;
      }
      case DemoState.Question: {
        setCategoryPossibilities(null);
        setQuestion('What is the capital of France?');
        setDifficulty('easy');
        setCategory('Geography');

        setTimeout(() => {
          setAnswers(['London', 'Paris', 'Berlin', 'Madrid']);
          setTimer(Date.now() + 5000, 5);
        }, 3000);

        setTimeout(() => {
          setSelectedAnswerIndex(1);
        }, 5000);

        setTimeout(() => {
          setAnswerPercentages([10, 67, 17, 6]);
          setCorrectAnswerIndex(1);
          setScore(100);
          setStreak(1);

          const source = selectedOptionRef.current?.getBoundingClientRect();

          fireConfetti({
            y: source!.top / window.innerHeight,
          });

          resetTimer();
        }, 8000);
        setTimeout(() => {
          setQuestion(null);
          setDifficulty(null);
          setCategory(null);
          setAnswers([]);
          setSelectedAnswerIndex(null);
          setDemoState(DemoState.ScoreExplainer);
        }, 13000);
        break;
      }

      case DemoState.ScoreExplainer: {
        setExplainer(
          'If you answer the question right, your score and streak will increase. A higher streaks means exponentially more points for the next question. Your score is linked to your account and stored in the database.',
        );
        setNextForExplainer(DemoState.ProfileExplainer);

        break;
      }
      case DemoState.ProfileExplainer: {
        setExplainer(
          'You can view your profile by clicking on your avatar in the bottom right corner. Here you can see your stats, like your score, streak, and rank. Your rank is based on your score compared to other players. The login is handled with OAuth2. I implemented the OAuth for Google and Discord.',
        );
        setNextForExplainer(DemoState.Ending);
        break;
      }
      case DemoState.Ending: {
        setExplainer(
          "Thank you for playing the demo! For more technological details, check out the Github README. If you want to play the actual game, just press the next button and it'll take you back to the start.",
        );
        setNextForExplainer(DemoState.Asking);
        break;
      }
    }
  }, [demoState]);

  // useEffect(() => {
  //   setQuestion('skibidi toilet?');
  //   setDifficulty('easy');
  //   setCategory('Music');
  //   setAnswers(['Yes', 'No', 'Sigma', 'Among us']);
  //   setAnswerPercentages([30, 70]);
  //   setCorrectAnswerIndex(0);
  //   // setCategoryPossibilities(['Music', 'Science', 'History']);
  // }, []);

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
    setSelectedAnswerIndex: (i: number) => {
      if (demoState !== DemoState.Normal) return;
      setSelectedAnswerIndex(i);
    },
    setSelectedCategory:
      // demoState === DemoState.Normal ? setSelectedCategory : () => {},
      (i: number | null) => {
        if (demoState !== DemoState.Normal) return;
        setSelectedCategory(i);
      },
  };
}
