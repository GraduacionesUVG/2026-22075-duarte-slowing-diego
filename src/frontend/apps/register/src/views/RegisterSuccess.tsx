import type { useRegistrationFlow } from "../hooks/useRegistrationFlow";
import PageShell from "../components/PageShell";
import QDot from "../components/QDot";

type RegisterSuccessProps = {
  flow: ReturnType<typeof useRegistrationFlow>;
};

export default function RegisterSuccess({ flow }: RegisterSuccessProps) {
  const { maskedPhone, whatsappLink } = flow;

  return (
    <PageShell>
      <div className="flex flex-grow flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <QDot className="h-8 w-8" />
        </div>
        <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          Registro completo
        </span>
        <h1 className="text-lg font-semibold text-gray-900">
          Ya estás registrado, ya puedes usar la conversación
        </h1>
        <p className="text-xs leading-relaxed text-gray-500">
          El número {maskedPhone} quedó registrado. Ya puedes escribir en el chat de QOrder y
          realizar pedidos.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-primary text-sm font-semibold text-white"
        >
          Volver a WhatsApp
        </a>
        <span className="text-xs text-gray-500">Puedes cerrar esta ventana.</span>
      </div>
    </PageShell>
  );
}
