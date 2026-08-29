/* Siembra el menú de servicios de cada negocio de citas.
   Ejecutar: npx tsx src/db/seed-options.ts (idempotente) */
import "dotenv/config";
import { db, pool } from "./index";
import { services, serviceOptions } from "./schema";

/* [nombre, descripción, precio MXN, duración min, popular] */
type Opt = [string, string, number, number, boolean?];

const MENU: Record<string, Opt[]> = {
  "barberia-a-domicilio": [
    ["Corte clásico", "Tijera y máquina, acabado con navaja", 160, 45, true],
    ["Corte + barba", "Corte completo y ritual de barba con toalla caliente", 230, 60],
    ["Rapado con diseño", "Máquina al gusto con diseño libre", 140, 30],
    ["Corte niño", "Para peques de 3 a 12 años", 120, 30],
    ["Arreglo de barba", "Perfilado, hidratación y aceite", 110, 25],
  ],
  "manicure-pedicure": [
    ["Manicure clásico", "Limado, cutícula y esmalte tradicional", 180, 45],
    ["Pedicure spa", "Exfoliación, hidratación y esmalte", 255, 60, true],
    ["Manicure + Pedicure", "Combo completo con masaje de manos y pies", 390, 90],
    ["Uñas acrílicas", "Aplicación completa con diseño sencillo", 420, 90],
    ["Gelish", "Esmaltado semipermanente hasta 3 semanas", 260, 60],
  ],
  "masaje-relajante": [
    ["Masaje relajante 60 min", "Cuerpo completo con aceites esenciales", 370, 60, true],
    ["Descontracturante", "Presión profunda en espalda y cuello", 420, 60],
    ["Piedras calientes", "Ritual de 75 minutos con piedras volcánicas", 520, 75],
    ["Masaje express", "Espalda y cuello en 30 minutos", 240, 30],
    ["Masaje en pareja", "Dos personas, misma sesión", 690, 60],
  ],
  "entrenador-personal": [
    ["Sesión funcional", "Entrenamiento adaptado a tu nivel", 300, 60, true],
    ["Rutina de fuerza", "Pesas y técnica con seguimiento", 320, 60],
    ["HIIT express", "Cardio intenso en 30 minutos", 220, 30],
    ["Valoración + plan mensual", "Medición, metas y rutina personalizada", 450, 90],
  ],
  "yoga-en-casa": [
    ["Hatha yoga", "Ritmo suave, ideal para empezar", 230, 60, true],
    ["Vinyasa flow", "Secuencias dinámicas con respiración", 250, 60],
    ["Yoga restaurativo", "75 min de relajación profunda", 260, 75],
    ["Meditación guiada", "Respiración y mindfulness en 40 min", 180, 40],
  ],
  "peluqueria-canina": [
    ["Baño y secado", "Shampoo según tipo de pelo", 185, 50, true],
    ["Corte de raza", "Estilo según estándar de la raza", 260, 75],
    ["Baño + corte de uñas", "Incluye limpieza de oídos", 210, 60],
    ["Deslanado", "Retiro de pelo muerto, ideal en muda", 290, 80],
  ],
  "veterinario-a-domicilio": [
    ["Consulta general", "Revisión completa en casa", 320, 40, true],
    ["Vacunación", "Aplicación con cartilla al día", 280, 30],
    ["Desparasitación", "Interna y externa según peso", 240, 30],
    ["Consulta + vacuna", "Combo de revisión y aplicación", 480, 60],
  ],
  "paseo-de-perros": [
    ["Paseo 40 min", "Ruta segura con reporte y fotos", 115, 40, true],
    ["Paseo 1 hora", "Más tiempo de juego y ejercicio", 160, 60],
    ["Paseo doble", "Dos perritos del mismo hogar", 190, 40],
    ["Paseo + juegos", "Incluye sesión de pelota en parque", 210, 60],
  ],
  "limpieza-a-fondo": [
    ["Limpieza estándar", "Depa o casa chica, 2 horas", 415, 120, true],
    ["Limpieza profunda", "Rincones, zoclos y electrodomésticos", 620, 180],
    ["Cocina y baños", "Desengrase y desinfección a detalle", 350, 90],
    ["Post-obra", "Después de remodelación o pintura", 780, 240],
  ],
  "tecnico-del-hogar": [
    ["Diagnóstico general", "Revisión y presupuesto en sitio", 275, 60, true],
    ["Instalación de pantalla", "Montaje en muro con soporte", 320, 60],
    ["Reparación eléctrica", "Contactos, apagadores y cortos", 380, 90],
    ["Armado de muebles", "Ensamble de muebles en caja", 300, 75],
  ],
  "plomeria-express": [
    ["Fuga o destape", "Solución en la primera visita", 255, 50, true],
    ["Cambio de grifo", "Retiro e instalación de mezcladora", 290, 60],
    ["Instalación de WC", "Retiro del anterior incluido", 420, 90],
    ["Revisión general", "Chequeo de tuberías y presión", 200, 40],
  ],
  "chef-a-domicilio": [
    ["Cena romántica (2 personas)", "Menú de 3 tiempos con maridaje", 830, 120, true],
    ["Comida familiar (6 personas)", "Menú casero de 3 tiempos", 1250, 180],
    ["Parrillada (8 personas)", "Cortes, guarniciones y salsas", 1450, 180],
    ["Clase de cocina", "Aprende un menú completo en tu cocina", 690, 120],
  ],
  "medico-a-domicilio": [
    ["Consulta general", "Valoración completa en casa", 275, 40, true],
    ["Consulta + receta", "Incluye receta y plan de tratamiento", 320, 50],
    ["Certificado médico", "Escolar, laboral o deportivo", 250, 30],
    ["Sueros y vitaminas", "Aplicación IV con valoración previa", 380, 45],
  ],
  "enfermeria-a-domicilio": [
    ["Aplicación de inyección", "Intramuscular o subcutánea", 150, 30],
    ["Curaciones", "Limpieza y vendaje de heridas", 205, 45, true],
    ["Signos vitales + glucosa", "Chequeo completo con reporte", 180, 30],
    ["Cuidado por hora", "Acompañamiento de paciente", 260, 60],
  ],
  "nutricionista": [
    ["Primera consulta + plan", "Evaluación completa y plan de alimentación", 255, 60, true],
    ["Consulta de seguimiento", "Ajustes a tu plan y mediciones", 200, 40],
    ["Plan deportivo", "Nutrición para rendimiento físico", 320, 75],
    ["Medición corporal", "Peso, grasa, músculo e hidratación", 150, 30],
  ],
  "psicologia-a-domicilio": [
    ["Sesión individual", "Terapia uno a uno, 55 minutos", 345, 55, true],
    ["Terapia de pareja", "Sesión de 75 minutos", 480, 75],
    ["Primera valoración", "Conoce a tu terapeuta y define objetivos", 300, 60],
    ["Sesión juvenil", "Adolescentes de 12 a 17 años", 320, 50],
  ],
};

async function main() {
  console.log("🌱 Sembrando menú de servicios por negocio...");
  const all = await db.select().from(services);
  await db.delete(serviceOptions);
  let count = 0;
  for (const svc of all) {
    const opts = MENU[svc.slug];
    if (!opts) continue;
    await db.insert(serviceOptions).values(
      opts.map(([name, description, price, durationMin, popular], i) => ({
        serviceId: svc.id,
        name,
        description,
        price,
        durationMin,
        popular: !!popular,
        sort: i,
      })),
    );
    count += opts.length;
  }
  console.log(`✓ ${count} servicios creados para ${Object.keys(MENU).length} negocios`);
  await pool.end();
}

main();
