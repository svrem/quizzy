import UserIcon from '@/icons/User';
import SlotCounter from 'react-slot-counter';

const scoreFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

type UserStatsDisplayProps = {
  score: number;
  streak: number;
};

export default function UserStatsDisplay({
  score,
  streak,
}: UserStatsDisplayProps) {
  return (
    <div className='row-start-5 grid grid-cols-3 rounded-xl bg-black/30'>
      <div className='flex flex-col items-center justify-center p-1'>
        <div className='flex items-center'>
          <img
            src='/icons/score.svg'
            alt='Score Icon'
            className='mx-1 h-6 w-6 md:h-10 md:w-10'
          />
          <SlotCounter
            value={scoreFormat.format(score)}
            numberSlotClassName='text-xl font-bold md:text-4xl'
          />
        </div>
        <p className='text-sm font-semibold text-gray-400 md:text-base'>
          Score
        </p>
      </div>

      <div className='flex flex-col items-center justify-center p-1'>
        <div className='flex items-center'>
          <img
            src='/icons/streak.svg'
            alt='Streaks Icon'
            className='h-6 w-6 md:h-10 md:w-10'
          />
          <SlotCounter
            value={scoreFormat.format(streak)}
            numberSlotClassName='text-xl font-bold md:text-4xl'
          />
        </div>
        <p className='text-sm font-semibold text-gray-400 md:text-base'>
          Streak
        </p>
      </div>

      <div className='grid place-content-center p-1'>
        <div className='relative aspect-square h-10 w-10 rounded-full bg-theme-accent-color p-2 md:h-16 md:w-16'>
          <p className='save-progress-text absolute w-24 rounded-sm bg-red-500 p-1 text-center text-[0.6rem] font-semibold md:w-36 md:text-sm'>
            Login to save your progress!
          </p>
          <UserIcon />
        </div>
      </div>
    </div>
  );
}
