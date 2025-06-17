import { useState, useEffect } from 'react';
import './App.css';
import React from 'react';
import { cn } from './utils.ts';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function App() {
  const [question, setQuestion] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null,
  );

  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!timerEndTime) return;

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const timeLeft = Math.max(0, timerEndTime - currentTime);

      setTimerCountdown(Math.floor(timeLeft / 1000));

      if (timeLeft <= 0) {
        clearInterval(interval);
        setTimerCountdown(0);
        // Optionally, you can reset the timerEndTime or handle the end of the timer here
        setTimerEndTime(null);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [timerEndTime]);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080/ws');
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log(data);

      switch (data.type) {
        case 'question': {
          setQuestion(data.data.question);
          setAnswers([]);
          setSelectedAnswerIndex(null);
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
          break;
        }
      }
    };
    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className='relative grid h-full w-full grid-rows-2'>
      <div className='flex flex-col'>
        <div className='grid grid-cols-3 items-center'>
          <h1 className='col-start-2 h-fit text-center text-5xl font-bold'>
            Quizzy
          </h1>

          <div className='col-start-3 grid place-items-center justify-self-end'>
            <div className='grid aspect-square h-32 place-items-center rounded-full bg-yellow-500 text-5xl font-bold text-black'>
              {String(timerCountdown).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className='row-span-1 grid flex-grow place-items-center'>
          <h1
            className='text-balance text-center text-3xl font-bold'
            dangerouslySetInnerHTML={{ __html: question }}
          ></h1>
        </div>
      </div>

      <div className='bottom-8 grid w-full grid-rows-4 gap-5'>
        {answers.map((answer, index) => {
          // const startIndex = 5 - question.answers.length;

          return (
            <button
              key={index}
              // style={{ gridRow: startIndex + index }}
              className={cn(
                'btn btn-primary answer-button rounded-3xl bg-answer-button-inactive px-20 py-10 text-3xl font-bold transition-all hover:bg-answer-button-hover',
                selectedAnswerIndex === index ? 'selected' : '',
                correctAnswerIndex !== null &&
                  (correctAnswerIndex === index ? 'correct' : 'incorrect'),
              )}
              onClick={() => {
                setSelectedAnswerIndex(index);
              }}
              dangerouslySetInnerHTML={{
                __html: ALPHABET[index] + ') ' + answer,
              }}
            ></button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
