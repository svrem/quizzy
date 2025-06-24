import { useRef, useState } from 'react';
import { useGameSocket } from '@/hooks/useGameSocket';
import { fireConfetti } from '@/utils/confetti';

export function useGame() {
  const gameSocket = useGameSocket();

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
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);

  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  gameSocket.onopen = () => {
    gameSocket.send(
      JSON.stringify({
        type: 'welcome',
      }),
    );
  };

  gameSocket.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    console.log(data);

    switch (data.type) {
      case 'question': {
        setQuestion(data.data.question);
        setDifficulty(data.data.difficulty);
        setCategory(data.data.category);
        setAnswers([]);
        setSelectedAnswerIndex(null);
        setTimerEndTime(null);
        setCorrectAnswerIndex(null);
        break;
      }
      case 'start-answer-phase': {
        setAnswers(data.data.answers);

        setTimerEndTime(data.data.answer_shown_at);
        break;
      }
      case 'show-answer': {
        setCorrectAnswerIndex(data.data);

        if (selectedAnswerIndex !== data.data) {
          setSelectedAnswerIndex(null);

          return;
        }
        setSelectedAnswerIndex(null);

        const source = selectedOptionRef.current?.getBoundingClientRect();

        if (!source) return;

        fireConfetti({
          y: source.top / window.innerHeight,
        });

        break;
      }
    }
  };

  gameSocket.onclose = () => {
    console.log('WebSocket connection closed');
    window.location.reload();
  };
  gameSocket.onerror = (error: Event) => {
    console.error('WebSocket error:', error);
  };

  return {
    question,
    difficulty,
    category,
    answers,
    selectedAnswerIndex,
    correctAnswerIndex,
    timerEndTime,
    selectedOptionRef,
    setSelectedAnswerIndex,
    setCorrectAnswerIndex,
  };
}
