import '@/App.css';

import AnswersDisplay from '@/components/AnswersDisplay';
import CategorySelector from '@/components/CategorySelector';
import GameTimer from '@/components/GameTimer';
import Leaderboard from '@/components/Leaderboard';
import LoginOverlay from '@/components/LoginOverlay';
import ProfileOverlay from '@/components/ProfileOverlay';
import QuestionDisplay from '@/components/QuestionDisplay';
import UserStatsDisplay from '@/components/UserStatsDisplay';
import { useGame } from '@/hooks/useGame';
import { cn } from '@/utils/utils';
import { useState } from 'react';

function GamePage() {
  const {
    question,
    answers,
    difficulty,
    category,
    selectedAnswerIndex,
    correctAnswerIndex,
    selectedCategory,
    timeOffset,
    selectedOptionRef,
    answerPercentages,
    categoryPossibilities,
    timerEndTime,
    rankedUsers,
    duration,
    score,
    streak,
    votePercentages,
    setSelectedCategory,
    setSelectedAnswerIndex,
  } = useGame();

  const [loginOverlayOpen, setLoginOverlayOpen] = useState(false);
  const [profileOverlayOpen, setProfileOverlayOpen] = useState(false);

  const fullPageContent =
    categoryPossibilities !== null || rankedUsers.length > 0;

  return (
    <>
      <div
        className='relative right-0 left-0 mx-auto grid h-full w-full max-w-280 max-w-[100vh]'
        style={{
          gridTemplateRows: 'repeat(17, minmax(0, 1fr))',
        }}
      >
        <div
          className={cn('row-span-2 grid grid-cols-3 items-center py-5 md:p-0')}
        >
          <h1 className='h-fit text-2xl font-bold md:col-start-2 md:text-center md:text-5xl'>
            Quizzy
          </h1>

          <GameTimer
            timerEndTime={timerEndTime}
            duration={duration}
            timeOffset={timeOffset}
          />
        </div>

        {!fullPageContent && (
          <div
            style={{ opacity: answers.length > 0 ? 1 : 0 }}
            className='row-span-5 flex grow flex-col items-center justify-center'
          >
            <QuestionDisplay
              category={category}
              difficulty={difficulty}
              question={question}
            />
          </div>
        )}

        {categoryPossibilities && (
          <CategorySelector
            possibleCategories={categoryPossibilities}
            setSelectedCategory={setSelectedCategory}
            votePercentages={votePercentages}
            selectedCategory={selectedCategory}
          />
        )}

        {rankedUsers.length > 0 && <Leaderboard rankedUsers={rankedUsers} />}

        <div
          className={cn(
            'answer-grid grid w-full',
            fullPageContent
              ? 'row-span-2 grid-rows-1'
              : 'row-span-10 grid-rows-5',
          )}
        >
          {!fullPageContent && (
            <AnswersDisplay
              answers={answers}
              correctAnswerIndex={correctAnswerIndex}
              answerPercentages={answerPercentages}
              selectedAnswerIndex={selectedAnswerIndex}
              setSelectedAnswerIndex={setSelectedAnswerIndex}
              selectedOptionRef={selectedOptionRef}
            />
          )}

          <UserStatsDisplay
            score={score}
            streak={streak}
            showCategorySelector={fullPageContent}
            openLoginOverlay={() => setLoginOverlayOpen(true)}
            openProfileOverlay={() => setProfileOverlayOpen(true)}
          />
        </div>

        {answers.length === 0 && !fullPageContent && (
          <div className='pointer-events-none absolute top-0 left-0 grid h-full w-full place-items-center'>
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
