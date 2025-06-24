import { useState, useEffect, useRef } from 'react';
import './App.css';
import React from 'react';
import { cn } from './utils.ts';

import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { fireConfetti } from './utils/confetti.ts';
import { useGameSocket } from './utils/useGameSocket.ts';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function App() {
  const gameSocket = useGameSocket();

  const [question, setQuestion] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null,
  );

  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);

  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!timerEndTime) return;

    setTimerCountdown(Math.floor((timerEndTime - new Date().getTime()) / 1000));

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const timeLeft = Math.max(0, timerEndTime - currentTime);

      setTimerCountdown(Math.floor(timeLeft / 1000));

      if (timeLeft <= 0) {
        setTimerCountdown(0);
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [timerEndTime]);

  useEffect(() => {
    gameSocket.onopen = () => {
      console.log('WebSocket connection established');
    };
    gameSocket.onmessage = (event) => {
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
    };
    gameSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      gameSocket.onopen = null;
      gameSocket.onmessage = null;
      gameSocket.onclose = null;
      gameSocket.onerror = null;
    };
  }, [gameSocket, selectedAnswerIndex]);

  return (
    <div className='relative grid h-full w-full grid-rows-2'>
      <div className='flex flex-col'>
        <div className='grid grid-cols-3 items-center p-5 md:p-0'>
          <h1 className='h-fit text-2xl font-bold md:col-start-2 md:text-center md:text-5xl'>
            Quizzy
          </h1>

          <CircularProgressbar
            className='col-start-3 h-12 !w-12 justify-self-end font-bold md:h-24 md:!w-24'
            value={timerCountdown ?? 15}
            text={
              timerCountdown ? String(timerCountdown).padStart(2, '0') : '00'
            }
            maxValue={15}
            backgroundPadding={6}
            styles={buildStyles({
              trailColor: 'hsla(0, 0%, 0%, 0.4)',
              textColor: '#fff',
              pathColor: 'yellow',
              strokeLinecap: 'round',
              pathTransitionDuration: 0.3,
              pathTransition: 'ease 0.3s',
              textSize: '1.8rem',
            })}
          />
        </div>

        <div className='row-span-1 flex flex-grow flex-col items-center justify-center'>
          <p
            className='text-center text-xl font-bold md:text-3xl'
            dangerouslySetInnerHTML={{ __html: question }}
          ></p>

          <div className='flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 md:gap-3 md:text-lg'>
            <p
              dangerouslySetInnerHTML={{
                __html: category ? category.split(':')[0] : '',
              }}
              className='capitalize'
            ></p>
            <div className='h-4 w-px bg-gray-500 md:h-5'></div>
            <p
              className={cn(
                'capitalize',
                difficulty === 'easy' ? 'text-green-500' : '',
                difficulty === 'medium' ? 'text-yellow-500' : '',
                difficulty === 'hard' ? 'text-red-500' : '',
              )}
            >
              {difficulty}
            </p>
          </div>

          {/* <div
            className='grid items-center justify-center gap-1 text-sm font-semibold text-gray-400 md:gap-2 md:text-lg'
            style={{ gridTemplateColumns: '1fr auto 1fr' }}
          >
            <p
              className='text-right capitalize'
              dangerouslySetInnerHTML={{ __html: category.split(':')[0] }}
            />
            <div className='h-4 w-px bg-gray-500 md:h-5'></div>
            <p
              className={cn(
                'text-left capitalize',
                difficulty === 'easy' ? 'text-green-500' : '',
                difficulty === 'medium' ? 'text-yellow-500' : '',
                difficulty === 'hard' ? 'text-red-500' : '',
              )}
            >
              {difficulty}
            </p>
          </div> */}
        </div>
      </div>

      <div className='bottom-8 grid w-full grid-rows-4 gap-3 md:gap-5'>
        {answers.map((answer, index) => {
          // const startIndex = 5 - question.answers.length;

          return (
            <button
              key={index}
              // style={{ gridRow: startIndex + index }}
              className={cn(
                'btn btn-primary answer-button relative select-none rounded-2xl bg-answer-button-inactive px-20 text-[2dvh] font-bold transition-all hover:bg-answer-button-hover md:rounded-3xl md:py-10',
                selectedAnswerIndex === index ? 'selected' : '',
                correctAnswerIndex !== null &&
                  (correctAnswerIndex === index ? 'correct' : 'incorrect'),
              )}
              onClick={() => {
                setSelectedAnswerIndex(index);
              }}
              ref={selectedAnswerIndex === index ? selectedOptionRef : null}
            >
              <p
                dangerouslySetInnerHTML={{
                  __html: ALPHABET[index] + ') ' + answer,
                }}
                className='absolute bottom-0 left-0 right-0 top-0 m-auto h-fit w-fit font-bold'
              ></p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
