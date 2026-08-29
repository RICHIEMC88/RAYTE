/* Siembra extras y complementos personalizables para los restaurantes.
   Ejecutar: npx tsx src/db/seed-extras.ts (idempotente) */
import "dotenv/config";
import { db, pool } from "./index";
import { restaurants, productExtras } from "./schema";

/* [nombre, precio MXN] */
type ExtraSeed = [string, number];

const RESTAURANT_EXTRAS: Record<string, ExtraSeed[]> = {
  // === RESTAURANTES ===
  "patio-de-humo-asadero-time": [
    ["Aguacate hass fresco en láminas", 22],
    ["Cebollitas cambray asadas extra", 18],
    ["Chicharrón de queso manchego", 28],
    ["Costra de queso asado para taco", 20],
    ["Frijoles charros individuales extra", 25],
    ["Guacamole artesanal con totopos", 28],
    ["Nopal asado con orégano x2", 16],
    ["Orden de tortillas recién hechas (10 pzs)", 15],
    ["Papas a la francesa sazonadas", 28],
    ["Queso gouda gratinado extra", 22],
    ["Salsa macha artesanal de chile de árbol", 12],
    ["Tuétano asado individual a la leña", 35],
  ],
  "la-brasa-smash": [
    ["Queso gouda gratinado", 18],
    ["Tocino ahumado crujiente", 22],
    ["Aguacate hass fresco", 20],
    ["Carne smash extra (100g)", 38],
    ["Papas a la francesa sazonadas", 28],
    ["Aderezo secreto de la casa", 12],
    ["Jalapeños toreados", 10],
    ["Cebolla caramelizada al bourbon", 14],
  ],
  "pizza-nonna": [
    ["Queso mozzarella extra", 25],
    ["Pepperoni crujiente extra", 25],
    ["Champiñones frescos salteados", 20],
    ["Orilla rellena de queso gouda", 35],
    ["Salsa de ajo y parmesano", 15],
    ["Chimichurri de la Nonna", 12],
    ["Hojuelas de chile peperoncino", 8],
  ],
  "sushi-neko": [
    ["Queso crema Philadelphia extra", 16],
    ["Aguacate fresco extra", 18],
    ["Salsa tampico de cangrejo", 24],
    ["Salsa anguila dulce artesanal", 12],
    ["Chiles serranos toreados con soya", 10],
    ["Cebollín fresco y ajonjolí tostado", 8],
    ["Porción de aderezo chipotle dulce", 12],
  ],
  "pollo-crack": [
    ["Salsa BBQ Habanero extra", 12],
    ["Aderezo Ranch cremoso casero", 14],
    ["Papas gajo crujientes con paprika", 26],
    ["Apio y zanahoria fresca con dip", 12],
    ["Queso cheddar líquido caliente", 16],
    ["Aros de cebolla crujientes x4", 28],
  ],
  "tacos-el-farol": [
    ["Costra de queso asado", 22],
    ["Guacamole artesanal con totopos", 25],
    ["Cebollitas cambray asadas", 15],
    ["Chicharrón de queso crujiente", 28],
    ["Salsa macha de chile de árbol", 10],
    ["Nopal asado con orégano", 12],
    ["Papas al horno con mantequilla", 20],
  ],

  // === PANADERÍAS ===
  "panaderia-la-espiga": [
    ["Nutella para untar (porción)", 16],
    ["Mermelada de fresa artesanal", 12],
    ["Mantequilla de rancho con sal", 10],
    ["Cajeta quemada de Celaya", 15],
    ["Vaso de leche fría 250ml", 14],
    ["Topping de canela y azúcar mascabado", 6],
  ],

  // === SALUDABLE ===
  "green-bowl": [
    ["Pollo a la plancha extra (100g)", 32],
    ["Aguacate hass en cubos", 18],
    ["Huevo cocido orgánico", 14],
    ["Semillas de chía y cáñamo tostadas", 12],
    ["Aderezo de cilantro y limón", 10],
    ["Queso feta desmoronado", 18],
  ],
  "fit-fuel": [
    ["Scoop de proteína aislada whey", 30],
    ["Crema de cacahuate 100% natural", 15],
    ["Almendras fileteadas", 14],
    ["Arándanos y goji berries", 16],
    ["Shot de jengibre y cúrcuma", 18],
  ],

  // === POSTRES ===
  "dulce-encanto": [
    ["Bola de helado de vainilla francesa", 22],
    ["Topping de chocolate belga líquido", 14],
    ["Fresas frescas picadas", 16],
    ["Crema batida chantilly casera", 10],
    ["Nuez pecana garapiñada", 14],
  ],
  "donas-coffee": [
    ["Dip de dulce de leche", 12],
    ["Dip de chocolate amargo", 12],
    ["Shot de espresso extra", 15],
    ["Jarabe de vainilla para café", 10],
    ["Leche de almendras / avena", 12],
  ],

  // === TURBO ===
  "turbo-rayte": [
    ["Salsa picante botanera extra", 8],
    ["Limones con sal para botana", 6],
    ["Vaso con hielo sellado", 10],
    ["Servilletas y cubiertos ecológicos", 4],
  ],

  // === BEBIDAS ===
  "bebidas-el-buho": [
    ["Bolsa de hielo purificado 3kg", 25],
    ["Vaso escarchado con chamoy y miguelito", 18],
    ["Limones frescos x4", 12],
    ["Refresco de toronja 600ml", 18],
  ],
  "licores-del-valle": [
    ["Bolsa de hielo purificado 3kg", 25],
    ["Agua mineral de manantial 600ml", 20],
    ["Vasos térmicos x10", 22],
  ],

  // === MERCADO ===
  "mercadito-fresco": [
    ["Bolsa ecológica reutilizable", 15],
    ["Empaque térmico para frescos", 12],
  ],
  "surtimarket-express": [
    ["Bolsa ecológica reutilizable", 15],
    ["Empaque protector para botellas", 10],
  ],

  // === FARMACIA ===
  "drogueria-mi-salud": [
    ["Empaque confidencial discreto", 0],
    ["Bolsa con sello de seguridad", 5],
  ],
  "farmacia-central-24h": [
    ["Empaque confidencial discreto", 0],
    ["Bolsa con sello de seguridad", 5],
  ],

  // === MASCOTAS ===
  "petshop-amigos": [
    ["Snack / premio sorpresa para perro", 20],
    ["Snack / premio sorpresa para gato", 20],
    ["Bolsitas biodegradables para heces x1 rollo", 25],
  ],
  "gatito-boutique": [
    ["Porción de Catnip orgánico", 25],
    ["Premio cremoso para gato Churu", 22],
  ],
};

async function main() {
  console.log("🌱 Sembrando extras y complementos de restaurantes...");
  const allStores = await db.select().from(restaurants);
  await db.delete(productExtras);

  let totalExtras = 0;
  for (const store of allStores) {
    const list = RESTAURANT_EXTRAS[store.slug];
    if (!list || list.length === 0) continue;

    await db.insert(productExtras).values(
      list.map(([name, price], i) => ({
        restaurantId: store.id,
        productId: null, // aplica a nivel restaurante/platillos
        name,
        price,
        available: true,
        sort: i,
      })),
    );
    totalExtras += list.length;
  }

  console.log(`✓ ${totalExtras} extras sembrados para ${allStores.length} restaurantes/tiendas`);
  await pool.end();
}

main();
