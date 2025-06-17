import { useState, useEffect } from 'react';
import './App.css';
import React from 'react';
import { cn } from './utils.ts';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface QuestionData {
  question: string;
  answers: string[];
  end_time: number;
}

function App() {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
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

      console.log(timerEndTime, currentTime);

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
          setQuestion(data.data);
          setSelectedAnswerIndex(null);
          break;
        }
        case 'start-answer-phase': {
          setTimerEndTime(data.data.answer_shown_at);
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
        <div className='grid grid-cols-3'>
          <h1 className='col-start-2 text-center text-5xl font-bold'>Quizzy</h1>

          <div className='col-start-3 grid place-items-center justify-self-end'>
            <div className='grid aspect-square h-full place-items-center rounded-full bg-black/30 font-bold'>
              {String(timerCountdown).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className='row-span-1 grid flex-grow place-items-center'>
          <h1
            className='text-balance text-center text-3xl font-bold'
            dangerouslySetInnerHTML={{ __html: question?.question || '' }}
          ></h1>
        </div>
      </div>

      <div className='bottom-8 grid w-full grid-rows-4 gap-5'>
        {question?.answers.map((answer, index) => {
          // const startIndex = 5 - question.answers.length;

          return (
            <button
              key={index}
              // style={{ gridRow: startIndex + index }}
              className={cn(
                'btn btn-primary answer-button bg-answer-button-inactive hover:bg-answer-button-hover rounded-xl px-20 py-10 text-3xl font-bold transition-all',
                selectedAnswerIndex === index ? 'selected' : '',
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
