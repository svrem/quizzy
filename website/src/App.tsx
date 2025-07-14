import AuthProvider from '@/context/AuthContext';
import GamePage from '@/pages/Game';
import DemoProvider from './context/DemoContext';

export default function App() {
  return (
    <DemoProvider>
      <AuthProvider>
        <GamePage />
      </AuthProvider>
    </DemoProvider>
  );
}
