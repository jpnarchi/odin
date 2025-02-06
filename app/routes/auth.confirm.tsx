import { useNavigate, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase/client';

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const confirmToken = searchParams.get('confirmation_token');
    
    if (!confirmToken) {
      setError('Token de confirmación no válido');
      return;
    }

    const confirmEmail = async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: confirmToken,
        type: 'email'
      });

      if (error) {
        setError('Error al confirmar el correo. Por favor, intenta de nuevo.');
      } else {
        navigate('/');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="p-6 bg-bolt-elements-background-depth-2 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-bolt-elements-textPrimary text-center">
        Confirmación de Correo
      </h2>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <p className="text-bolt-elements-textSecondary text-center">
          Confirmando tu correo electrónico...
        </p>
      )}
    </div>
  );
}