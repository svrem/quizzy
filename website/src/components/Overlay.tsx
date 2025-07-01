type OverlayProps = {
  children?: React.ReactNode;
  backgroundBlur?: boolean;
};

export default function Overlay({ children, backgroundBlur }: OverlayProps) {
  return (
    <div
      className='absolute left-0 top-0 grid h-full w-full place-items-center'
      style={{
        // backdropFilter: backgroundBlur ? 'blur(2px)' : 'none',
        backgroundColor: backgroundBlur ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
      }}
    >
      {children}
    </div>
  );
}
