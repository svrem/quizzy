import Overlay from '@/components/Overlay';
import { useState } from 'react';

type LoginOverlayProps = {
  closeLoginOverlay: () => void;
};

export default function LoginOverlay({ closeLoginOverlay }: LoginOverlayProps) {
  const [pageOpen, setPageOpen] = useState<'login' | 'signup'>('login');

  return (
    <Overlay backgroundBlur onClick={closeLoginOverlay}>
      <div className='login-popup relative flex w-[95%] max-w-[50rem] flex-col items-center gap-5 rounded-xl bg-answer-button-inactive p-3 md:p-5'>
        <button onClick={closeLoginOverlay} className='absolute right-5 top-5'>
          <img
            src='/icons/close.svg'
            alt='Close Icon'
            className='h-6 w-6 cursor-pointer'
            onClick={() => setPageOpen('login')}
          />
        </button>

        <img src='/icons/logo.svg' className='w-16' alt='' />
        <h2 className='text-center text-2xl font-bold md:text-3xl'>
          {pageOpen === 'login' ? 'Welcome Back' : 'Welcome'}
        </h2>

        <p className='text-sm font-semibold text-gray-400'>
          {pageOpen === 'login'
            ? "Don't have an account yet?"
            : 'Already have an account?'}
          <button
            className='ml-1 text-base-text-color'
            onClick={() =>
              setPageOpen(pageOpen === 'login' ? 'signup' : 'login')
            }
          >
            {pageOpen === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <div className='flex w-full flex-col items-center gap-3'>
          <OAuthButton icon='/icons/google.svg' provider='google' />
          <OAuthButton icon='/icons/discord.svg' provider='discord' />
        </div>
      </div>
    </Overlay>
  );
}

type OAuthButtonProps = {
  provider: string;
  icon: string;
};

function OAuthButton({ icon, provider }: OAuthButtonProps) {
  return (
    <a
      href={`/auth/login/${provider}`}
      className='oauth-button flex w-full select-none items-center justify-center gap-3 rounded-lg py-4 text-center text-sm font-bold capitalize md:py-5 md:text-xl'
    >
      <img
        src={icon}
        alt={`${provider} Icon`}
        className='inline-block h-6 w-6'
      />
      {provider}
    </a>
  );
}
