import '@/App.css';
import GameTimer from '@/components/GameTimer';
import { cn } from '@/utils/utils';
import 'react-circular-progressbar/dist/styles.css';
import { useGame } from './hooks/useGame';
import QuestionDisplay from './components/QuestionDisplay';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function App() {
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
  } = useGame();

  return (
    <div className='relative left-0 right-0 mx-auto grid h-full w-full max-w-[100rem] grid-rows-2'>
      <div className='flex flex-col'>
        <div className='grid grid-cols-3 items-center p-5 md:p-0'>
          <h1 className='h-fit text-2xl font-bold md:col-start-2 md:text-center md:text-5xl'>
            Quizzy
          </h1>

          <GameTimer timerEndTime={timerEndTime} />
        </div>

        <QuestionDisplay
          category={category}
          difficulty={difficulty}
          question={question}
        />
      </div>

      <div className='grid w-full grid-rows-4 gap-3 md:gap-5'>
        {answers.map((answer, index) => {
          return (
            <button
              key={index}
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
