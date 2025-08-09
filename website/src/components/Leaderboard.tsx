import { useAuth } from '@/context/AuthContext';
import { quizzy } from '@/protocol/quizzy.pb';
import { cn } from '@/utils/utils';
import { useEffect, useState } from 'react';
import RankIcon from './icons/RankIcon';
import MinusIcon from './icons/MinusIcon';

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
              'leaderboard-display animate-fade-in flex h-20 items-center gap-3 rounded-lg bg-black/30 px-3 py-3 opacity-0',
              user?.id === rankedUser.id &&
                'border-secondary-accent border-4 px-2 py-2',
              rankedUser.ranking === 1
                ? 'from-first-winner-background-from to-first-winner-background-to border-0 bg-linear-to-r'
                : '',
              rankedUser.ranking === 2
                ? 'from-second-winner-background-from to-second-winner-background-to border-0 bg-linear-to-r'
                : '',
              rankedUser.ranking === 3
                ? 'from-third-winner-background-from to-third-winner-background-to border-0 bg-linear-to-r'
                : '',
            )}
            ref={user?.id === rankedUser.id ? setUserRef : null}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className='flex flex-col items-center gap-2'>
              <div className='flex items-center gap-1'>
                <p className='text-lg font-semibold'>
                  #{rankedUser.ranking ?? '-'}
                </p>

                {typeof rankedUser.ranking === 'number' &&
                  typeof rankedUser.previousRanking === 'number' &&
                  rankedUser.previousRanking !== rankedUser.ranking && (
                    <RankIcon
                      style={{
                        transform:
                          rankedUser.ranking! < rankedUser.previousRanking!
                            ? 'rotate(0deg)'
                            : 'rotate(180deg)',
                        color:
                          rankedUser.ranking! < rankedUser.previousRanking!
                            ? 'hsl(121, 60%, 40%)' // up: green
                            : 'hsl(0, 70%, 55%)', // down: red
                      }}
                    />
                  )}
                {typeof rankedUser.ranking === 'number' &&
                  typeof rankedUser.previousRanking === 'number' &&
                  rankedUser.previousRanking === rankedUser.ranking && (
                    <MinusIcon style={{ color: 'gray' }} />
                  )}
              </div>
            </div>

            <div className='relative aspect-square h-full rounded-full'>
              <img
                src={rankedUser.profilePicture || ''}
                className='h-12 w-12 rounded-full'
              />
              <div className='absolute top-0 -z-10 h-full w-full animate-pulse rounded-full bg-slate-800' />
            </div>

            <div className='grow'>
              <p className='text-lg font-semibold'>{rankedUser.username}</p>
              <p
                className={cn(
                  'text-theme-accent-color text-sm',
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
          </div>
        ))}
      </div>
    </div>
  );
}
