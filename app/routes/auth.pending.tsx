export default function Pending() {
  return (
    <div className="p-6 bg-bolt-elements-background-depth-2 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-bolt-elements-textPrimary text-center">
        Confirma tu Correo
      </h2>
      <p className="text-bolt-elements-textSecondary text-center mb-4">
        Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.
      </p>
      <p className="text-bolt-elements-textSecondary text-center">
        ¡No olvides revisar tu carpeta de spam si no encuentras el correo!
      </p>
    </div>
  );
}