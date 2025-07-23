import { useAuth } from '@/context/AuthContext';
import { quizzy } from '@/protocol/quizzy.pb';
import { cn } from '@/utils/utils';
import { useEffect, useState } from 'react';

type LeaderboardProps = {
  rankedUsers: quizzy.IRankedUser[];
};

export default function Leaderboard({ rankedUsers }: LeaderboardProps) {
  const { user } = useAuth();

  const [userRef, setUserRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (userRef) {
      setTimeout(() => {
        userRef.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 500);
    }
  }, [userRef]);

  return (
    <div
      className='flex flex-col gap-3'
      style={{
        gridRow: 'span 13 / span 13',
      }}
    >
      <h2 className='text-2xl font-bold'>Leaderboard</h2>
      <div className='flex flex-col gap-1.5 overflow-auto py-1.5'>
        {rankedUsers.map((rankedUser, index) => (
          <div
            key={index}
            className={cn(
              'leaderboard-display flex h-20 animate-fade-in items-center gap-3 rounded-lg bg-black/30 px-3 py-3 opacity-0',
              user?.id === rankedUser.id && 'border-secondary-accent border-4',
              rankedUser.ranking === 1
                ? 'from-first-winner-background-from to-first-winner-background-to border-0 bg-gradient-to-r'
                : '',
              rankedUser.ranking === 2
                ? 'from-second-winner-background-from to-second-winner-background-to border-0 bg-gradient-to-r'
                : '',
              rankedUser.ranking === 3
                ? 'from-third-winner-background-from to-third-winner-background-to border-0 bg-gradient-to-r'
                : '',
            )}
            ref={user?.id === rankedUser.id ? setUserRef : null}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className='relative aspect-square h-full rounded-full'>
              <img
                src={rankedUser.profilePicture || ''}
                className='h-full rounded-full'
              />
              <div className='absolute top-0 -z-10 h-full w-full animate-pulse rounded-full bg-slate-800' />
            </div>

            <div className='flex-grow'>
              <p className='text-lg font-semibold'>{rankedUser.username}</p>
              <p
                className={cn(
                  'text-sm text-theme-accent-color',
                  rankedUser.ranking === 1 ||
                    rankedUser.ranking === 2 ||
                    rankedUser.ranking === 3
                    ? 'font-bold text-white'
                    : 'font-normal',
                )}
              >
                {rankedUser.score?.toLocaleString()} points
              </p>
            </div>

            <p className='text-lg font-semibold'>#{rankedUser.ranking}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
