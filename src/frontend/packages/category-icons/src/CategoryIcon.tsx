import type { SVGProps } from "react";
import { CATEGORY_ICON_LABELS, DEFAULT_CATEGORY_ICON, isCategoryIconKey, type CategoryIconKey } from "./catalog";
import { ICON_MARKUP } from "./paths";

type CategoryIconProps = Omit<SVGProps<SVGSVGElement>, "name" | "children"> & {
  // Clave guardada en el backend. Nula o desconocida -> icono genérico (nunca un hueco).
  name: string | null | undefined;
  // Lado en px (el icono es cuadrado).
  size?: number;
  // Por defecto el icono es decorativo (aria-hidden): el nombre de la categoría ya va al lado en
  // texto. Pasa `label` solo si el icono llega a ir sin texto.
  label?: string;
};

export function resolveCategoryIcon(name: string | null | undefined): CategoryIconKey {
  return isCategoryIconKey(name) ? name : DEFAULT_CATEGORY_ICON;
}

export default function CategoryIcon({ name, size = 20, label, className, ...rest }: CategoryIconProps) {
  const key = resolveCategoryIcon(name);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      data-icon={key}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true, focusable: false })}
      {...rest}
      // Marcado estático de ICON_MARKUP (constantes del paquete).
      dangerouslySetInnerHTML={{ __html: ICON_MARKUP[key] }}
    />
  );
}

export { CATEGORY_ICON_LABELS };
