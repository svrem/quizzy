import { useId } from 'react';

type OverlayProps = {
  children?: React.ReactNode;
  backgroundBlur?: boolean;
  onClick?: () => void;
};

export default function Overlay({
  children,
  backgroundBlur,
  onClick,
}: OverlayProps) {
  const id = useId();

  function handleClick(event: React.MouseEvent) {
    if (!onClick) return;

    const target = event.target as HTMLElement;

    if (target.id === id) {
      onClick();
    }
  }

  return (
    <div
      className='absolute left-0 top-0 grid h-full w-full place-items-center'
      onClick={handleClick}
      id={id}
      style={{
        // backdropFilter: backgroundBlur ? 'blur(2px)' : 'none',
        backgroundColor: backgroundBlur ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
      }}
    >
      {children}
    </div>
  );
}
