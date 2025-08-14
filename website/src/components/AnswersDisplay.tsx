import { cn } from '@/utils/utils';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type AnswerProps = {
  answer: string;
  index: number;
  selectedAnswerIndex: number | null;
  percentage?: number;
  correctAnswerIndex: number | null;
  setSelectedAnswerIndex: (index: number) => void;
  selectedOptionRef: React.RefObject<HTMLButtonElement | null>;
};

function AnswerButton({
  answer,
  correctAnswerIndex,
  index,
  selectedAnswerIndex,
  percentage,
  setSelectedAnswerIndex,
  selectedOptionRef,
}: AnswerProps) {
  return (
    <button
      className={cn(
        'btn btn-primary answer-button bg-answer-button-inactive relative overflow-hidden rounded-2xl px-20 text-[2dvh] font-bold transition-all select-none md:rounded-3xl',
        selectedAnswerIndex === index ? 'selected' : '',
        correctAnswerIndex !== null &&
          (correctAnswerIndex === index ? 'correct' : 'incorrect'),
      )}
      onClick={() => {
        setSelectedAnswerIndex(index);
      }}
      ref={selectedAnswerIndex === index ? selectedOptionRef : null}
    >
      <div
        className='progress absolute top-0 left-0 h-full w-[50%] transition-all duration-500'
        style={{
          width: percentage ? `${percentage}%` : '0%',
        }}
      />
      <div className='shine absolute top-0 left-0 h-full w-full rounded-2xl transition-all md:rounded-3xl' />

      <p
        dangerouslySetInnerHTML={{
          __html: ALPHABET[index] + ') ' + answer,
        }}
        className='absolute top-0 right-0 bottom-0 left-0 m-auto h-fit w-fit font-bold'
      ></p>
    </button>
  );
}

type AnswersDisplayProps = {
  answers: string[];
  selectedAnswerIndex: number | null;
  correctAnswerIndex: number | null;
  setSelectedAnswerIndex: (index: number) => void;
  answerPercentages: number[] | null;
  selectedOptionRef: React.RefObject<HTMLButtonElement | null>;
};

export default function AnswersDisplay({
  answers,
  selectedAnswerIndex,
  answerPercentages,
  correctAnswerIndex,
  setSelectedAnswerIndex,
  selectedOptionRef,
}: AnswersDisplayProps) {
  return (
    <>
      {answers.map((answer, index) => (
        <AnswerButton
          key={index}
          answer={answer}
          index={index}
          percentage={answerPercentages ? answerPercentages[index] : undefined}
          selectedAnswerIndex={selectedAnswerIndex}
          correctAnswerIndex={correctAnswerIndex}
          setSelectedAnswerIndex={setSelectedAnswerIndex}
          selectedOptionRef={selectedOptionRef}
        />
      ))}
    </>
  );
}
