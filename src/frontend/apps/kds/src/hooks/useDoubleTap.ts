import { useRef } from "react";

const DOUBLE_TAP_THRESHOLD_MS = 350;

// onDoubleClick no siempre dispara en pantallas táctiles, así que detectamos
// el doble tap manualmente para que funcione igual con mouse y con touch.
export function useDoubleTap(onDoubleTap: () => void) {
  const lastTapRef = useRef(0);
  return () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD_MS) {
      lastTapRef.current = 0;
      onDoubleTap();
    } else {
      lastTapRef.current = now;
    }
  };
}
