import "dotenv/config";
import { db, pool } from "./index";
import { restaurants, products, productExtras } from "./schema";
import { eq } from "drizzle-orm";

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

async function main() {
  console.log("🌱 Sembrando parrilladas y paquetes de cortes en porciones de 250g...");

  const [brasa] = await db.select().from(restaurants).where(eq(restaurants.slug, "la-brasa-smash"));
  if (brasa) {
    // 1. Parrillada 1 Kg (4 porciones de 250g)
    await db.insert(products).values({
      restaurantId: brasa.id,
      name: "Parrillada La Brasa Premium (1 Kg · 4 porciones de 250g)",
      description: "Arma tu paquete: elige 4 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye frijoles charros, guacamole artesanal, cebollitas asadas y tortillas calientes.",
      price: 480,
      image: px(1482803),
      section: "Combos & Paquetes",
      popular: true,
      available: true,
      sort: 0,
    });

    // 2. Parrillada Dúo 500g (2 porciones de 250g)
    await db.insert(products).values({
      restaurantId: brasa.id,
      name: "Parrillada Dúo al Carbón (500g · 2 porciones de 250g)",
      description: "Arma tu paquete: elige 2 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye orden de frijoles charros, guacamole y chiles toreados.",
      price: 285,
      image: px(1251198),
      section: "Combos & Paquetes",
      popular: true,
      available: true,
      sort: 1,
    });

    // 3. Paquete Fiesta de Cortes (1.5 Kg · 6 porciones de 250g)
    await db.insert(products).values({
      restaurantId: brasa.id,
      name: "Paquete Fiesta Grill Master (1.5 Kg · 6 porciones de 250g)",
      description: "El paquete definitivo para reuniones: Elige 6 porciones de 250g de cortes selectos a la leña. Incluye doble guacamole, frijoles charros familiares, nopales asados y queso fundido.",
      price: 690,
      image: px(410648),
      section: "Combos & Paquetes",
      popular: true,
      available: true,
      sort: 2,
    });

    // Extras de parrillada
    await db.insert(productExtras).values([
      { restaurantId: brasa.id, productId: null, name: "Tuétanos asados a la brasa x2", price: 45, available: true, sort: 0 },
      { restaurantId: brasa.id, productId: null, name: "Chicharrón de queso manchego", price: 28, available: true, sort: 0 },
      { restaurantId: brasa.id, productId: null, name: "Orden extra de frijoles charros", price: 22, available: true, sort: 0 },
      { restaurantId: brasa.id, productId: null, name: "Guacamole con totopos extra", price: 25, available: true, sort: 0 },
      { restaurantId: brasa.id, productId: null, name: "Nopales asados con orégano x4", price: 18, available: true, sort: 0 },
    ]);
  }

  const [tacos] = await db.select().from(restaurants).where(eq(restaurants.slug, "tacos-el-farol"));
  if (tacos) {
    await db.insert(products).values({
      restaurantId: tacos.id,
      name: "Paquete Taquiza al Carbón (750g · 3 porciones de 250g)",
      description: "Arma tu taquiza: Elige 3 porciones de 250g (Arrachera, Bistec asado, Pastor adobado o Chorizo). Incluye 1/2 kilo de tortillas calientes, cebollitas cambray, limones y salsas.",
      price: 360,
      image: px(2087748),
      section: "Combos & Paquetes",
      popular: true,
      available: true,
      sort: 0,
    });
  }

  console.log("✓ Parrilladas y paquetes de cortes en porciones de 250g creados con éxito");
  await pool.end();
}

main();
