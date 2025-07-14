import { cn } from '@/utils/utils';

type CategorySelectorProps = {
  category: string;
  index: number;
  selected: boolean;
  votePercentage?: number;
  description?: string;
  onClick: () => void;
};

export default function CategoryButton({
  category,
  index,
  selected,
  votePercentage,
  description,
  onClick,
}: CategorySelectorProps) {
  return (
    <button
      className={
        'category-selector relative animate-fade-in overflow-hidden rounded-xl opacity-0 transition-all' +
        (selected ? ' selected' : '')
      }
      key={category}
      onClick={onClick}
      style={{
        backgroundImage: `url(/images/${category.toLowerCase().replaceAll(' ', '_')}.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animationDelay: `${index * 0.6}s`,
      }}
      aria-label={`Select category: ${category}`}
    >
      <div
        className={cn(
          'absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/70 transition-all duration-500',
          votePercentage === undefined && selected
            ? 'bg-black/0'
            : 'bg-black/70 hover:bg-black/60',
        )}
        style={{
          height: `${100 - (votePercentage || 0)}%`,
        }}
      />
      <div
        className='absolute bottom-0 left-0 h-0 w-full bg-theme-accent-color opacity-20 transition-all duration-500'
        style={{
          height: `${votePercentage}%`,
        }}
      />
      <p
        className={cn(
          'absolute bottom-0 top-0 my-auto h-fit w-full select-none py-2 text-center text-[4vw] font-bold transition-colors md:text-4xl',
          selected || votePercentage !== undefined
            ? 'bg-black/50'
            : 'bg-black/0',
        )}
        dangerouslySetInnerHTML={{
          __html: category,
        }}
      />
      <p className='absolute bottom-0 top-0 my-auto h-fit w-full translate-y-[75%] px-2 text-center text-sm md:translate-y-full md:text-base'>
        {description}
      </p>
    </button>
  );
}
