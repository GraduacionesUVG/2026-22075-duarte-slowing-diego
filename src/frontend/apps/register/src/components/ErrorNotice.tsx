// Aviso de error: fondo rojo suave, borde rojo más saturado y esquinas de 5px.
export default function ErrorNotice({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="w-full rounded-[5px] border border-red-500 bg-red-50 px-3 py-2.5 text-left text-xs font-medium leading-relaxed text-red-700"
    >
      {children}
    </p>
  );
}
