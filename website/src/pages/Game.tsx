import '@/App.css';

import AnswersDisplay from '@/components/AnswersDisplay';
import CategorySelector from '@/components/CategorySelector';
import CategoryButton from '@/components/CategorySelector/CategoryButton';
import GameTimer from '@/components/GameTimer';
import LoginOverlay from '@/components/LoginOverlay';
import ProfileOverlay from '@/components/ProfileOverlay';
import QuestionDisplay from '@/components/QuestionDisplay';
import UserStatsDisplay from '@/components/UserStatsDisplay';
import { DemoState, useDemoContext } from '@/context/DemoContext';
import { useGame } from '@/hooks/useGame';
import ArrowRightIcon from '@/icons/arrow-right';
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
    selectedOptionRef,
    answerPercentages,
    categoryPossiblities,
    timerEndTime,
    duration,
    score,
    streak,
    votePercentages,
    setSelectedCategory,
    setSelectedAnswerIndex,
  } = useGame();

  const { demoState, setDemoState, explainer, nextForExplainer, setExplainer } =
    useDemoContext();

  const [loginOverlayOpen, setLoginOverlayOpen] = useState(false);
  const [profileOverlayOpen, setProfileOverlayOpen] = useState(false);

  const showCategorySelector = categoryPossiblities !== null;
  const giveMeTheRoom = demoState === DemoState.Asking || explainer !== '';

  return (
    <>
      <div
        className='relative left-0 right-0 mx-auto grid h-full w-full max-w-[100rem]'
        style={{
          gridTemplateRows: 'repeat(17, minmax(0, 1fr))',
        }}
      >
        <div
          className={cn('row-span-2 grid grid-cols-3 items-center p-5 md:p-0')}
        >
          <h1 className='h-fit text-2xl font-bold md:col-start-2 md:text-center md:text-5xl'>
            Quizzy
          </h1>

          <GameTimer timerEndTime={timerEndTime} duration={duration} />
        </div>

        {!showCategorySelector && !giveMeTheRoom && (
          <div
            style={{ opacity: answers.length > 0 ? 1 : 0 }}
            className='row-span-5 flex flex-grow flex-col items-center justify-center'
          >
            <QuestionDisplay
              category={category}
              difficulty={difficulty}
              question={question}
            />
          </div>
        )}

        {showCategorySelector && (
          <CategorySelector
            possibleCategories={categoryPossiblities}
            setSelectedCategory={setSelectedCategory}
            votePercentages={votePercentages}
            selectedCategory={selectedCategory}
          />
        )}

        {demoState === DemoState.Asking && (
          <div
            className='flex flex-col'
            style={{
              gridRow: 'span 13 / span 13',
            }}
          >
            <h2 className='m-3 text-center text-xl'>Select a mode.</h2>

            <div className='grid w-full flex-grow grid-cols-2 gap-2 md:gap-5'>
              <CategoryButton
                category='Demo'
                description='When you play the actual game, it will take a while before you see everything, so this demo will just take you through all the content real quick.'
                index={0}
                selected={false}
                onClick={() => {
                  setDemoState(DemoState.CategoryExplainer);
                }}
              />
              <CategoryButton
                category='Normal'
                description='This is the normal mode. Every category contains 10 questions, after that you can choose a new category. This is how the game is meant to be played.'
                index={1}
                selected={false}
                onClick={() => {
                  setDemoState(DemoState.Normal);
                }}
              />
            </div>
          </div>
        )}

        {explainer !== '' && (
          <div
            className='flex flex-col items-center justify-center'
            style={{
              gridRow: 'span 13 / span 13',
            }}
          >
            <p className='text-center text-xl'>{explainer}</p>
            <button
              onClick={() => {
                setDemoState(nextForExplainer);
                setExplainer('');
              }}
              className='mt-5 flex w-fit items-center gap-1 rounded-lg bg-black/70 px-4 py-2 text-lg font-semibold text-white transition-colors'
            >
              Next
              <ArrowRightIcon />
            </button>
          </div>
        )}

        <div
          className={cn(
            'answer-grid grid w-full',
            showCategorySelector || giveMeTheRoom
              ? 'row-span-2 grid-rows-1'
              : 'row-span-10 grid-rows-5',
          )}
        >
          {!showCategorySelector && !giveMeTheRoom && (
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
            showCategorySelector={showCategorySelector || giveMeTheRoom}
            openLoginOverlay={() => setLoginOverlayOpen(true)}
            openProfileOverlay={() => setProfileOverlayOpen(true)}
          />
        </div>

        {answers.length === 0 && !showCategorySelector && !giveMeTheRoom && (
          <div className='pointer-events-none absolute left-0 top-0 grid h-full w-full place-items-center'>
            <QuestionDisplay
              category={category}
              difficulty={difficulty}
              question={question}
            />
          </div>
        )}

        {/* <div className='pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden px-4'>
          <h2>Choose new category!</h2>

          <div className='flex w-full flex-wrap content-center items-center justify-center gap-5 overflow-hidden p-2'>
            {possibleCategories.map((possibleCategory, i) => (
              <div
                className='category-selector animate-fade-in-slide-from-bottom aspect-[0.7] w-full max-w-[40%] shrink-0 overflow-hidden rounded-lg opacity-0 md:w-96'
                key={possibleCategory}
                style={{
                  backgroundImage: `url(/images/${possibleCategory.toLowerCase()}.jpg)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                <div className='flex h-full w-full items-center justify-center bg-black/60'>
                  <p className='text-center text-[4vw] font-bold md:text-4xl'>
                    {possibleCategory}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
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
