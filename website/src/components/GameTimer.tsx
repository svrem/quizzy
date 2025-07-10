import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useEffect, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';

type GameTimerProps = {
  timerEndTime: number | null;
  duration: number;
};

export default function GameTimer({ timerEndTime, duration }: GameTimerProps) {
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!timerEndTime) return;

    setTimerCountdown(Math.floor((timerEndTime - new Date().getTime()) / 1000));

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const timeLeft = Math.max(0, timerEndTime - currentTime);

      setTimerCountdown(Math.floor(timeLeft / 1000));

      if (timeLeft <= 0) {
        setTimerCountdown(0);
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [timerEndTime]);

  return (
    <CircularProgressbar
      className='col-start-3 h-12 !w-12 justify-self-end font-bold md:h-24 md:!w-24'
      value={timerCountdown ?? duration}
      text={
        timerCountdown
          ? String(Math.max(timerCountdown, 0)).padStart(2, '0')
          : '00'
      }
      maxValue={duration}
      backgroundPadding={6}
      styles={buildStyles({
        trailColor: 'hsla(0, 0%, 0%, 0.4)',
        textColor: 'var(--base-text-color)',
        pathColor: 'hsl(var(--theme-accent-color))',
        strokeLinecap: 'round',
        pathTransitionDuration: 0.3,
        pathTransition: 'ease 0.3s',
        textSize: '1.8rem',
      })}
    />
  );
}
