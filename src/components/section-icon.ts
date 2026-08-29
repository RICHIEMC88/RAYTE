import { Sandwich, Pizza, Package, CupSoda, Coffee, IceCreamCone, Salad, Drumstick, Fish, Soup, Popcorn, Beer, Wine, Apple, Egg, Croissant, ShoppingBasket, SprayCan, HeartPulse, Pill, Baby, PawPrint, Gamepad2, CakeSlice, Donut, Beef, Utensils } from "lucide-react";

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/* Ícono según el nombre de la sección del menú (estilo Uber Eats) */
const RULES: [RegExp, IconType][] = [
  [/helader|helado/i, IceCreamCone],
  [/vino|whisky|ron |tequila|destilad|licor|cocteler|ginebra|vodka|aguardiente/i, Wine],
  [/cerveza|lager|ipa|porter|sixpack|alcohol/i, Beer],
  [/caf[eé]|espresso|latte|capuch|molido/i, Coffee],
  [/sushi|roll|dragon|geisha|philadelphia|california|neko/i, Fish],
  [/alita|pollo|broaster|crispy|res magra/i, Drumstick],
  [/pizza|porcion|calzone|pasta|lasagna|spaghetti/i, Pizza],
  [/smash|burger|hamburgues|taco|burrito|quesadilla|birria|pastor|hot ?dog|arepa|sandwich/i, Sandwich],
  [/combo|tr[ií]o|familiar|pareja|personal/i, Package],
  [/ensalada|saludable|detox|wrap|bowl verde|vegano|thai/i, Salad],
  [/sopa|entrada|edamame|gyoza|miso/i, Soup],
  [/postre|dulce|torta|dona|volc[aá]n|panqueque|cheesecake|brownie|malteada/i, Donut],
  [/fruta|manzana|banano|lim[oó]n|verdura|tomate|aguacate|espinaca|frutos/i, Apple],
  [/l[aá]cteo|huevo|leche|yogurt|queso/i, Egg],
  [/pan|panader[ií]a|croissant|pandebono|boller[ií]a/i, Croissant],
  [/aseo|limpieza|detergente|jab[oó]n|blanqueador|multiusos|servilleta|papel|hogar|varios|t[eé]cnic/i, SprayCan],
  [/cuidado|shampoo|dental|personal|colonia|perfume|bienestar|mascara/i, HeartPulse],
  [/medicamento|analg|[aá]nti|suero|vitamina|primeros|botiqu[ií]n|emergencia|salud/i, Pill],
  [/beb[eé]|mam[aá]|pa[ñn]al|toallita/i, Baby],
  [/mascota|perro|gato|alimento|arena|higiene|ba[ñn]o/i, PawPrint],
  [/juguete|torre|t[uú]nel|rat[oó]n|ca[ñn]a|juego/i, Gamepad2],
  [/snack|papas|palomita|antojo|nachito|grano|semilla|barra|proteic|fit|macro/i, Beef],
  [/gaseosa|jugo|bebida|soda|agua|t[eé] /i, CupSoda],
  [/tarta|bizcocho/i, CakeSlice],
  [/despensa|arroz|az[uú]car|aceite|mercado|canasta|esencial|desayuno/i, ShoppingBasket],
];

export function sectionIcon(name: string): IconType {
  for (const [re, icon] of RULES) {
    if (re.test(name)) return icon;
  }
  return Utensils;
}
