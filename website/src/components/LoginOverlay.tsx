import Overlay from '@/components/Overlay';
import { useState } from 'react';
import DiscordIcon from '@/components/icons/DiscordIcon';
import GoogleIcon from '@/components/icons/GoogleIcon';
import LogoIcon from '@/components/icons/LogoIcon';

type LoginOverlayProps = {
  overlayOpen: boolean;
  closeLoginOverlay: () => void;
};

export default function LoginOverlay({
  closeLoginOverlay,
  overlayOpen,
}: LoginOverlayProps) {
  const [pageOpen, setPageOpen] = useState<'login' | 'signup'>('login');

  return (
    <Overlay
      backgroundBlur
      onClick={closeLoginOverlay}
      overlayOpen={overlayOpen}
    >
      <LogoIcon className='w-16' />
      <h2 className='text-center text-2xl font-bold md:text-3xl'>
        {pageOpen === 'login' ? 'Welcome Back' : 'Welcome'}
      </h2>

      <p className='text-sm font-semibold text-gray-400'>
        {pageOpen === 'login'
          ? "Don't have an account yet?"
          : 'Already have an account?'}
        <button
          className='ml-1 text-base-text-color'
          onClick={() => setPageOpen(pageOpen === 'login' ? 'signup' : 'login')}
        >
          {pageOpen === 'login' ? 'Sign Up' : 'Login'}
        </button>
      </p>

      <div className='flex w-full flex-col items-center gap-3'>
        <OAuthButton iconComponent={GoogleIcon} provider='google' />
        <OAuthButton iconComponent={DiscordIcon} provider='discord' />
      </div>
    </Overlay>
  );
}

type OAuthButtonProps = {
  provider: string;
  iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
};

function OAuthButton({ iconComponent: Icon, provider }: OAuthButtonProps) {
  return (
    <a
      href={`/auth/login/${provider}`}
      className='secondary-display flex w-full select-none items-center justify-center gap-3 rounded-lg py-4 text-center text-sm font-bold capitalize md:py-5 md:text-xl'
    >
      <Icon className='inline-block h-6 w-6' />
      {provider}
    </a>
  );
}
