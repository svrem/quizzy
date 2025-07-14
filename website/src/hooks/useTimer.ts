import { useState } from 'react';

export function useTimer() {
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);

  function setTimer(endTime: number | null, duration: number) {
    setTimerEndTime(endTime);
    setDuration(duration);
  }

  function resetTimer() {
    setTimerEndTime(null);
    setDuration(0);
  }

  return {
    timerEndTime,
    duration,
    setTimer,
    resetTimer,
  };
}
