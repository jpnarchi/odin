import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { useEffect } from 'react';
import { supabase } from '~/lib/supabase/client';
import { authStore } from '~/lib/stores/auth';
import { useStore } from '@nanostores/react';
import { EmailOptIn } from '~/components/auth/EmailOptIn';

export default function Login() {
  const user = useStore(authStore.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'sign_in';

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      navigate('/');
    }
  }, [user, navigate]);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="fixed inset-0 min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-blue-400 to-white">
      {/* Animated Clouds */}
      <div className="absolute inset-0">
        <div className="cloud-1 absolute w-32 h-32 bg-white/20 rounded-full blur-xl animate-float" 
             style={{left: '10%', top: '20%', animationDelay: '0s'}} />
        <div className="cloud-2 absolute w-40 h-40 bg-white/20 rounded-full blur-xl animate-float" 
             style={{left: '60%', top: '40%', animationDelay: '2s'}} />
        <div className="cloud-3 absolute w-36 h-36 bg-white/20 rounded-full blur-xl animate-float" 
             style={{left: '30%', top: '60%', animationDelay: '4s'}} />
        <div className="cloud-4 absolute w-28 h-28 bg-white/20 rounded-full blur-xl animate-float" 
             style={{left: '80%', top: '15%', animationDelay: '6s'}} />
      </div>
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Geek-AI.lat Logo */}
          <div className="mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60" className="w-full h-12">
              <defs>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap');
                </style>
              </defs>
              <text x="50%" y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fill="white"
                    fontFamily="Dancing Script, cursive"
                    fontSize="36"
                    fontWeight="300">
                GeeK-AI.lat
              </text>
            </svg>
          </div>
          <div className="rounded-lg border border-blue-700/30 bg-blue-900/80 p-8 shadow-lg backdrop-blur-md">
            <h2 className="mb-6 text-center text-2xl font-bold text-white">
              {view === 'sign_in' ? 'Ingresa a Geek' : 'Ingresa a Geek'}
            </h2>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(37 99 235)',
                      brandAccent: 'rgb(59 130 246)',
                      inputBackground: 'rgba(255, 255, 255, 0.1)',
                      inputText: 'white',
                      inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                      inputBorder: 'rgba(59, 130, 246, 0.3)',
                      inputBorderHover: 'rgba(59, 130, 246, 0.5)',
                      inputBorderFocus: 'rgb(59 130 246)',
                    }
                  }
                },
                className: {
                  anchor: 'text-blue-300 hover:text-blue-200',
                  button: 'bg-blue-600 hover:bg-blue-500 text-white',
                  container: 'text-white',
                  divider: 'bg-blue-700/30',
                  label: 'text-gray-300',
                  input: 'bg-blue-900/50 border-blue-700/30 text-white placeholder-gray-400',
                  message: 'text-gray-300'
                }
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Correo electrónico',
                    password_label: 'Contraseña',
                    button_label: 'Iniciar sesión',
                    loading_button_label: 'Iniciando sesión...',
                    link_text: '¿Ya tienes una cuenta? Inicia sesión',
                  },
                  sign_up: {
                    email_label: 'Correo electrónico',
                    password_label: 'Contraseña',
                    button_label: 'Registrarse',
                    loading_button_label: 'Registrando...',
                    confirmation_text: 'Revisa tu correo para confirmar tu cuenta',
                    link_text: '¿No tienes una cuenta? Regístrate'
                  }
                }
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/auth/confirm`}
              onlyThirdPartyProviders={false}
              view={view as 'sign_in' | 'sign_up'}
            />
            {view === 'sign_up' && (
              <div className="mt-4 border-t border-blue-700/30 pt-4">
                <EmailOptIn 
                  onOptIn={async (optIn) => {
                    if (!user) return;
                    
                    const { error } = await supabase
                      .from('user_preferences')
                      .upsert({ user_id: user.id, email_opt_in: optIn });

                    if (error) {
                      console.error('Error saving preferences:', error);
                    }
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

