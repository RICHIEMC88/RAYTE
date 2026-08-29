/* Siembra cuentas de socios y dueños para cada negocio de cualquier rubro.
   Ejecutar: npx tsx src/db/seed-partners.ts */
import "dotenv/config";
import { db, pool } from "./index";
import { restaurants, partnerAccounts } from "./schema";

type PartnerSeed = {
  slug: string;
  username: string;
  partnerName: string;
  email: string;
  phone: string;
  password: string;
};

const PARTNERS: PartnerSeed[] = [
  // === RESTAURANTES ===
  {
    slug: "patio-de-humo-asadero-time",
    username: "patiodehumo",
    partnerName: "Don Héctor Valdés · Maestro Asador Propietario",
    email: "socio@patiodehumo.com",
    phone: "477 888 1234",
    password: "socio123",
  },
  {
    slug: "la-brasa-smash",
    username: "labrasa",
    partnerName: "Carlos Morales · Propietario",
    email: "socio@labrasasmash.com",
    phone: "477 234 5678",
    password: "socio123",
  },
  {
    slug: "panaderia-la-espiga",
    username: "laespiga",
    partnerName: "Don Mateo Espinoza · Maestro Panadero",
    email: "socio@laespiga.com",
    phone: "477 345 6789",
    password: "socio123",
  },
  {
    slug: "pizza-nonna",
    username: "pizzanonna",
    partnerName: "Nonna Gina & Marco · Fundadores",
    email: "socio@pizzanonna.com",
    phone: "477 456 7890",
    password: "socio123",
  },
  {
    slug: "sushi-neko",
    username: "sushineko",
    partnerName: "Chef Kenji Tanaka · Dueño",
    email: "socio@sushineko.com",
    phone: "477 567 8901",
    password: "socio123",
  },
  {
    slug: "pollo-crack",
    username: "pollocrack",
    partnerName: "Valeria Salazar · Gerente Propietaria",
    email: "socio@pollocrack.com",
    phone: "477 678 9012",
    password: "socio123",
  },
  {
    slug: "tacos-el-farol",
    username: "tacoselfarol",
    partnerName: "Don Ramón Farías · Taquero Propietario",
    email: "socio@tacoselfarol.com",
    phone: "477 789 0123",
    password: "socio123",
  },

  // === MERCADO ===
  {
    slug: "mercadito-fresco",
    username: "mercaditofresco",
    partnerName: "Lucía Gómez · Administradora",
    email: "socio@mercaditofresco.com",
    phone: "477 890 1234",
    password: "socio123",
  },
  {
    slug: "surtimarket-express",
    username: "surtimarket",
    partnerName: "Roberto Vargas · Dueño",
    email: "socio@surtimarket.com",
    phone: "477 901 2345",
    password: "socio123",
  },

  // === TURBO ===
  {
    slug: "turbo-rayte",
    username: "turborayte",
    partnerName: "Gerencia Hub Turbo Rayte León",
    email: "hub@turborayte.com",
    phone: "477 111 2233",
    password: "socio123",
  },

  // === FARMACIA ===
  {
    slug: "drogueria-mi-salud",
    username: "misalud",
    partnerName: "Dra. Maricarmen Prado · QFB Responsable",
    email: "socio@misalud.com",
    phone: "477 222 3344",
    password: "socio123",
  },
  {
    slug: "farmacia-central-24h",
    username: "farmaciacentral",
    partnerName: "Lic. Fernando Corona · Director",
    email: "socio@farmaciacentral.com",
    phone: "477 333 4455",
    password: "socio123",
  },

  // === BEBIDAS ===
  {
    slug: "bebidas-el-buho",
    username: "bebidaselbuho",
    partnerName: "Héctor Buendía · Dueño",
    email: "socio@bebidaselbuho.com",
    phone: "477 444 5566",
    password: "socio123",
  },
  {
    slug: "licores-del-valle",
    username: "licoresdelvalle",
    partnerName: "Mauricio del Valle · Socio Fundador",
    email: "socio@licoresdelvalle.com",
    phone: "477 555 6677",
    password: "socio123",
  },

  // === SALUDABLE ===
  {
    slug: "green-bowl",
    username: "greenbowl",
    partnerName: "Nutr. Andrea Rosas · Fundadora",
    email: "socio@greenbowl.com",
    phone: "477 666 7788",
    password: "socio123",
  },
  {
    slug: "fit-fuel",
    username: "fitfuel",
    partnerName: "Coach Daniel Herrera · Propietario",
    email: "socio@fitfuel.com",
    phone: "477 777 8899",
    password: "socio123",
  },

  // === POSTRES ===
  {
    slug: "dulce-encanto",
    username: "dulceencanto",
    partnerName: "Chef Sofía Morales · Repostera",
    email: "socio@dulceencanto.com",
    phone: "477 888 9900",
    password: "socio123",
  },
  {
    slug: "donas-coffee",
    username: "donascoffee",
    partnerName: "Javier Orozco · Barista Dueño",
    email: "socio@donascoffee.com",
    phone: "477 999 0011",
    password: "socio123",
  },

  // === MASCOTAS ===
  {
    slug: "petshop-amigos",
    username: "petshopamigos",
    partnerName: "Dra. Camila Lara · MVZ Dueña",
    email: "socio@petshopamigos.com",
    phone: "477 123 9988",
    password: "socio123",
  },
  {
    slug: "gatito-boutique",
    username: "gatitoboutique",
    partnerName: "Lorena Krauss · Propietaria",
    email: "socio@gatitoboutique.com",
    phone: "477 234 8877",
    password: "socio123",
  },
];

async function main() {
  console.log("🌱 Sembrando cuentas de socios y restaurantes...");
  const allStores = await db.select().from(restaurants);
  await db.delete(partnerAccounts);

  let createdCount = 0;
  for (const store of allStores) {
    const seed = PARTNERS.find((p) => p.slug === store.slug);
    const username = seed?.username || store.slug.replace(/[^a-z0-9]/g, "");
    const partnerName = seed?.partnerName || `Socio Titular · ${store.name}`;
    const email = seed?.email || `socio@${store.slug}.com`;
    const phone = seed?.phone || "477 100 0000";
    const password = seed?.password || "socio123";

    await db.insert(partnerAccounts).values({
      restaurantId: store.id,
      username,
      partnerName,
      email,
      phone,
      password,
    });
    createdCount++;
  }

  console.log(`✓ ${createdCount} cuentas de socios creadas con éxito (contraseña por defecto: socio123)`);
  await pool.end();
}

main();
