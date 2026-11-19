import type { CategoryIconKey } from "./catalog";

// Dibujos de los iconos: marcado SVG interno, viewBox 0 0 24 24, trazo (no relleno) con
// `currentColor`. Mismo grosor y esquinas redondeadas en todos para que se vean como una familia.
// Son constantes del propio paquete (no vienen de la API ni del usuario).
export const ICON_MARKUP: Record<CategoryIconKey, string> = {
  desayuno:
    '<path d="M12 4c3 0 4 1.5 6 2.5s2.5 4 .5 6.5-3 5-7 5-8-2-8-5.5S7 4 12 4z"/><circle cx="12" cy="11.5" r="2.6"/>',
  almuerzo:
    '<circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/><path d="M3 3v5a1.5 1.5 0 0 0 3 0V3M4.5 9.5V21"/><path d="M20.5 21V3c-2 1.5-2.5 4-2.5 7h2.5"/>',
  cena: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3.5v3M15.5 5h3"/>',
  combos: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  hamburguesas:
    '<path d="M4 11a8 6 0 0 1 16 0H4z"/><path d="M4 14c1.5 1.5 2.5 1.5 4 0s2.5-1.5 4 0 2.5 1.5 4 0 2.5-1.5 4 0"/><path d="M4 17h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1z"/>',
  hotdogs:
    '<rect x="2.5" y="8" width="19" height="9" rx="4.5"/><path d="M1.5 12.5h21"/><path d="M5 12.5l1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5"/>',
  pizza:
    '<path d="M3 6c6-3 12-3 18 0L12 21 3 6z"/><circle cx="9.5" cy="9.5" r="1.3"/><circle cx="14.5" cy="9.5" r="1.3"/><circle cx="12" cy="14" r="1.3"/>',
  burritos:
    '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M15.5 5.5a3.2 3.2 0 0 1 3 3"/>',
  tacos: '<path d="M3 18a9 9 0 0 1 18 0z"/><path d="M7 14c1-2 2-2 3 0M11 13c1-2.5 2-2.5 3 0M15 14c.7-1.5 1.5-1.5 2.3 0"/>',
  sushi:
    '<ellipse cx="12" cy="9" rx="8" ry="4"/><path d="M4 9v6c0 2.2 3.6 4 8 4s8-1.8 8-4V9"/><circle cx="12" cy="9" r="1.6"/>',
  pollo:
    '<ellipse cx="15" cy="9" rx="6" ry="5" transform="rotate(-20 15 9)"/><path d="M11 13l-5 5"/><circle cx="5" cy="17" r="1.6"/><circle cx="7" cy="19" r="1.6"/>',
  carnes:
    '<path d="M3 8c3-2.5 6 1 9-1s6 0 9 1v8c-3 2.5-6-1-9 1s-6 0-9-1z"/><path d="M8 10.5v4M12 9.5v5M16 10.5v4"/>',
  pescado: '<path d="M3 12c3-5 9-6 14-2l4-3v10l-4-3c-5 4-11 3-14-2z"/><circle cx="7.5" cy="11" r=".7"/>',
  pasta:
    '<ellipse cx="12" cy="17" rx="9" ry="3.5"/><path d="M7 15c0-4 3-8 5-8s5 4 5 8"/><path d="M9.5 14c1-2 4-2 5 0M10 11c1-1.2 3-1.2 4 0"/>',
  sopas:
    '<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 9c1-1.5 1-2.5 0-4M12 9c1-1.5 1-2.5 0-4M16 9c1-1.5 1-2.5 0-4"/>',
  arroz:
    '<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><path d="M6 12c0-3.5 2.5-6 6-6s6 2.5 6 6"/><path d="M10 9.5h.01M13.5 8.5h.01M14.5 10.5h.01"/>',
  ensaladas:
    '<path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M8 12c-1-3 0-6 3-7 1 2 1 5-.5 7"/><path d="M13 12c0-3 1.5-5.5 5-6 .5 3-1 5.5-4 6"/>',
  sandwiches:
    '<path d="M3 11l9-7 9 7z"/><path d="M3 14c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/><path d="M3 17h18v2H3z"/>',
  panes:
    '<path d="M4 11a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7H4v-7z"/><path d="M9 11.5l1.5-3.5M13 11.5l1.5-3.5"/>',
  galletas:
    '<path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5z"/><path d="M8 10h.01M9 15h.01M14 14h.01M13 18h.01"/>',
  postres:
    '<rect x="4" y="12" width="16" height="8" rx="1.5"/><path d="M4 15c2 2 4 2 6 0s4-2 6 0 3 1 4 0"/><path d="M12 12V8"/><path d="M12 3.5c1 1 1 2.2 0 3-1-.8-1-2 0-3z"/>',
  helados: '<path d="M8 11l4 10 4-10"/><path d="M7 11a5 5 0 1 1 10 0z"/><path d="M10 14.5l3 1M11 17.5l2 .7"/>',
  dulces: '<rect x="7" y="8" width="10" height="8" rx="3"/><path d="M7 12 3 9v6l4-3zM17 12l4-3v6l-4-3z"/>',
  snacks:
    '<path d="M6 10h12l-1.5 11h-9L6 10z"/><path d="M10 10l.5 11M14 10l-.5 11"/><path d="M6 10a3 3 0 0 1 1-5.5 3 3 0 0 1 5-1.5 3 3 0 0 1 5 1.5 3 3 0 0 1 1 5.5"/>',
  chucherias:
    '<path d="M6 4h12v16H6z"/><path d="M6 7h12M6 17h12"/><path d="M12 9.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
  papas: '<path d="M6 11h12l-1.2 10H7.2L6 11z"/><path d="M8.5 11 8 5M11.5 11V3.5M14.5 11l.5-7M17 11l1-5"/>',
  frutas:
    '<path d="M12 8c-2-1.5-7-1.5-7 4 0 4.5 3 9 7 9s7-4.5 7-9c0-5.5-5-5.5-7-4z"/><path d="M12 8c0-2 .5-3.5 2-4.5"/><path d="M14 5.5c1-1.5 2.5-1.5 3.5-1-.3 1.5-1.8 2.3-3.5 1z"/>',
  bebidas:
    '<path d="M7 8h10l-1.2 12H8.2L7 8z"/><path d="M6 8h12"/><path d="M13 8l1.2-5H17"/><path d="M7.6 13h8.8"/>',
  cafe: '<path d="M5 10h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v3M12 3v3"/>',
  jugos:
    '<path d="M6 7h10l-1.2 13H7.2L6 7z"/><path d="M12 7l2-4"/><circle cx="18" cy="8" r="3"/><path d="M18 5v6M15 8h6"/>',
  licuados:
    '<path d="M7 4h10l-1.5 11h-7L7 4z"/><path d="M6 4h12"/><rect x="7" y="15" width="10" height="5" rx="1"/><path d="M12 17.5h.01"/>',
  cerveza:
    '<path d="M6 7h9v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7z"/><path d="M15 9h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M6 7a2 2 0 0 1 2-2 2 2 0 0 1 3-1 2 2 0 0 1 3 1 2 2 0 0 1 1 2"/><path d="M9 11v6M12 11v6"/>',
  vegetariano: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
  extras: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>',
  otros: '<path d="M6 3v5a2 2 0 0 0 4 0V3M8 3v18"/><path d="M16 21V3c-2.5 1.5-3.5 4-3.5 8H16"/>',
};
