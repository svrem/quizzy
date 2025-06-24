import '@/App.css';
import GameTimer from '@/components/GameTimer';
import 'react-circular-progressbar/dist/styles.css';
import { useGame } from '@/hooks/useGame';
import QuestionDisplay from '@/components/QuestionDisplay';
import AnswersDisplay from '@/components/AnswersDisplay';

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

      <AnswersDisplay
        answers={answers}
        correctAnswerIndex={correctAnswerIndex}
        selectedAnswerIndex={selectedAnswerIndex}
        setSelectedAnswerIndex={setSelectedAnswerIndex}
        selectedOptionRef={selectedOptionRef}
      />
    </div>
  );
}

export default App;
