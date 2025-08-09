import { useAuth } from '@/context/AuthContext';
import UserIcon from '@/components/icons/User';
import { cn } from '@/utils/utils';
import SlotCounter from 'react-slot-counter';
import ScoreIcon from './icons/ScoreIcon';
import StreakIcon from './icons/StreakIcon';

const scoreFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

type UserStatsDisplayProps = {
  score: number;
  streak: number;
  showCategorySelector: boolean;
  openLoginOverlay: () => void;
  openProfileOverlay: () => void;
};

export default function UserStatsDisplay({
  score,
  streak,
  showCategorySelector,
  openLoginOverlay,
  openProfileOverlay,
}: UserStatsDisplayProps) {
  return (
    <div
      className={cn(
        'row-start-1 grid grid-cols-3 rounded-xl bg-black/30',
        showCategorySelector ? 'row-start-1' : 'row-start-5',
      )}
    >
      <ScoreDisplay score={score} />
      <StreakDisplay streak={streak} />
      <UserAvatar
        openLoginOverlay={openLoginOverlay}
        openProfileOverlay={openProfileOverlay}
      />
    </div>
  );
}

function ScoreDisplay({ score }: { score: number }) {
  const { authenticatedState } = useAuth();

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='flex items-center'>
        <ScoreIcon className='mx-1 h-[3dvh] w-[3dvh]' />
        {authenticatedState !== 'loading' && (
          <SlotCounter
            value={scoreFormat.format(score)}
            numberSlotClassName='text-[3dvh] font-bold'
          />
        )}
      </div>
      <p className='text-[1.5dvh] font-semibold text-gray-400'>Score</p>
    </div>
  );
}

function StreakDisplay({ streak }: { streak: number }) {
  const { authenticatedState } = useAuth();

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='flex items-center'>
        <StreakIcon className='h-[3dvh] w-[3dvh]' />
        {authenticatedState !== 'loading' && (
          <SlotCounter
            value={scoreFormat.format(streak)}
            numberSlotClassName='text-[3dvh] font-bold'
          />
        )}
      </div>
      <p className='text-[1.5dvh] font-semibold text-gray-400'>Streak</p>
    </div>
  );
}

function UserAvatar({
  openLoginOverlay,
  openProfileOverlay,
}: {
  openLoginOverlay: () => void;
  openProfileOverlay: () => void;
}) {
  const { authenticatedState, user } = useAuth();

  return (
    <div className='grid place-content-center'>
      <button
        onClick={
          authenticatedState === 'unauthenticated'
            ? openLoginOverlay
            : openProfileOverlay
        }
        className={cn(
          'relative h-[5.5dvh] w-[5.5dvh] rounded-full',
          authenticatedState === 'loading'
            ? 'animate-pulse bg-gray-700'
            : 'bg-theme-accent-color',
        )}
      >
        {authenticatedState === 'unauthenticated' && (
          <p className='save-progress-text absolute w-24 rounded-xs bg-red-500 p-1 text-center text-[0.6rem] font-semibold md:w-36 md:text-sm'>
            Log in to save your progress!
          </p>
        )}
        {user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt='User Avatar'
            className='h-full w-full rounded-full bg-white object-cover'
          />
        )}

        {(!user?.avatarUrl || authenticatedState === 'unauthenticated') &&
          authenticatedState !== 'loading' && (
            <div className='flex h-full w-full items-center justify-center rounded-full p-2'>
              <UserIcon />
            </div>
          )}
      </button>
    </div>
  );
}
