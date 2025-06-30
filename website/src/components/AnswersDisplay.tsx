import { cn } from '@/utils/utils';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type AnswerProps = {
  answer: string;
  index: number;
  selectedAnswerIndex: number | null;
  correctAnswerIndex: number | null;
  setSelectedAnswerIndex: (index: number) => void;
  selectedOptionRef: React.RefObject<HTMLButtonElement | null>;
};

function AnswerButton({
  answer,
  correctAnswerIndex,
  index,
  selectedAnswerIndex,
  setSelectedAnswerIndex,
  selectedOptionRef,
}: AnswerProps) {
  return (
    <button
      className={cn(
        'btn btn-primary answer-button relative select-none rounded-2xl bg-answer-button-inactive px-20 text-[2dvh] font-bold transition-all md:rounded-3xl md:py-10',
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
}

type AnswersDisplayProps = {
  answers: string[];
  selectedAnswerIndex: number | null;
  correctAnswerIndex: number | null;
  setSelectedAnswerIndex: (index: number) => void;
  selectedOptionRef: React.RefObject<HTMLButtonElement | null>;
};

export default function AnswersDisplay({
  answers,
  selectedAnswerIndex,

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
          selectedAnswerIndex={selectedAnswerIndex}
          correctAnswerIndex={correctAnswerIndex}
          setSelectedAnswerIndex={setSelectedAnswerIndex}
          selectedOptionRef={selectedOptionRef}
        />
      ))}
    </>
  );
}
