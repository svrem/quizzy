import AuthProvider from '@/context/AuthContext';
import GamePage from '@/pages/Game';
import Route from '@/components/Route';

export default function App() {
  return (
    <AuthProvider>
      <Route url='/'>
        <GamePage />
      </Route>
    </AuthProvider>
  );
}
