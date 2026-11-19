// Catálogo de iconos de categoría. Las CLAVES son las que guarda el backend
// (`menu_categories.icon`, ver src/models/category_icons.py en GP-Agent-Backend): si se agrega una
// acá hay que agregarla allá y viceversa. Una clave desconocida cae en `otros`, nunca en blanco.

export const CATEGORY_ICON_KEYS = [
  "desayuno",
  "almuerzo",
  "cena",
  "combos",
  "hamburguesas",
  "hotdogs",
  "pizza",
  "burritos",
  "tacos",
  "sushi",
  "pollo",
  "carnes",
  "pescado",
  "pasta",
  "sopas",
  "arroz",
  "ensaladas",
  "sandwiches",
  "panes",
  "galletas",
  "postres",
  "helados",
  "dulces",
  "snacks",
  "chucherias",
  "papas",
  "frutas",
  "bebidas",
  "cafe",
  "jugos",
  "licuados",
  "cerveza",
  "vegetariano",
  "extras",
  "otros",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

export const DEFAULT_CATEGORY_ICON: CategoryIconKey = "otros";

export const CATEGORY_ICON_LABELS: Record<CategoryIconKey, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  combos: "Combos / para llevar",
  hamburguesas: "Hamburguesas",
  hotdogs: "Hot dogs",
  pizza: "Pizza",
  burritos: "Burritos",
  tacos: "Tacos",
  sushi: "Sushi",
  pollo: "Pollo",
  carnes: "Carnes",
  pescado: "Pescado y mariscos",
  pasta: "Pasta",
  sopas: "Sopas",
  arroz: "Arroz y bowls",
  ensaladas: "Ensaladas",
  sandwiches: "Sándwiches",
  panes: "Panes",
  galletas: "Galletas",
  postres: "Postres",
  helados: "Helados",
  dulces: "Dulces",
  snacks: "Snacks",
  chucherias: "Chucherías",
  papas: "Papas fritas",
  frutas: "Frutas",
  bebidas: "Bebidas",
  cafe: "Café",
  jugos: "Jugos",
  licuados: "Licuados",
  cerveza: "Cerveza",
  vegetariano: "Vegetariano",
  extras: "Extras",
  otros: "Otros",
};

// Agrupación para el selector del panel (el orden dentro de cada grupo sigue CATEGORY_ICON_KEYS).
export const CATEGORY_ICON_GROUPS: { label: string; keys: CategoryIconKey[] }[] = [
  { label: "Comidas del día", keys: ["desayuno", "almuerzo", "cena", "combos"] },
  {
    label: "Platos fuertes",
    keys: [
      "hamburguesas",
      "hotdogs",
      "pizza",
      "burritos",
      "tacos",
      "sushi",
      "pollo",
      "carnes",
      "pescado",
      "pasta",
      "sopas",
      "arroz",
      "ensaladas",
      "sandwiches",
    ],
  },
  { label: "Panes y dulces", keys: ["panes", "galletas", "postres", "helados", "dulces"] },
  { label: "Snacks", keys: ["snacks", "chucherias", "papas", "frutas"] },
  { label: "Bebidas", keys: ["bebidas", "cafe", "jugos", "licuados", "cerveza"] },
  { label: "Otros", keys: ["vegetariano", "extras", "otros"] },
];

export function isCategoryIconKey(value: unknown): value is CategoryIconKey {
  return typeof value === "string" && (CATEGORY_ICON_KEYS as readonly string[]).includes(value);
}

// Espejo de `suggest_icon` del backend (src/models/category_icons.py): solo para previsualizar el
// icono que el backend asignará si no se elige uno. El backend es quien decide al guardar.
// "=palabra" = coincide solo como palabra exacta; el resto, como prefijo de palabra.
const KEYWORDS: [CategoryIconKey, string[]][] = [
  ["combos", ["combo", "paquete", "promocion"]],
  ["hotdogs", ["hot dog", "hotdog", "perro caliente", "salchicha", "shuco", "choripan"]],
  ["hamburguesas", ["hamburguesa", "burger"]],
  ["pizza", ["pizza"]],
  ["burritos", ["burrito", "wrap", "quesadilla"]],
  ["tacos", ["taco", "tostada", "enchilada", "nacho", "fajita"]],
  ["sushi", ["sushi", "maki", "nigiri", "sashimi"]],
  ["sopas", ["sopa", "caldo", "crema", "ramen", "consome"]],
  ["ensaladas", ["ensalada", "salad"]],
  ["pasta", ["pasta", "espagueti", "spaghetti", "lasagna", "lasana", "fideo", "macarron"]],
  ["sandwiches", ["sandwich", "sanduche", "emparedado", "torta", "baguette", "=sub"]],
  ["arroz", ["arroz", "bowl", "poke"]],
  ["pollo", ["pollo", "alita", "nugget", "broaster"]],
  ["carnes", ["carne", "=res", "bistec", "parrilla", "asado", "churrasco", "cerdo"]],
  ["pescado", ["pescado", "marisco", "camaron", "ceviche", "tilapia", "atun"]],
  ["desayuno", ["desayuno", "huevo", "panqueque", "pancake", "waffle", "hotcake"]],
  ["almuerzo", ["almuerzo", "plato", "menu del dia"]],
  ["cena", ["cena"]],
  ["cafe", ["cafe", "capuchino", "cappuccino", "espresso", "latte", "moka", "mocha"]],
  ["licuados", ["licuado", "batido", "smoothie", "frappe"]],
  ["jugos", ["jugo", "naranjada", "limonada", "=fresco"]],
  ["cerveza", ["cerveza", "alcohol", "vino", "coctel", "licor"]],
  ["bebidas", ["bebida", "refresco", "gaseosa", "soda", "=agua", "infusion", "te frio", "te helado"]],
  ["helados", ["helado", "nieve", "paleta", "raspado"]],
  ["postres", ["postre", "pastel", "=pay", "flan", "tres leches", "cheesecake", "queque"]],
  ["galletas", ["galleta", "cookie", "brownie", "muffin"]],
  ["panes", ["=pan", "panes", "panader", "croissant", "bolillo"]],
  ["dulces", ["dulce", "caramelo", "chocolate", "gomita", "golosina", "confite"]],
  ["chucherias", ["chucheria", "=chuchu"]],
  ["papas", ["=papas", "papa frita", "fritura", "=fritas", "=chips"]],
  ["snacks", ["snack", "palomita", "boquita"]],
  ["frutas", ["fruta", "manzana", "banano", "platano", "papaya", "melon", "sandia", "fresa"]],
  ["vegetariano", ["vegetariano", "vegano", "vegetal", "verdura", "saludable"]],
  [
    "extras",
    ["extra", "adicional", "complemento", "salsa", "aderezo", "acompanamiento", "guarnicion", "topping"],
  ],
];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PATTERNS: [CategoryIconKey, RegExp[]][] = KEYWORDS.map(([key, words]) => [
  key,
  words.map((w) =>
    w.startsWith("=")
      ? new RegExp(`(?<![a-z0-9])${escapeRegExp(w.slice(1))}(?![a-z0-9])`)
      : new RegExp(`(?<![a-z0-9])${escapeRegExp(w)}`),
  ),
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function suggestCategoryIcon(name: string | null | undefined): CategoryIconKey {
  const normalized = normalize(name ?? "");
  if (!normalized) return DEFAULT_CATEGORY_ICON;
  for (const [key, patterns] of PATTERNS) {
    if (patterns.some((p) => p.test(normalized))) return key;
  }
  return DEFAULT_CATEGORY_ICON;
}
