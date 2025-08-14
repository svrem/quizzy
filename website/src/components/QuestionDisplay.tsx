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
    <div className='flex flex-col items-center justify-center'>
      <p
        className='animate-fade-in text-center text-[3.5dvh] font-bold opacity-0 select-none'
        dangerouslySetInnerHTML={{ __html: question || '' }}
      ></p>

      <div className='flex items-center justify-center gap-2 text-[2dvh] font-semibold text-gray-400 md:gap-3'>
        <p
          dangerouslySetInnerHTML={{
            __html: category || '',
          }}
          className='animate-fade-in-slide capitalize opacity-0'
          style={{ animationDelay: '0.4s' }}
        ></p>
        <div
          className='animate-fade-in h-4 w-px bg-gray-500 opacity-0 md:h-5'
          style={{ animationDelay: '0.8s' }}
        />
        <p
          style={{ animationDelay: '0.8s' }}
          className={cn(
            'animate-fade-in-slide capitalize opacity-0',
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
