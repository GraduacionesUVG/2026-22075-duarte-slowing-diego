import { useCallback, useState } from "react";
import { isSoundEnabled, playSoundPreview, setSoundEnabled } from "../lib/sounds";

// Preferencia de sonido de la estación (se recuerda en el navegador).
export function useSoundEnabled() {
  const [enabled, setEnabled] = useState(isSoundEnabled);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      if (next) playSoundPreview();
      return next;
    });
  }, []);

  return { enabled, toggle };
}
