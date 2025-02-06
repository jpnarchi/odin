import { useStore } from '@nanostores/react';
import { useNavigate } from '@remix-run/react';
import { useEffect } from 'react';
import { authStore } from '~/lib/stores/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const user = useStore(authStore.user);
  const loading = useStore(authStore.loading);
  const initialized = useStore(authStore.initialized);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !loading && !user && window) {
      navigate('/auth/login');
    }
  }, [user, loading, initialized, navigate]);

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}