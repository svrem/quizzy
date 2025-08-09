import { cn } from '@/utils/utils';
import { useEffect, useId, useState } from 'react';
import CloseIcon from './icons/CloseIcon';

type OverlayProps = {
  children?: React.ReactNode;
  backgroundBlur?: boolean;
  onClick?: () => void;
  overlayOpen: boolean;
};

export default function Overlay({
  children,
  backgroundBlur,
  onClick,
  overlayOpen,
}: OverlayProps) {
  const id = useId();
  const [destroyed, setDestroyed] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (overlayOpen) {
      setDestroyed(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return;
    }

    setIsVisible(false);
    const t = setTimeout(() => {
      setDestroyed(true);
    }, 300);

    return () => {
      clearTimeout(t);
    };
  }, [overlayOpen]);

  function handleClick(event: React.MouseEvent) {
    if (!onClick) return;

    const target = event.target as HTMLElement;

    if (target.id === id) {
      onClick();
    }
  }

  if (destroyed) return null;

  return (
    <div
      className='absolute left-0 top-0 grid h-full w-full place-items-center transition-colors'
      onClick={handleClick}
      id={id}
      style={{
        backgroundColor:
          backgroundBlur && isVisible ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
      }}
    >
      <div
        className={cn(
          'login-popup relative flex w-[95%] max-w-200 flex-col items-center gap-5 rounded-xl bg-answer-button-inactive p-3 transition-all md:p-5',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-0',
        )}
      >
        <button onClick={onClick} className='absolute right-5 top-5'>
          <CloseIcon className='h-6 w-6 cursor-pointer' />
        </button>
        {children}
      </div>
    </div>
  );
}
