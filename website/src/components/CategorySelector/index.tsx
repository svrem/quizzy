import { useEffect, useState } from 'react';
import CategoryButton from './CategoryButton';
import PulseLoader from '../PulseLoader';

type CategorySelectorProps = {
  possibleCategories: string[];
  selectedCategory: number | null;
  votePercentages: number[] | null;
  setSelectedCategory: (category: number | null) => void;
};

export default function CategorySelector({
  possibleCategories,
  selectedCategory,
  votePercentages,
  setSelectedCategory,
}: CategorySelectorProps) {
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    setImagesLoaded(0); // Reset images loaded count when categories change

    for (const category of possibleCategories) {
      const img = new Image();
      img.src = `/images/${category.toLowerCase().replaceAll(' ', '_')}.jpg`;
      img.onload = () => {
        setImagesLoaded((prev) => prev + 1);
      };
      img.onerror = () => {
        setImagesLoaded((prev) => prev + 1); // Count as loaded even if there's an error
      };
    }
  }, [possibleCategories]);

  return (
    <div
      className='flex flex-col'
      style={{
        gridRow: 'span 13 / span 13',
      }}
    >
      <h2 className='m-3 text-center text-xl'>Choose a new category!</h2>
      {imagesLoaded < 3 && (
        <div className='flex grow items-center justify-center'>
          <PulseLoader />
        </div>
      )}
      {imagesLoaded >= 3 && (
        <div className='grid w-full grow grid-cols-3 gap-2 md:gap-5'>
          {possibleCategories.map((category, i) => (
            <CategoryButton
              category={category}
              index={i}
              key={category}
              votePercentage={votePercentages ? votePercentages[i] : undefined}
              selected={selectedCategory === i}
              onClick={() => setSelectedCategory(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
