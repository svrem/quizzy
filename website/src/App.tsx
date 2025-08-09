import AuthProvider from '@/context/AuthContext';
import GamePage from '@/pages/Game';
import Route from '@/components/Route';
import UmamiScript from '@/components/UmamiScript';

export default function App() {
  return (
    <>
      <AuthProvider>
        <Route url='/'>
          <GamePage />
        </Route>
      </AuthProvider>
      <UmamiScript />
    </>
  );
}
