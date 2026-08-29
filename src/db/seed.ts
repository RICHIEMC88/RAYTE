import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { categories, restaurants, products, services, drivers } from "./schema";

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

type P = [name: string, desc: string, price: number, image: string, section: string, popular: boolean];

async function main() {
  console.log("🌱 Sembrando Rayte (catálogo completo)...");

  // Reseed limpio (demo)
  await db.execute(
    sql`TRUNCATE TABLE appointments, products, services, drivers, restaurants, categories RESTART IDENTITY CASCADE`,
  );

  await db.insert(categories).values([
    { name: "Restaurantes", slug: "restaurantes", icon: "utensils", color: "#FF441F", bg: "#FFEDE8", sort: 1 },
    { name: "Panaderías", slug: "panaderias", icon: "croissant", color: "#D97706", bg: "#FEF3C7", sort: 2 },
    { name: "Mercado", slug: "mercado", icon: "shopping-basket", color: "#0EA55B", bg: "#E6F8EE", sort: 3 },
    { name: "Turbo", slug: "turbo", icon: "zap", color: "#FFB020", bg: "#2A2430", sort: 4 },
    { name: "Salud", slug: "farmacia", icon: "pill", color: "#2D7FF9", bg: "#E9F2FF", sort: 5 },
    { name: "Bebidas", slug: "bebidas", icon: "beer", color: "#8B5CF6", bg: "#F2ECFF", sort: 6 },
    { name: "Saludable", slug: "saludable", icon: "salad", color: "#16A34A", bg: "#EAF7EE", sort: 7 },
    { name: "Postres", slug: "postres", icon: "ice-cream-cone", color: "#EC4899", bg: "#FDEAF3", sort: 8 },
    { name: "Mascotas", slug: "mascotas", icon: "paw-print", color: "#F59E0B", bg: "#FEF4E2", sort: 9 },
  ]);

  type StoreSeed = {
    slug: string; name: string; description: string; categorySlug: string; image: string;
    rating: number; ratingCount: number; timeMin: number; timeMax: number; deliveryFee: number;
    distanceKm: number; promo?: string; tags: string[]; isTurbo?: boolean; isOpen?: boolean; featured?: boolean; address?: string; allowsPickup?: boolean;
    products: P[];
  };

  const storesData: StoreSeed[] = [
    // ================= TURBO =================
    {
      slug: "turbo-rayte", address: "Blvd. Aeropuerto 420, Col. San Jerónimo, León, GTO", allowsPickup: true, name: "Turbo Rayte", description: "Antojos, bebidas y esenciales en 10 minutos",
      categorySlug: "turbo", image: px(3826282), rating: 4.9, ratingCount: 12400, timeMin: 8, timeMax: 12,
      deliveryFee: 1900, distanceKm: 0.8, promo: "En 10 min", tags: ["turbo", "snacks", "bebidas"], isTurbo: true, featured: true,
      products: [
        ["Papas & Snack Mix", "Papas crocantes con mix de snacks picantes", 6900, px(9872916), "Antojos", true],
        ["Alitas Express x6", "Alitas BBQ listas para matar el antojo", 12900, px(5652266), "Antojos", true],
        ["Nachos con queso", "Totopos con doble queso y jalapeño", 9900, px(4958792), "Antojos", false],
        ["Mini pizzas x4", "Para compartir sin esperar", 9900, px(1099680), "Antojos", false],
        ["Cerveza Artesanal x4", "IPA bien fría, para ahora mismo", 19900, px(10701942), "Bebidas", false],
        ["Gaseosa 1.5L", "Bien fría, del sabor que quieras", 4500, px(1251913), "Bebidas", false],
        ["Agua sin gas 750ml", "Hidratación inmediata", 2500, px(4154759), "Bebidas", false],
        ["Café del día 500ml", "Recién pasado, para el empujón", 3900, px(312418), "Bebidas", false],
        ["Kit Emergencia", "Curas, alcohol y analgésico en uno", 15900, px(3683074), "Esenciales", true],
        ["Huevos AA x12", "Frescos del mercadito, llegan hoy", 8900, px(1627120), "Esenciales", false],
        ["Pan artesanal x4", "Recién horneado", 6900, px(1775043), "Esenciales", false],
        ["Leche entera 1L", "Siempre en nevera", 3400, px(3738832), "Esenciales", false],
        ["Cargador USB-C", "El de emergencia que siempre se pierde", 12900, px(868110), "Tecnología", false],
        ["Pilas AA x4", "Para el control y lo que sea", 7900, px(7262911), "Tecnología", false],
      ],
    },
    // ================= PANADERÍAS =================
    {
      slug: "panaderia-la-espiga", address: "Blvd. Campestre 812, Col. Jardines del Moral, León, GTO", allowsPickup: true, name: "Panadería La Espiga", description: "Pan dulce tradicional, conchas de vainilla y chocolate, cuernitos de mantequilla y baguettes de masa madre recién salidos del horno",
      categorySlug: "panaderias", image: px(1775043), rating: 4.9, ratingCount: 4800, timeMin: 15, timeMax: 25,
      deliveryFee: 1900, distanceKm: 1.3, promo: "Pan caliente cada hora", tags: ["panaderia", "pan-dulce", "desayuno", "conchas"], featured: true,
      products: [
        ["Conchas Tradicionales x4", "Vainilla y chocolate con costra crocante y miga suave", 12900, px(1775046), "Pan Dulce", true],
        ["Cuernitos de Mantequilla x4", "Hojaldrados, dorados y crujientes", 14900, px(1600711), "Pan Dulce", true],
        ["Orejas & Hojaldras x4", "Caramelizadas al horno con azúcar", 11900, px(2056135), "Pan Dulce", false],
        ["Pan de Muerto Artesanal x2", "Con agua de azahar y naranja", 16900, px(1775043), "Pan Dulce", false],
        ["Baguette Masa Madre", "Corteza crujiente y fermentación de 24h", 9900, px(1775043), "Pan Salado", true],
        ["Bolillos Crujientes x6", "Ideales para tortas o el desayuno", 8900, px(1393382), "Pan Salado", false],
        ["Pan Rústico Multigrano", "Con semillas de girasol, chía y avena", 14900, px(1627120), "Pan Salado", false],
        ["Pastel Tres Leches Porción", "Húmedo, tradicional con canela", 13900, px(291528), "Pastelería", true],
        ["Pay de Queso Casero", "Cremoso con base de galleta", 12900, px(3914884), "Pastelería", false],
        ["Café de Olla 500ml", "Con piloncillo y canela", 6500, px(312418), "Bebidas", false],
        ["Chocolate Caliente 500ml", "Espumoso con leche entera", 7500, px(1126359), "Bebidas", false],
      ],
    },
    // ================= RESTAURANTES =================
    {
      slug: "patio-de-humo-asadero-time", address: "Blvd. Campestre 1520, Col. Lomas del Campestre, León, GTO", allowsPickup: true, name: "Patio de Humo Asadero Time", description: "Asador norteño de leña y mezquite: cortes prime, parrilladas por porciones de 250g, tuétanos y guarniciones.",
      categorySlug: "restaurantes", image: px(1482803), rating: 4.9, ratingCount: 9240, timeMin: 25, timeMax: 40,
      deliveryFee: 2500, distanceKm: 1.6, promo: "🥩 Parrilladas 1 Kg con Guarniciones Gratis", tags: ["cortes", "parrilladas", "carneasada", "asador", "norteña"], featured: true,
      products: [
        ["Parrillada Patio de Humo Especial (1 Kg · 4 porciones de 250g)", "Elige 4 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye charros, guacamole y tortillas.", 52000, px(1482803), "Combos & Paquetes", true],
        ["Paquete Asadero Time Familiar (1.5 Kg · 6 porciones de 250g)", "Elige 6 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye doble frijoles charros, guacamole gigante y queso fundido.", 74000, px(410648), "Combos & Paquetes", true],
        ["Combo Parrillada Dúo (500g · 2 porciones de 250g)", "Elige 2 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye guacamole y frijoles charros.", 31000, px(1251198), "Combos & Paquetes", true],
        ["Rib Eye Prime al Carbón (350g)", "Corte selecto con marmoleo perfecto, sal marina y papa asada.", 28500, px(1482803), "Cortes al Carbón", true],
        ["Arrachera Norteña Marinada (300g)", "Suave y jugosa, marinada con receta de la casa, cebollitas y nopal.", 24000, px(299348), "Cortes al Carbón", true],
        ["Picaña a la Espada (300g)", "Corte tierno con costra crujiente de sal y chimichurri.", 26000, px(616353), "Cortes al Carbón", false],
        ["Tacos de Arrachera al Carbón x3", "Tres tacos con costra de queso manchego y aguacate.", 16500, px(2087748), "Tacos al Carbón", true],
        ["Tuétanos a la Leña x2", "Canoas asadas con sal de grano y tortillas recién hechas.", 14500, px(1482803), "Entradas", true],
        ["Chicharrón de Rib Eye en Guacamole", "Cubos crujientes de Rib Eye sobre guacamole rústico.", 18500, px(1132047), "Entradas", true],
        ["Frijoles Charros con Tuétano", "Calientitos con tocino, salchicha polaca y tuétano.", 6500, px(4109111), "Guarniciones", false],
        ["Papa Asada Rellena", "Con crema, mantequilla, queso cheddar y tocino crocante.", 8000, px(1583884), "Guarniciones", false],
      ],
    },
    {
      slug: "la-brasa-smash", address: "Av. Hidalgo 125, Zona Centro, León, GTO", allowsPickup: true, name: "La Brasa Smash", description: "Smashes jugosas al carbón con papas crujientes",
      categorySlug: "restaurantes", image: px(38896819), rating: 4.8, ratingCount: 8400, timeMin: 20, timeMax: 35,
      deliveryFee: 2900, distanceKm: 1.2, promo: "50% en tu 1er pedido", tags: ["hamburguesas", "smash"], featured: true,
      products: [
        ["Smash Clásica", "Doble carne aplastada, cheddar, pepinillos y salsa secreta", 22900, px(38896819), "Smashes", true],
        ["Doble Tocineta", "Tocino caramelizado, cheddar doble y cebolla crispy", 28900, px(10701942), "Smashes", false],
        ["Smash Pollo Crispy", "Pollo crocante, mayo de ajo y lechuga", 24900, px(587741), "Smashes", false],
        ["Veggie Smash", "Hamburguesa de lentejas con aguacate", 21900, px(2955223), "Smashes", false],
        ["Combo Trío", "Tres smashes clásicas con papas para compartir", 54900, px(13163534), "Combos", true],
        ["Combo Brasa", "Smash clásica + papas + gaseosa", 31900, px(1639557), "Combos", false],
        ["Combo Pareja", "2 smashes + papas grandes + 2 bebidas", 49900, px(1633578), "Combos", false],
        ["Papas Chunky", "Con crema de la casa y queso rallado", 9900, px(4109111), "Acompañantes", false],
        ["Aros de cebolla", "Crocantes con salsa ranch", 8900, px(2400043), "Acompañantes", false],
        ["Mazorcas asadas", "Con mantequilla y parmesano", 9500, px(1300602), "Acompañantes", false],
        ["Malteada de Vainilla", "Cremosa, con topping de crema", 12900, px(1126359), "Bebidas", false],
        ["Limonada de coco", "Bien fría, la favorita de la casa", 8500, px(1251913), "Bebidas", false],
      ],
    },
    {
      slug: "pizza-nonna", address: "Calle Madero 308, Zona Centro, León, GTO", allowsPickup: true, name: "Pizza Nonna", description: "Pizza artesanal al horno de leña, masa de 48 horas",
      categorySlug: "restaurantes", image: px(1565982), rating: 4.6, ratingCount: 3900, timeMin: 30, timeMax: 45,
      deliveryFee: 3500, distanceKm: 2.4, promo: "2x1 en pizzas grandes", tags: ["pizza", "italiana"],
      products: [
        ["Margherita", "Tomate San Marzano, mozzarella y albahaca fresca", 19900, px(1565982), "Pizzas Clásicas", true],
        ["Pepperoni Classic", "Doble pepperoni y mozzarella gratinada", 24900, px(315755), "Pizzas Clásicas", false],
        ["Hawaiana Nonna", "Jamón, piña caramelizada y toque de miel", 23900, px(461198), "Pizzas Clásicas", false],
        ["Vegetariana", "Champiñones, pimentón, cebolla y aceitunas", 22900, px(2092906), "Pizzas Clásicas", false],
        ["Nonna 4 Quesos", "Mozzarella, gorgonzola, parmesano y provolone", 27900, px(1099680), "Pizzas Especiales", true],
        ["Calzone Napolitano", "Relleno de ricotta, jamón y albahaca", 23900, px(264537), "Pizzas Especiales", false],
        ["Pizza Nutella", "Para los golosos, con fresas", 19900, px(376464), "Pizzas Especiales", false],
        ["Porción x2 tajadas", "Para la antojada de media tarde", 6900, px(315755), "Porciones", false],
        ["Lasagna de la casa", "Boloñesa horneada con queso gratinado", 21900, px(264537), "Pastas", false],
        ["Spaghetti boloñesa", "Con parmesano recién rallado", 19900, px(868110), "Pastas", false],
        ["Soda italiana", "Aranciata o limonata", 7500, px(1251913), "Bebidas", false],
        ["Cerveza artesanal", "Lager local bien fría", 12000, px(1667913), "Bebidas", false],
      ],
    },
    {
      slug: "sushi-neko", address: "Plaza Mayor, Local 24, Blvd. Aeropuerto 301, León, GTO", allowsPickup: true, name: "Sushi Neko", description: "Rolls frescos de salmón importado, hechos al momento",
      categorySlug: "restaurantes", image: "/tiendas/sushi-neko.jpg", rating: 4.9, ratingCount: 2100, timeMin: 35, timeMax: 50,
      deliveryFee: 3900, distanceKm: 2.6, promo: "Roll 2x1 martes y jueves", tags: ["sushi", "japonesa", "rollos"], isOpen: false,
      products: [
        ["California Roll 8p", "Kanikama, aguacate y pepino con masago", 24900, px(357756), "Rolls Clásicos", true],
        ["Philadelphia Roll 8p", "Salmón, queso crema y cebollín", 26900, px(2098085), "Rolls Clásicos", true],
        ["Salmón Avocado 8p", "Salmón fresco y aguacate en láminas", 29900, px(2347311), "Rolls Clásicos", false],
        ["Veggie Roll 8p", "Aguacate, pepino, mango y zanahoria", 19900, px(1148086), "Rolls Clásicos", false],
        ["Neko Roll 8p", "Tempura de camarón con spicy mayo", 32900, px(3296280), "Rolls Especiales", false],
        ["Dragon Roll 8p", "Anguila, aguacate y unagi", 34900, px(391208), "Rolls Especiales", false],
        ["Geisha Roll 8p", "Salmón flameado con queso crema", 31900, px(590022), "Rolls Especiales", false],
        ["Edamame", "Con sal marina", 12900, px(1435895), "Entradas", false],
        ["Gyoza x5", "Dumplings de pollo al vapor con salsa", 15900, px(3703323), "Entradas", false],
        ["Sopa miso", "Tofu, cebollín y alga wakame", 8900, px(230477), "Entradas", false],
        ["Sake copa", "Junmai ginjo, sirvimos frío", 15000, px(434311), "Bebidas", false],
        ["Té verde", "Matcha tradicional", 5000, px(539453), "Bebidas", false],
      ],
    },
    {
      slug: "pollo-crack", address: "Av. León 85, Col. Moderna, León, GTO", allowsPickup: true, name: "Pollo Crack", description: "Alitas, broaster y combos para compartir",
      categorySlug: "restaurantes", image: px(5652266), rating: 4.7, ratingCount: 6100, timeMin: 25, timeMax: 40,
      deliveryFee: 0, distanceKm: 1.8, promo: "Envío gratis", tags: ["pollo", "alitas"],
      products: [
        ["Alitas BBQ x8", "Bañadas en BBQ ahumada, súper crujientes", 18900, px(5652266), "Alitas", true],
        ["Alitas Picantes x8", "Salsa buffalo con toque de miel", 18900, px(675951), "Alitas", false],
        ["Alitas Honey x8", "Dulces y doradas, adictivas", 19400, px(2338407), "Alitas", false],
        ["Mix de Alitas x12", "3 salsas a elección", 26900, px(9609839), "Alitas", false],
        ["Medio Pollo Broaster", "Con papas rústicas y salsa de la casa", 21900, px(825661), "Pollo", true],
        ["Pollo Entero Broaster", "Para la familia completa", 34900, px(3762064), "Pollo", false],
        ["Tiras Crispy x10", "Pechuga empanizada con dips", 20900, px(2271107), "Pollo", false],
        ["Combo Crack Familiar", "Pollo completo, alitas x8 y 4 bebidas", 46900, px(1639557), "Combos", true],
        ["Combo Personal", "¼ de pollo + papas + gaseosa", 16500, px(2092906), "Combos", false],
        ["Combo Parejas", "½ pollo + alitas + 2 bebidas", 32900, px(2955223), "Combos", false],
        ["Papas rústicas", "Con hierbas y parmesano", 8900, px(4109111), "Acompañantes", false],
        ["Arepa con queso", "Asada, con queso doble crema", 4500, px(1071190), "Acompañantes", false],
        ["Té frío de durazno", "Bien helado", 5500, px(7271267), "Bebidas", false],
      ],
    },
    {
      slug: "tacos-el-farol", address: "López Mateos s/n, Col. Lomas, León, GTO", allowsPickup: true, name: "Tacos El Farol", description: "Taquería urbana: al pastor, asado y birria",
      categorySlug: "restaurantes", image: "/tiendas/tacos-farol.jpg", rating: 4.7, ratingCount: 4400, timeMin: 20, timeMax: 35,
      deliveryFee: 2900, distanceKm: 1.9, promo: "Tacos 3x2 hoy", tags: ["mexicana", "tacos", "antosjo"],
      products: [
        ["Tacos al Pastor x3", "Cerdo adobado, piña, cilantro y cebolla", 16900, px(4958792), "Tacos", true],
        ["Tacos de Asado x3", "Res a la brasa con salsa roja", 17900, px(2862154), "Tacos", false],
        ["Tacos Pollo Chipotle x3", "Pollo cremoso con chipotle", 16900, px(2087748), "Tacos", false],
        ["Tacos Veggie x3", "Hongos, rajas y aguacate", 14900, px(9559074), "Tacos", false],
        ["Burrito de Asado", "Grandote, con frijoles y arroz", 22900, px(460537), "Burritos", true],
        ["Burrito de Pollo", "Con guacamole y pico de gallo", 21900, px(6046399), "Burritos", false],
        ["Burrito Veggie", "Frijol negros, verduras asadas y queso", 19900, px(6520173), "Burritos", false],
        ["Quesadilla de Queso", "Con champiñones salteados", 14900, px(1194030), "Quesadillas", false],
        ["Birria Quesatacos x3", "El clásico con consomé para mojar", 24900, px(4300396), "Quesadillas", true],
        ["Nachos El Farol", "Para compartir, con todo el toppings", 18900, px(3717695), "Para Compartir", false],
        ["Guacamole con totopos", "Recién hecho", 13900, px(1132047), "Para Compartir", false],
        ["Agua de horchata", "Dulce y cremosa", 6500, px(1251913), "Bebidas", false],
        ["Margarita de mango", "Con hielo frappé", 14500, px(338713), "Bebidas", false],
      ],
    },
    // ================= MERCADO =================
    {
      slug: "mercadito-fresco", address: "Mercado Hidalgo, Local 12, Zona Centro, León, GTO", allowsPickup: true, name: "Mercadito Fresco", description: "Frutas, verduras y despensa del día",
      categorySlug: "mercado", image: px(2456435), rating: 4.8, ratingCount: 2600, timeMin: 15, timeMax: 25,
      deliveryFee: 2500, distanceKm: 1.1, tags: ["mercado", "despensa", "frutas"],
      products: [
        ["Banano criollo x6", "Dulces y maduros, del eje cafetero", 3900, px(708774), "Frutas y Verduras", true],
        ["Manzana roja x6", "Crocantes y jugosas", 6900, px(102104), "Frutas y Verduras", false],
        ["Tomate chonto 500g", "Para la salsa de la abuela", 3400, px(1152260), "Frutas y Verduras", false],
        ["Aguacate hass x2", "Punto exacto de maduración", 5800, px(1132047), "Frutas y Verduras", true],
        ["Limones 500g", "Para todo, siempre", 2400, px(1435904), "Frutas y Verduras", false],
        ["Espinaca 200g", "Hojas frescas para ensalada o jugo", 3200, px(1300602), "Frutas y Verduras", false],
        ["Huevos AA x12", "De granja, recién recogidos", 8900, px(1627120), "Lácteos y Huevos", true],
        ["Leche entera 1L", "Entera, pasteurizada", 3400, px(3738832), "Lácteos y Huevos", false],
        ["Yogurt griego 500g", "Cremoso, sin azúcar añadida", 8900, px(531058), "Lácteos y Huevos", false],
        ["Queso campesino 500g", "Fresco del día", 9800, px(2484121), "Lácteos y Huevos", false],
        ["Pan artesanal x4", "Masa madre, recién horneado", 6900, px(1775043), "Panadería", false],
        ["Croissant x2", "De mantequilla, hojaldrado", 5200, px(1600711), "Panadería", false],
        ["Pandebono x6", "Recién salidos del horno", 5900, px(1775046), "Panadería", false],
        ["Arroz 500g", "Blanco, grano largo", 2600, px(1393382), "Despensa", false],
        ["Frijol 500g", "Cargamanto, para la cocida", 3800, px(5410400), "Despensa", false],
        ["Café molido 250g", "Tostado medio, origen Huila", 7900, px(1436372), "Despensa", true],
        ["Azúcar 500g", "Blanca refinada", 2400, px(144112), "Despensa", false],
        ["Aceite 900ml", "Girasol, para todo uso", 8900, px(5836776), "Despensa", false],
        ["Canasta desayuno", "Huevos, pan, café y fruta para 2", 19900, px(2983101), "Canastas", true],
        ["Canasta familiar", "Lo esencial de la semana para 4", 49900, px(533342), "Canastas", false],
      ],
    },
    {
      slug: "surtimarket-express", address: "Blvd. Marañón 512, Col. San Jerónimo, León, GTO", allowsPickup: false, name: "Surtimarket Express", description: "Aseo, cuidado personal y todo para el hogar",
      categorySlug: "mercado", image: "/tiendas/surtimarket.jpg", rating: 4.6, ratingCount: 1900, timeMin: 25, timeMax: 40,
      deliveryFee: 2400, distanceKm: 2.2, tags: ["mercado", "aseo", "hogar"],
      products: [
        ["Detergente líquido 1L", "Ropa limpia y olorosa", 9900, px(4239143), "Aseo Hogar", true],
        ["Jabón loza 500ml", "Desengrasa al instante", 4500, px(545012), "Aseo Hogar", false],
        ["Limpiador multiusos 1L", "Pisos, baños y cocina", 6900, px(6199965), "Aseo Hogar", false],
        ["Blanqueador 1L", "Para la ropa blanca", 3900, px(2724749), "Aseo Hogar", false],
        ["Shampoo 400ml", "Para todo tipo de cabello", 12900, px(3785147), "Cuidado Personal", false],
        ["Pasta dental 100ml", "Con flúor, protección total", 8500, px(3762879), "Cuidado Personal", false],
        ["Papel higiénico x4", "Doble hoja, suave", 6900, px(4039978), "Cuidado Personal", true],
        ["Jabón de manos 400ml", "Hidratante con glicerina", 4000, px(4202325), "Cuidado Personal", false],
        ["Papas fritas familiares", "Para la película", 6900, px(9872916), "Snacks", false],
        ["Chocolatinas x3", "El capricho de siempre", 4500, px(533280), "Snacks", false],
        ["Bombillo LED", "Luz blanca, ahorra energía", 6900, px(868110), "Hogar", false],
        ["Servilletas x100", "Para cualquier imprevisto", 3500, px(1775043), "Hogar", false],
        ["Gaseosa 2L", "Bien fría", 5900, px(1251913), "Bebidas", false],
        ["Agua 5L", "Para la oficina o la casa", 6900, px(4154759), "Bebidas", false],
      ],
    },
    // ================= FARMACIA =================
    {
      slug: "drogueria-mi-salud", address: "Av. Torreón 210, Col. Monumento, León, GTO", allowsPickup: true, name: "Droguería Mi Salud", description: "Medicamentos y cuidado personal, siempre abiertos",
      categorySlug: "farmacia", image: px(3683074), rating: 4.9, ratingCount: 5100, timeMin: 12, timeMax: 20,
      deliveryFee: 1900, distanceKm: 0.9, tags: ["farmacia", "salud"],
      products: [
        ["Acetaminofén 500mg x10", "Alivio del dolor y la fiebre", 3900, px(3683074), "Medicamentos", true],
        ["Ibuprofeno 400mg x10", "Antiinflamatorio de uso común", 5900, px(3683098), "Medicamentos", false],
        ["Loratadina 10mg x10", "Antialérgico, sin somnolencia", 4900, px(2282532), "Medicamentos", false],
        ["Suero oral 500ml", "Rehidratación rápida", 3500, px(208512), "Medicamentos", false],
        ["Antiácido x10", "Alivio de la acidez", 4500, px(3759742), "Medicamentos", false],
        ["Vitamina C x10", "Efervescente, sabor naranja", 7900, px(4033148), "Cuidado Personal", false],
        ["Protector solar SPF50", "Protección diaria", 32900, px(4465124), "Cuidado Personal", true],
        ["Alcohol antiséptico 500ml", "Para desinfectar todo", 5900, px(3683098), "Primeros Auxilios", false],
        ["Gasas y curas", "Botiquín básico para casa", 4900, px(5214316), "Primeros Auxilios", false],
        ["Botiquín de viaje", "Lo esencial para cualquier percance", 19900, px(3759742), "Primeros Auxilios", false],
        ["Tapabocas x10", "Quirúrgicos triple capa", 3900, px(3683074), "Primeros Auxilios", false],
        ["Termómetro digital", "Lectura en 10 segundos", 14900, px(5214316), "Primeros Auxilios", false],
        ["Pañales etapa 3 x10", "Ultra absorbentes", 15900, px(3771089), "Mamá y Bebé", false],
        ["Toallitas húmedas x80", "Sin alcohol, con manzanilla", 7900, px(2661591), "Mamá y Bebé", false],
        ["Crema para rozaduras", "Óxido de zinc, barrera protectora", 12900, px(1552109), "Mamá y Bebé", false],
      ],
    },
    {
      slug: "farmacia-central-24h", address: "Av. Hidalgo 899, Zona Centro, León, GTO", allowsPickup: true, name: "Farmacia Central 24h", description: "La farmacia de siempre, a cualquier hora",
      categorySlug: "farmacia", image: "/tiendas/farmacia-central.jpg", rating: 4.8, ratingCount: 8600, timeMin: 10, timeMax: 18,
      deliveryFee: 1900, distanceKm: 1.0, promo: "Envío gratis desde $230", tags: ["farmacia", "24h"],
      products: [
        ["Antigripal x6", "Para el resfrío completo", 6900, px(5214316), "Medicamentos", true],
        ["Analgésico nocturno x6", "Duerme sin dolor", 5900, px(3683098), "Medicamentos", false],
        ["Sales de rehidratación", "Sobre para preparar 1L", 3900, px(208512), "Medicamentos", false],
        ["Multivitamínico x30", "Energía para todo el mes", 18900, px(3759742), "Vitaminas", false],
        ["Magnesio x30", "Para calambres y sueño", 14900, px(4033148), "Vitaminas", false],
        ["Omega 3 x30", "Capsulas de aceite de pescado", 19900, px(5214316), "Vitaminas", false],
        ["Mascarilla facial", "Hidratante con ácido hialurónico", 5900, px(3785147), "Bienestar", false],
        ["Aceite esencial lavanda", "Para difusor o baño", 12900, px(3373736), "Bienestar", false],
        ["Sales de Epsom 1kg", "Baño relajante", 9900, px(5069432), "Bienestar", false],
      ],
    },
    // ================= BEBIDAS =================
    {
      slug: "bebidas-el-buho", address: "Calle Guanajuato 45, Col. Centro, León, GTO", allowsPickup: true, name: "Bebidas El Búho", description: "Cervezas, vinos y gaseosas bien frías",
      categorySlug: "bebidas", image: px(10701942), rating: 4.7, ratingCount: 1800, timeMin: 15, timeMax: 25,
      deliveryFee: 2900, distanceKm: 2.1, tags: ["licores", "cerveza", "vino"],
      products: [
        ["Sixpack Lager", "Cerveza lager bien fría", 18900, px(10701942), "Cervezas", true],
        ["IPA 500ml", "De la casa, con notas cítricas", 8900, px(996359), "Cervezas", false],
        ["Porter 500ml", "Oscura, con notas de café", 9500, px(2443192), "Cervezas", false],
        ["Sixpack sin alcohol", "Para los que conducen", 15900, px(1667913), "Cervezas", false],
        ["Vino tinto reserva", "Malbec, 750ml", 49900, px(391213), "Vinos y Licores", true],
        ["Vino blanco", "Sauvignon blanc, 750ml", 42900, px(1407846), "Vinos y Licores", false],
        ["Aguardiente 750ml", "El clásico de las reuniones", 42900, px(667203), "Vinos y Licores", false],
        ["Ron añejo 750ml", "8 años, para el saborear", 59900, px(774455), "Vinos y Licores", false],
        ["Tequila reposado 750ml", "100% agave", 89900, px(1479734), "Vinos y Licores", false],
        ["Gaseosa 2L", "Del sabor que quieras", 5900, px(1251913), "Gaseosas y Jugos", false],
        ["Jugo natural 1L", "Sin azúcar añadida", 7900, px(7271267), "Gaseosas y Jugos", false],
        ["Té helado 1.5L", "De durazno o limón", 6900, px(1340116), "Gaseosas y Jugos", false],
        ["Hielo 5kg", "Bolsa lista para la nevera", 5900, px(4154759), "Extras", false],
        ["Limones x1kg", "Para los micheladas", 3900, px(1435904), "Extras", false],
      ],
    },
    {
      slug: "licores-del-valle", address: "Blvd. Aeropuerto 850, Col. Las Américas, León, GTO", allowsPickup: false, name: "Licores del Valle", description: "Destilados premium y todo para coctelería",
      categorySlug: "bebidas", image: "/tiendas/licores-valle.jpg", rating: 4.7, ratingCount: 1200, timeMin: 25, timeMax: 40,
      deliveryFee: 3900, distanceKm: 3.1, tags: ["licores", "whisky", "cocteleria"],
      products: [
        ["Whisky 750ml", "Blended, 12 años", 99900, px(667203), "Destilados", true],
        ["Ginebra 750ml", "Con botánicos locales", 69900, px(1128602), "Destilados", false],
        ["Vodka 750ml", "Triple destilado", 54900, px(434311), "Destilados", false],
        ["Crema de whisky 750ml", "Para el café o sola", 47900, px(7810572), "Destilados", false],
        ["Caja artesanal x12", "Para compartir con los parceros", 34900, px(2443192), "Cervezas", false],
        ["Sixpack light 300ml", "Livianas para la charla", 14900, px(1667913), "Cervezas", false],
        ["Kit coctelería", "Limones, azúcar, hielo y menta", 14900, px(338713), "Coctelería", true],
        ["Angostura 200ml", "El toque final de todo coctel", 12900, px(6963043), "Coctelería", false],
      ],
    },
    // ================= SALUDABLE =================
    {
      slug: "green-bowl", address: "Av. Club de León 240, Col. Lomas, León, GTO", allowsPickup: true, name: "Green Bowl", description: "Bowls, ensaladas y jugos detox",
      categorySlug: "saludable", image: px(1640773), rating: 4.8, ratingCount: 2200, timeMin: 18, timeMax: 28,
      deliveryFee: 2500, distanceKm: 1.6, tags: ["saludable", "bowls", "vegano"],
      products: [
        ["Bowl Palta & Pollo", "Pollo grillado, aguacate, quinoa y crema de ajonjolí", 22900, px(1640773), "Bowls", true],
        ["Bowl Vegano", "Garbanzos crocantes, batata y kale", 19900, px(1059905), "Bowls", false],
        ["Salmón Poke", "Poke hawaiano con edamame y mango", 28900, px(3616950), "Bowls", true],
        ["Thai Chicken", "Pollo tailandés con maní y lime", 24900, px(2092906), "Bowls", false],
        ["César Light", "Lechuga romana, pollo y aderezo de yogurt", 18900, px(1213710), "Ensaladas", false],
        ["Mediterránea", "Quinoa, tomate, aceitunas y feta", 19900, px(566566), "Ensaladas", false],
        ["Ensalada de la casa", "Con vinagreta de frutos rojos", 17900, px(8585080), "Ensaladas", false],
        ["Jugo Detox 500ml", "Verde, con jengibre y limón", 8900, px(1340116), "Jugos y Detox", false],
        ["Naranja jengibre 500ml", "Recién exprimido", 7500, px(7271267), "Jugos y Detox", false],
        ["Smoothie berry 500ml", "Con yogur griego", 9900, px(1251913), "Jugos y Detox", false],
        ["Wrap de pollo", "Integral, con hummus", 16900, px(2282523), "Wraps", false],
        ["Wrap veggie", "Con aguacate y pesto", 14900, px(1640770), "Wraps", false],
      ],
    },
    {
      slug: "fit-fuel", address: "Av. Cerro Gordo 130, Lomas del Campestre, León, GTO", allowsPickup: false, name: "Fit Fuel", description: "Comida fitness con macronutrientes a la vista",
      categorySlug: "saludable", image: "/tiendas/fit-fuel.jpg", rating: 4.9, ratingCount: 1700, timeMin: 18, timeMax: 30,
      deliveryFee: 2500, distanceKm: 1.7, promo: "Snack gratis en combos", tags: ["fitness", "proteina", "saludable"],
      products: [
        ["Pollo, arroz y brócoli", "45g de proteína, el clásico del gym", 19900, px(3026474), "Proteicos", true],
        ["Bowl de res magra", "Con camote y espárragos", 24900, px(1092730), "Proteicos", false],
        ["Omelette proteico", "4 claras, espinaca y queso", 15900, px(2983101), "Proteicos", false],
        ["Waffles proteicos", "Con frutos rojos y miel", 16900, px(1446749), "Proteicos", false],
        ["Yogurt bowl con granola", "Con semillas y fruta", 12900, px(531058), "Bowls Fit", false],
        ["Overnight oats", "De la noche a la mañana", 9900, px(144112), "Bowls Fit", false],
        ["Barra proteica x2", "20g de proteína c/u", 8900, px(566566), "Snacks", false],
        ["Huevos duros x4", "Snack perfecto post-entreno", 5900, px(1627120), "Snacks", false],
        ["Mix de frutos secos 40g", "Energía inmediata", 5900, px(102104), "Snacks", false],
      ],
    },
    // ================= POSTRES =================
    {
      slug: "dulce-encanto", address: "Heroico Colegio Militar 77, Col. Jardines, León, GTO", allowsPickup: true, name: "Dulce Encanto", description: "Helados artesanales y postres para compartir",
      categorySlug: "postres", image: px(291528), rating: 4.9, ratingCount: 3100, timeMin: 15, timeMax: 25,
      deliveryFee: 2200, distanceKm: 1.4, promo: "Doble bola -20%", tags: ["postres", "helados", "tortas"],
      products: [
        ["Helado 2 bolas", "Sabores de la casa en barquillo o copa", 9900, px(1126359), "Helados", true],
        ["Pote familiar 500ml", "Para compartir en sofa", 19900, px(1352281), "Helados", false],
        ["Paletas artesanales x3", "De fruta natural", 8900, px(2292919), "Helados", false],
        ["Brownie con helado", "Caliente, con bola de vainilla", 10900, px(376464), "Helados", false],
        ["Torta de zanahoria", "Porción con frosting de queso", 7900, px(291528), "Tortas", false],
        ["Torta de chocolate", "Porción generosa, 70% cacao", 8900, px(1721932), "Tortas", false],
        ["Torta entera 8 porciones", "Para el cumpleaños sorpresa", 59900, px(2915246), "Tortas", true],
        ["Panqueques con frutos", "Con moras, miel y crema", 14900, px(376464), "Postres", false],
        ["Volcán de chocolate", "Con centro líquido", 11900, px(1071190), "Postres", false],
        ["Cheesecake de frutos", "Estilo Nueva York", 12900, px(3914884), "Postres", false],
      ],
    },
    {
      slug: "donas-coffee", address: "Av. María de la Torre 402, La Martinica, León, GTO", allowsPickup: true, name: "Donas & Coffee", description: "Donas recién hechas y café de especialidad",
      categorySlug: "postres", image: "/tiendas/donas-coffee.jpg", rating: 4.8, ratingCount: 5200, timeMin: 15, timeMax: 25,
      deliveryFee: 2200, distanceKm: 1.3, promo: "Docena -20%", tags: ["donas", "cafe", "desayuno"],
      products: [
        ["Donas glaseadas x4", "El clásico que nunca falla", 9900, px(2955821), "Donas", true],
        ["Donas de chocolate x4", "Con chispas o glaseado", 11900, px(2056135), "Donas", false],
        ["Donas rellenas x4", "De leche o arequipe", 12900, px(3977437), "Donas", false],
        ["Mini donas x8", "Para picar sin culpa", 13900, px(6516077), "Donas", false],
        ["Docena surtida", "Las 12 favoritas de la casa", 29900, px(5875018), "Donas", true],
        ["Espresso", "Doble, de origen", 3500, px(894695), "Café", false],
        ["Capuchino", "Con arte latte", 5500, px(851553), "Café", false],
        ["Latte", "Grande, con vainilla opcional", 5900, px(1233528), "Café", false],
        ["Café de origen 340g", "Para preparar en casa", 18900, px(2638715), "Café", false],
        ["Croissant mixto", "Jamón y queso", 7900, px(1600711), "Para Acompañar", false],
        ["Malteada oreo", "Con dona de regalo", 11900, px(5875018), "Para Acompañar", false],
      ],
    },
    // ================= MASCOTAS =================
    {
      slug: "petshop-amigos", address: "Av. Cerro Gordo 312, Lomas del Campestre, León, GTO", allowsPickup: true, name: "PetShop Amigos", description: "Todo para tu peludito, con mimo",
      categorySlug: "mascotas", image: px(1108099), rating: 4.8, ratingCount: 1500, timeMin: 20, timeMax: 30,
      deliveryFee: 2600, distanceKm: 2.0, tags: ["mascotas", "perros", "gatos"],
      products: [
        ["Alimento perro adulto 3kg", "Croquetas balanceadas, sabor res", 45900, px(1904108), "Perros", true],
        ["Alimento cachorro 3kg", "Para su primera etapa", 51900, px(1400172), "Perros", false],
        ["Snacks dentales x20", "Reducen el sarro", 12900, px(1350589), "Perros", false],
        ["Hueso de cuero", "Resistente, para horas", 8900, px(7210750), "Perros", false],
        ["Alimento gato 3kg", "Con salmón y taurina", 42900, px(617278), "Gatos", false],
        ["Sachets x12", "Húmedos, surtidos", 26900, px(1170986), "Gatos", false],
        ["Shampoo hipoalergénico 500ml", "Para pieles sensibles", 18900, px(1805164), "Higiene", false],
        ["Colonia para peludos", "Aroma suave y duradero", 12900, px(4587959), "Higiene", false],
        ["Arena aglomerante 4kg", "Control de olores", 18900, px(1904108), "Higiene", false],
        ["Pack juguetes perro", "Peluche, soga y pelota", 15900, px(1400172), "Juguetes", false],
        ["Ratón de juguete", "El clásico gatuno", 7900, px(2071882), "Juguetes", false],
        ["Pelota saltarina", "Para el parkour felino", 5900, px(589233), "Juguetes", false],
      ],
    },
    {
      slug: "gatito-boutique", address: "Zona Piel, Calle Pionilla 60, Col. Industrial, León, GTO", allowsPickup: false, name: "Gatito Boutique", description: "Boutique felina: premium y mimos",
      categorySlug: "mascotas", image: "/tiendas/gatito-boutique.jpg", rating: 4.9, ratingCount: 800, timeMin: 20, timeMax: 35,
      deliveryFee: 2600, distanceKm: 2.8, tags: ["mascotas", "gatos", "boutique"],
      products: [
        ["Premium salmón 3kg", "Sin granos, alto en proteína", 54900, px(1543793), "Alimentación", true],
        ["Esterilizados 3kg", "Control de peso y ph urinario", 49900, px(2589653), "Alimentación", false],
        ["Kitten 1.5kg", "Para los bebés", 36900, px(2071882), "Alimentación", false],
        ["Arena de sílica 3.6kg", "Dura hasta un mes", 27900, px(3359723), "Arena", false],
        ["Arena biodegradable 2.5kg", "De fibra de trigo", 24900, px(979247), "Arena", false],
        ["Churus x4", "Crema lickable, adictivos", 9900, px(1170986), "Snacks", true],
        ["Snacks dentales gato", "Para el aliento fresco", 8900, px(1183434), "Snacks", false],
        ["Torre rascador", "Tres niveles de diversión", 89900, px(2069803), "Juguetes", false],
        ["Caña con pluma", "Caza garantizada", 12900, px(979011), "Juguetes", false],
        ["Túnel felino", "Para esconderse y jugar", 29900, px(3359723), "Juguetes", false],
      ],
    },
  ];

  let totalProducts = 0;
  for (const s of storesData) {
    const [store] = await db
      .insert(restaurants)
      .values({
        name: s.name, slug: s.slug, description: s.description, categorySlug: s.categorySlug,
        image: s.image, rating: s.rating, ratingCount: s.ratingCount, timeMin: s.timeMin, timeMax: s.timeMax,
        deliveryFee: s.deliveryFee, distanceKm: s.distanceKm, promo: s.promo ?? null, tags: s.tags,
        isTurbo: s.isTurbo ?? false, address: s.address, allowsPickup: s.allowsPickup, isOpen: s.isOpen ?? true, featured: s.featured ?? false, sort: storesData.indexOf(s),
      })
      .returning();
    await db.insert(products).values(
      s.products.map((p, i) => ({
        restaurantId: store.id, name: p[0], description: p[1], price: p[2], image: p[3],
        section: p[4], popular: p[5], sort: i + 1,
      })),
    );
    totalProducts += s.products.length;
  }

  await db.insert(services).values([
    { name: "Barbería a Domicilio", slug: "barberia-a-domicilio", category: "belleza", provider: "Javier Ruiz — Barber Studio", proName: "Javier R.", description: "Corte y perfilado profesional en tu casa, con toalla caliente y acabado con navaja.", includes: ["Corte a tijera y máquina", "Perfilado de barba", "Toalla caliente y styling"], image: px(1570807), rating: 4.9, ratingCount: 820, price: 35000, durationMin: 45, domicilio: true, local: false, sort: 1 },
    { name: "Manicure & Pedicure", slug: "manicure-pedicure", category: "belleza", provider: "Bella Uñas Spa", proName: "Camila T.", description: "Spa completo de uñas con esmaltado de larga duración y diseño a tu gusto.", includes: ["Uñas en acrílico o semipermanente", "Spa de pies", "Decoración incluida"], image: px(3997379), rating: 4.8, ratingCount: 1240, price: 55000, durationMin: 75, sort: 2 },
    { name: "Masaje Relajante", slug: "masaje-relajante", category: "bienestar", provider: "Laura Gómez — Fisioterapeuta", proName: "Laura G.", description: "Masaje corporal descontracturante con aceites esenciales y musicoterapia.", includes: ["Masaje corporal 60 min", "Aceites esenciales", "Recomendaciones post-sesión"], image: px(3997993), rating: 5.0, ratingCount: 640, price: 80000, durationMin: 60, local: false, sort: 3 },
    { name: "Entrenador Personal", slug: "entrenador-personal", category: "bienestar", provider: "FitPro — Carlos Mera", proName: "Carlos M.", description: "Rutina personalizada en tu casa o en el parque, con plan nutricional básico.", includes: ["Rutina personalizada", "Plan nutricional básico", "Seguimiento semanal"], image: px(1552242), rating: 4.9, ratingCount: 480, price: 65000, durationMin: 60, sort: 4 },
    { name: "Yoga en Casa", slug: "yoga-en-casa", category: "bienestar", provider: "Valentina Restrepo — Yoga Lab", proName: "Valentina R.", description: "Sesión privada de yoga adaptada a tu nivel, con guía de respiración.", includes: ["Sesión 60 min", "Guía de respiración", "Plan de práctica semanal"], image: px(3822906), rating: 4.9, ratingCount: 350, price: 50000, durationMin: 60, local: false, sort: 5 },
    { name: "Peluquería Canina", slug: "peluqueria-canina", category: "mascotas", provider: "Pet Style", proName: "Andrea P.", description: "Baño, corte de raza y arreglo completo para tu peludito, sin estrés.", includes: ["Baño con shampoo especial", "Corte de raza", "Perfume y lazo final"], image: px(4587993), rating: 4.9, ratingCount: 910, price: 40000, durationMin: 50, sort: 6 },
    { name: "Veterinario a Domicilio", slug: "veterinario-a-domicilio", category: "mascotas", provider: "Dr. Andrés Rojas", proName: "Dr. Rojas", description: "Consulta general, vacunación y desparasitación sin salir de casa.", includes: ["Consulta general", "Vacunación", "Desparasitación"], image: px(6816856), rating: 4.8, ratingCount: 530, price: 70000, durationMin: 40, local: false, sort: 7 },
    { name: "Paseo de Perros", slug: "paseo-de-perros", category: "mascotas", provider: "Pet Walkers", proName: "Walker asignado", description: "Paseo seguro y divertido mientras trabajas, con reporte completo.", includes: ["Paseo 40 min", "Fotos del paseo", "Hidratación incluida"], image: px(1350589), rating: 4.9, ratingCount: 210, price: 25000, durationMin: 40, local: false, sort: 8 },
    { name: "Limpieza a Fondo", slug: "limpieza-a-fondo", category: "hogar", provider: "LimpiaMas", proName: "Equipo LimpiaMas", description: "Limpieza profunda de cocina y baños con productos incluidos.", includes: ["Cocina y baños a fondo", "Barrido y trapeado", "Productos incluidos"], image: px(4239146), rating: 4.7, ratingCount: 780, price: 90000, durationMin: 120, local: false, sort: 9 },
    { name: "Técnico del Hogar", slug: "tecnico-del-hogar", category: "hogar", provider: "Manitas Rápidas", proName: "Técnico certificado", description: "Instalaciones, lámparas y pequeños arreglos eléctricos.", includes: ["Revisión eléctrica", "Instalación de lámparas", "Pequeños arreglos"], image: px(2735913), rating: 4.8, ratingCount: 460, price: 60000, durationMin: 60, sort: 10 },
    { name: "Plomería Express", slug: "plomeria-express", category: "hogar", provider: "Manitas Rápidas", proName: "Plomero certificado", description: "Fugas, grifos y destapes resueltos en la primera visita.", includes: ["Revisión de fugas", "Instalación de grifos", "Destape de tuberías"], image: "/servicios/plomeria.jpg", rating: 4.8, ratingCount: 390, price: 55000, durationMin: 50, sort: 11 },
    { name: "Chef a Domicilio", slug: "chef-a-domicilio", category: "hogar", provider: "Chef Camila Ortiz", proName: "Chef Camila", description: "Cena de restaurante en tu casa: menú personalizado y cocina en vivo.", includes: ["Menú personalizado", "Cena para 2-6 personas", "Compra de insumos incluida"], image: px(884631), rating: 5.0, ratingCount: 150, price: 180000, durationMin: 120, sort: 12 },
    { name: "Médico a Domicilio", slug: "medico-a-domicilio", category: "salud", provider: "Dr. Carolina Restrepo — Medicina General", proName: "Dra. Restrepo", description: "Consulta médica general en casa: revisión completa, fórmulas y remisiones.", includes: ["Consulta general completa", "Expedición de fórmulas", "Remisiones si se requieren"], image: px(5452201), rating: 4.9, ratingCount: 640, price: 60000, durationMin: 40, domicilio: true, local: false, sort: 13 },
    { name: "Enfermería a Domicilio", slug: "enfermeria-a-domicilio", category: "salud", provider: "Enfermeras Rayte", proName: "Enfermera asignada", description: "Inyectológicas, curaciones, tomas de laboratorio y cuidado en casa.", includes: ["Aplicación de inyectables", "Curaciones y vendajes", "Toma de muestras de laboratorio"], image: px(6492318), rating: 4.9, ratingCount: 480, price: 45000, durationMin: 45, domicilio: true, local: false, sort: 14 },
    { name: "Nutricionista", slug: "nutricionista", category: "salud", provider: "NutriVida — Diana Salas", proName: "Diana S.", description: "Plan de alimentación personalizado con seguimiento mensual.", includes: ["Valoración nutricional", "Plan de alimentación personalizado", "Seguimiento mensual"], image: px(566566), rating: 4.8, ratingCount: 320, price: 55000, durationMin: 60, sort: 15 },
    { name: "Psicología a Domicilio", slug: "psicologia-a-domicilio", category: "salud", provider: "Mente Serena — David Cano", proName: "David C.", description: "Sesión de terapia individual en la comodidad de tu casa.", includes: ["Sesión de 55 min", "Total confidencialidad", "Plan de trabajo personalizado"], image: px(3757963), rating: 5.0, ratingCount: 260, price: 75000, durationMin: 55, domicilio: true, local: false, sort: 16 },
  ]);

  await db.insert(drivers).values([
    { name: "Andrés M.", vehicle: "Moto", plate: "RY-421", rating: 4.9, trips: 2350 },
    { name: "Carolina R.", vehicle: "Moto", plate: "RY-133", rating: 4.8, trips: 1890 },
    { name: "Jorge L.", vehicle: "Carro", plate: "RY-809", rating: 4.9, trips: 3120 },
    { name: "María F.", vehicle: "Carro XL", plate: "RY-265", rating: 4.7, trips: 990 },
  ]);

  // Conversión a pesos mexicanos (MXN): escala real de México
  await db.execute(sql`UPDATE products SET price = GREATEST(10, ROUND(price * 0.0046 / 5) * 5)`);
  await db.execute(sql`UPDATE services SET price = GREATEST(20, ROUND(price * 0.0046 / 5) * 5)`);
  await db.execute(sql`UPDATE restaurants SET delivery_fee = GREATEST(0, ROUND(delivery_fee * 0.0046))`);

  console.log(`✓ precios convertidos a MXN`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
