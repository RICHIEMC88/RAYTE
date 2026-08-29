/* Siembra combos y paquetes promocionales para restaurantes y comercios.
   Ejecutar: npx tsx src/db/seed-combos.ts */
import "dotenv/config";
import { db, pool } from "./index";
import { restaurants, products } from "./schema";
import { eq } from "drizzle-orm";

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

type ComboSeed = {
  restaurantSlug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  section: string;
  popular: boolean;
};

const COMBOS: ComboSeed[] = [
  {
    restaurantSlug: "la-brasa-smash",
    name: "Combo Pareja: 2 Smash Burgers + 2 Papas + 2 Bebidas",
    description: "Incluye: 2 Hamburguesas Clásicas con queso cheddar + 2 porciones de papas sazonadas + 2 refrescos bien fríos. (Ahorra $45)",
    price: 239,
    image: px(1639557),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "la-brasa-smash",
    name: "Paquete Fiesta 4x4 Smash",
    description: "Incluye: 4 Hamburguesas Doble Carne Smash + 2 Papas Grandes + 1 Orden de Aros de Cebolla + 4 Refrescos.",
    price: 449,
    image: px(1639565),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "pizza-nonna",
    name: "Combo Nonna: 1 Pizza Mediana + Boneless + Refresco",
    description: "Incluye: 1 Pizza Mediana Pepperoni o 4 Quesos + 1 Orden de Boneless crujientes + 2 Bebidas de 600ml. (Ahorra $55)",
    price: 289,
    image: px(315755),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "pizza-nonna",
    name: "Paquete Familiar Trattoria (3-4 Personas)",
    description: "Incluye: 2 Pizzas Grandes a elegir + 1 Orden de Pan de Ajo Gratinado + 1 Refresco familiar de 2 Litros.",
    price: 489,
    image: px(1099680),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "sushi-neko",
    name: "Combo Dúo Neko (16 piezas + Kushiages)",
    description: "Incluye: 1 California Roll (8p) + 1 Philadelphia Roll (8p) + 4 Kushiages de Queso Manchego + 2 Té frío de durazno.",
    price: 269,
    image: px(357756),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "sushi-neko",
    name: "Paquete Sensei Party (32 piezas)",
    description: "Incluye: 4 Rollos Completos (California, Philadelphia, Dragon y Neko Roll) + 1 Edamames preparados con soya y limón.",
    price: 499,
    image: px(2098085),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "pollo-crack",
    name: "Combo Crack: 20 Alitas + Papas Gajo + 2 Salsas",
    description: "Incluye: 20 Alitas jugosas bañadas en 2 salsas a tu elección + 1 Orden grande de papas gajo + 2 Aderezos Ranch caseros.",
    price: 279,
    image: px(5652266),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "tacos-el-farol",
    name: "Paquete Taquiza El Farol (12 Tacos + Guacamole)",
    description: "Incluye: 6 Tacos al Pastor + 6 Tacos de Bistec + 1 Guacamole grande con totopos + Cebollitas asadas y salsas de la casa.",
    price: 245,
    image: px(2087748),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "panaderia-la-espiga",
    name: "Combo Desayuno: 6 Piezas de Pan Dulce + Café de Olla",
    description: "Incluye: 6 Conchas y panes tradicionales recién horneados a tu gusto + 1 Litro de café de olla con canela y piloncillo.",
    price: 120,
    image: px(208537),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "donas-coffee",
    name: "Docena de Donas Glaseadas + 2 Frappés",
    description: "Incluye: 12 Donas artesanales surtidas (chocolate, fresa, maple, oreo) + 2 Frappés de moka o caramelo 500ml.",
    price: 210,
    image: px(1854652),
    section: "Combos & Paquetes",
    popular: true,
  },
  {
    restaurantSlug: "green-bowl",
    name: "Combo Fit Dúo: 2 Bowls Proteicos + 2 Smoothies",
    description: "Incluye: 2 Bowls grandes a elección (Salmón o Pollo Grill) + 2 Smoothies antioxidantes de frutos rojos.",
    price: 275,
    image: px(1640777),
    section: "Combos & Paquetes",
    popular: true,
  },
];

async function main() {
  console.log("🌱 Sembrando combos y paquetes en restaurantes...");
  let count = 0;

  for (const c of COMBOS) {
    const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, c.restaurantSlug));
    if (!store) continue;

    // Verificar si ya existe para no duplicar
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.name, c.name));

    if (existing.length === 0) {
      await db.insert(products).values({
        restaurantId: store.id,
        name: c.name,
        description: c.description,
        price: c.price,
        image: c.image,
        section: c.section,
        popular: c.popular,
        available: true,
        sort: 0,
      });
      count++;
    }
  }

  console.log(`✓ ${count} combos y paquetes creados con éxito`);
  await pool.end();
}

main();
