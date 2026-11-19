import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastState } from "../components/Toast";

const SUCCESS_MS = 4000;

export type Notifier = {
  success: (message: string) => void;
  error: (message: string) => void;
};

// Estado del aviso flotante: el de éxito se cierra solo, el de error espera a que lo cierren.
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seq = useRef(0);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((kind: ToastState["kind"], message: string) => {
    clearTimeout(timer.current);
    seq.current += 1;
    setToast({ id: seq.current, kind, message });
    if (kind === "success") timer.current = setTimeout(() => setToast(null), SUCCESS_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const success = useCallback((message: string) => show("success", message), [show]);
  const error = useCallback((message: string) => show("error", message), [show]);

  return { toast, dismiss, success, error };
}
