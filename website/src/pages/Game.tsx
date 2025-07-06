import '@/App.css';

import AnswersDisplay from '@/components/AnswersDisplay';
import GameTimer from '@/components/GameTimer';
import LoginOverlay from '@/components/LoginOverlay';
import ProfileOverlay from '@/components/ProfileOverlay';
import QuestionDisplay from '@/components/QuestionDisplay';
import UserStatsDisplay from '@/components/UserStatsDisplay';
import { useGame } from '@/hooks/useGame';
import { useState } from 'react';

function GamePage() {
  const {
    question,
    answers,
    difficulty,
    category,
    selectedAnswerIndex,
    correctAnswerIndex,
    setSelectedAnswerIndex,
    selectedOptionRef,
    timerEndTime,
    score,
    streak,
  } = useGame();

  const [loginOverlayOpen, setLoginOverlayOpen] = useState(false);
  const [profileOverlayOpen, setProfileOverlayOpen] = useState(false);

  return (
    <>
      <div className='relative left-0 right-0 mx-auto grid h-full w-full max-w-[100rem] grid-rows-10'>
        <div className='row-span-4 flex flex-col'>
          <div className='grid grid-cols-3 items-center p-5 md:p-0'>
            <h1 className='h-fit text-2xl font-bold md:col-start-2 md:text-center md:text-5xl'>
              Quizzy
            </h1>

            <GameTimer timerEndTime={timerEndTime} />
          </div>

          <div
            style={{ opacity: answers.length > 0 ? 1 : 0 }}
            className='row-span-1 flex flex-grow flex-col items-center justify-center'
          >
            <QuestionDisplay
              category={category}
              difficulty={difficulty}
              question={question}
            />
          </div>
        </div>

        <div className='row-span-6 grid w-full grid-rows-5 gap-3 md:gap-5'>
          <AnswersDisplay
            answers={answers}
            correctAnswerIndex={correctAnswerIndex}
            selectedAnswerIndex={selectedAnswerIndex}
            setSelectedAnswerIndex={setSelectedAnswerIndex}
            selectedOptionRef={selectedOptionRef}
          />

          <UserStatsDisplay
            score={score}
            streak={streak}
            openLoginOverlay={() => setLoginOverlayOpen(true)}
            openProfileOverlay={() => setProfileOverlayOpen(true)}
          />
        </div>

        {answers.length === 0 && (
          <div className='pointer-events-none absolute left-0 top-0 grid h-full w-full place-items-center'>
            <QuestionDisplay
              category={category}
              difficulty={difficulty}
              question={question}
            />
          </div>
        )}
      </div>

      <LoginOverlay
        closeLoginOverlay={() => setLoginOverlayOpen(false)}
        overlayOpen={loginOverlayOpen}
      />

      <ProfileOverlay
        closeProfileOverlay={() => setProfileOverlayOpen(false)}
        overlayOpen={profileOverlayOpen}
        score={score}
      />
    </>
  );
}

export default GamePage;
