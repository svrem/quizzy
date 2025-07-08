import { useState } from 'react';

type CategorySelectorProps = {
  category: string;
  index: number;
};

export default function CategoryButton({
  category,
  index,
}: CategorySelectorProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <button
      className='category-selector relative animate-fade-in overflow-hidden rounded-xl opacity-0'
      key={category}
      style={{
        animationDelay: `${index * 0.6}s`,
      }}
      aria-label={`Select category: ${category}`}
    >
      <img
        src={`/images/${category.toLowerCase()}.jpg`}
        alt={category}
        className='h-full w-full object-cover transition-opacity'
        style={{
          opacity: imageLoaded ? 1 : 0,
        }}
        onLoad={() => setImageLoaded(true)}
        loading='lazy'
      />
      <div className='absolute top-0 flex h-full w-full items-center justify-center bg-black/60 transition-colors hover:bg-black/50'>
        <p className='select-none text-center text-[4vw] font-bold md:text-4xl'>
          {category}
        </p>
      </div>
    </button>
  );
}
