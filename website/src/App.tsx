import AuthProvider from '@/context/AuthContext';
import GamePage from '@/pages/Game';

export default function App() {
  return (
    <AuthProvider>
      <GamePage />
    </AuthProvider>
  );
}
