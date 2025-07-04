import { useAuth } from '@/context/AuthContext';
import Overlay from './Overlay';
import { useEffect, useState } from 'react';

export default function ProfileOverlay({
  closeProfileOverlay,
  overlayOpen,
  score,
}: {
  closeProfileOverlay: () => void;
  overlayOpen: boolean;
  score: number;
}) {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const [userLevel, setUserLevel] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!overlayOpen) return;

      setLoading(true);
      await refreshUser();
      const response = await fetch('/api/user/details');
      if (!response.ok) {
        console.error('Failed to fetch user details');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUserRanking(data.ranking);
      setUserLevel(data.level);

      setLoading(false);
    }
    fetchUserData();
  }, [overlayOpen, score]);

  return (
    <Overlay
      backgroundBlur
      onClick={closeProfileOverlay}
      overlayOpen={overlayOpen}
    >
      <div className='flex w-full flex-col items-center'>
        <img
          src={user?.avatarUrl}
          alt=''
          className='h-16 w-16 rounded-full md:h-24 md:w-24'
        />
        <h3 className='mt-2 text-2xl font-bold md:text-3xl'>
          {user?.username}
        </h3>
        <p className='text-sm font-semibold text-gray-300'>
          LEVEL {!loading ? userLevel || 0 : '--'}
        </p>

        <div className='mt-5 grid w-full grid-cols-2 gap-2 md:grid-cols-3'>
          <div className='secondary-display flex gap-1 rounded p-1'>
            <img
              src='/icons/streak.svg'
              alt='Streaks Icon'
              className='h-6 w-6 p-0.5 md:h-10 md:w-10 md:p-1'
            />
            <div className='items-center text-[12px] font-semibold text-gray-500 md:text-base'>
              Max Streak
              <p className='text-lg font-bold text-base-text-color'>
                {!loading ? user?.maxStreak || 0 : '--'}
              </p>
            </div>
          </div>

          <div className='secondary-display col-span-2 row-start-1 flex gap-1 rounded p-1 md:col-span-1 md:col-start-2'>
            <img
              src='/icons/rank.svg'
              alt='Rank Icon'
              className='h-6 w-6 p-0.5 md:h-10 md:w-10 md:p-1'
            />
            <div className='items-center text-[12px] font-semibold text-gray-500 md:text-base'>
              Rank
              <p className='text-lg font-bold text-base-text-color'>
                {!loading ? `#${userRanking}` : '--'}
              </p>
            </div>
          </div>

          <div className='secondary-display flex gap-1 rounded p-1'>
            <img
              src='/icons/score.svg'
              alt='Score Icon'
              className='h-6 w-6 p-0.5 md:h-10 md:w-10 md:p-1'
            />
            <div className='items-center text-[12px] font-semibold text-gray-500 md:text-base'>
              Score
              <p className='text-lg font-bold text-base-text-color'>
                {!loading ? user?.startingScore || 0 : '--'}
              </p>
            </div>
          </div>
        </div>

        <a href='/auth/logout' className='mt-5 w-fit font-bold text-red-500'>
          Logout
        </a>
      </div>
    </Overlay>
  );
}
