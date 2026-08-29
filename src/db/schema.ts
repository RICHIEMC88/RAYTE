import { pgTable, serial, integer, varchar, text, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  icon: varchar("icon", { length: 40 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  bg: varchar("bg", { length: 20 }).notNull(),
  sort: integer("sort").notNull().default(0),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 90 }).notNull(),
  slug: varchar("slug", { length: 90 }).notNull().unique(),
  description: text("description").notNull().default(""),
  categorySlug: varchar("category_slug", { length: 60 }).notNull(),
  image: text("image").notNull(),
  rating: real("rating").notNull().default(4.5),
  ratingCount: integer("rating_count").notNull().default(500),
  timeMin: integer("time_min").notNull().default(20),
  timeMax: integer("time_max").notNull().default(35),
  deliveryFee: integer("delivery_fee").notNull().default(2500),
  distanceKm: real("distance_km").notNull().default(1.5),
  promo: varchar("promo", { length: 60 }),
  tags: text("tags").array().notNull().default([]),
  isTurbo: boolean("is_turbo").notNull().default(false),
  address: varchar("address", { length: 180 }).notNull().default(""),
  allowsPickup: boolean("allows_pickup").notNull().default(true),
  isOpen: boolean("is_open").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  image: text("image"),
  section: varchar("section", { length: 60 }).notNull().default("General"),
  popular: boolean("popular").notNull().default(false),
  available: boolean("available").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

/* Extras / complementos configurables para los platillos y restaurantes */
export const productExtras = pgTable("product_extras", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 90 }).notNull(),
  price: integer("price").notNull(),
  available: boolean("available").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export type UploadedDocument = {
  name: string;
  url: string;
  type: string;
  size: number;
};

export type MedicalVerificationDocs = {
  certificate: UploadedDocument | null;
  diploma: UploadedDocument | null;
  professionalLicense: UploadedDocument | null;
  professionalLicenseNumber: string;
  ine: UploadedDocument | null;
  uploadedAt: string;
};

export type ClinicalSnapshot = {
  weightKg?: number;
  heightCm?: number;
  temperatureC?: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  oxygenSat?: number;
  glucoseMgDl?: number;
  updatedAt?: string;
};

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 90 }).notNull(),
  slug: varchar("slug", { length: 90 }).notNull().unique(),
  category: varchar("category", { length: 30 }).notNull(),
  provider: varchar("provider", { length: 90 }).notNull(),
  proName: varchar("pro_name", { length: 90 }).notNull(),
  description: text("description").notNull().default(""),
  includes: text("includes").array().notNull().default([]),
  image: text("image").notNull(),
  rating: real("rating").notNull().default(4.8),
  ratingCount: integer("rating_count").notNull().default(300),
  price: integer("price").notNull(),
  durationMin: integer("duration_min").notNull().default(60),
  domicilio: boolean("domicilio").notNull().default(true),
  local: boolean("local").notNull().default(true),
  available: boolean("available").notNull().default(true),
  verificationDocs: jsonb("verification_docs").$type<MedicalVerificationDocs | null>(),
  sort: integer("sort").notNull().default(0),
});

/* Menú de servicios de cada negocio de citas (el usuario elige uno al agendar) */
export const serviceOptions = pgTable("service_options", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 90 }).notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  durationMin: integer("duration_min").notNull(),
  popular: boolean("popular").notNull().default(false),
  sort: integer("sort").notNull().default(0),
});

export const appointments = pgTable("appointments", {
  id: varchar("id", { length: 40 }).primaryKey(),
  code: varchar("code", { length: 12 }).notNull(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  serviceName: varchar("service_name", { length: 90 }).notNull(),
  serviceImage: text("service_image"),
  /* Servicio específico elegido del menú del negocio */
  optionName: varchar("option_name", { length: 90 }),
  customerName: varchar("customer_name", { length: 90 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  mode: varchar("mode", { length: 20 }).notNull(),
  address: text("address"),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  price: integer("price").notNull(),
  proName: varchar("pro_name", { length: 90 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  rating: integer("rating"),
  notes: text("notes"),
  /* Solicitud detallada del paciente (categoría salud): síntomas, alergias, etc. */
  intake: jsonb("intake").$type<{ edad?: string; sintomas?: string; alergias?: string; medicamentos?: string } | null>(),
  clinicalSnapshot: jsonb("clinical_snapshot").$type<ClinicalSnapshot | null>(),
  /* Expediente: nota clínica / bitácora que escribe el profesional (diagnóstico, receta, seguimiento) */
  proNotes: text("pro_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* Tabla de repartidores/conductores (la importaba seed.ts pero faltaba en la reconstrucción) */
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 90 }).notNull(),
  vehicle: varchar("vehicle", { length: 40 }).notNull(),
  plate: varchar("plate", { length: 12 }).notNull(),
  rating: real("rating").notNull().default(4.8),
  trips: integer("trips").notNull().default(1000),
  photo: text("photo"),
  active: boolean("active").notNull().default(true),
});

/* ── Cuentas de Socios y Dueños de Negocios (Login individual por restaurante) ── */
export const partnerAccounts = pgTable("partner_accounts", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 60 }).notNull().unique(),
  partnerName: varchar("partner_name", { length: 90 }).notNull(),
  email: varchar("email", { length: 120 }).notNull().unique(),
  password: varchar("password", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ── Usuarios y sesiones (login/registro real) ── */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 90 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull().unique(),
  address: text("address").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 80 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/* ── Pedidos reales en la base de datos ── */
export type OrderItem = {
  key: string; productId: number; name: string; price: number;
  image: string | null; qty: number; notes?: string; options?: string;
};

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 12 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  restaurantName: varchar("restaurant_name", { length: 90 }).notNull(),
  restaurantSlug: varchar("restaurant_slug", { length: 90 }).notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  serviceFee: integer("service_fee").notNull().default(0),
  tip: integer("tip").notNull().default(0),
  total: integer("total").notNull(),
  customerName: varchar("customer_name", { length: 90 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  address: text("address").notNull(),
  payment: varchar("payment", { length: 40 }).notNull(),
  /* placed → preparing → ready → on_way → delivered */
  status: varchar("status", { length: 20 }).notNull().default("placed"),
  /* true cuando la tienda o un conductor lo gestionan a mano (apaga el autopiloto) */
  manual: boolean("manual").notNull().default(false),
  driverId: integer("driver_id").references(() => drivers.id, { onDelete: "set null" }),
  etaMin: integer("eta_min").notNull().default(25),
  etaMax: integer("eta_max").notNull().default(40),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  preparingAt: timestamp("preparing_at", { withTimezone: true }),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  onWayAt: timestamp("on_way_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  rating: integer("rating"),
});

export type Category = typeof categories.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductExtra = typeof productExtras.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceOption = typeof serviceOptions.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type PartnerAccount = typeof partnerAccounts.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type DbOrder = typeof orders.$inferSelect;
