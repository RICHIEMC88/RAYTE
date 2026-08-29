/* Alta completa del restaurante: Patio de Humo Asadero Time
   Ejecutar: npx tsx src/db/seed-patio-humo.ts */
import "dotenv/config";
import { db, pool } from "./index";
import { restaurants, products, productExtras, partnerAccounts } from "./schema";
import { eq } from "drizzle-orm";

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

async function main() {
  console.log("🔥 Creando restaurante: Patio de Humo Asadero Time...");

  // 1. Eliminar si ya existía para idempotencia
  const [existing] = await db.select().from(restaurants).where(eq(restaurants.slug, "patio-de-humo-asadero-time"));
  if (existing) {
    await db.delete(restaurants).where(eq(restaurants.id, existing.id));
  }

  // 2. Insertar Restaurante
  const [store] = await db
    .insert(restaurants)
    .values({
      name: "Patio de Humo Asadero Time",
      slug: "patio-de-humo-asadero-time",
      description: "Asador norteño de leña y mezquite: cortes prime, parrilladas por porciones de 250g, tuétanos, costillas ahumadas y guarniciones artesanales.",
      categorySlug: "restaurantes",
      image: px(1482803), // Foto espectacular de parrillada y fuego
      rating: 4.9,
      ratingCount: 9240,
      timeMin: 25,
      timeMax: 40,
      deliveryFee: 25,
      distanceKm: 1.6,
      promo: "🥩 Parrilladas 1 Kg con Guarniciones Gratis",
      tags: ["cortes", "parrilladas", "carneasada", "asador", "norteña", "ribeye", "arrachera"],
      isTurbo: false,
      address: "Blvd. Campestre 1520, Col. Lomas del Campestre, León, GTO",
      allowsPickup: true,
      isOpen: true,
      featured: true,
      sort: 2,
    })
    .returning();

  // 3. Insertar Platillos, Combos y Cortes
  const MENU = [
    // ════ COMBOS & PAQUETES (CON PORCIONES DE 250G) ════
    {
      name: "Parrillada Patio de Humo Especial (1 Kg · 4 porciones de 250g)",
      description: "Arma tu paquete: elige 4 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye frijoles charros con tuétano, guacamole artesanal, cebollitas asadas y tortillas calientes.",
      price: 520,
      image: px(1482803),
      section: "Combos & Paquetes",
      popular: true,
    },
    {
      name: "Paquete Asadero Time Familiar (1.5 Kg · 6 porciones de 250g)",
      description: "Paquete fiesta para 5-6 personas: elige 6 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye doble orden de frijoles charros, guacamole gigante con totopos, queso fundido con chistorra y tortillas calientes.",
      price: 740,
      image: px(410648),
      section: "Combos & Paquetes",
      popular: true,
    },
    {
      name: "Combo Parrillada Dúo al Carbón (500g · 2 porciones de 250g)",
      description: "Arma tu combo para 2 personas: Elige 2 porciones de 250g de tus cortes favoritos. Incluye orden de frijoles charros, guacamole rústico y chiles toreados.",
      price: 310,
      image: px(1251198),
      section: "Combos & Paquetes",
      popular: true,
    },
    {
      name: "Paquete Taquiza de Asador (750g · 3 porciones de 250g)",
      description: "Arma tu taquiza: Elige 3 porciones de 250g (Arrachera marinada, Bistec de rib eye, Pastor al carbón o Chorizo artesanal). Incluye 1/2 kilo de tortillas calientes, cebollitas cambray y salsas tatemadas.",
      price: 420,
      image: px(2087748),
      section: "Combos & Paquetes",
      popular: true,
    },

    // ════ CORTES INDIVIDUALES AL CARBÓN ════
    {
      name: "Rib Eye Prime al Carbón (350g)",
      description: "Corte selecto con marmoleo perfecto, sellado a fuego vivo con sal marina ahumada y mantequilla de romero. Incluye papa asada.",
      price: 285,
      image: px(1482803),
      section: "Cortes al Carbón",
      popular: true,
    },
    {
      name: "Arrachera Norteña Marinada (300g)",
      description: "Suave y jugosa, marinada con la receta secreta de la casa con cerveza y cítricos. Acompañada de cebollitas y nopal asado.",
      price: 240,
      image: px(299348),
      section: "Cortes al Carbón",
      popular: true,
    },
    {
      name: "Picaña Brasileña a la Espada (300g)",
      description: "Corte tierno con costra crujiente de sal de grano, asado lentamente y servido con chimichurri casero.",
      price: 260,
      image: px(616353),
      section: "Cortes al Carbón",
      popular: false,
    },
    {
      name: "Costillar BBQ Ahumado en Mezquite (500g)",
      description: "Costillas de cerdo ahumadas a baja temperatura por 8 horas con madera de mezquite y bañadas en salsa BBQ de frutos rojos.",
      price: 295,
      image: px(410648),
      section: "Cortes al Carbón",
      popular: true,
    },
    {
      name: "Cowboy Steak con Hueso (600g)",
      description: "Corte grueso y espectacular para los verdaderos amantes de la carne. Sellado a la parrilla con costra de especias.",
      price: 440,
      image: px(1482803),
      section: "Cortes al Carbón",
      popular: false,
    },
    {
      name: "Tacos de Arrachera al Carbón x3",
      description: "Tres tacos generosos en tortilla de maíz recién hecha con costra de queso manchego, cebollitas asadas y aguacate.",
      price: 165,
      image: px(2087748),
      section: "Tacos al Carbón",
      popular: true,
    },
    {
      name: "Volcán de Rib Eye con Queso Fundido x2",
      description: "Totopos gigantes horneados con frijoles refritos, costra de queso gouda y rib eye picado al carbón.",
      price: 145,
      image: px(4958792),
      section: "Tacos al Carbón",
      popular: false,
    },

    // ════ ENTRADAS & AL ASADOR ════
    {
      name: "Tuétanos a la Leña con Escamoles x2",
      description: "Canoas de tuétano asadas a las brasas con sal de grano de Colima y tortillas recién hechas para taquear.",
      price: 145,
      image: px(1482803),
      section: "Entradas & Asador",
      popular: true,
    },
    {
      name: "Chicharrón de Rib Eye en Guacamole",
      description: "Cubos crocantes de Rib Eye dorados a la perfección sobre cama de guacamole rústico con totopos caseros.",
      price: 185,
      image: px(1132047),
      section: "Entradas & Asador",
      popular: true,
    },
    {
      name: "Queso Fundido con Chistorra al Horno",
      description: "Cazuela de queso gouda y manchego derretido al horno de leña con chistorra artesanal doradita.",
      price: 120,
      image: px(1071190),
      section: "Entradas & Asador",
      popular: false,
    },
    {
      name: "Nopales Asados con Queso de Cuadro x4",
      description: "Asados con orégano silvestre, aceite de oliva y rebanadas de queso panela asado.",
      price: 85,
      image: px(1640777),
      section: "Entradas & Asador",
      popular: false,
    },

    // ════ GUARNICIONES ════
    {
      name: "Frijoles Charros Especiales con Tuétano",
      description: "Calientitos y cocinados a fuego lento con tocino, salchicha polaca, chile serrano y tuétano de res.",
      price: 65,
      image: px(4109111),
      section: "Guarniciones",
      popular: true,
    },
    {
      name: "Papa Asada Rellena de Tocino y Queso",
      description: "Papa jumbo horneada en papel aluminio con crema ácida, mantequilla, queso cheddar y tocino crocante.",
      price: 80,
      image: px(1583884),
      section: "Guarniciones",
      popular: false,
    },
    {
      name: "Cebollitas Cambray y Chiles Toreados",
      description: "Asadas al carbón con salsa negra de soya, jugo de limón y sazonador de la casa.",
      price: 55,
      image: px(2862154),
      section: "Guarniciones",
      popular: false,
    },

    // ════ BEBIDAS DE ASADOR ════
    {
      name: "Clamato Preparado con Carne Seca",
      description: "Clamato especial escarchado con salsas negras, limón, sal de apio y lámina de carne seca de Sonora.",
      price: 95,
      image: px(1251913),
      section: "Bebidas",
      popular: true,
    },
    {
      name: "Cerveza Artesanal Minera de León (355ml)",
      description: "Cerveza artesanal local estilo Amber Ale o IPA, servida bien fría.",
      price: 75,
      image: px(10701942),
      section: "Bebidas",
      popular: false,
    },
    {
      name: "Limonada Mineral con Hierbabuena (1 Litro)",
      description: "Refrescante y natural con limón real exprimido, hojas de hierbabuena y agua mineral de manantial.",
      price: 60,
      image: px(7271267),
      section: "Bebidas",
      popular: false,
    },
    {
      name: "Agua de Horchata con Coco y Canela (1 Litro)",
      description: "Receta tradicional cremosa de arroz con leche de coco y canela en raja.",
      price: 55,
      image: px(312418),
      section: "Bebidas",
      popular: false,
    },
  ];

  for (let i = 0; i < MENU.length; i++) {
    const item = MENU[i];
    await db.insert(products).values({
      restaurantId: store.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      section: item.section,
      popular: item.popular,
      available: true,
      sort: i,
    });
  }

  // 4. Insertar Extras del Restaurante (Ordenados alfabéticamente)
  const EXTRAS = [
    { name: "Aguacate hass fresco en láminas", price: 22 },
    { name: "Cebollitas cambray asadas extra", price: 18 },
    { name: "Chicharrón de queso manchego", price: 28 },
    { name: "Costra de queso asado para taco", price: 20 },
    { name: "Frijoles charros individuales extra", price: 25 },
    { name: "Guacamole artesanal con totopos", price: 28 },
    { name: "Nopal asado con orégano x2", price: 16 },
    { name: "Orden de tortillas recién hechas (10 pzs)", price: 15 },
    { name: "Papas a la francesa sazonadas", price: 28 },
    { name: "Queso gouda gratinado extra", price: 22 },
    { name: "Salsa macha artesanal de chile de árbol", price: 12 },
    { name: "Tuétano asado individual a la leña", price: 35 },
  ];

  for (let i = 0; i < EXTRAS.length; i++) {
    const ext = EXTRAS[i];
    await db.insert(productExtras).values({
      restaurantId: store.id,
      productId: null, // Aplica a todos los platillos y combos
      name: ext.name,
      price: ext.price,
      available: true,
      sort: i,
    });
  }

  // 5. Crear Cuenta de Socio para "Patio de Humo Asadero Time"
  await db.insert(partnerAccounts).values({
    restaurantId: store.id,
    username: "patiodehumo",
    partnerName: "Don Héctor Valdés · Maestro Asador Propietario",
    email: "socio@patiodehumo.com",
    phone: "477 888 1234",
    password: "socio123",
  });

  console.log(`✓ Restaurante "${store.name}" creado con éxito con ${MENU.length} platillos/combos y ${EXTRAS.length} extras!`);
  console.log(`✓ Cuenta de socio: usuario "patiodehumo", contraseña "socio123"`);
  await pool.end();
}

main();
