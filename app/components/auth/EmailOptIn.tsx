import { useState } from 'react';

interface EmailOptInProps {
  onOptIn: (optIn: boolean) => void;
}

export function EmailOptIn({ onOptIn }: EmailOptInProps) {
  const [checked, setChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    onOptIn(e.target.checked);
  };

  return (
    <div className="flex items-start mb-4">
      <div className="flex items-center h-5">
        <input
          id="email-opt-in"
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="w-4 h-4 border border-bolt-elements-borderColor rounded bg-bolt-elements-background-depth-1"
        />
      </div>
      <label htmlFor="email-opt-in" className="ml-2 text-sm text-bolt-elements-textSecondary">
        Sí, quiero recibir noticias sobre IA, actualizaciones y herramientas. ¡Recibirás un regalo especial al confirmar tu correo!
      </label>
    </div>
  );
}