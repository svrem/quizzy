import { cn } from '@/utils/utils';

type QuestionDisplayProps = {
  question: string | null;
  difficulty: string | null;
  category: string | null;
};

export default function QuestionDisplay({
  question,
  difficulty,
  category,
}: QuestionDisplayProps) {
  return (
    <div className='row-span-1 flex flex-grow flex-col items-center justify-center'>
      <p
        className='select-none text-center text-xl font-bold md:text-3xl'
        dangerouslySetInnerHTML={{ __html: question || '' }}
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
    </div>
  );
}
