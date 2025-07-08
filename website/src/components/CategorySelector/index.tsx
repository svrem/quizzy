import { useEffect, useState } from 'react';
import CategoryButton from './CategoryButton';

type CategorySelectorProps = {
  possibleCategories: string[];
};

export default function CategorySelector({
  possibleCategories,
}: CategorySelectorProps) {
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    for (const category of possibleCategories) {
      const img = new Image();
      img.src = `/images/${category.toLowerCase()}.jpg`;
      img.onload = () => {
        setImagesLoaded((prev) => prev + 1);
      };
    }
  }, [possibleCategories]);

  console.log('Images loaded:', imagesLoaded);

  return (
    <div
      className='flex flex-col'
      style={{
        gridRow: 'span 13 / span 13',
      }}
    >
      {imagesLoaded >= 3 && (
        <>
          <h2 className='m-3 text-center text-xl'>Choose new category!</h2>

          <div className='grid w-full flex-grow grid-cols-3 gap-2 md:gap-5'>
            {possibleCategories.map((category, i) => (
              <CategoryButton category={category} index={i} key={category} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
