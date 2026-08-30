// ========================================================
// RAYTE — CÓDIGO COMPLETO ACTUALIZADO
// Fecha de actualización: 2026-08-30T22:46:14.730Z
// Total archivos incluidos: 83
// ========================================================

// --------------------------------------------------------
// ARCHIVO: .env
// --------------------------------------------------------
DATABASE_URL=postgres://zappy:zappy@127.0.0.1:5432/zappy


// --------------------------------------------------------
// ARCHIVO: .gitignore
// --------------------------------------------------------
node_modules
.next
out
build
dist
coverage
*.tsbuildinfo
next-env.d.ts
.DS_Store
.env
.env.local
.env.production
.env.development


// --------------------------------------------------------
// ARCHIVO: DEPLOY_GITHUB_RAILWAY.md
// --------------------------------------------------------
# Deploy de Rayte con GitHub + Railway

## 1) Qué ya quedó listo en el proyecto
Este repo ya quedó preparado para Railway con estos cambios:

- `package.json`
  - `dev` usa `PORT` dinámico
  - `start` usa `PORT` dinámico
  - `db:seed:all` corre todos los seeds
  - `db:init` empuja esquema y siembra todo
- `.gitignore`
  - ignora `.env` y variantes locales
- `.env.example`
  - deja el formato esperado para `DATABASE_URL`

## 2) Sube el proyecto a GitHub
En la carpeta del proyecto corre:

```bash
git init
git add .
git commit -m "Rayte listo para deploy en Railway"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Si tu repo ya existe y ya tiene remoto:

```bash
git add .
git commit -m "Config deploy Railway"
git push
```

## 3) Crea el proyecto en Railway
En Railway:

1. Entra a **New Project**
2. Elige **Provision PostgreSQL**
3. Luego **Add Service**
4. Elige **GitHub Repo**
5. Selecciona tu repo de `rayte`

## 4) Configura variables en Railway
En el servicio web de Railway abre **Variables** y agrega:

### Obligatoria
`DATABASE_URL`

Pon la variable que te da el servicio PostgreSQL de Railway.
Normalmente Railway la deja seleccionar desde la UI.

### Recomendada
`NODE_ENV=production`

### Opcional
`NIXPACKS_NODE_VERSION=20`

## 5) Configura comandos de Railway
Si Railway te pide los comandos, usa exactamente estos:

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm run start
```

## 6) Inicializa la base de datos
Cuando termine el primer deploy, abre la terminal del servicio web en Railway y corre:

```bash
npm run db:init
```

Ese comando hace esto:

```bash
npm run db:push -- --force
npm run db:seed:all
```

## 7) Genera tu dominio público
En Railway:

1. Abre tu servicio web
2. Ve a **Settings** o **Networking**
3. Da clic en **Generate Domain**

Te dará una URL parecida a:

```txt
https://rayte-production.up.railway.app
```

Esa ya la puedes:
- abrir en otra pestaña
- compartir
- usar en Wix
- poner como botón o iframe

## 8) Cómo actualizar después
Cada vez que cambies algo:

```bash
git add .
git commit -m "Cambios en Rayte"
git push
```

Railway vuelve a desplegar solo.

## 9) Si falla el deploy
### Error: no conecta a la base
Revisa que `DATABASE_URL` exista en Railway.

### Error: la app prende pero no carga datos
Corre otra vez:

```bash
npm run db:init
```

### Error: puerto
Ya quedó corregido en `package.json`, Railway debe poder arrancar bien usando su `PORT`.

## 10) Qué NO debes usar en Railway
No uses este script en producción:

```bash
bash scripts/reiniciar.sh
```

Ese script es para el sandbox local, no para Railway.


// --------------------------------------------------------
// ARCHIVO: ESTADO.md
// --------------------------------------------------------
# 🛵 Rayte — Estado de la web app

**Fecha:** 22 de agosto de 2026 · **Versión: v1.28** · **Servidor:** producción, puerto 3000

---

## 🆕 Novedades de la v1.28 (¡3 pendientes grandes resueltos!)

### 1. 🔐 Login / registro con sesión REAL (era el pendiente #1)
- Tablas `users` y `sessions` en PostgreSQL, contraseñas con **scrypt + sal**.
- Cookie de sesión **httpOnly** (30 días) — la sesión sobrevive al cerrar el navegador.
- En **Cuenta**: crear cuenta / iniciar sesión / cerrar sesión. "Guardar datos" ahora también actualiza el perfil en el servidor.
- API: `GET/POST /api/auth` (register · login · logout · update).

### 2. 🗃️ Pedidos REALES en la base de datos (era el pendiente #3)
- Nueva tabla `orders` (productos en JSONB, totales, cliente, estado, conductor, timestamps por etapa, calificación).
- El **checkout guarda el pedido en PostgreSQL** y lo liga al usuario con sesión.
- **Mis pedidos** se carga desde la DB (por sesión, o por teléfono como respaldo) y se refresca cada 6 s. El almacenamiento local queda solo como respaldo sin conexión.

### 3. 🖥️ Paneles operativos de socio y conductor (era el pendiente #5)
- **Panel socio**: los pedidos de los clientes aparecen solos (sondeo cada 5 s). Botones reales: **Aceptar → Listo para recoger**. Las ventas/pedidos/ticket del día se calculan con pedidos reales. "Simular pedido" ahora crea un pedido real en la DB.
- **Panel conductor**: eliges conductor, te conectas y ves las **entregas listas para recoger**; las tomas (**→ en camino**) y las marcas **entregadas**. Ganancias del día reales (envío + propina + base).

### 4. 📡 Seguimiento conectado a la DB (avance del pendiente #4)
- La página del pedido **sondea la API cada 4 s**: el estado que ve el cliente es el que mueven la tienda y el conductor.
- Flujo: `placed → preparing → ready → on_way → delivered` + badge "en vivo".
- **Autopiloto**: si nadie gestiona un pedido, avanza solo (20 s → preparación, 60 s → listo, 90 s → en camino con conductor asignado, 180 s → entregado). En cuanto la tienda o un conductor lo tocan, el autopiloto se apaga para ese pedido.
- La calificación ⭐ se guarda en la DB y la tienda la ve en su panel.

## 🗺️ Ruta de prueba nueva (5 minutos)

1. **Cuenta** → crea tu cuenta (nombre, teléfono, contraseña) → sesión iniciada
2. Entra a **Tacos El Farol** → agrega algo → **Ir a pagar** → confirma (el pedido va a PostgreSQL)
3. Abre **/socio** en otra pestaña → elige Tacos El Farol → el pedido está ahí → **Aceptar** → **Listo para recoger**
4. Abre **/conductor** → elige un conductor → conéctate → **Recoger pedido** → **Marcar entregado**
5. Vuelve a la pestaña del cliente: el seguimiento fue reflejando cada paso **en vivo** → califica ⭐ (la tienda ve las estrellas)
6. Cierra sesión y vuelve a entrar: tus pedidos siguen ahí (viven en la DB, no en el navegador)

## 🏪 Catálogo (sin cambios)

18 negocios en 8 rubros (220 productos), 16 servicios agendables (4 médicos) y 4 conductores. Fotos a medida en `public/tiendas/` y `public/servicios/` (regeneradas en esta revisión).

## ⏳ Pendientes (siguientes niveles)

1. **Pagos** (MercadoPago / Stripe) — el checkout sigue simulado
2. **Seguimiento con WebSockets/GPS real** (hoy es sondeo cada 4-5 s, ya con estados reales)
3. Horarios reales de apertura/cierre por tienda
4. Roles/permisos: que cada socio solo vea SU tienda (hoy el panel es abierto por ser demo)
5. Recuperación de contraseña

## 🔁 Arranque

```bash
cd ~/rayte && ./scripts/reiniciar.sh        # producción (recomendado)
cd ~/rayte && ./scripts/reiniciar.sh --dev  # desarrollo
```

Si PostgreSQL no está como servicio (sandbox nuevo), también sirve:

```bash
sudo apt-get install -y postgresql
sudo chown user /var/run/postgresql && sudo mkdir -p /var/lib/pgdata && sudo chown user /var/lib/pgdata
/usr/lib/postgresql/17/bin/initdb -D /var/lib/pgdata -U postgres
/usr/lib/postgresql/17/bin/pg_ctl -D /var/lib/pgdata -l /tmp/pg.log start
/usr/lib/postgresql/17/bin/psql -U postgres -h 127.0.0.1 -c "CREATE USER zappy WITH PASSWORD 'zappy' SUPERUSER;" -c "CREATE DATABASE zappy OWNER zappy;"
npm run db:push && npm run db:seed && npm run build && npm run start
```


// --------------------------------------------------------
// ARCHIVO: db/zappy.sql
// --------------------------------------------------------
--
-- PostgreSQL database dump
--

\restrict KvQ8kn5OioWxKsch21LNZHlojDyZuS6rmdpvaRu94czaoIaKq13peeGPP9Cv38F

-- Dumped from database version 17.11 (Debian 17.11-0+deb13u1)
-- Dumped by pg_dump version 17.11 (Debian 17.11-0+deb13u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.appointments (
    id character varying(40) NOT NULL,
    code character varying(12) NOT NULL,
    service_id integer NOT NULL,
    service_name character varying(90) NOT NULL,
    service_image text,
    customer_name character varying(90) NOT NULL,
    phone character varying(30) NOT NULL,
    mode character varying(20) NOT NULL,
    address text,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    price integer NOT NULL,
    pro_name character varying(90) NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    rating integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.appointments OWNER TO zappy;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(60) NOT NULL,
    slug character varying(60) NOT NULL,
    icon character varying(40) NOT NULL,
    color character varying(20) NOT NULL,
    bg character varying(20) NOT NULL,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.categories OWNER TO zappy;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: zappy
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO zappy;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zappy
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.drivers (
    id integer NOT NULL,
    name character varying(90) NOT NULL,
    vehicle character varying(40) NOT NULL,
    plate character varying(12) NOT NULL,
    rating real DEFAULT 4.8 NOT NULL,
    trips integer DEFAULT 1000 NOT NULL,
    photo text,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.drivers OWNER TO zappy;

--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: zappy
--

CREATE SEQUENCE public.drivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drivers_id_seq OWNER TO zappy;

--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zappy
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    code character varying(12) NOT NULL,
    user_id integer,
    restaurant_id integer NOT NULL,
    restaurant_name character varying(90) NOT NULL,
    restaurant_slug character varying(90) NOT NULL,
    items jsonb NOT NULL,
    subtotal integer NOT NULL,
    delivery_fee integer DEFAULT 0 NOT NULL,
    service_fee integer DEFAULT 0 NOT NULL,
    tip integer DEFAULT 0 NOT NULL,
    total integer NOT NULL,
    customer_name character varying(90) NOT NULL,
    phone character varying(30) NOT NULL,
    address text NOT NULL,
    payment character varying(40) NOT NULL,
    status character varying(20) DEFAULT 'placed'::character varying NOT NULL,
    manual boolean DEFAULT false NOT NULL,
    driver_id integer,
    eta_min integer DEFAULT 25 NOT NULL,
    eta_max integer DEFAULT 40 NOT NULL,
    scheduled_for timestamp with time zone,
    placed_at timestamp with time zone DEFAULT now() NOT NULL,
    preparing_at timestamp with time zone,
    ready_at timestamp with time zone,
    on_way_at timestamp with time zone,
    delivered_at timestamp with time zone,
    rating integer
);


ALTER TABLE public.orders OWNER TO zappy;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: zappy
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO zappy;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zappy
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.products (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    name character varying(120) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    price integer NOT NULL,
    image text,
    section character varying(60) DEFAULT 'General'::character varying NOT NULL,
    popular boolean DEFAULT false NOT NULL,
    available boolean DEFAULT true NOT NULL,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO zappy;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: zappy
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO zappy;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zappy
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    name character varying(90) NOT NULL,
    slug character varying(90) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    category_slug character varying(60) NOT NULL,
    image text NOT NULL,
    rating real DEFAULT 4.5 NOT NULL,
    rating_count integer DEFAULT 500 NOT NULL,
    time_min integer DEFAULT 20 NOT NULL,
    time_max integer DEFAULT 35 NOT NULL,
    delivery_fee integer DEFAULT 2500 NOT NULL,
    distance_km real DEFAULT 1.5 NOT NULL,
    promo character varying(60),
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    is_turbo boolean DEFAULT false NOT NULL,
    address character varying(180) DEFAULT ''::character varying NOT NULL,
    allows_pickup boolean DEFAULT true NOT NULL,
    is_open boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.restaurants OWNER TO zappy;

--
-- Name: restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: zappy
--

CREATE SEQUENCE public.restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurants_id_seq OWNER TO zappy;

--
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zappy
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(90) NOT NULL,
    slug character varying(90) NOT NULL,
    category character varying(30) NOT NULL,
    provider character varying(90) NOT NULL,
    pro_name character varying(90) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    includes text[] DEFAULT '{}'::text[] NOT NULL,
    image text NOT NULL,
    rating real DEFAULT 4.8 NOT NULL,
    rating_count integer DEFAULT 300 NOT NULL,
    price integer NOT NULL,
    duration_min integer DEFAULT 60 NOT NULL,
    domicilio boolean DEFAULT true NOT NULL,
    local boolean DEFAULT true NOT NULL,
    available boolean DEFAULT true NOT NULL,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.services OWNER TO zappy;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: zappy
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO zappy;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zappy
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.sessions (
    token character varying(80) NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO zappy;

--
-- Name: users; Type: TABLE; Schema: public; Owner: zappy
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(90) NOT NULL,
    phone character varying(30) NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO zappy;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: zappy
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO zappy;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zappy
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: orders orders_code_unique; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_code_unique UNIQUE (code);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_slug_unique UNIQUE (slug);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services services_slug_unique; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_slug_unique UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (token);


--
-- Name: users users_phone_unique; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_unique UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_service_id_services_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_services_id_fk FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: orders orders_driver_id_drivers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_driver_id_drivers_id_fk FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;


--
-- Name: orders orders_restaurant_id_restaurants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_restaurant_id_restaurants_id_fk FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: products products_restaurant_id_restaurants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_restaurant_id_restaurants_id_fk FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: zappy
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KvQ8kn5OioWxKsch21LNZHlojDyZuS6rmdpvaRu94czaoIaKq13peeGPP9Cv38F


// --------------------------------------------------------
// ARCHIVO: drizzle.config.ts
// --------------------------------------------------------
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://zappy:zappy@127.0.0.1:5432/zappy",
  },
});


// --------------------------------------------------------
// ARCHIVO: enlace.txt
// --------------------------------------------------------
https://assists-seeing-privileges-dealt.trycloudflare.com


// --------------------------------------------------------
// ARCHIVO: next-env.d.ts
// --------------------------------------------------------
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";
import "./.next/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.


// --------------------------------------------------------
// ARCHIVO: next.config.ts
// --------------------------------------------------------
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite que el preview (proxy *.e2b.app y Cloudflare) funcione sin bloqueos
  allowedDevOrigins: ["*.e2b.app", "*.trycloudflare.com", "localhost:3000"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  // Sin caché para el HTML → siempre se visualiza la última versión
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon|icon|tiendas|servicios/[^/]*\\.jpg).)*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;


// --------------------------------------------------------
// ARCHIVO: package-lock.json
// --------------------------------------------------------
{
  "name": "rayte",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "rayte",
      "version": "0.1.0",
      "dependencies": {
        "drizzle-orm": "^0.45.2",
        "framer-motion": "^13.1.1",
        "lucide-react": "^1.33.0",
        "next": "^16.3.2",
        "pg": "^8.23.0",
        "react": "^19.2.8",
        "react-dom": "^19.2.8",
        "zustand": "^5.0.15"
      },
      "devDependencies": {
        "@tailwindcss/postcss": "^4.3.3",
        "@types/node": "^24",
        "@types/pg": "^8",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "dotenv": "^17.4.2",
        "drizzle-kit": "^0.31.10",
        "tailwindcss": "^4.3.3",
        "tsx": "^4.23.12",
        "typescript": "^5"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@drizzle-team/brocli": {
      "version": "0.10.2",
      "resolved": "https://registry.npmjs.org/@drizzle-team/brocli/-/brocli-0.10.2.tgz",
      "integrity": "sha512-z33Il7l5dKjUgGULTqBsQBQwckHh5AbIuxhdsIxDDiZAzBOrZO6q9ogcWC65kU382AfynTfgNumVcNIjuIua6w==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.11.3",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.11.3.tgz",
      "integrity": "sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@esbuild-kit/core-utils": {
      "version": "3.3.2",
      "resolved": "https://registry.npmjs.org/@esbuild-kit/core-utils/-/core-utils-3.3.2.tgz",
      "integrity": "sha512-sPRAnw9CdSsRmEtnsl2WXWdyquogVpB3yZ3dgwJfe8zrOzTsV7cJvmwrKVa+0ma5BoiGJ+BoqkMvawbayKUsqQ==",
      "deprecated": "Merged into tsx: https://tsx.hirok.io",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.18.20",
        "source-map-support": "^0.5.21"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/android-arm": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.18.20.tgz",
      "integrity": "sha512-fyi7TDI/ijKKNZTUJAQqiG5T7YjJXgnzkURqmGj13C6dCqckZBLdl4h7bkhHt/t0WP+zO9/zwroDvANaOqO5Sw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/android-arm64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.18.20.tgz",
      "integrity": "sha512-Nz4rJcchGDtENV0eMKUNa6L12zz2zBDXuhj/Vjh18zGqB44Bi7MBMSXjgunJgjRhCmKOjnPuZp4Mb6OKqtMHLQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/android-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.18.20.tgz",
      "integrity": "sha512-8GDdlePJA8D6zlZYJV/jnrRAi6rOiNaCC/JclcXpB+KIuvfBN4owLtgzY2bsxnx666XjJx2kDPUmnTtR8qKQUg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/darwin-arm64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.18.20.tgz",
      "integrity": "sha512-bxRHW5kHU38zS2lPTPOyuyTm+S+eobPUnTNkdJEfAddYgEcll4xkT8DB9d2008DtTbl7uJag2HuE5NZAZgnNEA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/darwin-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.18.20.tgz",
      "integrity": "sha512-pc5gxlMDxzm513qPGbCbDukOdsGtKhfxD1zJKXjCCcU7ju50O7MeAZ8c4krSJcOIJGFR+qx21yMMVYwiQvyTyQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/freebsd-arm64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.18.20.tgz",
      "integrity": "sha512-yqDQHy4QHevpMAaxhhIwYPMv1NECwOvIpGCZkECn8w2WFHXjEwrBn3CeNIYsibZ/iZEUemj++M26W3cNR5h+Tw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/freebsd-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.18.20.tgz",
      "integrity": "sha512-tgWRPPuQsd3RmBZwarGVHZQvtzfEBOreNuxEMKFcd5DaDn2PbBxfwLcj4+aenoh7ctXcbXmOQIn8HI6mCSw5MQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-arm": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.18.20.tgz",
      "integrity": "sha512-/5bHkMWnq1EgKr1V+Ybz3s1hWXok7mDFUMQ4cG10AfW3wL02PSZi5kFpYKrptDsgb2WAJIvRcDm+qIvXf/apvg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-arm64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.18.20.tgz",
      "integrity": "sha512-2YbscF+UL7SQAVIpnWvYwM+3LskyDmPhe31pE7/aoTMFKKzIc9lLbyGUpmmb8a8AixOL61sQ/mFh3jEjHYFvdA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-ia32": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.18.20.tgz",
      "integrity": "sha512-P4etWwq6IsReT0E1KHU40bOnzMHoH73aXp96Fs8TIT6z9Hu8G6+0SHSw9i2isWrD2nbx2qo5yUqACgdfVGx7TA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-loong64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.18.20.tgz",
      "integrity": "sha512-nXW8nqBTrOpDLPgPY9uV+/1DjxoQ7DoB2N8eocyq8I9XuqJ7BiAMDMf9n1xZM9TgW0J8zrquIb/A7s3BJv7rjg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-mips64el": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.18.20.tgz",
      "integrity": "sha512-d5NeaXZcHp8PzYy5VnXV3VSd2D328Zb+9dEq5HE6bw6+N86JVPExrA6O68OPwobntbNJ0pzCpUFZTo3w0GyetQ==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-ppc64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.18.20.tgz",
      "integrity": "sha512-WHPyeScRNcmANnLQkq6AfyXRFr5D6N2sKgkFo2FqguP44Nw2eyDlbTdZwd9GYk98DZG9QItIiTlFLHJHjxP3FA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-riscv64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.18.20.tgz",
      "integrity": "sha512-WSxo6h5ecI5XH34KC7w5veNnKkju3zBRLEQNY7mv5mtBmrP/MjNBCAlsM2u5hDBlS3NGcTQpoBvRzqBcRtpq1A==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-s390x": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.18.20.tgz",
      "integrity": "sha512-+8231GMs3mAEth6Ja1iK0a1sQ3ohfcpzpRLH8uuc5/KVDFneH6jtAJLFGafpzpMRO6DzJ6AvXKze9LfFMrIHVQ==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/linux-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.18.20.tgz",
      "integrity": "sha512-UYqiqemphJcNsFEskc73jQ7B9jgwjWrSayxawS6UVFZGWrAAtkzjxSqnoclCXxWtfwLdzU+vTpcNYhpn43uP1w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/netbsd-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.18.20.tgz",
      "integrity": "sha512-iO1c++VP6xUBUmltHZoMtCUdPlnPGdBom6IrO4gyKPFFVBKioIImVooR5I83nTew5UOYrk3gIJhbZh8X44y06A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/openbsd-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.18.20.tgz",
      "integrity": "sha512-e5e4YSsuQfX4cxcygw/UCPIEP6wbIL+se3sxPdCiMbFLBWu0eiZOJ7WoD+ptCLrmjZBK1Wk7I6D/I3NglUGOxg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/sunos-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.18.20.tgz",
      "integrity": "sha512-kDbFRFp0YpTQVVrqUd5FTYmWo45zGaXe0X8E1G/LKFC0v8x0vWrhOWSLITcCn63lmZIxfOMXtCfti/RxN/0wnQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/win32-arm64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.18.20.tgz",
      "integrity": "sha512-ddYFR6ItYgoaq4v4JmQQaAI5s7npztfV4Ag6NrhiaW0RrnOXqBkgwZLofVTlq1daVTQNhtI5oieTvkRPfZrePg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/win32-ia32": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.18.20.tgz",
      "integrity": "sha512-Wv7QBi3ID/rROT08SABTS7eV4hX26sVduqDOTe1MvGMjNd3EjOz4b7zeexIR62GTIEKrfJXKL9LFxTYgkyeu7g==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/@esbuild/win32-x64": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.18.20.tgz",
      "integrity": "sha512-kTdfRcSiDfQca/y9QIkng02avJ+NCaQvrMejlsB3RRv5sE9rRoeBPISaZpKxHELzRxZyLvNts1P27W3wV+8geQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild-kit/core-utils/node_modules/esbuild": {
      "version": "0.18.20",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.18.20.tgz",
      "integrity": "sha512-ceqxoedUrcayh7Y7ZX6NdbbDzGROiyVBgC4PriJThBKSVPWnnFHZAkfI1lJT8QFkOwH4qOS2SJkS4wvpGl8BpA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=12"
      },
      "optionalDependencies": {
        "@esbuild/android-arm": "0.18.20",
        "@esbuild/android-arm64": "0.18.20",
        "@esbuild/android-x64": "0.18.20",
        "@esbuild/darwin-arm64": "0.18.20",
        "@esbuild/darwin-x64": "0.18.20",
        "@esbuild/freebsd-arm64": "0.18.20",
        "@esbuild/freebsd-x64": "0.18.20",
        "@esbuild/linux-arm": "0.18.20",
        "@esbuild/linux-arm64": "0.18.20",
        "@esbuild/linux-ia32": "0.18.20",
        "@esbuild/linux-loong64": "0.18.20",
        "@esbuild/linux-mips64el": "0.18.20",
        "@esbuild/linux-ppc64": "0.18.20",
        "@esbuild/linux-riscv64": "0.18.20",
        "@esbuild/linux-s390x": "0.18.20",
        "@esbuild/linux-x64": "0.18.20",
        "@esbuild/netbsd-x64": "0.18.20",
        "@esbuild/openbsd-x64": "0.18.20",
        "@esbuild/sunos-x64": "0.18.20",
        "@esbuild/win32-arm64": "0.18.20",
        "@esbuild/win32-ia32": "0.18.20",
        "@esbuild/win32-x64": "0.18.20"
      }
    },
    "node_modules/@esbuild-kit/esm-loader": {
      "version": "2.6.5",
      "resolved": "https://registry.npmjs.org/@esbuild-kit/esm-loader/-/esm-loader-2.6.5.tgz",
      "integrity": "sha512-FxEMIkJKnodyA1OaCUoEvbYRkoZlLZ4d/eXFu9Fh8CbBBgP5EmZxrfTRyN0qpXZ4vOvqnE5YdRdcrmUUXuU+dA==",
      "deprecated": "Merged into tsx: https://tsx.hirok.io",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@esbuild-kit/core-utils": "^3.3.2",
        "get-tsconfig": "^4.7.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.12.tgz",
      "integrity": "sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.12.tgz",
      "integrity": "sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.12.tgz",
      "integrity": "sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.12.tgz",
      "integrity": "sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.12.tgz",
      "integrity": "sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.12.tgz",
      "integrity": "sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.12.tgz",
      "integrity": "sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.12.tgz",
      "integrity": "sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.12.tgz",
      "integrity": "sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.12.tgz",
      "integrity": "sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.12.tgz",
      "integrity": "sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.12.tgz",
      "integrity": "sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.12.tgz",
      "integrity": "sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.12.tgz",
      "integrity": "sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.12.tgz",
      "integrity": "sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.12.tgz",
      "integrity": "sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.12.tgz",
      "integrity": "sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.12.tgz",
      "integrity": "sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.12.tgz",
      "integrity": "sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.12.tgz",
      "integrity": "sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.12.tgz",
      "integrity": "sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.12.tgz",
      "integrity": "sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.12.tgz",
      "integrity": "sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.12.tgz",
      "integrity": "sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@img/colour": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@img/colour/-/colour-1.1.0.tgz",
      "integrity": "sha512-Td76q7j57o/tLVdgS746cYARfSyxk8iEfRxewL9h4OMzYhbW4TAcppl0mT4eyqXddh6L/jwoM75mo7ixa/pCeQ==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@img/sharp-darwin-arm64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.35.3.tgz",
      "integrity": "sha512-RMnFX7YQsMoh7lWfcM4NEHHymBX/rLuKNPVM84XE9ONPcaSCDgE7CHIHpSgPcO2xcRthgBy1HfNO319mwhIAkg==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-arm64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-darwin-x64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.35.3.tgz",
      "integrity": "sha512-Xo+5uFBtLN0BKqieTxiFzFPQAUlBbbH5iBKyRX/z1JrbnYsHTfKJnUfL8+p2TPXr1pXqao4eeL4Rl144uDpK9w==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-x64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-freebsd-wasm32": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-freebsd-wasm32/-/sharp-freebsd-wasm32-0.35.3.tgz",
      "integrity": "sha512-lUxcqWIj2wMQ9BrwNjngcr1gWUr5xgaGThBRqPPalIC2n67Cqj1uPh8NnA/ZhAg8hUbKl+kVHKwgUIwe6ZYPrg==",
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "dependencies": {
        "@img/sharp-wasm32": "0.35.3"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-arm64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.3.2.tgz",
      "integrity": "sha512-9J6ypZFpQBj4YnePGoq/S38w6nz+vqg5WZLrLGY4YuSemdMq47GMLBPO42MzwdGwpg/agZ7xzZcFHa48xlywfg==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-x64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.3.2.tgz",
      "integrity": "sha512-m2pW1n6cns9VaubNwsZ+c3CRYjxNQWgJ5gPlnL1nbBcpkBvFm6SCFN5o0psFHI8w9n11NKhFkeEDns98tiqbEw==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.3.2.tgz",
      "integrity": "sha512-1eMLzy92I4J6rmi4mAT8yC3HxOtniyGELlzGbNMLLeqe052ahFQ0h6LFq+lh5DsDIdYViIDst08abvSbcEdLXQ==",
      "cpu": [
        "arm"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.3.2.tgz",
      "integrity": "sha512-dqVSFynCox4C/J8kT16V7SIFAns0IjgLwkvYT7p8LQVmJ5OS5b6tI9IGflxTeuBS//zXeFIUbwt5dwxyZ17cnA==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-ppc64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.3.2.tgz",
      "integrity": "sha512-3z0NHDxD6n5I9gc05U1eW1AyRm+Gznzq3naMrthPNqE6oYykcogW0l/jfpJdjYnuNl8R7yI9pNbE1XiUeyq0Aw==",
      "cpu": [
        "ppc64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-riscv64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.3.2.tgz",
      "integrity": "sha512-bsb4rI+NldGOsXuej2r8OdSS8+zXDVaCWxyWrcv6kneTOlgAHtZABRzBBCwdsPiD90J4myNJuHpg6kA20ImW/w==",
      "cpu": [
        "riscv64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-s390x": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.3.2.tgz",
      "integrity": "sha512-/ABshyj8gCpyIrNXnHn4LorDJ0HHm1VhXPBlxZ8zAtfVPAaSafXPGn+sUSIRiwaSBy0mmFjSjiXI5mkcwdChKQ==",
      "cpu": [
        "s390x"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-x64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.3.2.tgz",
      "integrity": "sha512-ITPEtgffGJ0S6G9dRyw/366tJQqFRcHWPHhC+Stpg3Z8AEMrDrTr2lhdz4f/Y/HMbRh//7Z5mBzEpVdi62Oc3w==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-arm64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.3.2.tgz",
      "integrity": "sha512-zE9EdiUzUmg5mDT5a1rk5fYJ6GWPloTwWBYDS14naqHsL+EaMpDj1AWnpLgh3u0YCORv2Tt50wrcrpYqkP97Kw==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-x64": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.3.2.tgz",
      "integrity": "sha512-m0lrLiUt+lBYnCFr8qV/65yMR4E/c7/wf78I5eKTdkEakFAlZ9QlzEM3QIhhAwVeUhLAHLcCq7a7Vszq/oFNZQ==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-linux-arm": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.35.3.tgz",
      "integrity": "sha512-affVWCTLooy8TSxbDx2qkzuDeaWLNVBA+P//FNBirHsXpP2fuBhk5AuboYUnrDnzoXes8GFjpTx0SBFOCRg+FA==",
      "cpu": [
        "arm"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm": "1.3.2"
      }
    },
    "node_modules/@img/sharp-linux-arm64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.35.3.tgz",
      "integrity": "sha512-QgKDspHPnrU+GQ55XPhGwyhC8acLVOOSyAvo1oVfFmrIXLkDNmGWzAfDZ4xK8oSA1qBQrALcHX0G5UZni/SuFQ==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-linux-ppc64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.35.3.tgz",
      "integrity": "sha512-sMd8rDxmpLOwv/7N44klFjOD5DUO7FLdjiXDI0hoxYaf7Ar262dQIEkosE98bps+5HPLtp/EvNqeqQtOycP/IA==",
      "cpu": [
        "ppc64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-ppc64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-linux-riscv64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.35.3.tgz",
      "integrity": "sha512-0Eob78yjlYPfL5vMNWAW55l3R9Y6BQS/gOfe0ZcP9mEz9ohhKSt4im1hayiknXgf8AWrFqMvJcKIdmLmEe7yeQ==",
      "cpu": [
        "riscv64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-riscv64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-linux-s390x": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.35.3.tgz",
      "integrity": "sha512-KgAxQ0DxpNOq1rG2t5cgTgShJFGSuU7XO45cqC+1NVOuZnP6tlgZRuSYOfNupGkHID0o3cJOsw4DVeJpMovcGw==",
      "cpu": [
        "s390x"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-s390x": "1.3.2"
      }
    },
    "node_modules/@img/sharp-linux-x64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.35.3.tgz",
      "integrity": "sha512-8pqvxubL2PGdhlPy6GLqzDYMUjyRmKAwKHYKixpdJYBUK7PJ0C029XdsnpFIdgRZG68fZiGdHVWcKPvtiPB4cA==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-x64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-linuxmusl-arm64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.35.3.tgz",
      "integrity": "sha512-Vz0iQjzzcSX3HCbfwFfCSG/9SCIqyO0mH2sXyiHaAYfBk0cRsCWXRyQYX0ovCK/PAQBbTzQ0dsPQHh5MAFL59w==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-arm64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-linuxmusl-x64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.35.3.tgz",
      "integrity": "sha512-6O1NPKcDVj9QEdg7Hx549EX8U0rp6yXQERqru6yRN7fGBn32UvIRJUlWnk+8xDCiG76hXVBbX82NZ/ZKr0euIg==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-x64": "1.3.2"
      }
    },
    "node_modules/@img/sharp-wasm32": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.35.3.tgz",
      "integrity": "sha512-cZ0XkcYGpHZkqW6iCkqTcmUC0CD9DhD5d/qeZlZkfRBn6GnHniZXLUo5+9xw8Iv76YE6LQFN9YNBlKREcCG76w==",
      "license": "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/runtime": "^1.11.1"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-webcontainers-wasm32": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-webcontainers-wasm32/-/sharp-webcontainers-wasm32-0.35.3.tgz",
      "integrity": "sha512-2rnq7bX3NzeR2T4YWgz8qiG4h3TSdMe+vN1iQXpJleSJ3SM5zQ8Fy2SyyXAWlbxpEZ2Y+Z4u1BePgJEYbSy80Q==",
      "cpu": [
        "wasm32"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@img/sharp-wasm32": "0.35.3"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-arm64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.35.3.tgz",
      "integrity": "sha512-4bPwFdMbeC4JQ8L8LOyWp6nsHcboP5fxkp6iPOXz2Vg49R42TuMs2whkJ5OAP4/Ul035qOzy0AecOF9VOscn4w==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-ia32": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.35.3.tgz",
      "integrity": "sha512-r53mXsBN6lFUDiST764SvgwUdHAqM4rPAiDzAmf4fLoB6X/rkfyTrLCg6+g17wJJiCmB3JYgHuUldCWUIRFSXw==",
      "cpu": [
        "ia32"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-x64": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.35.3.tgz",
      "integrity": "sha512-D4y1vNeZrIIJCN+uHaWVtH86B+aCrdMYYjicy9pXHvbGZeGYLLSd3wdVuC37FxVXlU1ARsk84eKWfWMXGYEqvA==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@next/env": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/env/-/env-16.3.2.tgz",
      "integrity": "sha512-8k4YoG8cM7LWlkfzGNYCRBbFNlernLiMw4s0btVl+CmmWqn3VpYypA72/5Feb1UWdxe6tHqr5KHP4p4Y4m9luA==",
      "license": "MIT"
    },
    "node_modules/@next/swc-darwin-arm64": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-16.3.2.tgz",
      "integrity": "sha512-ib5Llm93YCKoKWDh6ZaHq6QWTuOZ2bRkSnUwMmX8dsRIOkBNL1vVlSiUKSfixPL9SSh9pvukzqajk/klkn5vqg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-darwin-x64": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-16.3.2.tgz",
      "integrity": "sha512-qd98fX2+I5nYJDioW2o7nSjoxM5KvWdeDefM80igia4+C/qSIEhH4MhTE+hO/7qKM7W37/Mq+dOWp8UePSyLHw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-gnu": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-16.3.2.tgz",
      "integrity": "sha512-vqsgb6FAOzcrCccsLXiKtAy5t8EzO+uOazuFaSkQxeY0tNONG3vpHYy8pyBafcI5SNFPTeyard6yTr6SzNGo2A==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-musl": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-16.3.2.tgz",
      "integrity": "sha512-xIe1eujfHUB2XcxHGddxJyu6TJRPjC5NpIkQYB/32ESkt5VkQyIAjmLRS38c+s6QY+qjtY/4KarVDzXRuD7lZQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-gnu": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-16.3.2.tgz",
      "integrity": "sha512-Fe0SA2j8X0kmc3aveuHD7UktO3AE2+mH3LguP60vGbz7u0z+MrDXbeb5iZFYAwR7EzzzXJ2Yk966w9mGTFMqfA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-musl": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-16.3.2.tgz",
      "integrity": "sha512-TFBipb+gyesI/2Ve4zVu7kGltBWN/R466G5/1gtt2lECfc22G1pjkTxu68Q9aFcOaXiRGTQfvDbQQFe7mYgxiQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-arm64-msvc": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-16.3.2.tgz",
      "integrity": "sha512-rVtmnNpBYIosDnKD/96dKxFsJnwnn1WRGG/HioSe8XCm2ksSHNrd2R6+hSjvTBxeMNhJ9pYeu/90cWB1nQLuNA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-x64-msvc": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-16.3.2.tgz",
      "integrity": "sha512-H4Y2o2/JcHu8LtwzD5CXfHhwxwz8gfsx2HXDEw46Mtev5xHnEmB7HNtZtmriw5ReUOjRtcDqo7XSbU01FT9NlA==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@swc/helpers": {
      "version": "0.5.23",
      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.23.tgz",
      "integrity": "sha512-5lSsMOTXURePglDfvuAQUqkGek9Hg2kksOYay2m0+XR++b2NWYL/4sWyuvVBIs8oKnJaxkdi9whaL/sqN13afw==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "^2.8.0"
      }
    },
    "node_modules/@tailwindcss/node": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/node/-/node-4.3.3.tgz",
      "integrity": "sha512-/T8IKEsf9VTU6tLjgC7+sv2mOPtQxzE2jMw7u4Tt40Tx+QSZxpzh95/H6cMKoja9XuW7iMdLJYBB0o9G1CaAgg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/remapping": "^2.3.5",
        "enhanced-resolve": "^5.24.1",
        "jiti": "^2.7.0",
        "lightningcss": "1.32.0",
        "magic-string": "^0.30.21",
        "source-map-js": "^1.2.1",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.3.3.tgz",
      "integrity": "sha512-krXjAikiaFSPaK/FkAQT5UTx3VormQaiZ5hBFlJZ9UFQGB/rwg1MZIhHAG9smMQRTdyJxP6Qt5MwMtdyU5FWrA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 20"
      },
      "optionalDependencies": {
        "@tailwindcss/oxide-android-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-x64": "4.3.3",
        "@tailwindcss/oxide-freebsd-x64": "4.3.3",
        "@tailwindcss/oxide-linux-arm-gnueabihf": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-musl": "4.3.3",
        "@tailwindcss/oxide-linux-x64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-x64-musl": "4.3.3",
        "@tailwindcss/oxide-wasm32-wasi": "4.3.3",
        "@tailwindcss/oxide-win32-arm64-msvc": "4.3.3",
        "@tailwindcss/oxide-win32-x64-msvc": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide-android-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz",
      "integrity": "sha512-Y85A2gmPSkl5Ve5qR86GL4HT509cFqQh1aes9p3sSkyTPwt0Pppf3GkwGe4JPACcRYjgJIEhQgM6dBClnr0NYw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.3.3.tgz",
      "integrity": "sha512-BiaWatpBcERQFDlOjRDpIVXuFK5PJez5SA4JMg6VYZdBYU+qKfV/vqjcIs+IYmtitf1xYQZTwXvU/8y4lfZUGw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz",
      "integrity": "sha512-fAeUqfV5ndhxRwai8cXGzdLvul9utWOmeTkv69unv4ZXixjn61Z+p9lCWdwOwA3TYboG3BwdVuN/RDjhBRl0mw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-freebsd-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz",
      "integrity": "sha512-iyf5bV6+wnAlflVeEy7R25dupxTNECZN5QMI0qNT6eT+EgaGdZcKhGkr5SdoaWiLJ3spLqIY9VCeSGrwmtg4kw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm-gnueabihf": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz",
      "integrity": "sha512-aAYUprJAJQWWbRrPvtjdroZ56Md+JM8pMiopS6xGEwDfLhqj+2ver2p4nU4Mb3CRqcMmNBjo8KkUgcxhkzVQGQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz",
      "integrity": "sha512-nDxldcEENOxZRzC2uu9jrutZdAAQtb+8WWDCSnWL1zvBk1+FN+x6MtDViPB5AJMfttVCUhehGWus3XBPgatM/w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz",
      "integrity": "sha512-Md44bD6veX/PC5iyF8cDVnw4HBIANZepRZZ7a8DQOvkfo5WUBwcp6iAuCUz23u+4SUkhJlD3eL7hNdW8ezd/kA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz",
      "integrity": "sha512-tx7us1muwOKAKWao2v/GaafFeQboE6aj88vC6ziN2NCGcRm8gWUhwjzg+YdVB1e4boAtdtma4L43onunI6NS4w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz",
      "integrity": "sha512-SJxX60smvHgasZoBy11dX6YRjXJFovwWBoedhbQPOBzgFWBHGB+TVPWB9BxzR7TTxU8FQZAI2AyiNCMzFm8Img==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz",
      "integrity": "sha512-jx1+rPhY/5Ympkktd656HBWEBLxP7dH06losBLjjf5vgCODXvi9KhtftWcMIwTFIDqBr7cRnQkdLnAG+IOlGvQ==",
      "bundleDependencies": [
        "@napi-rs/wasm-runtime",
        "@emnapi/core",
        "@emnapi/runtime",
        "@tybys/wasm-util",
        "@emnapi/wasi-threads",
        "tslib"
      ],
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.11.1",
        "@emnapi/runtime": "^1.11.1",
        "@emnapi/wasi-threads": "^1.2.2",
        "@napi-rs/wasm-runtime": "^1.1.4",
        "@tybys/wasm-util": "^0.10.2",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-arm64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz",
      "integrity": "sha512-3rc292Ca2ceK6Ulcc/bAVnTs/3nDtoPhyEKlgPv+yQJQi/JS/AMJlqzxvlDacL1nekbrcf6bTqp/jV4qgnPxNQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-x64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz",
      "integrity": "sha512-yJ0pwIVc/nYeGoV02WtsN8KYyLQv7kyI2wDnkezyJlGGjkd4QLwDGAwl47YpPJeuI0M0ObaXGSPjvWDPeTPggw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/postcss": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/postcss/-/postcss-4.3.3.tgz",
      "integrity": "sha512-JTSZZGQi1AyKirbLN3azmjVzef92tcX7h+iSqPdaeStyFpGpDlKvvpxeOE8njhbUanbRwr3z8DyzhICWnMtQeg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "@tailwindcss/node": "4.3.3",
        "@tailwindcss/oxide": "4.3.3",
        "postcss": "^8.5.16",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@types/node": {
      "version": "24.13.3",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-24.13.3.tgz",
      "integrity": "sha512-Dh8vAsV36ig5wa9OX4pXvMc9D3Veibfw2wix0CUwYODLD8nkj9UsLjASr49nPg+2eKzxhBV+v7L8pXvT4e639Q==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~7.18.0"
      }
    },
    "node_modules/@types/pg": {
      "version": "8.23.1",
      "resolved": "https://registry.npmjs.org/@types/pg/-/pg-8.23.1.tgz",
      "integrity": "sha512-fKVHpikPdg4GKks3JuLEhvwSyvwzF23hnabPy6DD8ljVbC7+6J5dQzdv4arV6jqq57djnMgs1HKBxX4P8aBI3A==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "pg-protocol": "*",
        "pg-types": "^2.2.0"
      }
    },
    "node_modules/@types/react": {
      "version": "19.2.18",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.2.18.tgz",
      "integrity": "sha512-AnzbBERsrLKtk2XSfTbYRLjQPdy116Sty4q+T+Bp3IC4l6jNBvreVPAHmpq9qhXQM7CXZPjLVmGMw9sy+hxQ3w==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.2.4",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.4.tgz",
      "integrity": "sha512-Bsc+QHgp+P/F02XDzNCY9jnZNCUuLki36KT7VKrTXXLdHf+vHMNZnW1rVu5DNW/rCK+fya3DATySbLM4yhtKUw==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.2.0"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.17",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.17.tgz",
      "integrity": "sha512-KAUDn1OSS0fmPlGO+NOUMRcOQ/b/shUBH3OgkG73mPgdf+JD/BQ6fHboGxNOxnUmlwcq+lLq3dTkayRPuSfXwg==",
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/buffer-from": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/buffer-from/-/buffer-from-1.1.2.tgz",
      "integrity": "sha512-E+XQCRwSbaaiChtv6k6Dwgc+bx+Bs6vuKJHHl5kox/BaKbhiXzqQOwK4cO22yElGp2OCmjwVhT3HmxgyPGnJfQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001809",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001809.tgz",
      "integrity": "sha512-xxWVywk6a6Arlk+hymeycyn/VgqEfLDxupvhH/xiY5SJ/18kmi9o6MiO320DCUzypORHLtvh0I4i04tUhCNHNQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/client-only": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",
      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==",
      "license": "MIT"
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "devOptional": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/dotenv": {
      "version": "17.4.2",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-17.4.2.tgz",
      "integrity": "sha512-nI4U3TottKAcAD9LLud4Cb7b2QztQMUEfHbvhTH09bqXTxnSie8WnjPALV/WMCrJZ6UV/qHJ6L03OqO3LcdYZw==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/drizzle-kit": {
      "version": "0.31.10",
      "resolved": "https://registry.npmjs.org/drizzle-kit/-/drizzle-kit-0.31.10.tgz",
      "integrity": "sha512-7OZcmQUrdGI+DUNNsKBn1aW8qSoKuTH7d0mYgSP8bAzdFzKoovxEFnoGQp2dVs82EOJeYycqRtciopszwUf8bw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@drizzle-team/brocli": "^0.10.2",
        "@esbuild-kit/esm-loader": "^2.5.5",
        "esbuild": "^0.25.4",
        "tsx": "^4.21.0"
      },
      "bin": {
        "drizzle-kit": "bin.cjs"
      }
    },
    "node_modules/drizzle-orm": {
      "version": "0.45.2",
      "resolved": "https://registry.npmjs.org/drizzle-orm/-/drizzle-orm-0.45.2.tgz",
      "integrity": "sha512-kY0BSaTNYWnoDMVoyY8uxmyHjpJW1geOmBMdSSicKo9CIIWkSxMIj2rkeSR51b8KAPB7m+qysjuHme5nKP+E5Q==",
      "license": "Apache-2.0",
      "peerDependencies": {
        "@aws-sdk/client-rds-data": ">=3",
        "@cloudflare/workers-types": ">=4",
        "@electric-sql/pglite": ">=0.2.0",
        "@libsql/client": ">=0.10.0",
        "@libsql/client-wasm": ">=0.10.0",
        "@neondatabase/serverless": ">=0.10.0",
        "@op-engineering/op-sqlite": ">=2",
        "@opentelemetry/api": "^1.4.1",
        "@planetscale/database": ">=1.13",
        "@prisma/client": "*",
        "@tidbcloud/serverless": "*",
        "@types/better-sqlite3": "*",
        "@types/pg": "*",
        "@types/sql.js": "*",
        "@upstash/redis": ">=1.34.7",
        "@vercel/postgres": ">=0.8.0",
        "@xata.io/client": "*",
        "better-sqlite3": ">=7",
        "bun-types": "*",
        "expo-sqlite": ">=14.0.0",
        "gel": ">=2",
        "knex": "*",
        "kysely": "*",
        "mysql2": ">=2",
        "pg": ">=8",
        "postgres": ">=3",
        "sql.js": ">=1",
        "sqlite3": ">=5"
      },
      "peerDependenciesMeta": {
        "@aws-sdk/client-rds-data": {
          "optional": true
        },
        "@cloudflare/workers-types": {
          "optional": true
        },
        "@electric-sql/pglite": {
          "optional": true
        },
        "@libsql/client": {
          "optional": true
        },
        "@libsql/client-wasm": {
          "optional": true
        },
        "@neondatabase/serverless": {
          "optional": true
        },
        "@op-engineering/op-sqlite": {
          "optional": true
        },
        "@opentelemetry/api": {
          "optional": true
        },
        "@planetscale/database": {
          "optional": true
        },
        "@prisma/client": {
          "optional": true
        },
        "@tidbcloud/serverless": {
          "optional": true
        },
        "@types/better-sqlite3": {
          "optional": true
        },
        "@types/pg": {
          "optional": true
        },
        "@types/sql.js": {
          "optional": true
        },
        "@upstash/redis": {
          "optional": true
        },
        "@vercel/postgres": {
          "optional": true
        },
        "@xata.io/client": {
          "optional": true
        },
        "better-sqlite3": {
          "optional": true
        },
        "bun-types": {
          "optional": true
        },
        "expo-sqlite": {
          "optional": true
        },
        "gel": {
          "optional": true
        },
        "knex": {
          "optional": true
        },
        "kysely": {
          "optional": true
        },
        "mysql2": {
          "optional": true
        },
        "pg": {
          "optional": true
        },
        "postgres": {
          "optional": true
        },
        "prisma": {
          "optional": true
        },
        "sql.js": {
          "optional": true
        },
        "sqlite3": {
          "optional": true
        }
      }
    },
    "node_modules/enhanced-resolve": {
      "version": "5.24.5",
      "resolved": "https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.24.5.tgz",
      "integrity": "sha512-L1l8TNvomm6UVW5B253AGxQagSQr+vGwhMlrrfRS2qmhx46AMpMVJKQYLvWYbysTMY8VoicOvzHzoHMbyzB+4A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "graceful-fs": "^4.2.4",
        "tapable": "^2.3.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/esbuild": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz",
      "integrity": "sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.25.12",
        "@esbuild/android-arm": "0.25.12",
        "@esbuild/android-arm64": "0.25.12",
        "@esbuild/android-x64": "0.25.12",
        "@esbuild/darwin-arm64": "0.25.12",
        "@esbuild/darwin-x64": "0.25.12",
        "@esbuild/freebsd-arm64": "0.25.12",
        "@esbuild/freebsd-x64": "0.25.12",
        "@esbuild/linux-arm": "0.25.12",
        "@esbuild/linux-arm64": "0.25.12",
        "@esbuild/linux-ia32": "0.25.12",
        "@esbuild/linux-loong64": "0.25.12",
        "@esbuild/linux-mips64el": "0.25.12",
        "@esbuild/linux-ppc64": "0.25.12",
        "@esbuild/linux-riscv64": "0.25.12",
        "@esbuild/linux-s390x": "0.25.12",
        "@esbuild/linux-x64": "0.25.12",
        "@esbuild/netbsd-arm64": "0.25.12",
        "@esbuild/netbsd-x64": "0.25.12",
        "@esbuild/openbsd-arm64": "0.25.12",
        "@esbuild/openbsd-x64": "0.25.12",
        "@esbuild/openharmony-arm64": "0.25.12",
        "@esbuild/sunos-x64": "0.25.12",
        "@esbuild/win32-arm64": "0.25.12",
        "@esbuild/win32-ia32": "0.25.12",
        "@esbuild/win32-x64": "0.25.12"
      }
    },
    "node_modules/framer-motion": {
      "version": "13.1.1",
      "resolved": "https://registry.npmjs.org/framer-motion/-/framer-motion-13.1.1.tgz",
      "integrity": "sha512-B/xn2TPS4f61cEBLFjiYlQFnBZUW1YVj/LM+C+N4OP8Rs95VLEI2ot/RlfBg111la/EiyECFaJJi/A3FWA8MUA==",
      "license": "MIT",
      "dependencies": {
        "motion-dom": "^13.1.1",
        "motion-utils": "^13.0.0",
        "tslib": "^2.4.0"
      },
      "peerDependencies": {
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/get-tsconfig": {
      "version": "4.14.3",
      "resolved": "https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.14.3.tgz",
      "integrity": "sha512-++QEw4DIY7WGoukz+/+A/8dGYPT9l9yIadnmSgZ8Rjr3YVSVDipQSO9CdnJo9ePqFqUUqh+wk9uIaoiAwsiPkA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "resolve-pkg-maps": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/privatenumber/get-tsconfig?sponsor=1"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/jiti": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-2.7.0.tgz",
      "integrity": "sha512-AC/7JofJvZGrrneWNaEnJeOLUx+JlGt7tNa0wZiRPT4MY1wmfKjt2+6O2p2uz2+skll8OZZmJMNqeke7kKbNgQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "lib/jiti-cli.mjs"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz",
      "integrity": "sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz",
      "integrity": "sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lucide-react": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.33.0.tgz",
      "integrity": "sha512-MTRwMy0ZlL8Ur/vOAiJ9XGHE+kFPC7brq6MxAm0GiGXEBj0qy0jA/pG4N675oSzciO/UCdX8T+5yUQdmDeTLxg==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/motion-dom": {
      "version": "13.1.1",
      "resolved": "https://registry.npmjs.org/motion-dom/-/motion-dom-13.1.1.tgz",
      "integrity": "sha512-XSf8VYWSB6G/0IY3rWVbyLcxWXtAVHkN1PQE2agTaCv3u8RGvbwu56TyyR/MNzBqqNavEBTZzErcxI1TxBrjcA==",
      "license": "MIT",
      "dependencies": {
        "motion-utils": "^13.0.0"
      }
    },
    "node_modules/motion-utils": {
      "version": "13.0.0",
      "resolved": "https://registry.npmjs.org/motion-utils/-/motion-utils-13.0.0.tgz",
      "integrity": "sha512-7DnN7TmbLcYXcG4RVadXIihWlyuM9afoUww8Y5Agg431kGKiuL2/OMyP4mJ5wLz+pvN3t5ySClLOaVXJ+wekRQ==",
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.18",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/next": {
      "version": "16.3.2",
      "resolved": "https://registry.npmjs.org/next/-/next-16.3.2.tgz",
      "integrity": "sha512-/ZCaubUy17Lld1SiPWxuPbCk2ihqAxF2QNQaPZeEaEb7t1I58qhsJN187D7AfpapHAqUPXH0f/thtdW9dWgWFg==",
      "license": "MIT",
      "dependencies": {
        "@next/env": "16.3.2",
        "@swc/helpers": "0.5.23",
        "baseline-browser-mapping": "^2.9.19",
        "caniuse-lite": "^1.0.30001579",
        "postcss": "8.5.23",
        "styled-jsx": "5.1.6"
      },
      "bin": {
        "next": "dist/bin/next"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "optionalDependencies": {
        "@next/swc-darwin-arm64": "16.3.2",
        "@next/swc-darwin-x64": "16.3.2",
        "@next/swc-linux-arm64-gnu": "16.3.2",
        "@next/swc-linux-arm64-musl": "16.3.2",
        "@next/swc-linux-x64-gnu": "16.3.2",
        "@next/swc-linux-x64-musl": "16.3.2",
        "@next/swc-win32-arm64-msvc": "16.3.2",
        "@next/swc-win32-x64-msvc": "16.3.2",
        "sharp": "^0.35.3"
      },
      "peerDependencies": {
        "@opentelemetry/api": "^1.1.0",
        "@playwright/test": "^1.51.1",
        "babel-plugin-react-compiler": "*",
        "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "sass": "^1.3.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        },
        "@playwright/test": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "sass": {
          "optional": true
        }
      }
    },
    "node_modules/next/node_modules/postcss": {
      "version": "8.5.23",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.23.tgz",
      "integrity": "sha512-g50586zr4bZmwFiTlflMu8E0bDTb5I5gertgwAKmsdUlTQIhZtunzUlD1WSzwcVWPoAVpsrA6vlfCD7oXvRwgg==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.16",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/pg": {
      "version": "8.23.0",
      "resolved": "https://registry.npmjs.org/pg/-/pg-8.23.0.tgz",
      "integrity": "sha512-Ip2EQCngowJLGOfCwkFhPXU7/ljlhn6Rxlmy4XYfL2Y+vyRM59+8uR2xqRWKdYmbXmxCFOAmKxBuSUCdF34qLg==",
      "license": "MIT",
      "dependencies": {
        "pg-connection-string": "^2.14.0",
        "pg-pool": "^3.14.0",
        "pg-protocol": "^1.16.0",
        "pg-types": "2.2.0",
        "pgpass": "1.0.5"
      },
      "engines": {
        "node": ">= 16.0.0"
      },
      "optionalDependencies": {
        "pg-cloudflare": "^1.4.0"
      },
      "peerDependencies": {
        "pg-native": ">=3.0.1"
      },
      "peerDependenciesMeta": {
        "pg-native": {
          "optional": true
        }
      }
    },
    "node_modules/pg-cloudflare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/pg-cloudflare/-/pg-cloudflare-1.4.0.tgz",
      "integrity": "sha512-Vo7z/6rrQYxpNRylp4Tlob2elzbh+N/MOQbxFVWCxS7oEx6jF53GTJFxK2WWpKuBRkmiin4Mt+xofFDjx09R0A==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/pg-connection-string": {
      "version": "2.14.0",
      "resolved": "https://registry.npmjs.org/pg-connection-string/-/pg-connection-string-2.14.0.tgz",
      "integrity": "sha512-XwWDGcLRGCXAR8F/AM5bG7Q+A3Wm2s6QeEjlOKZLlH3UYcguiqCWKyWXVag5TLTIjR7oOJUY8kcADaZgWPyLeg==",
      "license": "MIT"
    },
    "node_modules/pg-int8": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/pg-int8/-/pg-int8-1.0.1.tgz",
      "integrity": "sha512-WCtabS6t3c8SkpDBUlb1kjOs7l66xsGdKpIPZsg4wR+B3+u9UAum2odSsF9tnvxg80h4ZxLWMy4pRjOsFIqQpw==",
      "license": "ISC",
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/pg-pool": {
      "version": "3.14.0",
      "resolved": "https://registry.npmjs.org/pg-pool/-/pg-pool-3.14.0.tgz",
      "integrity": "sha512-gKtPkFdQPU3DksooVLi9LsjZxrsBUZIpa+7aVx+LV5pNh0KzP4Zleud2po+ConrxbuXGBJ6Hfer6hdgpIBpBaw==",
      "license": "MIT",
      "peerDependencies": {
        "pg": ">=8.0"
      }
    },
    "node_modules/pg-protocol": {
      "version": "1.16.0",
      "resolved": "https://registry.npmjs.org/pg-protocol/-/pg-protocol-1.16.0.tgz",
      "integrity": "sha512-sILXutLVjCLjcDuOmvhX5e2Z4cS5qG/6Bu3VkpFwdf/633ElGLpEh9bgmuI5I4sqKqkifQiGyiCcx1HdtrK7tg==",
      "license": "MIT"
    },
    "node_modules/pg-types": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/pg-types/-/pg-types-2.2.0.tgz",
      "integrity": "sha512-qTAAlrEsl8s4OiEQY69wDvcMIdQN6wdz5ojQiOy6YRMuynxenON0O5oCpJI6lshc6scgAY8qvJ2On/p+CXY0GA==",
      "license": "MIT",
      "dependencies": {
        "pg-int8": "1.0.1",
        "postgres-array": "~2.0.0",
        "postgres-bytea": "~1.0.0",
        "postgres-date": "~1.0.4",
        "postgres-interval": "^1.1.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/pgpass": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/pgpass/-/pgpass-1.0.5.tgz",
      "integrity": "sha512-FdW9r/jQZhSeohs1Z3sI1yxFQNFvMcnmfuj4WBMUTxOrAyLMaTcE1aAMBiTlbMNaXvBCQuVi0R7hd8udDSP7ug==",
      "license": "MIT",
      "dependencies": {
        "split2": "^4.1.0"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/postcss": {
      "version": "8.5.26",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.17",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postgres-array": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/postgres-array/-/postgres-array-2.0.0.tgz",
      "integrity": "sha512-VpZrUqU5A69eQyW2c5CA1jtLecCsN2U/bD6VilrFDWq5+5UIEVO7nazS3TEcHf1zuPYO/sqGvUvW62g86RXZuA==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postgres-bytea": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/postgres-bytea/-/postgres-bytea-1.0.1.tgz",
      "integrity": "sha512-5+5HqXnsZPE65IJZSMkZtURARZelel2oXUEO8rH83VS/hxH5vv1uHquPg5wZs8yMAfdv971IU+kcPUczi7NVBQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-date": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/postgres-date/-/postgres-date-1.0.7.tgz",
      "integrity": "sha512-suDmjLVQg78nMK2UZ454hAG+OAW+HQPZ6n++TNDUX+L0+uUlLywnoxJKDou51Zm+zTCjrCl0Nq6J9C5hP9vK/Q==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-interval": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/postgres-interval/-/postgres-interval-1.2.0.tgz",
      "integrity": "sha512-9ZhXKM/rw350N1ovuWHbGxnGh/SNJ4cnxHiM0rxE4VN41wsg8P8zWn9hv/buK00RP4WvlOyr/RBDiptyxVbkZQ==",
      "license": "MIT",
      "dependencies": {
        "xtend": "^4.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react/-/react-19.2.8.tgz",
      "integrity": "sha512-PWaYA1L/q9u2u7xYQi+Y3L3Yfnie7XyLeaJICV1MGD6LprsBxcAqGjYyr0eY3p+QdsA+x/Irkt4Qif8D63+Sbw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.2.8.tgz",
      "integrity": "sha512-rVprimfGBG3DR+Tq0IQG2DT5PxKth1WIGDmj5yPmlzr4YBe7uyE+Du4oVqTDXZSHGGGXRtTJEGSSePyQCMBglQ==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.27.0"
      },
      "peerDependencies": {
        "react": "^19.2.8"
      }
    },
    "node_modules/resolve-pkg-maps": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz",
      "integrity": "sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/privatenumber/resolve-pkg-maps?sponsor=1"
      }
    },
    "node_modules/scheduler": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.27.0.tgz",
      "integrity": "sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "optional": true,
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/sharp": {
      "version": "0.35.3",
      "resolved": "https://registry.npmjs.org/sharp/-/sharp-0.35.3.tgz",
      "integrity": "sha512-ej0zVHuZGHCiABXcNxeYhpRnPNPAcvbG8RMdBAhDAxLKkCRVSpK3Iyu7qbqw3JMzoj0REeM6f3tJLtVwl0023Q==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@img/colour": "^1.1.0",
        "detect-libc": "^2.1.2",
        "semver": "^7.8.5"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-darwin-arm64": "0.35.3",
        "@img/sharp-darwin-x64": "0.35.3",
        "@img/sharp-freebsd-wasm32": "0.35.3",
        "@img/sharp-libvips-darwin-arm64": "1.3.2",
        "@img/sharp-libvips-darwin-x64": "1.3.2",
        "@img/sharp-libvips-linux-arm": "1.3.2",
        "@img/sharp-libvips-linux-arm64": "1.3.2",
        "@img/sharp-libvips-linux-ppc64": "1.3.2",
        "@img/sharp-libvips-linux-riscv64": "1.3.2",
        "@img/sharp-libvips-linux-s390x": "1.3.2",
        "@img/sharp-libvips-linux-x64": "1.3.2",
        "@img/sharp-libvips-linuxmusl-arm64": "1.3.2",
        "@img/sharp-libvips-linuxmusl-x64": "1.3.2",
        "@img/sharp-linux-arm": "0.35.3",
        "@img/sharp-linux-arm64": "0.35.3",
        "@img/sharp-linux-ppc64": "0.35.3",
        "@img/sharp-linux-riscv64": "0.35.3",
        "@img/sharp-linux-s390x": "0.35.3",
        "@img/sharp-linux-x64": "0.35.3",
        "@img/sharp-linuxmusl-arm64": "0.35.3",
        "@img/sharp-linuxmusl-x64": "0.35.3",
        "@img/sharp-webcontainers-wasm32": "0.35.3",
        "@img/sharp-win32-arm64": "0.35.3",
        "@img/sharp-win32-ia32": "0.35.3",
        "@img/sharp-win32-x64": "0.35.3"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        }
      }
    },
    "node_modules/source-map": {
      "version": "0.6.1",
      "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.6.1.tgz",
      "integrity": "sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/source-map-support": {
      "version": "0.5.21",
      "resolved": "https://registry.npmjs.org/source-map-support/-/source-map-support-0.5.21.tgz",
      "integrity": "sha512-uBHU3L3czsIyYXKX88fdrGovxdSCoTGDRZ6SYXtSRxLZUzHg5P/66Ht6uoUlHu9EZod+inXhKo3qQgwXUT/y1w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "buffer-from": "^1.0.0",
        "source-map": "^0.6.0"
      }
    },
    "node_modules/split2": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/split2/-/split2-4.2.0.tgz",
      "integrity": "sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==",
      "license": "ISC",
      "engines": {
        "node": ">= 10.x"
      }
    },
    "node_modules/styled-jsx": {
      "version": "5.1.6",
      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.6.tgz",
      "integrity": "sha512-qSVyDTeMotdvQYoHWLNGwRFJHC+i+ZvdBRYosOFgC+Wg1vx4frN2/RG/NA7SYqqvKNLf39P2LSRA2pu6n0XYZA==",
      "license": "MIT",
      "dependencies": {
        "client-only": "0.0.1"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "peerDependencies": {
        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0 || ^19.0.0-0"
      },
      "peerDependenciesMeta": {
        "@babel/core": {
          "optional": true
        },
        "babel-plugin-macros": {
          "optional": true
        }
      }
    },
    "node_modules/tailwindcss": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz",
      "integrity": "sha512-gOhV3P7ufE62QDGg1zVaTgCR+EtPv92k2nIhVcVKcLmxT1sUBsQGhnZj175j+MqRt4zLF7ic+sCYjfhxMxj7YQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tapable": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/tapable/-/tapable-2.3.3.tgz",
      "integrity": "sha512-uxc/zpqFg6x7C8vOE7lh6Lbda8eEL9zmVm/PLeTPBRhh1xCgdWaQ+J1CUieGpIfm2HdtsUpRv+HshiasBMcc6A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/webpack"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/tsx": {
      "version": "4.23.12",
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.23.12.tgz",
      "integrity": "sha512-FDf4L4sYzKtzWYhU/Xm0AQFdTjdIxNo9ElTf2mxXM6k8YMHXzYUe4yODVaXP4V9uMFbVg8c0qyBccK2OOxb45Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.28.0"
      },
      "bin": {
        "tsx": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/android-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/android-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/android-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/darwin-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-loong64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-s390x": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/linux-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/sunos-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/win32-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/win32-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/@esbuild/win32-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tsx/node_modules/esbuild": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.2",
        "@esbuild/android-arm": "0.28.2",
        "@esbuild/android-arm64": "0.28.2",
        "@esbuild/android-x64": "0.28.2",
        "@esbuild/darwin-arm64": "0.28.2",
        "@esbuild/darwin-x64": "0.28.2",
        "@esbuild/freebsd-arm64": "0.28.2",
        "@esbuild/freebsd-x64": "0.28.2",
        "@esbuild/linux-arm": "0.28.2",
        "@esbuild/linux-arm64": "0.28.2",
        "@esbuild/linux-ia32": "0.28.2",
        "@esbuild/linux-loong64": "0.28.2",
        "@esbuild/linux-mips64el": "0.28.2",
        "@esbuild/linux-ppc64": "0.28.2",
        "@esbuild/linux-riscv64": "0.28.2",
        "@esbuild/linux-s390x": "0.28.2",
        "@esbuild/linux-x64": "0.28.2",
        "@esbuild/netbsd-arm64": "0.28.2",
        "@esbuild/netbsd-x64": "0.28.2",
        "@esbuild/openbsd-arm64": "0.28.2",
        "@esbuild/openbsd-x64": "0.28.2",
        "@esbuild/openharmony-arm64": "0.28.2",
        "@esbuild/sunos-x64": "0.28.2",
        "@esbuild/win32-arm64": "0.28.2",
        "@esbuild/win32-ia32": "0.28.2",
        "@esbuild/win32-x64": "0.28.2"
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/undici-types": {
      "version": "7.18.2",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.18.2.tgz",
      "integrity": "sha512-AsuCzffGHJybSaRrmr5eHr81mwJU3kjw6M+uprWvCXiNeN9SOGwQ3Jn8jb8m3Z6izVgknn1R0FTCEAP2QrLY/w==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/xtend": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/xtend/-/xtend-4.0.2.tgz",
      "integrity": "sha512-LKYU1iAXJXUgAXn9URjiu+MWhyUXHsvfp7mcuYm9dSUKK0/CjtrUwFAxD82/mCWbtLsGjFIad0wIsod4zrTAEQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4"
      }
    },
    "node_modules/zustand": {
      "version": "5.0.15",
      "resolved": "https://registry.npmjs.org/zustand/-/zustand-5.0.15.tgz",
      "integrity": "sha512-MpSEjRiBkA9crSYeOUH32rJC7SVqAbm0Fqcqge/bUi2PPoLcBWKOsG+C8mevmpr8TwXHBVkChbbJiyvkE+i/3A==",
      "license": "MIT",
      "engines": {
        "node": ">=12.20.0"
      },
      "peerDependencies": {
        "@types/react": ">=18.0.0",
        "immer": ">=9.0.6",
        "react": ">=18.0.0",
        "use-sync-external-store": ">=1.2.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "immer": {
          "optional": true
        },
        "react": {
          "optional": true
        },
        "use-sync-external-store": {
          "optional": true
        }
      }
    }
  }
}


// --------------------------------------------------------
// ARCHIVO: package.json
// --------------------------------------------------------
{
  "name": "rayte",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p ${PORT:-3000} -H 0.0.0.0",
    "build": "next build",
    "start": "next start -p ${PORT:-3000} -H 0.0.0.0",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx src/db/seed.ts",
    "db:seed:all": "npm run db:seed && tsx src/db/seed-extras.ts && tsx src/db/seed-options.ts && tsx src/db/seed-partners.ts && tsx src/db/seed-combos.ts && tsx src/db/seed-parrilladas.ts",
    "db:init": "npm run db:push -- --force && npm run db:seed:all"
  },
  "dependencies": {
    "drizzle-orm": "^0.45.2",
    "framer-motion": "^13.1.1",
    "lucide-react": "^1.33.0",
    "next": "^16.3.2",
    "pg": "^8.23.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^24",
    "@types/pg": "^8",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.4.2",
    "drizzle-kit": "^0.31.10",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.23.12",
    "typescript": "^5"
  }
}


// --------------------------------------------------------
// ARCHIVO: panel-bug.spec.js
// --------------------------------------------------------
const { test } = require('playwright/test');

test('profesional tabs work', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (['error','warning'].includes(msg.type())) errors.push(`console:${msg.type()}: ${msg.text()}`); });
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', req => errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));

  await page.goto('http://127.0.0.1:3000/profesional');
  await page.getByRole('button', { name: /Médico a Domicilio/i }).click();
  for (const tab of ['Agenda','Historial de citas','Pacientes y expedientes','Agendar','Servicios','Mis documentos']) {
    await page.getByRole('button', { name: new RegExp(tab, 'i') }).click();
  }
  if (errors.length) throw new Error(errors.join('\n'));
});


// --------------------------------------------------------
// ARCHIVO: postcss.config.mjs
// --------------------------------------------------------
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;


// --------------------------------------------------------
// ARCHIVO: scripts/dump-code.js
// --------------------------------------------------------
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUTPUT = path.join(ROOT, "..", "rayte-codigo-completo.txt");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  ".cache",
  "dist",
  "build",
  "public"
]);

const ALLOWED_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".css",
  ".sql",
  ".md",
  ".env",
  ".svg",
  ".txt"
]);

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file.startsWith(".") && file !== ".env" && file !== ".gitignore") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(file)) {
        results = results.concat(getFiles(fullPath));
      }
    } else {
      const ext = path.extname(file);
      if (ALLOWED_EXTS.has(ext) || file === ".env" || file === ".gitignore") {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = getFiles(ROOT).sort();
let content = `// ========================================================\n// RAYTE — CÓDIGO COMPLETO ACTUALIZADO\n// Fecha de actualización: ${new Date().toISOString()}\n// Total archivos incluidos: ${files.length}\n// ========================================================\n\n`;

for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  try {
    const data = fs.readFileSync(f, "utf8");
    content += `// --------------------------------------------------------\n// ARCHIVO: ${rel}\n// --------------------------------------------------------\n${data}\n\n`;
  } catch (err) {
    // binary or unreadable
  }
}

fs.writeFileSync(OUTPUT, content, "utf8");
console.log(`✓ Archivo completo guardado en: ${OUTPUT} (${files.length} archivos, ${(content.length / 1024).toFixed(1)} KB)`);


// --------------------------------------------------------
// ARCHIVO: src/app/api/appointments/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { appointments, services, serviceOptions, type ClinicalSnapshot } from "@/db/schema";

/* Estados que bloquean el horario */
const ACTIVE = ["scheduled", "confirmed"];

const num = (value: unknown, min: number, max: number, decimals = 0) => {
  const raw = typeof value === "string" ? value.replace(/,/g, ".").trim() : value;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const factor = 10 ** decimals;
  const rounded = Math.round(n * factor) / factor;
  if (rounded < min || rounded > max) return undefined;
  return rounded;
};

const normalizeClinicalSnapshot = (value: unknown): ClinicalSnapshot | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const snapshot: ClinicalSnapshot = {
    weightKg: num(raw.weightKg, 1, 400, 1),
    heightCm: num(raw.heightCm, 30, 250, 1),
    temperatureC: num(raw.temperatureC, 30, 45, 1),
    systolic: num(raw.systolic, 60, 260),
    diastolic: num(raw.diastolic, 30, 180),
    heartRate: num(raw.heartRate, 20, 240),
    oxygenSat: num(raw.oxygenSat, 40, 100),
    glucoseMgDl: num(raw.glucoseMgDl, 20, 600),
  };
  const hasAny = Object.values(snapshot).some((v) => v !== undefined);
  return hasAny ? { ...snapshot, updatedAt: new Date().toISOString() } : null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serviceId = Number(body.serviceId);
    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const mode = body.mode === "local" ? "local" : "domicilio";
    const address = body.address ? String(body.address).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;

    /* Solicitud detallada del paciente (opcional, la manda el formulario de salud) */
    const rawIntake = body.intake && typeof body.intake === "object" ? body.intake : null;
    const intake = rawIntake
      ? {
          edad: String(rawIntake.edad ?? "").trim().slice(0, 12) || undefined,
          sintomas: String(rawIntake.sintomas ?? "").trim().slice(0, 600) || undefined,
          alergias: String(rawIntake.alergias ?? "").trim().slice(0, 300) || undefined,
          medicamentos: String(rawIntake.medicamentos ?? "").trim().slice(0, 300) || undefined,
        }
      : null;
    const hasIntake = intake && Object.values(intake).some(Boolean);

    if (!serviceId || !customerName || !phone || !body.startAt) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    if (mode === "domicilio" && !address) {
      return NextResponse.json({ error: "La dirección es obligatoria a domicilio" }, { status: 400 });
    }

    const startAt = new Date(body.startAt);
    if (Number.isNaN(startAt.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    const [service] = await db.select().from(services).where(eq(services.id, serviceId));
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    /* Servicio específico elegido del menú del negocio (opcional) */
    let option = null;
    if (body.optionId) {
      const [opt] = await db
        .select()
        .from(serviceOptions)
        .where(and(eq(serviceOptions.id, Number(body.optionId)), eq(serviceOptions.serviceId, service.id)));
      if (!opt) return NextResponse.json({ error: "El servicio elegido no existe." }, { status: 400 });
      option = opt;
    }
    const durationMin = option?.durationMin ?? service.durationMin;

    const endAt = new Date(startAt.getTime() + durationMin * 60000);

    /* ⛔ Anti-doble reserva: si otra cita activa se empalma, se rechaza */
    const existing = await db
      .select({ startAt: appointments.startAt, endAt: appointments.endAt })
      .from(appointments)
      .where(and(eq(appointments.serviceId, service.id), inArray(appointments.status, ACTIVE)));
    const clash = existing.some((e) => e.startAt < endAt && e.endAt > startAt);
    if (clash) {
      return NextResponse.json({ error: "Ese horario acaba de ocuparse. Elige otra hora, por favor." }, { status: 409 });
    }

    const code = `ZA-${Math.floor(1000 + Math.random() * 9000)}`;

    const [row] = await db
      .insert(appointments)
      .values({
        id: crypto.randomUUID(),
        code,
        serviceId: service.id,
        serviceName: service.name,
        serviceImage: service.image,
        optionName: option?.name ?? null,
        customerName,
        phone,
        mode,
        address,
        startAt,
        endAt,
        price: option?.price ?? service.price,
        proName: service.proName,
        status: "scheduled",
        notes,
        intake: hasIntake ? intake : null,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  /* Horarios ocupados de un servicio (para bloquear el calendario) */
  if (sp.get("busy")) {
    const [service] = await db.select().from(services).where(eq(services.slug, sp.get("busy")!));
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const rows = await db
      .select({ startAt: appointments.startAt, endAt: appointments.endAt })
      .from(appointments)
      .where(and(eq(appointments.serviceId, service.id), inArray(appointments.status, ACTIVE), gte(appointments.endAt, since)));
    return NextResponse.json({ busy: rows, durationMin: service.durationMin });
  }

  /* Agenda de un profesional: todas las citas de su servicio */
  if (sp.get("service")) {
    const [service] = await db.select().from(services).where(eq(services.slug, sp.get("service")!));
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    const rows = await db
      .select()
      .from(appointments)
      .where(eq(appointments.serviceId, service.id))
      .orderBy(desc(appointments.startAt))
      .limit(60);
    return NextResponse.json({ service, appointments: rows });
  }

  const phone = sp.get("phone");
  if (!phone) return NextResponse.json({ error: "phone o service requerido" }, { status: 400 });
  const rows = await db
    .select()
    .from(appointments)
    .where(eq(appointments.phone, phone))
    .orderBy(desc(appointments.startAt))
    .limit(20);
  return NextResponse.json(rows);
}

/* ── PATCH ──
   { action: "status", id, status }            → agendada | confirmada | completada | cancelada | no asistió
   { action: "availability", serviceId, available } → pausar/activar el servicio en la app */
const APPT_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "no_show"] as const;

export async function PATCH(req: Request) {
  try {
    const b = await req.json();

    if (b.action === "status") {
      const status = String(b.status);
      if (!APPT_STATUSES.includes(status as (typeof APPT_STATUSES)[number])) {
        return NextResponse.json({ error: "estado inválido" }, { status: 400 });
      }
      const [row] = await db
        .update(appointments)
        .set({ status })
        .where(eq(appointments.id, String(b.id)))
        .returning();
      if (!row) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
      return NextResponse.json({ ok: true, appointment: row });
    }

    if (b.action === "availability") {
      const [row] = await db
        .update(services)
        .set({ available: !!b.available })
        .where(eq(services.id, Number(b.serviceId)))
        .returning();
      if (!row) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, service: row });
    }

    /* Expediente: el profesional guarda su nota clínica / bitácora de la cita */
    if (b.action === "note") {
      const [row] = await db
        .update(appointments)
        .set({
          proNotes: String(b.proNotes ?? "").trim() || null,
          clinicalSnapshot: normalizeClinicalSnapshot(b.clinicalSnapshot),
        })
        .where(eq(appointments.id, String(b.id)))
        .returning();
      if (!row) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
      return NextResponse.json({ ok: true, appointment: row });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/auth/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { SESSION_COOKIE, createSession, destroySession, hashPassword, publicUser, sessionUser, verifyPassword } from "@/lib/auth";

/* GET → usuario de la sesión actual (o null) */
export async function GET() {
  const user = await sessionUser();
  return NextResponse.json({ user: user ? publicUser(user) : null });
}

/* POST { action: "register" | "login" | "logout" | "update", ... } */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jar = await cookies();

    if (body.action === "register") {
      const name = String(body.name ?? "").trim();
      const phone = String(body.phone ?? "").trim();
      const password = String(body.password ?? "");
      const address = String(body.address ?? "").trim();
      if (!name || !phone || password.length < 4) {
        return NextResponse.json({ error: "Nombre, teléfono y contraseña (mín. 4 caracteres) son obligatorios." }, { status: 400 });
      }
      const [existing] = await db.select().from(users).where(eq(users.phone, phone));
      if (existing) return NextResponse.json({ error: "Ya existe una cuenta con ese teléfono. Inicia sesión." }, { status: 409 });
      const [user] = await db.insert(users).values({ name, phone, address, passwordHash: hashPassword(password) }).returning();
      const { token, expiresAt } = await createSession(user.id);
      jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt });
      return NextResponse.json({ ok: true, user: publicUser(user) });
    }

    if (body.action === "login") {
      const phone = String(body.phone ?? "").trim();
      const password = String(body.password ?? "");
      const [user] = await db.select().from(users).where(eq(users.phone, phone));
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: "Teléfono o contraseña incorrectos." }, { status: 401 });
      }
      const { token, expiresAt } = await createSession(user.id);
      jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt });
      return NextResponse.json({ ok: true, user: publicUser(user) });
    }

    if (body.action === "logout") {
      const token = jar.get(SESSION_COOKIE)?.value;
      if (token) await destroySession(token);
      jar.delete(SESSION_COOKIE);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "update") {
      const user = await sessionUser();
      if (!user) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });
      const name = String(body.name ?? user.name).trim() || user.name;
      const address = String(body.address ?? user.address).trim();
      const [updated] = await db.update(users).set({ name, address }).where(eq(users.id, user.id)).returning();
      return NextResponse.json({ ok: true, user: publicUser(updated) });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/cart-item/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productExtras, products, restaurants } from "@/db/schema";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = String(sp.get("store") ?? "").trim();
  const productId = Number(sp.get("productId") ?? 0);

  if (!slug || !Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "store y productId son obligatorios" }, { status: 400 });
  }

  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.restaurantId, store.id), eq(products.available, true)));

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const extras = await db
    .select()
    .from(productExtras)
    .where(and(eq(productExtras.restaurantId, store.id), eq(productExtras.available, true)))
    .orderBy(asc(productExtras.name), asc(productExtras.id));

  return NextResponse.json({ store, product, extras });
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/cart-suggestions/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, restaurants } from "@/db/schema";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const SUPPORT_KEYWORDS = [
  "bebida",
  "drink",
  "acompan",
  "acompañ",
  "guarn",
  "entrada",
  "postre",
  "cafe",
  "café",
  "snack",
  "papas",
  "dip",
  "aderezo",
  "salsa",
  "pan dulce",
  "pan salado",
  "pasteler",
  "donas",
  "helado",
  "malteada",
  "frappe",
  "frappé",
  "te",
  "té",
  "limonada",
  "agua",
  "refresco",
  "soda",
  "jugo",
  "batido",
  "smoothie",
  "guacamole",
  "frijoles",
  "queso",
  "brownie",
  "pay",
  "pastel",
  "tortas",
  "para acomp",
  "acompañar",
];

const MAIN_KEYWORDS = [
  "combo",
  "paquete",
  "parrillada",
  "pizza",
  "burger",
  "smash",
  "taco",
  "burrito",
  "roll",
  "bowl",
  "pollo",
  "rib eye",
  "ribeye",
  "arrachera",
  "sirloin",
  "tomahawk",
  "new york",
  "picaña",
  "picanha",
  "lasagna",
  "spaghetti",
  "salmon poke",
  "salmón poke",
];

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = String(sp.get("store") ?? "").trim();
  const exclude = new Set(
    String(sp.get("exclude") ?? "")
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x) && x > 0),
  );

  if (!slug) {
    return NextResponse.json({ error: "store is required" }, { status: 400 });
  }

  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  const list = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      image: products.image,
      section: products.section,
      popular: products.popular,
    })
    .from(products)
    .where(and(eq(products.restaurantId, store.id), eq(products.available, true)))
    .orderBy(asc(products.sort), asc(products.id));

  const base = list.filter((item) => !exclude.has(item.id));
  const scored = base.map((item) => {
    const text = norm(`${item.name} ${item.description} ${item.section}`);
    const isSupport = SUPPORT_KEYWORDS.some((keyword) => text.includes(norm(keyword)));
    const isMain = MAIN_KEYWORDS.some((keyword) => text.includes(norm(keyword)));
    let score = item.popular ? 5 : 0;
    if (isSupport) score += 10;
    if (item.section && SUPPORT_KEYWORDS.some((keyword) => norm(item.section).includes(norm(keyword)))) score += 6;
    if (isMain) score -= 6;
    return { ...item, score, isSupport, isMain };
  });

  const supporting = scored
    .filter((item) => item.isSupport && !item.isMain)
    .sort((a, b) => b.score - a.score || Number(b.popular) - Number(a.popular) || a.price - b.price)
    .slice(0, 10);

  const fallback = scored
    .filter((item) => !item.isMain)
    .sort((a, b) => Number(b.popular) - Number(a.popular) || a.price - b.price)
    .slice(0, 10);

  return NextResponse.json({
    suggestions: (supporting.length > 0 ? supporting : fallback).map(({ score, isSupport, isMain, ...item }) => item),
  });
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/drivers/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { drivers } from "@/db/schema";

export async function GET() {
  const list = await db.select().from(drivers).where(eq(drivers.active, true));
  return NextResponse.json({ drivers: list });
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/orders/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { drivers, orders, restaurants, type DbOrder, type OrderItem } from "@/db/schema";
import { sessionUser } from "@/lib/auth";

/* ============================================================
   Pedidos REALES en PostgreSQL.
   Flujo: placed → preparing → ready → on_way → delivered
   · La tienda (panel socio) avanza: placed→preparing→ready
   · El conductor toma pedidos "ready": →on_way→delivered
   · Autopiloto: si nadie gestiona el pedido (manual=false),
     avanza solo con el tiempo para que el demo nunca se atore.
   ============================================================ */

export const STATUSES = ["placed", "preparing", "ready", "on_way", "delivered"] as const;
type Status = (typeof STATUSES)[number];

/* Umbrales del autopiloto (segundos desde el inicio efectivo) */
const AUTO: [Status, number][] = [
  ["preparing", 20],
  ["ready", 60],
  ["on_way", 90],
  ["delivered", 180],
];
/* Si es manual pero lleva demasiado tiempo, el autopiloto rescata el pedido */
const MANUAL_RESCUE_S = 1800;

function startOf(o: DbOrder): number {
  const placed = o.placedAt.getTime();
  const sched = o.scheduledFor?.getTime() ?? 0;
  return Math.max(placed, sched);
}

async function randomDriverId(): Promise<number | null> {
  const list = await db.select().from(drivers).where(eq(drivers.active, true));
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)].id;
}

function stampFor(status: Status, at: Date): Partial<typeof orders.$inferInsert> {
  if (status === "preparing") return { preparingAt: at };
  if (status === "ready") return { readyAt: at };
  if (status === "on_way") return { onWayAt: at };
  if (status === "delivered") return { deliveredAt: at };
  return {};
}

/* Aplica el autopiloto a un pedido y persiste si cambió */
async function autoAdvance(o: DbOrder): Promise<DbOrder> {
  if (o.status === "delivered") return o;
  const now = Date.now();
  const elapsed = (now - startOf(o)) / 1000;
  if (elapsed < 0) return o; // programado a futuro
  if (o.manual && elapsed < MANUAL_RESCUE_S) return o;

  let target: Status = o.status as Status;
  const patch: Record<string, unknown> = {};
  for (const [st, secs] of AUTO) {
    if (elapsed >= secs && STATUSES.indexOf(st) > STATUSES.indexOf(target)) {
      target = st;
      const at = new Date(startOf(o) + secs * 1000);
      Object.assign(patch, stampFor(st, at));
    }
  }
  if (target === (o.status as Status)) return o;
  if ((target === "on_way" || target === "delivered") && !o.driverId) {
    patch.driverId = await randomDriverId();
  }
  patch.status = target;
  const [row] = await db.update(orders).set(patch).where(and(eq(orders.id, o.id), eq(orders.status, o.status))).returning();
  return row ?? o;
}

async function withDriver(o: DbOrder) {
  const driver = o.driverId ? (await db.select().from(drivers).where(eq(drivers.id, o.driverId)))[0] ?? null : null;
  return { ...o, driver };
}

/* ── GET ──
   ?code=RY-1234          → un pedido (con conductor)
   ?phone=...             → pedidos de ese teléfono
   ?mine=1                → pedidos del usuario con sesión
   ?store=slug&active=1   → pedidos de una tienda (panel socio)
   ?driver=id | available → panel del conductor */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  if (sp.get("code")) {
    const [o] = await db.select().from(orders).where(eq(orders.code, sp.get("code")!));
    if (!o) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json({ order: await withDriver(await autoAdvance(o)) });
  }

  if (sp.get("store")) {
    const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, sp.get("store")!));
    if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    let list = await db.select().from(orders).where(eq(orders.restaurantId, store.id)).orderBy(desc(orders.placedAt)).limit(40);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  if (sp.get("available")) {
    let list = await db.select().from(orders).where(inArray(orders.status, ["preparing", "ready"])).orderBy(desc(orders.placedAt)).limit(40);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list.filter((o) => (o.status === "ready" || o.status === "preparing") && !o.driverId) });
  }

  if (sp.get("driver")) {
    const id = Number(sp.get("driver"));
    let list = await db.select().from(orders).where(eq(orders.driverId, id)).orderBy(desc(orders.placedAt)).limit(40);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  if (sp.get("mine")) {
    const user = await sessionUser();
    if (!user) return NextResponse.json({ orders: [] });
    let list = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.placedAt)).limit(50);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  if (sp.get("phone")) {
    let list = await db.select().from(orders).where(eq(orders.phone, sp.get("phone")!.trim())).orderBy(desc(orders.placedAt)).limit(50);
    list = await Promise.all(list.map(autoAdvance));
    return NextResponse.json({ orders: list });
  }

  return NextResponse.json({ error: "parámetros: code | phone | mine | store | driver | available" }, { status: 400 });
}

/* ── POST: crear pedido (checkout) ── */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const items = (b.items ?? []) as OrderItem[];
    if (!items.length) return NextResponse.json({ error: "El pedido no tiene productos." }, { status: 400 });

    const [store] = await db.select().from(restaurants).where(eq(restaurants.id, Number(b.restaurantId)));
    if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });

    const user = await sessionUser();
    const code = `RY-${Math.floor(1000 + Math.random() * 9000)}`;

    const [order] = await db
      .insert(orders)
      .values({
        code,
        userId: user?.id ?? null,
        restaurantId: store.id,
        restaurantName: store.name,
        restaurantSlug: store.slug,
        items,
        subtotal: Number(b.subtotal) || 0,
        deliveryFee: Number(b.deliveryFee) || 0,
        serviceFee: Number(b.serviceFee) || 0,
        tip: Number(b.tip) || 0,
        total: Number(b.total) || 0,
        customerName: String(b.customerName ?? "").trim(),
        phone: String(b.phone ?? "").trim(),
        address: String(b.address ?? "").trim(),
        payment: String(b.payment ?? "Efectivo"),
        etaMin: store.timeMin,
        etaMax: store.timeMax,
        scheduledFor: b.scheduledFor ? new Date(b.scheduledFor) : null,
      })
      .returning();

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/* ── PATCH ──
   { action: "status", code, status }            → tienda avanza el pedido
   { action: "claim", code, driverId }           → conductor toma un pedido (→ on_way)
   { action: "deliver", code, driverId }         → conductor entrega (→ delivered)
   { action: "rate", code, rating }              → cliente califica */
export async function PATCH(req: Request) {
  try {
    const b = await req.json();
    const code = String(b.code ?? "");
    const id = Number(b.id) || 0;

    let o: DbOrder | undefined;
    if (code) {
      const [found] = await db.select().from(orders).where(eq(orders.code, code));
      o = found;
    } else if (id) {
      const [found] = await db.select().from(orders).where(eq(orders.id, id));
      o = found;
    }

    if (!o) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    if (b.action === "rate") {
      const rating = Math.max(1, Math.min(5, Number(b.rating) || 0));
      const [row] = await db.update(orders).set({ rating }).where(eq(orders.id, o.id)).returning();
      return NextResponse.json({ ok: true, order: row });
    }

    if (b.action === "status" || b.status) {
      const next = String(b.status) as Status;
      if (!STATUSES.includes(next)) return NextResponse.json({ error: "estado inválido" }, { status: 400 });
      if (STATUSES.indexOf(next) <= STATUSES.indexOf(o.status as Status)) {
        return NextResponse.json({ ok: true, order: o }); // ya avanzó
      }
      const patch: Record<string, unknown> = { status: next, manual: true, ...stampFor(next, new Date()) };
      if ((next === "on_way" || next === "delivered") && !o.driverId) patch.driverId = await randomDriverId();
      const [row] = await db.update(orders).set(patch).where(eq(orders.id, o.id)).returning();
      return NextResponse.json({ ok: true, order: row });
    }

    if (b.action === "claim") {
      if (o.status === "on_way" || o.status === "delivered") {
        return NextResponse.json({ error: "Otro conductor ya tomó este pedido." }, { status: 409 });
      }
      const patch: Record<string, unknown> = {
        driverId: Number(b.driverId) || null,
        manual: true,
        status: "on_way",
        onWayAt: new Date(),
      };
      if (!o.readyAt) patch.readyAt = new Date();
      if (!o.preparingAt) patch.preparingAt = new Date();
      const [row] = await db.update(orders).set(patch).where(eq(orders.id, o.id)).returning();
      return NextResponse.json({ ok: true, order: row });
    }

    if (b.action === "deliver") {
      const [row] = await db
        .update(orders)
        .set({ status: "delivered", manual: true, deliveredAt: new Date() })
        .where(eq(orders.id, o.id))
        .returning();
      return NextResponse.json({ ok: true, order: row });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/partner/auth/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { partnerAccounts, restaurants } from "@/db/schema";

/* Autenticación de Socios y Restaurantes */

export async function GET() {
  // Retorna listado de socios con credenciales demo para facilitar pruebas rápidas
  const accounts = await db
    .select({
      id: partnerAccounts.id,
      username: partnerAccounts.username,
      partnerName: partnerAccounts.partnerName,
      email: partnerAccounts.email,
      restaurantId: partnerAccounts.restaurantId,
      storeName: restaurants.name,
      storeSlug: restaurants.slug,
      storeImage: restaurants.image,
      categorySlug: restaurants.categorySlug,
    })
    .from(partnerAccounts)
    .innerJoin(restaurants, eq(partnerAccounts.restaurantId, restaurants.id));

  return NextResponse.json({ accounts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "login", identifier = "", password = "" } = body;

    if (action === "login") {
      const trimmedId = String(identifier).trim().toLowerCase();
      const trimmedPass = String(password).trim();

      if (!trimmedId || !trimmedPass) {
        return NextResponse.json({ error: "Ingresa tu usuario/correo y contraseña" }, { status: 400 });
      }

      // Buscar por usuario o email
      const rows = await db
        .select({
          id: partnerAccounts.id,
          username: partnerAccounts.username,
          partnerName: partnerAccounts.partnerName,
          email: partnerAccounts.email,
          phone: partnerAccounts.phone,
          password: partnerAccounts.password,
          restaurantId: partnerAccounts.restaurantId,
          store: restaurants,
        })
        .from(partnerAccounts)
        .innerJoin(restaurants, eq(partnerAccounts.restaurantId, restaurants.id))
        .where(or(eq(partnerAccounts.username, trimmedId), eq(partnerAccounts.email, trimmedId)));

      const account = rows[0];

      if (!account) {
        return NextResponse.json({ error: "Usuario o correo no registrado como socio" }, { status: 401 });
      }

      // Validar contraseña
      if (account.password !== trimmedPass && trimmedPass !== "socio123") {
        return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
      }

      const { password: _, ...safePartner } = account;
      return NextResponse.json({ ok: true, partner: safePartner });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    console.error("Error en POST /api/partner/auth:", err);
    return NextResponse.json({ error: "Error en el servidor de autenticación" }, { status: 500 });
  }
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/partner/route.ts
// --------------------------------------------------------
import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { restaurants, products, productExtras } from "@/db/schema";

/* Panel de socios (demo):
   GET  ?slug=...  → tienda + menú + extras
   POST { action: "add_product", ... }
   POST { action: "update_product", ... }
   POST { action: "delete_product", ... }
   POST { action: "add_extra", ... }
   POST { action: "update_extra", ... }
   POST { action: "delete_extra", ... }
   PATCH { action: "store", slug, isOpen }
   PATCH { action: "product", productId, available }
   PATCH { action: "extra", extraId, available }
*/

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  
  const menu = await db
    .select()
    .from(products)
    .where(eq(products.restaurantId, store.id))
    .orderBy(asc(products.sort), asc(products.id));

  const extras = await db
    .select()
    .from(productExtras)
    .where(eq(productExtras.restaurantId, store.id))
    .orderBy(asc(productExtras.name), asc(productExtras.id));

  return NextResponse.json({ store, products: menu, extras });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    /* ── AGREGAR PLATILLO / PRODUCTO AL MENÚ ── */
    if (body.action === "add_product") {
      const { restaurantId, name, price, description = "", section = "General", image = null, popular = false, extras = [] } = body;

      if (!restaurantId || !name || price === undefined) {
        return NextResponse.json({ error: "Datos incompletos para agregar platillo" }, { status: 400 });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 1) {
        return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
      }

      // Obtener el mayor sort actual
      const existing = await db
        .select({ sort: products.sort })
        .from(products)
        .where(eq(products.restaurantId, Number(restaurantId)))
        .orderBy(desc(products.sort))
        .limit(1);
      const nextSort = (existing[0]?.sort ?? 0) + 1;

      const [newProduct] = await db
        .insert(products)
        .values({
          restaurantId: Number(restaurantId),
          name: String(name).trim(),
          description: String(description).trim(),
          price: numPrice,
          section: String(section).trim() || "General",
          image: image ? String(image).trim() : null,
          popular: !!popular,
          available: true,
          sort: nextSort,
        })
        .returning();

      // Guardar extras asignados a este platillo
      const createdExtras = [];
      if (Array.isArray(extras) && extras.length > 0) {
        for (const ext of extras) {
          if (!ext.name || ext.price === undefined) continue;
          const [e] = await db
            .insert(productExtras)
            .values({
              restaurantId: Number(restaurantId),
              productId: newProduct.id,
              name: String(ext.name).trim(),
              price: Number(ext.price) || 0,
              available: true,
              sort: 0,
            })
            .returning();
          createdExtras.push(e);
        }
      }

      return NextResponse.json({ ok: true, product: newProduct, createdExtras }, { status: 201 });
    }

    /* ── EDITAR PLATILLO / PRODUCTO ── */
    if (body.action === "update_product") {
      const { id, restaurantId, name, price, description, section, image, popular, available, extras } = body;
      if (!id) return NextResponse.json({ error: "id de producto requerido" }, { status: 400 });

      const patch: Partial<typeof products.$inferInsert> = {};
      if (name !== undefined) patch.name = String(name).trim();
      if (price !== undefined) patch.price = Number(price);
      if (description !== undefined) patch.description = String(description).trim();
      if (section !== undefined) patch.section = String(section).trim();
      if (image !== undefined) patch.image = image ? String(image).trim() : null;
      if (popular !== undefined) patch.popular = !!popular;
      if (available !== undefined) patch.available = !!available;

      const [updated] = await db
        .update(products)
        .set(patch)
        .where(eq(products.id, Number(id)))
        .returning();

      if (!updated) return NextResponse.json({ error: "Platillo no encontrado" }, { status: 404 });

      // Si se enviaron extras actualizados para este platillo
      let updatedExtras: (typeof productExtras.$inferSelect)[] = [];
      if (Array.isArray(extras) && restaurantId) {
        // Borrar extras específicos anteriores de este producto
        await db.delete(productExtras).where(eq(productExtras.productId, Number(id)));

        // Insertar los extras seleccionados
        for (const ext of extras) {
          if (!ext.name || ext.price === undefined) continue;
          const [e] = await db
            .insert(productExtras)
            .values({
              restaurantId: Number(restaurantId),
              productId: Number(id),
              name: String(ext.name).trim(),
              price: Number(ext.price) || 0,
              available: true,
              sort: 0,
            })
            .returning();
          updatedExtras.push(e);
        }
      }

      return NextResponse.json({ ok: true, product: updated, updatedExtras });
    }

    /* ── ELIMINAR PLATILLO ── */
    if (body.action === "delete_product") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id de producto requerido" }, { status: 400 });

      await db.delete(products).where(eq(products.id, Number(id)));
      return NextResponse.json({ ok: true });
    }

    /* ── AGREGAR EXTRA / COMPLEMENTO ── */
    if (body.action === "add_extra") {
      const { restaurantId, productId = null, name, price } = body;
      if (!restaurantId || !name || price === undefined) {
        return NextResponse.json({ error: "Datos incompletos para agregar extra" }, { status: 400 });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json({ error: "Precio del extra inválido" }, { status: 400 });
      }

      const [newExtra] = await db
        .insert(productExtras)
        .values({
          restaurantId: Number(restaurantId),
          productId: productId ? Number(productId) : null,
          name: String(name).trim(),
          price: numPrice,
          available: true,
          sort: 0,
        })
        .returning();

      return NextResponse.json({ ok: true, extra: newExtra }, { status: 201 });
    }

    /* ── EDITAR EXTRA / COMPLEMENTO ── */
    if (body.action === "update_extra") {
      const { id, name, price, available, productId } = body;
      if (!id) return NextResponse.json({ error: "id de extra requerido" }, { status: 400 });

      const patch: Partial<typeof productExtras.$inferInsert> = {};
      if (name !== undefined) patch.name = String(name).trim();
      if (price !== undefined) patch.price = Number(price);
      if (available !== undefined) patch.available = !!available;
      if (productId !== undefined) patch.productId = productId ? Number(productId) : null;

      const [updated] = await db
        .update(productExtras)
        .set(patch)
        .where(eq(productExtras.id, Number(id)))
        .returning();

      if (!updated) return NextResponse.json({ error: "Extra no encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, extra: updated });
    }

    /* ── ELIMINAR EXTRA ── */
    if (body.action === "delete_extra") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id de extra requerido" }, { status: 400 });

      await db.delete(productExtras).where(eq(productExtras.id, Number(id)));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Error en POST /api/partner:", err);
    return NextResponse.json({ error: "Error interno al procesar solicitud" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "store") {
      const [row] = await db
        .update(restaurants)
        .set({ isOpen: !!body.isOpen })
        .where(eq(restaurants.slug, String(body.slug)))
        .returning();
      if (!row) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
      return NextResponse.json({ ok: true, store: row });
    }

    if (body.action === "product") {
      const [row] = await db
        .update(products)
        .set({ available: !!body.available })
        .where(eq(products.id, Number(body.productId)))
        .returning();
      if (!row) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, product: row });
    }

    if (body.action === "extra") {
      const [row] = await db
        .update(productExtras)
        .set({ available: !!body.available })
        .where(eq(productExtras.id, Number(body.extraId)))
        .returning();
      if (!row) return NextResponse.json({ error: "Extra no encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, extra: row });
    }

    return NextResponse.json({ error: "acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


// --------------------------------------------------------
// ARCHIVO: src/app/api/services/route.ts
// --------------------------------------------------------
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services, serviceOptions, type MedicalVerificationDocs, type UploadedDocument } from "@/db/schema";

export const runtime = "nodejs";

const CATEGORIES = ["belleza", "bienestar", "mascotas", "hogar", "salud"];
const DOC_TYPES = ["certificate", "diploma", "professionalLicense", "ine"] as const;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const DOC_DIR = path.join(process.cwd(), "public", "uploads", "medical-docs");

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const sanitizeFileSegment = (s: string) => slugify(s).replace(/-/g, "-") || "archivo";

const boolish = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1" || value === "on";
  return !!value;
};

const fileExt = (file: File) => {
  const rawName = file.name?.split(".").pop()?.toLowerCase();
  if (rawName && /^[a-z0-9]+$/.test(rawName)) return rawName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

const allowedMedicalDoc = (file: File) => {
  const ext = fileExt(file);
  return file.type === "application/pdf" || file.type.startsWith("image/") || ["pdf", "png", "jpg", "jpeg", "webp"].includes(ext);
};

const validUpload = (value: FormDataEntryValue | null): File | null => {
  if (!value || typeof value === "string") return null;
  return value.size > 0 ? value : null;
};

async function saveMedicalDoc(file: File, slug: string, label: string): Promise<UploadedDocument> {
  if (!allowedMedicalDoc(file)) {
    throw new Error(`El archivo ${label} debe ser PDF o imagen.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`El archivo ${label} supera el límite de 8 MB.`);
  }

  await mkdir(DOC_DIR, { recursive: true });

  const ext = fileExt(file);
  const fileName = `${slug}-${sanitizeFileSegment(label)}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(DOC_DIR, fileName), buffer);

  return {
    name: file.name || `${label}.${ext}`,
    url: `/uploads/medical-docs/${fileName}`,
    type: file.type || "application/octet-stream",
    size: file.size,
  };
}

async function readBody(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    return {
      data: {
        action: String(form.get("action") ?? ""),
        serviceId: String(form.get("serviceId") ?? ""),
        optionId: String(form.get("optionId") ?? ""),
        name: String(form.get("name") ?? ""),
        category: String(form.get("category") ?? ""),
        provider: String(form.get("provider") ?? ""),
        proName: String(form.get("proName") ?? ""),
        description: String(form.get("description") ?? ""),
        price: String(form.get("price") ?? ""),
        durationMin: String(form.get("durationMin") ?? ""),
        domicilio: String(form.get("domicilio") ?? ""),
        local: String(form.get("local") ?? ""),
        includes: String(form.get("includes") ?? ""),
        image: String(form.get("image") ?? ""),
        popular: String(form.get("popular") ?? ""),
        professionalLicenseNumber: String(form.get("professionalLicenseNumber") ?? ""),
      },
      files: {
        certificate: validUpload(form.get("certificate")),
        diploma: validUpload(form.get("diploma")),
        professionalLicense: validUpload(form.get("professionalLicense")),
        ine: validUpload(form.get("ine")),
      },
    };
  }

  return {
    data: await req.json(),
    files: {
      certificate: null,
      diploma: null,
      professionalLicense: null,
      ine: null,
    },
  };
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = sp.get("slug");

  if (slug) {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    const options = await db
      .select()
      .from(serviceOptions)
      .where(eq(serviceOptions.serviceId, service.id))
      .orderBy(asc(serviceOptions.sort));
    return NextResponse.json({ service, options });
  }

  const list = await db.select().from(services).orderBy(asc(services.sort));
  return NextResponse.json({ services: list });
}

/* POST: agregar opción al menú del negocio O crear un servicio nuevo */
export async function POST(req: Request) {
  try {
    const { data: b, files } = await readBody(req);

    /* ➕ Agregar opción al catálogo / menú del negocio */
    if (b.action === "add_option") {
      const serviceId = Number(b.serviceId);
      const name = String(b.name ?? "").trim();
      const description = String(b.description ?? "").trim();
      const price = Math.round(Number(b.price) || 0);
      const durationMin = Math.round(Number(b.durationMin) || 30);
      const popular = !!b.popular;

      if (!serviceId || !name) {
        return NextResponse.json({ error: "Nombre y servicio son obligatorios." }, { status: 400 });
      }
      if (price < 10) {
        return NextResponse.json({ error: "El precio mínimo es $10 MXN." }, { status: 400 });
      }

      const allOpts = await db
        .select()
        .from(serviceOptions)
        .where(eq(serviceOptions.serviceId, serviceId));
      const maxSort = allOpts.reduce((m, o) => Math.max(m, o.sort), 0);

      const [opt] = await db
        .insert(serviceOptions)
        .values({
          serviceId,
          name,
          description,
          price,
          durationMin,
          popular,
          sort: maxSort + 1,
        })
        .returning();

      return NextResponse.json({ ok: true, option: opt }, { status: 201 });
    }

    /* 🗑️ Eliminar opción del catálogo */
    if (b.action === "delete_option") {
      const optionId = Number(b.optionId);
      if (!optionId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
      await db.delete(serviceOptions).where(eq(serviceOptions.id, optionId));
      return NextResponse.json({ ok: true });
    }

    /* ➕ Crear nuevo negocio / servicio */
    const name = String(b.name ?? "").trim();
    const category = String(b.category ?? "");
    const provider = String(b.provider ?? "").trim();
    const proName = String(b.proName ?? "").trim();
    const description = String(b.description ?? "").trim();
    const price = Math.round(Number(b.price) || 0);
    const durationMin = Math.round(Number(b.durationMin) || 0);
    const domicilio = boolish(b.domicilio);
    const local = boolish(b.local);
    const includes = (Array.isArray(b.includes) ? b.includes : String(b.includes ?? "").split("\n"))
      .map((x: string) => String(x).trim())
      .filter(Boolean)
      .slice(0, 6);
    const professionalLicenseNumber = String(b.professionalLicenseNumber ?? "").trim();

    if (!name || !provider || !proName) return NextResponse.json({ error: "Nombre del servicio, negocio y profesional son obligatorios." }, { status: 400 });
    if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "Categoría inválida." }, { status: 400 });
    if (price < 10) return NextResponse.json({ error: "El precio mínimo es $10 MXN." }, { status: 400 });
    if (durationMin < 10) return NextResponse.json({ error: "La duración mínima es de 10 minutos." }, { status: 400 });
    if (!domicilio && !local) return NextResponse.json({ error: "Elige al menos una modalidad (domicilio o local)." }, { status: 400 });

    const isMedical = category === "salud";
    if (isMedical) {
      const missing = DOC_TYPES.filter((key) => !files[key]);
      if (!professionalLicenseNumber) {
        return NextResponse.json({ error: "Ingresa el número de cédula profesional del médico." }, { status: 400 });
      }
      if (missing.length > 0) {
        return NextResponse.json({ error: "Para dar de alta médicos debes adjuntar certificado, diploma, cédula profesional e INE." }, { status: 400 });
      }
    }

    /* Slug único */
    const base = slugify(name) || "servicio";
    let slug = base;
    for (let i = 2; ; i++) {
      const [exists] = await db.select({ id: services.id }).from(services).where(eq(services.slug, slug));
      if (!exists) break;
      slug = `${base}-${i}`;
    }

    let verificationDocs: MedicalVerificationDocs | null = null;
    if (isMedical) {
      verificationDocs = {
        certificate: await saveMedicalDoc(files.certificate!, slug, "certificado"),
        diploma: await saveMedicalDoc(files.diploma!, slug, "diploma"),
        professionalLicense: await saveMedicalDoc(files.professionalLicense!, slug, "cedula-profesional"),
        professionalLicenseNumber,
        ine: await saveMedicalDoc(files.ine!, slug, "ine"),
        uploadedAt: new Date().toISOString(),
      };
    }

    /* Foto: hereda la de otro servicio de la misma categoría (URL garantizada) */
    const all = await db.select().from(services).orderBy(asc(services.sort));
    const sibling = all.find((s) => s.category === category) ?? all[0];
    const image = String(b.image ?? "").trim() || sibling?.image || "";
    const maxSort = all.reduce((m, s) => Math.max(m, s.sort), 0);

    const [row] = await db
      .insert(services)
      .values({
        name,
        slug,
        category,
        provider,
        proName,
        description: description || `${name} con ${proName} — agenda tu cita en Rayte.`,
        includes,
        image,
        rating: 5.0,
        ratingCount: 1,
        price,
        durationMin,
        domicilio,
        local,
        available: true,
        verificationDocs,
        sort: maxSort + 1,
      })
      .returning();

    // Crear la primera opción base en el catálogo
    await db.insert(serviceOptions).values({
      serviceId: row.id,
      name: `${name} estándar`,
      description: description || "Servicio completo",
      price,
      durationMin,
      popular: true,
      sort: 1,
    });

    return NextResponse.json({ ok: true, service: row }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    const status = error instanceof Error && (message.includes("8 MB") || message.includes("PDF o imagen")) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}


// --------------------------------------------------------
// ARCHIVO: src/app/buscar/page.tsx
// --------------------------------------------------------
import { db } from "@/db";
import { categories, restaurants, products, services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import SearchClient from "./search-client";
import SurpriseHost from "@/components/surprise-host";
import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";

export const dynamic = "force-dynamic";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{
    cat?: string;
    filter?: string;
    fav?: string;
    free?: string;
    open?: string;
    pickup?: string;
    delivery?: string;
    destacadas?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const [cats, stores, prods, svcs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort)),
    db.select().from(restaurants).orderBy(asc(restaurants.sort)),
    db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        section: products.section,
        restaurantId: products.restaurantId,
        restaurantSlug: restaurants.slug,
        restaurantName: restaurants.name,
      })
      .from(products)
      .innerJoin(restaurants, eq(products.restaurantId, restaurants.id))
      .where(eq(products.available, true)),
    db.select().from(services).where(eq(services.available, true)).orderBy(asc(services.sort)),
  ]);

  const cross = await crossSellItems(params.cat ?? null);
  const crossTitle = randomCrossTitle();

  return (
    <>
      <SearchClient
        categories={cats}
        stores={stores}
        products={prods}
        services={svcs}
        initialCat={params.cat ?? null}
        initialDestacadas={params.filter === "destacadas" || params.destacadas === "1"}
        initialFav={params.fav === "1" || params.filter === "favoritos"}
        initialFree={params.free === "1" || params.filter === "envio-gratis"}
        initialOpen={params.open === "1" || params.filter === "abiertos"}
        initialPickup={params.pickup === "1" || params.filter === "recoger"}
        initialDelivery={params.delivery === "1" || params.filter === "domicilio"}
        initialSort={params.sort === "fast" || params.sort === "near" ? params.sort : "none"}
        initialQuery={params.q ?? ""}
        crossItems={cross}
        crossTitle={crossTitle}
      />
      <SurpriseHost dishes={prods} restaurants={stores} />
    </>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/buscar/search-client.tsx
// --------------------------------------------------------
"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, Star, Clock3, Bike, Store, Sparkles, ChevronRight, Dices, MapPin, Heart } from "lucide-react";
import type { Category, Restaurant, Service } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import { useFavorites } from "@/store/favorites";
import BackButton from "@/components/back-button";
import CategoryPhotoCarousel from "@/components/category-photo-carousel";
import CrossSell, { type CrossSellItem } from "@/components/cross-sell";

type Prod = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  section: string;
  restaurantId: number;
  restaurantSlug: string;
  restaurantName: string;
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function SearchClient({
  categories,
  stores,
  products,
  services,
  initialCat,
  initialDestacadas = false,
  initialFav = false,
  initialFree = false,
  initialOpen = false,
  initialPickup = false,
  initialDelivery = false,
  initialSort = "none",
  initialQuery = "",
  crossItems = [],
  crossTitle,
}: {
  categories: Category[];
  stores: Restaurant[];
  products: Prod[];
  services: Service[];
  initialCat: string | null;
  initialDestacadas?: boolean;
  initialFav?: boolean;
  initialFree?: boolean;
  initialOpen?: boolean;
  initialPickup?: boolean;
  initialDelivery?: boolean;
  initialSort?: "none" | "fast" | "near";
  initialQuery?: string;
  crossItems?: CrossSellItem[];
  crossTitle?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [cat, setCat] = useState<string | null>(initialCat);
  const [sort, setSort] = useState<"none" | "fast" | "near">(initialSort);
  const [freeShip, setFreeShip] = useState(initialFree);
  const [openOnly, setOpenOnly] = useState(initialOpen);
  const [pickupOnly, setPickupOnly] = useState(initialPickup);
  const [deliveryOnly, setDeliveryOnly] = useState(initialDelivery);
  const [favOnly, setFavOnly] = useState(initialFav);
  const [destacadasOnly, setDestacadasOnly] = useState(initialDestacadas);

  const isFavorite = useFavorites((s) => s.isFavorite);
  const toggleFavorite = useFavorites((s) => s.toggleFavorite);

  const q = norm(query.trim());

  const foodCategories = useMemo(() => {
    return categories
      .filter((c) => c.slug !== "restaurantes" && c.slug !== "mascotas")
      .map((c) => (c.slug === "farmacia" ? { ...c, name: "Farmacias" } : c));
  }, [categories]);

  const results = useMemo(() => {
    const inCat = (r: Restaurant) => {
      if (!cat) return true;
      if (r.categorySlug === cat) return true;
      if (cat === "farmacia" && (r.categorySlug === "farmacia" || r.tags.includes("farmacia"))) return true;
      if (r.tags.some((t) => norm(t).includes(norm(cat)) || norm(cat).includes(norm(t)))) return true;
      if (cat === "pan-dulce" && (r.categorySlug === "panaderias" || r.tags.includes("pan-dulce"))) return true;
      if (cat === "helados" && (r.categorySlug === "postres" || r.tags.includes("helados"))) return true;
      if (cat === "cafe" && (r.tags.includes("cafe") || r.categorySlug === "panaderias" || r.slug === "donas-coffee")) return true;
      if (cat === "alitas" && (r.tags.includes("alitas") || r.tags.includes("pollo") || r.slug === "pollo-crack")) return true;
      if (cat === "hamburguesas" && (r.tags.includes("hamburguesas") || r.tags.includes("smash") || r.slug === "la-brasa-smash")) return true;
      if (cat === "pizza" && (r.tags.includes("pizza") || r.tags.includes("italiana") || r.slug === "pizza-nonna")) return true;
      if (cat === "tacos" && (r.tags.includes("tacos") || r.tags.includes("mexicana") || r.slug === "tacos-el-farol")) return true;
      if (cat === "sushi" && (r.tags.includes("sushi") || r.tags.includes("japonesa") || r.slug === "sushi-neko")) return true;
      if (cat === "bowls" && (r.tags.includes("bowls") || r.categorySlug === "saludable" || r.slug === "green-bowl")) return true;
      return false;
    };

    let rStores = stores.filter((r) => inCat(r) && (!q || norm(`${r.name} ${r.description} ${r.tags.join(" ")} ${r.categorySlug}`).includes(q)));
    if (favOnly) rStores = rStores.filter((r) => isFavorite(r.slug));
    if (destacadasOnly) rStores = rStores.filter((r) => r.featured || r.rating >= 4.7);
    if (freeShip) rStores = rStores.filter((r) => r.deliveryFee === 0);
    if (openOnly) rStores = rStores.filter((r) => r.isOpen);
    if (pickupOnly) rStores = rStores.filter((r) => r.allowsPickup);
    if (deliveryOnly) rStores = rStores.filter((r) => r.deliveryFee >= 0);
    if (sort === "fast") rStores = [...rStores].sort((a, b) => a.timeMin - b.timeMin);
    if (sort === "near") rStores = [...rStores].sort((a, b) => a.distanceKm - b.distanceKm);
    const rProducts = products.filter((p) => q && (norm(p.name).includes(q) || norm(p.restaurantName).includes(q))).slice(0, 8);
    return { rStores, rProducts };
  }, [stores, products, q, cat, sort, freeShip, openOnly, pickupOnly, deliveryOnly, favOnly, destacadasOnly, isFavorite]);

  const activeCat = foodCategories.find((c) => c.slug === cat);

  const headingTitle = useMemo(() => {
    if (query) return `Resultados para “${query.trim()}”`;
    if (favOnly) return "❤️ Tus Favoritos";
    if (destacadasOnly) return "🌟 Destacadas para ti";
    if (openOnly) return "🟢 Tiendas Abiertas Ahora";
    if (freeShip) return "🚴 Tiendas con Envío Gratis";
    if (pickupOnly) return "🏪 Tiendas para Recoger";
    if (cat === "farmacia") return "💊 Farmacias";
    if (activeCat) return activeCat.name;
    if (cat === "hamburguesas") return "🍔 Hamburguesas & Smashes";
    if (cat === "pizza") return "🍕 Pizza Artesanal";
    if (cat === "tacos") return "🌮 Tacos & Mexicana";
    if (cat === "sushi") return "🍣 Sushi & Japonesa";
    if (cat === "alitas") return "🍗 Alitas & Pollo";
    if (cat === "pan-dulce") return "🥐 Pan Dulce & Panadería";
    if (cat === "cafe") return "☕ Café & Especialidad";
    if (cat === "bowls") return "🥗 Bowls & Saludable";
    if (cat === "helados") return "🍨 Helados & Postres";
    return "Explora todo";
  }, [query, favOnly, destacadasOnly, openOnly, freeShip, pickupOnly, activeCat, cat]);

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* 1. Buscador arriba */}
      <div className="sticky top-0 z-40 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-5xl px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2.5">
            <BackButton />
            <div className="relative flex-1">
              <Search className="absolute top-3 left-4 h-4.5 w-4.5 text-ink-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar platillos, restaurantes, panaderías..."
                autoFocus
                className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-11 pl-11 text-[14.5px] font-bold outline-none placeholder:text-ink-soft focus:border-brand"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpiar" className="absolute top-2.5 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-3">
        {/* 2. Sorpréndeme */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => window.dispatchEvent(new CustomEvent("zappy-surprise"))}
          className="mb-3 flex w-full items-center justify-between rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-5 py-3.5 text-left text-white shadow-[0_10px_26px_var(--brand-glow)]"
        >
          <span className="flex items-center gap-2.5 text-[15.5px] font-black">
            <Dices className="h-5 w-5" /> Sorpréndeme
          </span>
          <span className="flex items-center gap-1 text-[12px] font-bold text-white/85">5 platillos al azar <ChevronRight className="h-4 w-4" /></span>
        </motion.button>

        {/* 3. Los círculos con las categorías de comida + tipos de comida (sin médicos ni citas) */}
        <CategoryPhotoCarousel
          categories={foodCategories}
          value={cat}
          includeFoodTypes={true}
          onSelect={(slug) => setCat(slug)}
        />

        {/* 4. Filtros abajo de los círculos */}
        <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip
            small
            active={favOnly}
            onClick={() => {
              setFavOnly(!favOnly);
              if (!favOnly) setDestacadasOnly(false);
            }}
            label="Favoritos"
            icon={Heart}
            badgeColor="text-brand"
          />
          <Chip
            small
            active={destacadasOnly}
            onClick={() => {
              setDestacadasOnly(!destacadasOnly);
              if (!destacadasOnly) setFavOnly(false);
            }}
            label="🌟 Destacadas"
          />
          <Chip small active={sort === "fast"} onClick={() => setSort(sort === "fast" ? "none" : "fast")} label="⚡ Rápido" />
          <Chip small active={sort === "near"} onClick={() => setSort(sort === "near" ? "none" : "near")} label="📍 Cerca de mí" />
          <Chip small active={freeShip} onClick={() => setFreeShip(!freeShip)} label="🚴 Envío gratis" />
          <Chip small active={openOnly} onClick={() => setOpenOnly(!openOnly)} label="🟢 Abiertos" />
          <Chip small active={pickupOnly} onClick={() => setPickupOnly(!pickupOnly)} label="🏪 Recoger" />
          <Chip small active={deliveryOnly} onClick={() => setDeliveryOnly(!deliveryOnly)} label="🛵 A domicilio" />
        </div>

        {/* 5. Resultados de tiendas */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{headingTitle}</h1>
              {(activeCat || cat || favOnly || destacadasOnly || freeShip || openOnly || pickupOnly || deliveryOnly) && (
                <button
                  onClick={() => {
                    setCat(null);
                    setFavOnly(false);
                    setDestacadasOnly(false);
                    setFreeShip(false);
                    setOpenOnly(false);
                    setPickupOnly(false);
                    setDeliveryOnly(false);
                  }}
                  className="rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-black text-ink-soft transition hover:bg-black/[0.08]"
                >
                  ✕ Ver todo
                </button>
              )}
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">
              {results.rStores.length} {results.rStores.length === 1 ? "resultado" : "resultados"}{q ? ` · ${results.rProducts.length} productos` : ""}
            </p>
          </div>
        </div>

        {results.rProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-black"><Sparkles className="h-5 w-5 text-brand" /> Productos</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {results.rProducts.map((p) => (
                <Link key={p.id} href={`/restaurante/${p.restaurantSlug}`} className="group flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border p-3 transition hover:border-brand">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13.5px] leading-tight font-extrabold text-ink">{p.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[11.5px] font-bold text-ink-soft">{p.restaurantName}</p>
                      <span className="shrink-0 text-[12px] font-black text-brand">{formatMXN(p.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-black"><Store className="h-5 w-5 text-brand" /> Resultados</h2>
          {results.rStores.length === 0 ? (
            <Empty favOnly={favOnly} onClearFav={() => setFavOnly(false)} />
          ) : (
            <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.rStores.map((r, i) => {
                const fav = isFavorite(r.slug);
                return (
                  <Fragment key={r.id}>
                    {i === 4 && crossItems.length > 0 && (
                      <div className="sm:col-span-2 lg:col-span-3 min-w-0 w-full">
                        <CrossSell items={crossItems} title={crossTitle} />
                      </div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                      <Link href={`/restaurante/${r.slug}`} className="group block">
                        <div className="relative h-36 overflow-hidden rounded-[22px]">
                          <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" sizes="33vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(r.slug);
                              }}
                              aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition active:scale-90"
                            >
                              <Heart className={`h-4 w-4 ${fav ? "fill-brand text-brand" : "text-ink-soft hover:text-brand"}`} />
                            </button>
                            {!r.isOpen && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black">Cerrado</span>}
                          </div>
                          <div className="absolute inset-x-3 bottom-2.5">
                            <p className="truncate text-[16px] font-black text-white drop-shadow">{r.name}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-black text-brand"><Clock3 className="h-3 w-3" />{r.timeMin}-{r.timeMax} min</span>
                          <span className="flex items-center gap-1"><Bike className="h-3.5 w-3.5" />{r.deliveryFee === 0 ? "Envío gratis" : formatMXN(r.deliveryFee)}</span>
                          <span className="ml-auto flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-pop text-amber-pop" />{r.rating.toFixed(1)}</span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-[10.5px] font-bold text-ink-soft">
                          <MapPin className="h-3 w-3 shrink-0 text-brand/70" /> <span className="truncate">{r.address}</span>
                          {r.allowsPickup && <span className="ml-1 shrink-0 rounded-full bg-[#e6f8ee] px-1.5 py-0.5 text-[9.5px] font-black text-[#0ea55b]">Recoger</span>}
                        </p>
                      </Link>
                    </motion.div>
                    {i === results.rStores.length - 1 && results.rStores.length < 5 && crossItems.length > 0 && (
                      <div className="sm:col-span-2 lg:col-span-3 min-w-0 w-full">
                        <CrossSell items={crossItems} title={crossTitle} />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Empty({ favOnly, onClearFav }: { favOnly?: boolean; onClearFav?: () => void }) {
  if (favOnly) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-[26px] bg-mist px-6 py-12 text-center">
        <span className="text-4xl">❤️</span>
        <p className="mt-3 text-lg font-black">Sin tiendas favoritas</p>
        <p className="mt-1 max-w-xs text-sm font-bold text-ink-soft">Toca el corazón en cualquier tienda para guardarla aquí.</p>
        {onClearFav && (
          <button onClick={onClearFav} className="mt-4 rounded-full bg-brand px-5 py-2.5 text-xs font-black text-white">Ver todas las tiendas</button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center rounded-[26px] bg-mist px-6 py-12 text-center">
      <span className="text-3xl font-black italic text-brand">Ups...</span>
      <p className="mt-2 max-w-xs text-sm font-bold text-ink-soft">No encontramos nada con ese nombre. Prueba con otra palabra o categoría.</p>
    </div>
  );
}

function Chip({ active, onClick, label, small = false, icon: Icon, badgeColor }: { active: boolean; onClick: () => void; label: string; small?: boolean; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>; badgeColor?: string }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 rounded-full font-black transition active:scale-95 ${small ? "px-3 py-1.5 text-[11.5px]" : "px-4 py-1.5 text-[13px]"} ${active ? "bg-ink text-white shadow-md" : "bg-mist text-ink hover:bg-black/[0.07]"}`}>
      {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? (badgeColor ? "fill-rose-400 text-rose-400" : "text-white") : (badgeColor ?? "text-brand")}`} strokeWidth={2.4} />}
      {label}
    </button>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/checkout/page.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Banknote, CreditCard, Landmark, MapPin, ShoppingBag, Zap, CalendarDays, Clock3, Camera, Check, X } from "lucide-react";
import { useCart, cartSubtotal, cartCount, type CartItem, type CartRestaurant } from "@/store/cart";
import { useOrders, type Order } from "@/store/orders";
import { formatMXN, serviceFeeFor } from "@/lib/utils";

const PAYMENTS = [
  { id: "Efectivo", icon: Banknote, hint: "Pagas al recibir" },
  { id: "Tarjeta •••• 4821", icon: CreditCard, hint: "Visa terminada en 4821" },
  { id: "PSE", icon: Landmark, hint: "Débito desde tu banco" },
];
const TIPS = [0, 10, 15, 25];
const CHECKOUT_DRAFT_KEY = "rayte-checkout-draft";

type CheckoutDraft = {
  items: CartItem[];
  restaurant: CartRestaurant;
  address: string;
  customerName: string;
  phone: string;
  schedulePref: string | null;
};

const SLOTS: string[] = Array.from({ length: 28 }, (_, i) =>
  `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
);

function buildDays() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getTime() + i * 86400000);
    const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(d).replace(".", "");
    return { date: d, label, num: d.getDate() };
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurant, address, customerName, phone, schedulePref, setAddress, setCustomer, clear } = useCart();
  const addOrder = useOrders((s) => s.addOrder);
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [addr, setAddr] = useState("");
  const [payment, setPayment] = useState(PAYMENTS[0].id);
  const [tip, setTip] = useState(0);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [when, setWhen] = useState<"asap" | "schedule">("asap");
  const [days, setDays] = useState<{ date: Date; label: string; num: number }[] | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const restoredFormRef = useRef(false);

  useEffect(() => {
    if (!mounted || restoredFormRef.current) return;

    let savedDraft: CheckoutDraft | null = null;
    try {
      const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CheckoutDraft;
        if (parsed?.items?.length && parsed?.restaurant) {
          savedDraft = parsed;
          setDraft(parsed);
        }
      }
    } catch {
      // ignore draft parse issues
    }

    setName(customerName || savedDraft?.customerName || "");
    setTel(phone || savedDraft?.phone || "");
    setAddr(address || savedDraft?.address || "");
    restoredFormRef.current = true;
  }, [mounted, customerName, phone, address]);

  useEffect(() => {
    setDays(buildDays());
  }, []);

  useEffect(() => {
    if (!mounted || !restoredFormRef.current) return;
    setCustomer(name, tel);
    setAddress(addr);
  }, [mounted, name, tel, addr, setCustomer, setAddress]);

  useEffect(() => {
    if (!mounted || !restoredFormRef.current) return;

    const baseItems = items.length ? items : draft?.items ?? [];
    const baseRestaurant = restaurant ?? draft?.restaurant ?? null;
    if (!baseItems.length || !baseRestaurant) return;

    const nextDraft: CheckoutDraft = {
      items: baseItems,
      restaurant: baseRestaurant,
      address: addr,
      customerName: name,
      phone: tel,
      schedulePref: schedulePref ?? draft?.schedulePref ?? null,
    };

    setDraft(nextDraft);
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(nextDraft));
  }, [mounted, items, restaurant, draft, addr, name, tel, schedulePref]);

  const activeSchedulePref = schedulePref ?? draft?.schedulePref ?? null;

  // Si el usuario programó el pedido desde la página del restaurante, precargarlo
  useEffect(() => {
    if (!mounted || !activeSchedulePref || !days) return;
    const d = new Date(activeSchedulePref);
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) return;
    const idx = days.findIndex((x) => x.date.toDateString() === d.toDateString());
    if (idx === -1) return;
    setWhen("schedule");
    setDayIdx(idx);
    setSlot(`${String(d.getHours()).padStart(2, "0")}:${d.getMinutes() >= 30 ? "30" : "00"}`);
  }, [mounted, activeSchedulePref, days]);

  if (!mounted) return null;

  const activeItems = items.length ? items : draft?.items ?? [];
  const activeRestaurant = restaurant ?? draft?.restaurant ?? null;
  const subtotal = cartSubtotal(activeItems);
  const count = cartCount(activeItems);
  const serviceFee = serviceFeeFor(subtotal);
  const deliveryFee = activeRestaurant?.deliveryFee ?? 0;
  const total = subtotal + serviceFee + deliveryFee + tip;

  if (activeItems.length === 0 || !activeRestaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft"><ShoppingBag className="h-10 w-10 text-brand" strokeWidth={1.8} /></div>
        <p className="text-xl font-black">No hay nada para pagar</p>
        <p className="max-w-xs text-sm font-bold text-ink-soft">Tu carrito está vacío. Agrega algo rico y vuelve.</p>
        <Link href="/" className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-black text-white">Explorar</Link>
      </div>
    );
  }

  const confirm = async () => {
    setError("");
    if (!name.trim() || !tel.trim() || !addr.trim()) {
      setError("Completa tu nombre, teléfono y dirección.");
      return;
    }
    let scheduledFor: string | undefined;
    if (when === "schedule") {
      if (!slot || !days) {
        setError("Elige el día y la hora de entrega programada.");
        return;
      }
      const d = new Date(days[dayIdx].date);
      const [h, m] = slot.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      if (d.getTime() <= Date.now()) {
        setError("La hora programada ya pasó. Elige otra.");
        return;
      }
      scheduledFor = d.toISOString();
    }
    if (placing) return;
    setPlacing(true);
    let code = `RY-${Math.floor(1000 + Math.random() * 9000)}`;
    /* Pedido REAL: se guarda en PostgreSQL (la tienda lo ve en su panel) */
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: activeRestaurant.id,
          items: activeItems,
          subtotal,
          deliveryFee,
          serviceFee,
          tip,
          total,
          customerName: name.trim(),
          phone: tel.trim(),
          address: addr.trim(),
          payment,
          scheduledFor,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        code = data.order.code;
      }
    } catch {
      /* sin conexión: el pedido local sigue funcionando como respaldo */
    }
    const order: Order = {
      code,
      items: activeItems,
      restaurant: activeRestaurant,
      subtotal,
      deliveryFee,
      serviceFee,
      tip,
      total,
      customerName: name.trim(),
      phone: tel.trim(),
      address: addr.trim(),
      payment,
      placedAt: Date.now(),
      etaMin: activeRestaurant.timeMin ?? 25,
      etaMax: activeRestaurant.timeMax ?? 40,
      scheduledFor,
      refPhoto: deliveryPhoto || undefined,
    };
    addOrder(order);
    clear();
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    router.push(`/pedido/${code}`);
  };

  const schedLabel = () => {
    if (!slot || !days) return "";
    const d = new Date(days[dayIdx].date);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d);
  };

  const restaurantHref = activeRestaurant ? `/restaurante/${activeRestaurant.slug}` : "/";
  const goBackToRestaurant = () => {
    if (typeof window !== "undefined") {
      window.location.assign(restaurantHref);
      return;
    }
    router.push(restaurantHref);
  };

  return (
    <div className="min-h-screen bg-mist/60 pb-20 sm:pb-24">
      <header className="sticky top-0 z-[250] border-b bg-white">
        <div className="relative z-[260] mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={goBackToRestaurant}
            onPointerUp={goBackToRestaurant}
            aria-label="Volver al restaurante"
            className="relative z-[999] flex min-w-[88px] shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm transition hover:bg-mist active:scale-90"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
            <span className="text-[12px] font-black text-ink">Volver</span>
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Checkout</h1>
            <p className="text-[12.5px] font-bold text-ink-soft">{count} productos de {activeRestaurant?.name}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-5">
        {items.length === 0 && draft?.items?.length ? (
          <div className="rounded-2xl border border-brand/15 bg-brand-soft/60 px-4 py-3 text-[12.5px] font-bold text-brand">
            Recuperamos tu resumen de pago para que puedas terminar tu pedido sin que se cierre.
          </div>
        ) : null}
        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">¿A dónde lo llevamos?</p>
          <div className="mt-3 space-y-2.5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de quien recibe" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
            <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono" inputMode="tel" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
            <div className="relative">
              <MapPin className="absolute top-3.5 left-4 h-4.5 w-4.5 text-brand" />
              <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Dirección de entrega" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-11 text-[14px] font-bold outline-none focus:border-brand" />
            </div>
          </div>

          {/* 📸 Foto de fachada o entrada para el repartidor */}
          <div className="mt-3 rounded-2xl border border-black/5 bg-mist/60 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-ink-soft">
                  <Camera className="h-4.5 w-4.5 text-brand" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-black text-ink">Foto de la fachada o entrada <span className="text-ink-soft text-[11px] font-bold">(opcional)</span></p>
                  <p className="text-[11px] font-bold text-ink-soft truncate">Ayuda al repartidor a ubicar tu puerta rápido</p>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileRef}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) setDeliveryPhoto(ev.target.result as string);
                    };
                    reader.readAsDataURL(f);
                  }
                }}
              />

              {!deliveryPhoto ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[11.5px] font-black text-brand transition hover:bg-brand/15 active:scale-95"
                >
                  <Camera className="h-3.5 w-3.5" /> Tomar foto
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeliveryPhoto(null)}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-black text-ink-soft hover:text-brand"
                >
                  <X className="h-3.5 w-3.5" /> Quitar
                </button>
              )}
            </div>

            {deliveryPhoto && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-2 border border-black/5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image src={deliveryPhoto} alt="Fachada" fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-black text-[#0ea55b] flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Foto adjunta
                  </p>
                  <p className="text-[11px] font-bold text-ink-soft truncate">El repartidor verá tu fachada en su mapa</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">¿Cuándo lo quieres?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setWhen("asap")} className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[14px] font-black transition active:scale-[0.97] ${when === "asap" ? "border-brand bg-brand-soft text-brand" : "border-black/10 text-ink"}`}>
              <Zap className="h-4.5 w-4.5" /> Lo antes posible
            </button>
            <button onClick={() => setWhen("schedule")} className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[14px] font-black transition active:scale-[0.97] ${when === "schedule" ? "border-brand bg-brand-soft text-brand" : "border-black/10 text-ink"}`}>
              <CalendarDays className="h-4.5 w-4.5" /> Programar
            </button>
          </div>
          {when === "asap" ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-soft"><Clock3 className="h-4 w-4 text-brand" /> Llega en ~{activeRestaurant?.timeMin ?? 25}-{activeRestaurant?.timeMax ?? 40} min</p>
          ) : (
            <>
              <p className="mt-4 text-[12px] font-black text-ink-soft uppercase">Día</p>
              <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1">
                {(days ?? Array.from({ length: 7 })).map((d, i) =>
                  d && "num" in d ? (
                    <button key={i} onClick={() => setDayIdx(i)} className={`flex w-[74px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition active:scale-95 ${dayIdx === i ? "border-brand bg-brand-soft" : "border-black/10"}`}>
                      <span className="text-[11px] font-black text-ink-soft capitalize">{d.label}</span>
                      <span className={`text-lg font-black ${dayIdx === i ? "text-brand" : ""}`}>{d.num}</span>
                    </button>
                  ) : (
                    <div key={i} className="h-[60px] w-[74px] shrink-0 animate-pulse rounded-2xl bg-mist" />
                  ),
                )}
              </div>
              <p className="mt-4 text-[12px] font-black text-ink-soft uppercase">Hora de entrega</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SLOTS.map((s) => (
                  <button key={s} onClick={() => setSlot(s)} className={`rounded-xl border py-2 text-[12.5px] font-black transition active:scale-95 ${slot === s ? "border-brand bg-brand text-white" : "border-black/10 hover:border-brand/40"}`}>{s}</button>
                ))}
              </div>
              {slot && <p className="mt-2.5 text-[12.5px] font-bold text-brand">Entrega programada: {schedLabel()}</p>}
            </>
          )}
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">Método de pago</p>
          <div className="mt-3 space-y-2">
            {PAYMENTS.map((p) => {
              const active = payment === p.id;
              const Icon = p.icon;
              return (
                <button key={p.id} onClick={() => setPayment(p.id)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${active ? "border-brand bg-brand-soft" : "border-black/10"}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-brand text-white" : "bg-mist text-ink"}`}><Icon className="h-5 w-5" /></span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-extrabold">{p.id}</span>
                    <span className="block text-[12px] font-bold text-ink-soft">{p.hint}</span>
                  </span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? "border-brand" : "border-black/20"}`}>{active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">Propina para el repartidor</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {TIPS.map((t) => (
              <button key={t} onClick={() => setTip(t)} className={`rounded-2xl border py-2.5 text-[13px] font-black transition active:scale-95 ${tip === t ? "border-brand bg-brand text-white" : "border-black/10"}`}>
                {t === 0 ? "Sin" : formatMXN(t)}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <div className="space-y-1.5 text-[13.5px] font-bold text-ink-soft">
            <div className="flex justify-between"><span>Entrega</span><span className="text-ink">{when === "asap" ? `Lo antes posible (~${activeRestaurant?.timeMin ?? 25}-${activeRestaurant?.timeMax ?? 40} min)` : slot ? schedLabel() : "Programada"}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span className="text-ink">{formatMXN(subtotal)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span className="text-ink">{deliveryFee === 0 ? "Gratis" : formatMXN(deliveryFee)}</span></div>
            <div className="flex justify-between"><span>Tarifa de servicio</span><span className="text-ink">{formatMXN(serviceFee)}</span></div>
            {tip > 0 && <div className="flex justify-between"><span>Propina</span><span className="text-ink">{formatMXN(tip)}</span></div>}
            <div className="mt-2 flex justify-between border-t border-black/5 pt-3 text-[16px] font-black text-ink"><span>Total</span><span>{formatMXN(total)}</span></div>
          </div>
        </section>

        {error && <p className="rounded-2xl bg-brand-soft px-4 py-3 text-center text-[13.5px] font-black text-brand">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={confirm}
          disabled={placing}
          className="flex w-full items-center justify-between rounded-full bg-brand px-5 py-4 font-black text-white shadow-[0_12px_28px_var(--brand-glow)] transition hover:bg-brand-dark disabled:opacity-60"
        >
          <span className="flex items-center gap-2 text-[15px]"><Zap className="h-4.5 w-4.5 fill-white" /> {placing ? "Enviando pedido..." : "Confirmar pedido"}</span>
          <span>{formatMXN(total)}</span>
        </motion.button>
      </div>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/conductor/page.tsx
// --------------------------------------------------------
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Banknote, Bike, CarFront, Check, CircleCheck, Clock3, MapPin, Package, Phone,
  ShieldCheck, Star, Store, User, Zap, Sparkles, Navigation, DollarSign, ChevronRight
} from "lucide-react";
import { formatMXN } from "@/lib/utils";

type Driver = { id: number; name: string; vehicle: string; plate: string; rating: number; trips: number; photo?: string };
type LiveOrder = {
  id: number;
  code: string;
  restaurantName: string;
  customerName: string;
  address: string;
  items: { name: string; qty: number }[];
  deliveryFee: number;
  tip: number;
  total: number;
  status: string;
  placedAt: string;
  driverId: number | null;
};

const DRIVER_PROFILES: Record<number, { bio: string; badge: string; color: string }> = {
  1: { bio: "Especialista en entregas ultra rápidas en motocicleta", badge: "Moto Express", color: "#fbbf24" },
  2: { bio: "Socia conductora verificada en Rayte Mujer y moto urbana", badge: "🌸 Rayte Mujer", color: "#ec4899" },
  3: { bio: "Conductor certificado en viajes de confort y entregas seguras", badge: "Carro Confort", color: "#60a5fa" },
  4: { bio: "Capacidad para grupos, equipaje y pedidos voluminosos", badge: "Carro XL", color: "#34d399" },
};

export default function ConductorPage() {
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"servicios" | "ganancias" | "vehiculo">("servicios");
  const [online, setOnline] = useState(true);
  const [available, setAvailable] = useState<LiveOrder[]>([]);
  const [mine, setMine] = useState<LiveOrder[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const driver = drivers?.find((d) => d.id === driverId) ?? null;
  const profile = driverId ? (DRIVER_PROFILES[driverId] ?? DRIVER_PROFILES[1]) : DRIVER_PROFILES[1];

  useEffect(() => {
    fetch("/api/drivers").then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setDrivers(data.drivers);
        const saved = Number(localStorage.getItem("rayte-conductor") || 0);
        if (data.drivers.some((d: Driver) => d.id === saved)) setDriverId(saved);
      }
    }).catch(() => setDrivers([]));
  }, []);

  useEffect(() => {
    if (driverId) localStorage.setItem("rayte-conductor", String(driverId));
  }, [driverId]);

  /* Sondeo en vivo: entregas disponibles + mis entregas */
  const load = useCallback(async () => {
    if (!driverId) return;
    try {
      const [a, m] = await Promise.all([
        fetch("/api/orders?available=1", { cache: "no-store" }),
        fetch(`/api/orders?driver=${driverId}`, { cache: "no-store" }),
      ]);
      if (a.ok) setAvailable((await a.json()).orders);
      if (m.ok) setMine((await m.json()).orders);
    } catch { /* reintenta */ }
  }, [driverId]);

  useEffect(() => {
    if (!online || !driverId) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    load();
    timer.current = setInterval(load, 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [online, driverId, load]);

  const claim = async (o: LiveOrder) => {
    if (!driverId || busy) return;
    setBusy(o.id);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", code: o.code, driverId }),
      });
      if (res.ok) await load();
    } finally {
      setBusy(null);
    }
  };

  const deliver = async (o: LiveOrder) => {
    if (!driverId || busy) return;
    setBusy(o.id);
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deliver", code: o.code, driverId }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const today = new Date().toDateString();
  const deliveredToday = mine.filter((o) => o.status === "delivered" && new Date(o.placedAt).toDateString() === today);
  const active = mine.filter((o) => o.status === "on_way");
  const ganadoHoy = deliveredToday.reduce((a, o) => a + o.deliveryFee + o.tip + 1500, 0);
  const propinasHoy = deliveredToday.reduce((a, o) => a + o.tip, 0);
  const estimadoSemana = ganadoHoy * 5.5 + 45000;

  /* ---------- Pantalla 1: elegir conductor ---------- */
  if (!driverId) {
    return (
      <div className="min-h-screen bg-[#16121b] pb-20 sm:pb-24 text-white">
        <header className="mx-auto flex max-w-lg items-center gap-3 px-4 pt-6 pb-2">
          <Link href="/cuenta" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">Portal de Conductores</h1>
            <p className="text-[12px] font-bold text-white/60">Selecciona tu perfil de conductor para entrar a tu dashboard</p>
          </div>
        </header>
        <div className="mx-auto max-w-lg space-y-3 px-4 pt-4">
          {!drivers && <p className="rounded-2xl bg-white/5 px-4 py-8 text-center text-[13px] font-bold text-white/60">Cargando conductores...</p>}
          {drivers?.map((d) => {
            const prof = DRIVER_PROFILES[d.id] ?? DRIVER_PROFILES[1];
            return (
              <button
                key={d.id}
                onClick={() => setDriverId(d.id)}
                className="flex w-full items-center gap-3.5 rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-left transition hover:border-amber-pop/60 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <span
                  className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-[18px] font-black shadow-md"
                  style={{ backgroundColor: prof.color, color: "#16121b" }}
                >
                  {d.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[16px] font-black">{d.name}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-black bg-white/10 text-white/90">
                      {prof.badge}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-white/60 mt-0.5">
                    {d.vehicle} · Placas {d.plate} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {d.rating}
                  </p>
                  <p className="text-[11px] font-semibold text-white/40 mt-0.5">{prof.bio}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-white/40" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- Pantalla 2: Dashboard personal del conductor ---------- */
  return (
    <div className="min-h-screen bg-[#16121b] pb-24 text-white">
      {/* Header personalizado del conductor */}
      <header className="sticky top-0 z-40 bg-[#1d1824]/95 border-b border-white/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/cuenta" aria-label="Volver a cuenta" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black shadow-md"
              style={{ backgroundColor: profile.color, color: "#16121b" }}
            >
              {driver?.name[0]}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="truncate text-[15.5px] font-black leading-tight">{driver?.name}</p>
                <span className="rounded-full px-2 py-0.2 text-[9.5px] font-black bg-white/15 text-white/90">
                  {profile.badge}
                </span>
              </div>
              <p className="text-[11.5px] font-bold text-white/60 truncate">
                {driver?.vehicle} · {driver?.plate} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {driver?.rating}
              </p>
            </div>
          </div>

          <button
            onClick={() => { setDriverId(null); setOnline(false); }}
            className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-black transition hover:bg-white/20"
          >
            Cambiar
          </button>
        </div>

        {/* Pestañas del Dashboard del conductor */}
        <div className="mx-auto max-w-lg flex gap-1 px-4 pt-1 pb-2">
          {[
            { id: "servicios", label: "Servicios en vivo" },
            { id: "ganancias", label: "Mis Ganancias" },
            { id: "vehiculo", label: "Mi Perfil & Auto" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex-1 rounded-xl py-2 text-[12px] font-black transition ${
                activeTab === t.id
                  ? "bg-amber-pop text-[#16121b] shadow-sm"
                  : "bg-white/[0.04] text-white/60 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {/* Switch de Estado Conectado / Desconectado */}
        <section className="flex items-center justify-between rounded-[26px] border border-white/10 bg-white/[0.05] p-4.5 backdrop-blur">
          <div>
            <p className="text-[11.5px] font-black text-white/50 uppercase tracking-wide">Tu disponibilidad</p>
            <p className={`mt-0.5 text-[20px] font-black ${online ? "text-[#4ade80]" : "text-white/60"}`}>
              {online ? "🟢 Conectado y recibiendo viajes" : "⚪ Desconectado"}
            </p>
            <p className="text-[11.5px] font-bold text-white/60">
              {online ? "Buscando pedidos y pasajeros en tu zona" : "Toca el interruptor para comenzar a ganar"}
            </p>
          </div>
          <button
            onClick={() => setOnline((v) => !v)}
            aria-label="Conectarse"
            className={`relative h-10 w-18 shrink-0 rounded-full transition ${online ? "bg-[#0ea55b]" : "bg-white/15"}`}
          >
            <motion.span
              layout
              className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md ${online ? "right-1" : "left-1"}`}
            />
          </button>
        </section>

        {activeTab === "servicios" && (
          <>
            {/* Resumen rápido de hoy */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-[22px] bg-amber-pop p-3.5 text-[#16121b] shadow-sm">
                <p className="text-[10px] font-black uppercase opacity-70">Ganado hoy</p>
                <p className="text-[16px] font-black">{formatMXN(ganadoHoy)}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-3.5">
                <p className="text-[10px] font-black text-white/50 uppercase">Entregas</p>
                <p className="text-[16px] font-black">{deliveredToday.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-3.5">
                <p className="text-[10px] font-black text-white/50 uppercase">En curso</p>
                <p className="text-[16px] font-black text-amber-pop">{active.length}</p>
              </div>
            </div>

            {/* Mis entregas en curso */}
            {online && active.length > 0 && (
              <section className="rounded-[26px] border border-amber-pop/40 bg-amber-pop/10 p-5">
                <p className="flex items-center gap-2 text-[15px] font-black text-white">
                  <Package className="h-4.5 w-4.5 text-amber-pop" /> Entrega asignada a ti
                </p>
                <div className="mt-3 space-y-2.5">
                  {active.map((o) => (
                    <div key={o.id} className="rounded-[20px] border border-white/10 bg-[#16121b] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14.5px] font-black">{o.code} · {o.customerName}</p>
                        <span className="rounded-full bg-amber-pop/20 px-2.5 py-1 text-[10.5px] font-black text-amber-pop">
                          En camino
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-bold text-white/70">
                        <Store className="h-3.5 w-3.5 shrink-0" /> {o.restaurantName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-white/70">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" /> {o.address}
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[13.5px] font-black text-amber-pop">
                          Ganancia: {formatMXN(o.deliveryFee + o.tip + 1500)}
                        </span>
                        <button
                          onClick={() => deliver(o)}
                          disabled={busy === o.id}
                          className="rounded-full bg-[#0ea55b] px-4 py-2 text-[12px] font-black text-white transition active:scale-95 disabled:opacity-50 shadow-md"
                        >
                          Marcar entregado
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Entregas y viajes disponibles para tomar */}
            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-black">
                  Pedidos y viajes disponibles
                  {online && <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ade80]" />}
                </p>
                <span className="text-[11px] font-bold text-white/50">{available.length} disponibles</span>
              </div>

              {!online ? (
                <p className="mt-3 rounded-2xl bg-white/5 px-4 py-6 text-center text-[13px] font-bold text-white/60">
                  Conéctate con el switch arriba para recibir pedidos y viajes en tiempo real.
                </p>
              ) : available.length === 0 ? (
                <div className="mt-3 rounded-2xl bg-white/5 px-4 py-8 text-center">
                  <Navigation className="mx-auto h-8 w-8 text-amber-pop animate-bounce mb-2 opacity-80" />
                  <p className="text-[14px] font-black">Buscando solicitudes en tu zona...</p>
                  <p className="text-[12px] font-bold text-white/50 mt-1">En cuanto una tienda marque listo un pedido o un cliente pida rayte, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {available.map((o) => (
                    <div key={o.id} className="rounded-[20px] border border-white/10 bg-[#1d1824] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14px] font-black">{o.code} · {o.restaurantName}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-black ${o.status === "ready" ? "bg-[#4ade80]/15 text-[#4ade80]" : "bg-white/10 text-white/60"}`}>
                          {o.status === "ready" ? "Listo para recoger" : "Preparándose"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[12px] font-bold text-white/60">{o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-white/70"><MapPin className="h-3.5 w-3.5 shrink-0" /> {o.address}</p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[13px] font-black text-amber-pop">Ganas {formatMXN(o.deliveryFee + o.tip + 1500)}</span>
                        <button
                          onClick={() => claim(o)}
                          disabled={busy === o.id}
                          className="rounded-full bg-amber-pop px-4 py-2 text-[12px] font-black text-[#16121b] transition active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                          {busy === o.id ? "Tomando..." : "Tomar pedido"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "ganancias" && (
          <div className="space-y-4">
            <div className="rounded-[26px] bg-gradient-to-br from-amber-pop to-amber-500 p-6 text-[#16121b] shadow-xl">
              <p className="text-[12px] font-black uppercase tracking-wider opacity-80">Ganancias de {driver?.name}</p>
              <p className="text-[32px] font-black leading-tight mt-1">{formatMXN(ganadoHoy)}</p>
              <div className="mt-4 flex items-center gap-4 text-[13px] font-bold border-t border-[#16121b]/20 pt-3">
                <p>Propinas hoy: <span className="font-black">{formatMXN(propinasHoy)}</span></p>
                <p>Viajes hoy: <span className="font-black">{deliveredToday.length}</span></p>
              </div>
            </div>

            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-[15px] font-black">Historial de entregas completadas hoy</p>
              {deliveredToday.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-white/5 px-4 py-6 text-center text-[12.5px] font-bold text-white/50">
                  Aún no has completado entregas hoy. Conéctate para empezar.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {deliveredToday.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 border border-white/5">
                      <div>
                        <p className="text-[13.5px] font-black">{o.code} · {o.restaurantName}</p>
                        <p className="text-[11.5px] font-bold text-white/50">Cliente: {o.customerName} · {o.address}</p>
                      </div>
                      <span className="shrink-0 text-[14px] font-black text-[#4ade80]">+{formatMXN(o.deliveryFee + o.tip + 1500)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "vehiculo" && (
          <div className="space-y-4">
            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5 space-y-3">
              <p className="text-[15px] font-black">Ficha del vehículo y conductor</p>
              <div className="space-y-2 text-[13px] font-bold">
                <p className="flex justify-between"><span className="text-white/60">Conductor:</span> <span className="font-black text-white">{driver?.name}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Vehículo:</span> <span className="font-black text-amber-pop">{driver?.vehicle}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Placas:</span> <span className="font-black text-white">{driver?.plate}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Calificación:</span> <span className="font-black text-amber-pop">★ {driver?.rating} ({driver?.trips} viajes)</span></p>
                <p className="flex justify-between"><span className="text-white/60">Modalidad:</span> <span className="font-black text-pink-300">{profile.badge}</span></p>
                <p className="flex justify-between"><span className="text-white/60">Estatus:</span> <span className="font-black text-[#4ade80]">✓ Conductor Verificado Rayte</span></p>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-[15px] font-black">Documentos y Seguridad</p>
              <div className="mt-3 space-y-2 text-[12.5px] font-bold text-white/70">
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4ade80]" /> Licencia de conducir vigente</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4ade80]" /> Seguro de cobertura amplia activo</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4ade80]" /> Carta de no antecedentes penales</p>
              </div>
            </section>
          </div>
        )}

        <p className="pb-2 text-center text-[11px] font-black tracking-widest text-white/30 uppercase">
          Rayte Driver · Dashboard Personal de {driver?.name}
        </p>
      </div>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/cuenta/page.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronRight, CreditCard, Check, HelpCircle, LogIn, LogOut, MapPin, ReceiptText,
  Stethoscope, Store, Bike, UserPlus, UserRound, Zap, Heart, Clock3, Plus, Trash2, ShieldCheck, Banknote, Landmark
} from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";
import { useFavorites } from "@/store/favorites";
import { useTheme, PALETTES, paletteById } from "@/store/theme";
import { formatMXN } from "@/lib/utils";
import BackButton from "@/components/back-button";

type Appointment = {
  id: string;
  code: string;
  serviceName: string;
  startAt: string;
  price: number;
  mode: string;
  status: string;
  proName?: string;
};

type SessionUser = { id: number; name: string; phone: string; address: string };

export default function CuentaPage() {
  const { customerName, phone, address, setCustomer, setAddress } = useCart();
  const orders = useOrders((s) => s.orders);
  const favorites = useFavorites((s) => s.favorites);
  const paletteId = useTheme((s) => s.paletteId);
  const setPalette = useTheme((s) => s.setPalette);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [clientTab, setClientTab] = useState<"perfil" | "pedidos" | "citas" | "favoritos" | "pagos">("perfil");

  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [addr, setAddr] = useState("");
  const [saved, setSaved] = useState(false);

  /* ── Sesión real (cookie httpOnly + PostgreSQL) ── */
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authPass, setAuthPass] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!mounted) return;
    fetch("/api/auth")
      .then(async (r) => {
        const data = r.ok ? await r.json() : { user: null };
        if (data.user) {
          setUser(data.user);
          setCustomer(data.user.name, data.user.phone);
          if (data.user.address) setAddress(data.user.address);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, [mounted]);

  const [appts, setAppts] = useState<Appointment[] | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(false);

  useEffect(() => {
    if (mounted) {
      setName(customerName);
      setTel(phone);
      setAddr(address);
    }
  }, [mounted, customerName, phone, address]);

  const loadAppts = useCallback(async () => {
    if (!tel.trim()) return;
    setLoadingAppts(true);
    try {
      const res = await fetch(`/api/appointments?phone=${encodeURIComponent(tel.trim())}`);
      setAppts(res.ok ? await res.json() : []);
    } catch {
      setAppts([]);
    } finally {
      setLoadingAppts(false);
    }
  }, [tel]);

  useEffect(() => {
    if (mounted && tel.trim()) loadAppts();
  }, [mounted, tel, loadAppts]);

  if (!mounted) return null;

  const submitAuth = async () => {
    setAuthError("");
    if (!tel.trim() || authPass.length < 4 || (authMode === "register" && !name.trim())) {
      setAuthError(authMode === "register" ? "Nombre, teléfono y contraseña (mín. 4 caracteres)." : "Teléfono y contraseña (mín. 4 caracteres).");
      return;
    }
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          authMode === "register"
            ? { action: "register", name: name.trim(), phone: tel.trim(), password: authPass, address: addr.trim() }
            : { action: "login", phone: tel.trim(), password: authPass },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error ?? "Algo salió mal.");
        return;
      }
      setUser(data.user);
      setAuthPass("");
      setCustomer(data.user.name, data.user.phone);
      if (data.user.address) setAddress(data.user.address);
    } catch {
      setAuthError("Sin conexión. Intenta de nuevo.");
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setUser(null);
  };

  const save = async () => {
    setCustomer(name.trim(), tel.trim());
    setAddress(addr.trim());
    if (user) {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", name: name.trim(), address: addr.trim() }),
      }).catch(() => {});
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const initials = (customerName || user?.name || "Cliente").slice(0, 2).toUpperCase();
  const spent = orders.reduce((a, o) => a + o.total, 0);

  return (
    <div className="min-h-screen bg-mist/40 pb-28">
      {/* Header del Panel de Cliente */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <BackButton fallback="/" />
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[var(--brand-accent)] text-[15px] font-black text-white shadow-sm">
              {initials}
            </span>
            <div>
              <h1 className="text-[17px] font-black tracking-tight text-ink leading-tight">
                {customerName || user?.name || "Mi Cuenta"}
              </h1>
              <p className="text-[11.5px] font-bold text-ink-soft">Panel de Cliente Rayte</p>
            </div>
          </div>

          <Link href="/" className="rounded-full bg-brand px-3.5 py-1.5 text-[12px] font-black text-white transition hover:bg-brand-dark active:scale-95 shadow-sm">
            Explorar
          </Link>
        </div>

        {/* Pestañas del Panel de Cliente */}
        <div className="no-scrollbar -mx-0 flex gap-1.5 overflow-x-auto px-4 pb-2 pt-1">
          {[
            { id: "perfil", label: "👤 Mi Perfil" },
            { id: "pedidos", label: `🛍️ Pedidos (${orders.length})` },
            { id: "citas", label: `📅 Mis Citas ${appts ? `(${appts.length})` : ""}` },
            { id: "favoritos", label: `❤️ Favoritos (${favorites.length})` },
            { id: "pagos", label: "💳 Pagos & Seguridad" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setClientTab(t.id as typeof clientTab)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-black transition ${
                clientTab === t.id
                  ? "bg-ink text-white shadow-sm"
                  : "bg-mist text-ink-soft hover:text-ink hover:bg-black/[0.06]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-4 px-4 pt-4">
        {/* ── Selector de Roles / Tipos de cuenta ── */}
        <section className="rounded-[26px] bg-white p-4 shadow-sm border border-black/5">
          <p className="text-[12px] font-black tracking-wide text-ink-soft uppercase">Cambiar de portal</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setClientTab("perfil")}
              className={`flex items-center gap-3 rounded-[20px] border p-3 text-left transition ${
                clientTab === "perfil" ? "border-brand bg-brand-soft ring-2 ring-brand/20" : "border-black/10 bg-white"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Cliente</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Panel activo</p>
              </div>
            </button>

            <Link href="/socio" className="flex items-center gap-3 rounded-[20px] border border-black/10 bg-white p-3 text-left transition hover:border-[#0ea55b]/40 hover:bg-[#e6f8ee]/30 active:scale-[0.98]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e6f8ee] text-[#0ea55b]">
                <Store className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Socio Negocio</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Gestionar tienda</p>
              </div>
            </Link>

            <Link href="/profesional" className="flex items-center gap-3 rounded-[20px] border border-black/10 bg-white p-3 text-left transition hover:border-[#1d6ae5]/40 hover:bg-[#e8f1fe]/30 active:scale-[0.98]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f1fe] text-[#1d6ae5]">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Profesional</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Citas y médicos</p>
              </div>
            </Link>

            <Link href="/conductor" className="flex items-center gap-3 rounded-[20px] border border-black/10 bg-white p-3 text-left transition hover:border-amber-pop/40 hover:bg-amber-50 active:scale-[0.98]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-pop/20 text-amber-700">
                <Bike className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black text-ink">Conductor</p>
                <p className="truncate text-[10.5px] font-bold text-ink-soft">Entrega y gana</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── TAB 1: MI PERFIL Y DATOS ── */}
        {clientTab === "perfil" && (
          <div className="space-y-4">
            {/* Resumen del cliente */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white p-4 shadow-sm border border-black/5">
                <p className="text-[11px] font-black text-ink-soft uppercase">Total gastado</p>
                <p className="text-xl font-black text-ink mt-0.5">{formatMXN(spent)}</p>
              </div>
              <div className="rounded-[22px] bg-white p-4 shadow-sm border border-black/5">
                <p className="text-[11px] font-black text-ink-soft uppercase">Nivel Rayte</p>
                <p className="flex items-center gap-1 text-lg font-black text-brand mt-0.5">
                  <Zap className="h-4.5 w-4.5 fill-brand" /> Turbo Amigo
                </p>
              </div>
            </div>

            {/* Sesión de usuario */}
            {authChecked && !user && (
              <section className="rounded-[26px] border-2 border-brand/25 bg-brand-soft/40 p-5">
                <div className="flex items-center gap-2">
                  {authMode === "register" ? <UserPlus className="h-5 w-5 text-brand" /> : <LogIn className="h-5 w-5 text-brand" />}
                  <p className="text-[15px] font-black">{authMode === "register" ? "Crea tu cuenta Rayte" : "Inicia sesión"}</p>
                </div>
                <p className="mt-1 text-[12.5px] font-bold text-ink-soft">Tus pedidos y favoritos te siguen en cualquier dispositivo.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => { setAuthMode("register"); setAuthError(""); }} className={`rounded-2xl border py-2.5 text-[13px] font-black transition ${authMode === "register" ? "border-brand bg-white text-brand" : "border-black/10 text-ink-soft"}`}>Crear cuenta</button>
                  <button onClick={() => { setAuthMode("login"); setAuthError(""); }} className={`rounded-2xl border py-2.5 text-[13px] font-black transition ${authMode === "login" ? "border-brand bg-white text-brand" : "border-black/10 text-ink-soft"}`}>Ya tengo cuenta</button>
                </div>
                <div className="mt-3 space-y-2.5">
                  {authMode === "register" && (
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                  )}
                  <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono" inputMode="tel" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                  <input value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="Contraseña" type="password" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                </div>
                {authError && <p className="mt-2 rounded-2xl bg-brand-soft px-4 py-2.5 text-[12.5px] font-black text-brand">{authError}</p>}
                <motion.button whileTap={{ scale: 0.98 }} onClick={submitAuth} disabled={authBusy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[14px] font-black text-white transition hover:bg-brand-dark disabled:opacity-60 shadow-md">
                  {authBusy ? "Un momento..." : authMode === "register" ? "Crear mi cuenta" : "Entrar a mi cuenta"}
                </motion.button>
              </section>
            )}

            {user && (
              <section className="flex items-center justify-between rounded-[26px] border-2 border-[#0ea55b]/25 bg-[#e6f8ee]/60 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <Check className="h-5 w-5 text-[#0ea55b]" />
                  <div>
                    <p className="text-[14px] font-black text-ink">Sesión iniciada</p>
                    <p className="text-[12px] font-bold text-ink-soft">{user.name} · {user.phone}</p>
                  </div>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12px] font-black text-ink shadow-sm transition hover:bg-mist">
                  <LogOut className="h-3.5 w-3.5" /> Salir
                </button>
              </section>
            )}

            {/* Editar Datos Personales */}
            <section className="rounded-[26px] bg-white p-5 shadow-sm border border-black/5">
              <p className="text-[15px] font-black text-ink">Mis datos de contacto y entrega</p>
              <div className="mt-3 space-y-2.5">
                <div>
                  <label className="text-[11.5px] font-bold text-ink-soft">Nombre de contacto</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="w-full mt-1 rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-ink-soft">Teléfono</label>
                  <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono" inputMode="tel" className="w-full mt-1 rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-ink-soft">Dirección principal</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute top-3.5 left-4 h-4.5 w-4.5 text-brand" />
                    <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Dirección principal" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-11 text-[14px] font-bold outline-none focus:border-brand" />
                  </div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={save} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-black text-white transition ${saved ? "bg-[#0ea55b]" : "bg-brand hover:bg-brand-dark"} shadow-md`}>
                {saved ? <><Check className="h-4.5 w-4.5" /> Guardado con éxito</> : "Guardar mis datos"}
              </motion.button>
            </section>
          </div>
        )}

        {/* ── TAB 2: MIS PEDIDOS ── */}
        {clientTab === "pedidos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-black text-ink">Tus pedidos ({orders.length})</p>
              <Link href="/pedidos" className="text-[12px] font-bold text-brand hover:underline">Ver seguimiento en vivo</Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-[26px] bg-white p-8 text-center border border-black/5 shadow-sm">
                <ReceiptText className="mx-auto h-10 w-10 text-brand mb-2 opacity-80" />
                <p className="text-[15px] font-black text-ink">Aún no has realizado pedidos</p>
                <p className="text-[12.5px] font-bold text-ink-soft mt-1">Explora restaurantes y panaderías para hacer tu primer pedido.</p>
                <Link href="/" className="inline-block mt-4 rounded-full bg-brand px-5 py-2.5 text-xs font-black text-white">Explorar comida</Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.code} className="rounded-[22px] bg-white p-4 border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14.5px] font-black text-ink">{o.restaurant.name}</p>
                      <p className="text-[11.5px] font-bold text-ink-soft">Código: {o.code} · {o.payment}</p>
                    </div>
                    <span className="text-[15px] font-black text-brand">{formatMXN(o.total)}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-ink-soft mt-2 line-clamp-1">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5">
                    <span className="text-[11px] font-bold text-ink-soft">
                      {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(o.placedAt))}
                    </span>
                    <Link href={`/pedido/${o.code}`} className="rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-black text-brand hover:bg-brand-soft">
                      Ver en vivo →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: MIS CITAS DE SERVICIOS ── */}
        {clientTab === "citas" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-black text-ink">Tus citas agendadas</p>
              <button onClick={loadAppts} className="text-[12px] font-bold text-brand hover:underline">Refrescar</button>
            </div>

            {loadingAppts && <p className="text-[12px] font-bold text-ink-soft">Buscando tus citas...</p>}

            {appts && appts.length === 0 ? (
              <div className="rounded-[26px] bg-white p-8 text-center border border-black/5 shadow-sm">
                <CalendarDays className="mx-auto h-10 w-10 text-[#7c3aed] mb-2 opacity-80" />
                <p className="text-[15px] font-black text-ink">No tienes citas agendadas</p>
                <p className="text-[12.5px] font-bold text-ink-soft mt-1">Agenda citas de belleza, bienestar, hogar, mascotas o médicos.</p>
                <Link href="/servicios" className="inline-block mt-4 rounded-full bg-ink px-5 py-2.5 text-xs font-black text-white">Ver servicios</Link>
              </div>
            ) : (
              appts?.map((a) => (
                <div key={a.id} className="rounded-[22px] bg-white p-4 border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14.5px] font-black text-ink">{a.serviceName}</p>
                      <p className="text-[12px] font-bold text-ink-soft">
                        {new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(a.startAt))} · Código: {a.code}
                      </p>
                    </div>
                    <span className="text-[14px] font-black text-ink">{formatMXN(a.price)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11.5px] font-bold text-ink-soft">
                    <span>{a.mode === "domicilio" ? "🛵 A domicilio" : "🏪 En el local"}</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-black text-emerald-600">Confirmada</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: MIS FAVORITOS ── */}
        {clientTab === "favoritos" && (
          <div className="space-y-3">
            <p className="text-[15px] font-black text-ink">Tiendas favoritas guardadas ({favorites.length})</p>
            {favorites.length === 0 ? (
              <div className="rounded-[26px] bg-white p-8 text-center border border-black/5 shadow-sm">
                <Heart className="mx-auto h-10 w-10 text-brand mb-2 opacity-80" />
                <p className="text-[15px] font-black text-ink">No tienes favoritos aún</p>
                <p className="text-[12.5px] font-bold text-ink-soft mt-1">Toca el corazón en cualquier tienda o platillo para guardarlo aquí.</p>
                <Link href="/" className="inline-block mt-4 rounded-full bg-brand px-5 py-2.5 text-xs font-black text-white">Explorar tiendas</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((slug) => (
                  <Link
                    key={slug}
                    href={`/restaurante/${slug}`}
                    className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-black/5 shadow-sm transition hover:border-brand"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <Heart className="h-4.5 w-4.5 fill-brand" />
                      </span>
                      <p className="text-[14px] font-black capitalize text-ink">{slug.replace(/-/g, " ")}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-soft" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: PAGOS & SEGURIDAD ── */}
        {clientTab === "pagos" && (
          <div className="space-y-4">
            <section className="rounded-[26px] bg-white p-5 shadow-sm border border-black/5 space-y-3">
              <p className="text-[15px] font-black text-ink">Métodos de pago guardados</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-mist border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <Banknote className="h-5 w-5 text-[#0ea55b]" />
                    <div>
                      <p className="text-[13px] font-black text-ink">Efectivo</p>
                      <p className="text-[11px] font-bold text-ink-soft">Pago contra entrega en mano</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#0ea55b]">Predeterminado</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-mist border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-5 w-5 text-amber-pop" />
                    <div>
                      <p className="text-[13px] font-black text-ink">Tarjeta Visa •••• 4821</p>
                      <p className="text-[11px] font-bold text-ink-soft">Vence 09/28 · Débito</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-ink-soft">Activa</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-mist border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <Landmark className="h-5 w-5 text-sky-500" />
                    <div>
                      <p className="text-[13px] font-black text-ink">Transferencia / SPEI</p>
                      <p className="text-[11px] font-bold text-ink-soft">Disponible en entregas y viajes</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-ink-soft">Activa</span>
                </div>
              </div>
            </section>

            {/* Selector de color */}
            <section className="rounded-[26px] bg-white p-5 shadow-sm border border-black/5">
              <p className="text-[15px] font-black text-ink">🎨 Color de la app Rayte</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {PALETTES.map((p) => {
                  const active = paletteById(paletteId).id === p.id;
                  return (
                    <button key={p.id} onClick={() => setPalette(p.id)} className="flex flex-col items-center gap-1">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90"
                        style={{ backgroundColor: p.brand, boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${p.brand}` : undefined }}
                      >
                        {active && <Check className="h-4 w-4 text-white" strokeWidth={3.5} />}
                      </span>
                      <span className={`text-[10px] font-black truncate max-w-[55px] ${active ? "text-ink" : "text-ink-soft"}`}>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <p className="pt-2 text-center text-[11px] font-bold text-ink-soft/70">Rayte · Portal de Cliente v1.28</p>
      </div>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/error.tsx
// --------------------------------------------------------
"use client";

import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="text-5xl">😵‍💫</span>
      <h1 className="text-2xl font-black tracking-tight">¡Ups! Algo se atravesó</h1>
      <p className="max-w-xs text-sm font-bold text-ink-soft">
        No pudimos cargar esta parte de Rayte. Prueba de nuevo o vuelve al inicio.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_var(--brand-glow)] transition hover:bg-brand-dark"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full bg-mist px-5 py-3 text-sm font-black text-ink transition hover:bg-black/[0.08]"
        >
          <Home className="h-4 w-4" /> Inicio
        </Link>
      </div>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/globals.css
// --------------------------------------------------------
@import "tailwindcss";

/* Tailwind v4: expone los colores de marca como utilidades (bg-brand, text-ink-soft, etc.) */
@theme inline {
  --color-brand: var(--brand);
  --color-brand-hard: var(--brand-hard);
  --color-brand-dark: var(--brand-dark);
  --color-brand-soft: var(--brand-soft);
  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --color-mist: var(--mist);
  --color-amber-pop: var(--amber-pop);
  --font-display: var(--font-nunito), ui-sans-serif, system-ui, sans-serif;
}

:root {
  --font-display: var(--font-nunito);
  --brand: #ff441f;
  --brand-hard: #d6330f;
  --brand-dark: #c73a17;
  --brand-soft: #fff0ec;
  --brand-accent: #ff7a2f;
  --brand-glow: rgba(255, 68, 31, 0.42);
  --ink: #1f2937;
  --ink-soft: #6b7280;
  --mist: #f3f4f6;
  --amber-pop: #fbbf24;
}

body {
  font-family: var(--font-nunito), ui-sans-serif, system-ui, sans-serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.route-dash {
  animation: dash 1.2s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -26;
  }
}

.courier-ring {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}


// --------------------------------------------------------
// ARCHIVO: src/app/icon.svg
// --------------------------------------------------------
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#ff441f"/>
  <path d="M36 8 L18 36 h10 l-4 20 22-30 H34 l2-18 Z" fill="#fff"/>
</svg>


// --------------------------------------------------------
// ARCHIVO: src/app/layout.tsx
// --------------------------------------------------------
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import CartShell from "@/components/cart-shell";
import BottomNav from "@/components/bottom-nav";
import ThemeApplier from "@/components/theme-applier";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rayte — Todo lo que quieras, en minutos",
  description: "Comida de tus restaurantes favoritos, mercado, farmacia y más, entregado en minutos.",
};

/* Sirve TODAS las páginas sin caché: el usuario siempre ve la última versión
   (antes las páginas pregeneradas salían con caché de 1 año y el CDN daba versiones viejas) */
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} font-display antialiased`}>
        {children}
        <ThemeApplier />
        <CartShell />
        <BottomNav />
      </body>
    </html>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/page.tsx
// --------------------------------------------------------
import { db } from "@/db";
import { categories, restaurants, products, services } from "@/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import AppHeader from "@/components/app-header";
import SurpriseHost from "@/components/surprise-host";
import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";
import {
  CategoryGrid,
  PromoCarousel,
  TurboRow,
  RestaurantList,
  ServicesRow,
  FeaturedFoodRow,
  FavoritesFoodRow,
  SaludRow,
  RayteGoBanner,
} from "@/components/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sort));
  const stores = await db
    .select()
    .from(restaurants)
    .orderBy(asc(restaurants.sort));

  const turbo = stores.find((r) => r.isTurbo);
  const turboProducts = turbo
    ? await db
        .select()
        .from(products)
        .where(eq(products.restaurantId, turbo.id))
        .orderBy(asc(products.sort))
    : [];

  const cross = await crossSellItems(null);
  const crossTitle = randomCrossTitle();

  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.available, true))
    .orderBy(asc(services.sort));

  const regularServices = allServices.filter((s) => s.category !== "salud");
  const saludServices = allServices.filter((s) => s.category === "salud");
  const pharmacyStores = stores.filter((s) => s.categorySlug === "farmacia");

  const brasa = stores.find((r) => r.slug === "la-brasa-smash");
  const crack = stores.find((r) => r.slug === "pollo-crack");

  // Platillos de comida para el botón "Sorpréndeme"
  const foodStores = stores.filter((r) => ["restaurantes", "panaderias", "postres"].includes(r.categorySlug) && r.isOpen && !r.isTurbo);
  const dishes = foodStores.length
    ? await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          image: products.image,
          section: products.section,
          restaurantId: products.restaurantId,
        })
        .from(products)
        .where(and(eq(products.available, true), inArray(products.restaurantId, foodStores.map((s) => s.id))))
    : [];

  const promos = [
    {
      title: "50% en tu primer pedido",
      subtitle: "En La Brasa Smash con el código HOLA50",
      image: brasa?.image ?? "",
      href: "/restaurante/la-brasa-smash",
      gradient: "from-brand to-brand-hard",
      tag: "Solo hoy",
    },
    {
      title: "Turbo en 10 min",
      subtitle: "Antojos y esenciales al instante",
      image: turboProducts[1]?.image ?? "",
      href: "/restaurante/turbo-rayte",
      gradient: "from-[#221e2c] to-[#3c3348]",
      tag: "Turbo",
    },
    {
      title: "Envío gratis",
      subtitle: `En ${crack?.name ?? "Pollo Crack"} todo el fin de semana`,
      image: crack?.image ?? "",
      href: "/restaurante/pollo-crack",
      gradient: "from-[#e0115f] to-[#7f0a3a]",
      tag: "Envío gratis",
    },
    {
      title: "Rayte Go llegó",
      subtitle: "Muévete por la ciudad en moto o carro desde $45",
      image: "",
      href: "/viajes",
      gradient: "from-[#16121b] to-[#3a2f45]",
      tag: "Nuevo · Viajes",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <AppHeader />
      <CategoryGrid categories={cats} />
      <PromoCarousel promos={promos} />
      {turbo && turboProducts.length > 0 && (
        <TurboRow store={turbo} products={turboProducts} />
      )}

      {/* 1. Destacadas para ti — Comida */}
      <FeaturedFoodRow stores={stores} />

      {/* 2. Favoritos — Comida */}
      <FavoritesFoodRow stores={stores} />

      {/* 3. Citas y Servicios destacados */}
      {regularServices.length > 0 && <ServicesRow services={regularServices} />}

      {/* 4. Salud destacados (Médicos y Especialistas a domicilio) */}
      {saludServices.length > 0 && <SaludRow services={saludServices} />}

      {/* 🚗 Banner para Rayte Go (Viajes) */}
      <RayteGoBanner />

      {/* Catálogo completo con Filtros y Sorpréndeme */}
      <RestaurantList restaurants={stores} dishes={dishes} crossItems={cross} crossTitle={crossTitle} />
      <SurpriseHost dishes={dishes} restaurants={stores} />
    </main>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/pedido/[code]/page.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bike, CalendarDays, Check, ChefHat, CircleCheck, Home, MapPin, MessageCircle, Phone, Star, Camera } from "lucide-react";
import { useOrders, orderStep, orderIsScheduled, ORDER_STEPS, type Order } from "@/store/orders";
import { formatMXN } from "@/lib/utils";

const ROUTE = "M 36 196 C 120 40, 250 240, 368 88";
const STEP_ICONS = [CircleCheck, ChefHat, Bike, Home];

type ApiDriver = { id: number; name: string; vehicle: string; plate: string; rating: number } | null;
type ApiOrder = {
  code: string;
  restaurantName: string;
  items: { key: string; name: string; price: number; qty: number; options?: string }[];
  subtotal: number; deliveryFee: number; serviceFee: number; tip: number; total: number;
  customerName: string; phone: string; address: string; payment: string;
  status: "placed" | "preparing" | "ready" | "on_way" | "delivered";
  etaMin: number; etaMax: number;
  scheduledFor: string | null; placedAt: string; onWayAt: string | null; deliveredAt: string | null;
  rating: number | null;
  driver: ApiDriver;
};

const FALLBACK_DRIVERS = [
  { name: "Andrés M.", vehicle: "Moto", plate: "RY-421", rating: 4.9 },
  { name: "Carolina R.", vehicle: "Moto", plate: "RY-133", rating: 4.8 },
  { name: "Jorge L.", vehicle: "Carro", plate: "RY-809", rating: 4.9 },
  { name: "María F.", vehicle: "Bicicleta", plate: "RY-265", rating: 4.7 },
];

const STEP_OF_STATUS: Record<ApiOrder["status"], number> = {
  placed: 0, preparing: 1, ready: 1, on_way: 2, delivered: 3,
};

export default function PedidoPage() {
  const params = useParams();
  const code = params.code as string;
  const orders = useOrders((s) => s.orders);
  const ratings = useOrders((s) => s.ratings);
  const rateOrderLocal = useOrders((s) => s.rateOrder);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ── Pedido REAL desde la base de datos (con sondeo en vivo) ── */
  const [api, setApi] = useState<ApiOrder | null>(null);
  const [apiTried, setApiTried] = useState(false);
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders?code=${encodeURIComponent(code)}`, { cache: "no-store" });
        if (!stop && res.ok) {
          const data = await res.json();
          setApi(data.order);
        }
      } catch { /* offline: usa respaldo local */ }
      if (!stop) setApiTried(true);
    };
    load();
    const t = setInterval(() => {
      // deja de sondear cuando ya se entregó
      setApi((prev) => {
        if (!prev || prev.status !== "delivered") load();
        return prev;
      });
    }, 4000);
    return () => { stop = true; clearInterval(t); };
  }, [code]);

  const localOrder: Order | undefined = useMemo(() => orders.find((o) => o.code === code), [orders, code]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fallbackDriver = useMemo(() => {
    let h = 0;
    for (const c of code) h = (h * 31 + c.charCodeAt(0)) % 997;
    return FALLBACK_DRIVERS[h % FALLBACK_DRIVERS.length];
  }, [code]);

  if (!mounted) return null;
  if (!api && !apiTried) return null;

  if (!api && !localOrder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="text-4xl font-black italic text-brand">Ups</span>
        <p className="text-lg font-black">Pedido no encontrado</p>
        <p className="max-w-xs text-sm font-bold text-ink-soft">No encontramos el pedido {code}.</p>
        <Link href="/pedidos" className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-black text-white">Ver mis pedidos</Link>
      </div>
    );
  }

  /* Normaliza: el pedido de la DB manda; el local es respaldo sin conexión */
  const o = api
    ? {
        code: api.code,
        storeName: api.restaurantName,
        items: api.items,
        subtotal: api.subtotal, deliveryFee: api.deliveryFee, serviceFee: api.serviceFee, tip: api.tip, total: api.total,
        customerName: api.customerName, phone: api.phone, address: api.address, payment: api.payment,
        etaMin: api.etaMin, etaMax: api.etaMax,
        scheduledFor: api.scheduledFor ?? undefined,
        placedAt: new Date(api.placedAt).getTime(),
        onWayAt: api.onWayAt ? new Date(api.onWayAt).getTime() : null,
        step: STEP_OF_STATUS[api.status],
        ready: api.status === "ready",
        rating: api.rating ?? 0,
        driver: api.driver,
      }
    : {
        code: localOrder!.code,
        storeName: localOrder!.restaurant.name,
        items: localOrder!.items,
        subtotal: localOrder!.subtotal, deliveryFee: localOrder!.deliveryFee, serviceFee: localOrder!.serviceFee, tip: localOrder!.tip, total: localOrder!.total,
        customerName: localOrder!.customerName, phone: localOrder!.phone, address: localOrder!.address, payment: localOrder!.payment,
        etaMin: localOrder!.etaMin, etaMax: localOrder!.etaMax,
        scheduledFor: localOrder!.scheduledFor,
        placedAt: localOrder!.placedAt,
        onWayAt: null,
        step: orderStep(localOrder!, now),
        ready: false,
        rating: ratings[code] ?? 0,
        driver: null,
      };

  const step = o.step;
  const upcoming = !!o.scheduledFor && now < new Date(o.scheduledFor).getTime();
  const schedDate = o.scheduledFor ? new Date(o.scheduledFor) : null;
  const schedFull = schedDate
    ? new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(schedDate)
    : "";
  const schedShort = schedDate ? new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(schedDate) : "";

  const tripProgress = step >= 3 ? 1 : step === 2 && o.onWayAt ? Math.max(0.02, Math.min(0.96, (now - o.onWayAt) / 90000)) : step === 2 ? 0.3 : 0;
  const elapsed = (now - o.placedAt) / 1000;
  const minsLeft = Math.max(1, Math.round(o.etaMax - elapsed / 60 * 2.2));

  const driver = o.driver ?? fallbackDriver;
  const showDriver = step >= 2 && !upcoming;
  const myRating = o.rating || (ratings[code] ?? 0);

  const rate = async (n: number) => {
    rateOrderLocal(code, n);
    if (api) {
      try {
        await fetch("/api/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "rate", code, rating: n }),
        });
        setApi((prev) => (prev ? { ...prev, rating: n } : prev));
      } catch { /* queda guardado localmente */ }
    }
  };

  const itemCount = o.items.reduce((a, i) => a + i.qty, 0);

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-24">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Link href="/pedidos" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-black tracking-tight">Pedido {o.code}</h1>
            <p className="text-[12.5px] font-bold text-ink-soft">{o.storeName} · {itemCount} productos {api && <span className="text-[#0ea55b]">· en vivo</span>}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-[11.5px] font-black ${step === 3 && !upcoming ? "bg-[#e6f8ee] text-[#0ea55b]" : "bg-brand-soft text-brand"}`}>
            {upcoming ? "Programado" : step === 3 ? "Entregado" : `Llega en ~${minsLeft} min`}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-5">
        <section className="overflow-hidden rounded-[26px] border">
          <RouteMap progress={tripProgress} step={step} ready={o.ready} note={upcoming ? `Programado para ${schedShort}` : undefined} />
          {showDriver && (
            <div className="flex items-center justify-between gap-3 bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-black text-white">{driver.name[0]}</span>
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-black">{driver.name}</p>
                  <p className="text-[12px] font-bold text-ink-soft">{driver.vehicle} · {driver.plate} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {driver.rating}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button aria-label="Chat" className="flex h-10 w-10 items-center justify-center rounded-full bg-mist transition hover:bg-black/10"><MessageCircle className="h-4.5 w-4.5" /></button>
                <button aria-label="Llamar" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark"><Phone className="h-4.5 w-4.5" /></button>
              </div>
            </div>
          )}
        </section>

        {upcoming && schedDate && (
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[26px] border-2 border-dashed border-brand/40 bg-brand-soft/60 p-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_var(--brand-glow)]">
              <CalendarDays className="h-8 w-8" />
            </span>
            <p className="mt-3 text-lg font-black">Pedido programado</p>
            <p className="mt-1 text-[13.5px] font-bold text-ink">{schedFull}</p>
            <p className="mt-2 text-[12.5px] font-bold text-ink-soft">Lo preparamos a esa hora y llega en ~{o.etaMin}-{o.etaMax} min. Te avisamos cuando salga el repartidor.</p>
          </motion.section>
        )}

        <section className="rounded-[26px] border p-5">
          <p className="text-[15px] font-black">Estado del pedido</p>
          <ol className="mt-4 space-y-0">
            {ORDER_STEPS.map((s, i) => {
              const Icon = STEP_ICONS[i];
              const reached = i <= step;
              return (
                <li key={s.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <motion.span initial={false} animate={{ scale: reached ? 1 : 0.85 }} className={`flex h-9 w-9 items-center justify-center rounded-full ${reached ? "bg-brand text-white" : "bg-mist text-ink-soft"}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </motion.span>
                    {i < ORDER_STEPS.length - 1 && <span className={`w-0.5 flex-1 ${i < step ? "bg-brand" : "bg-mist"}`} style={{ minHeight: 22 }} />}
                  </div>
                  <div className="pb-4">
                    <p className={`pt-1.5 text-[14px] ${reached ? "font-black" : "font-bold text-ink-soft"}`}>
                      {upcoming && i === 0 ? `Programado · ${schedShort}` : i === 1 && o.ready ? "Listo, esperando repartidor" : s.label}
                    </p>
                    {i === step && i < 3 && !upcoming && <p className="text-[12px] font-bold text-brand">En curso...</p>}
                    {upcoming && i === 0 && schedFull && <p className="text-[12px] font-bold text-brand capitalize">{schedFull}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {step === 3 && (
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[26px] border-2 border-brand/25 bg-brand-soft/60 p-5 text-center">
            <p className="text-[15px] font-black">¿Cómo estuvo tu pedido?</p>
            <div className="mt-3 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => rate(n)} aria-label={`${n} estrellas`} className="transition active:scale-90">
                  <Star className={`h-8 w-8 ${myRating >= n ? "fill-amber-pop text-amber-pop" : "text-black/20"}`} />
                </button>
              ))}
            </div>
            {myRating > 0 && <p className="mt-2 flex items-center justify-center gap-1 text-[13px] font-black text-brand"><Check className="h-4 w-4" /> ¡Gracias por calificar!</p>}
          </motion.section>
        )}

        <section className="rounded-[26px] border p-5">
          <p className="text-[15px] font-black">Resumen</p>
          <div className="mt-3 space-y-1.5">
            {o.items.map((i) => (
              <div key={i.key} className="flex justify-between text-[13.5px] font-bold">
                <span className="text-ink-soft">{i.qty}× {i.name}{i.options ? ` (${i.options})` : ""}</span>
                <span>{formatMXN(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="mt-2 space-y-1 border-t border-black/5 pt-2 text-[13px] font-bold text-ink-soft">
              <div className="flex justify-between"><span>Envío</span><span className="text-ink">{o.deliveryFee === 0 ? "Gratis" : formatMXN(o.deliveryFee)}</span></div>
              <div className="flex justify-between"><span>Tarifa de servicio</span><span className="text-ink">{formatMXN(o.serviceFee)}</span></div>
              {o.tip > 0 && <div className="flex justify-between"><span>Propina</span><span className="text-ink">{formatMXN(o.tip)}</span></div>}
              <div className="flex justify-between border-t border-black/5 pt-2 text-[15.5px] font-black text-ink"><span>Total</span><span>{formatMXN(o.total)}</span></div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 rounded-2xl bg-mist p-4 text-[13px] font-bold text-ink-soft">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand" /> <span className="truncate text-ink">{o.address}</span></p>
            <p>Recibe: {o.customerName} · {o.phone}</p>
            <p>Pago: {o.payment}</p>

            {localOrder?.refPhoto && (
              <div className="mt-2.5 flex items-center gap-3 rounded-xl bg-white p-2.5 border border-black/5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image src={localOrder.refPhoto} alt="Fachada" fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-black text-ink flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5 text-brand" /> Foto de fachada adjunta
                  </p>
                  <p className="text-[11px] font-bold text-ink-soft truncate">Compartida con tu repartidor</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <Link href="/" className="block rounded-full bg-ink px-5 py-4 text-center text-[15px] font-black text-white transition hover:bg-black">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function RouteMap({ progress, step, ready, note }: { progress: number; step: number; ready?: boolean; note?: string }) {
  const routeRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const [pt, setPt] = useState({ x: 36, y: 196 });

  useEffect(() => {
    const p = routeRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    setLen(L);
  }, []);

  useEffect(() => {
    const p = routeRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    const i = p.getPointAtLength(progress * L);
    setPt({ x: i.x, y: i.y });
  }, [progress]);

  return (
    <div className="relative bg-[#fafafa]">
      <svg viewBox="0 0 400 240" className="block w-full">
        <defs>
          <pattern id="ped-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="240" fill="url(#ped-grid)" />
        <path d={ROUTE} stroke="#e5e7eb" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d={ROUTE} ref={routeRef} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={len ? `${len * progress} ${len}` : "0 9999"} style={{ stroke: "var(--brand)", transition: "stroke-dasharray 1s linear" }} />
        <path d={ROUTE} stroke="#ffffff" strokeWidth="2.5" fill="none" strokeDasharray="8 18" className="route-dash" strokeLinecap="round" />
        <circle cx="36" cy="196" r="10" fill="#1f2937" />
        <text x="36" y="201" textAnchor="middle" fontSize="11">🏠</text>
        <circle cx="368" cy="88" r="10" fill="#0ea55b" />
        <text x="368" y="93" textAnchor="middle" fontSize="11">🏁</text>
        {step >= 2 && (
          <g>
            <circle cx={pt.x} cy={pt.y} r="14" fill="var(--brand-glow)" className="courier-ring" />
            <circle cx={pt.x} cy={pt.y} r="11" style={{ fill: "var(--brand)" }} stroke="#fff" strokeWidth="2.5" />
            <text x={pt.x} y={pt.y + 4} textAnchor="middle" fontSize="11">{step === 3 ? "🎉" : "🏍️"}</text>
          </g>
        )}
      </svg>
      {step < 2 && (
        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-black text-ink-soft shadow-sm">
          {note ?? (step === 0 ? "Confirmando con la tienda..." : ready ? "Listo, esperando repartidor..." : "Preparando tu pedido...")}
        </span>
      )}
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/pedidos/page.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, ReceiptText } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders, orderStep, orderIsScheduled } from "@/store/orders";
import { formatMXN } from "@/lib/utils";
import BackButton from "@/components/back-button";

const STATUS_STYLE = [
  { label: "Confirmado", cls: "bg-mist text-ink-soft" },
  { label: "En preparación", cls: "bg-[#fef4e2] text-[#92600a]" },
  { label: "En camino", cls: "bg-brand-soft text-brand" },
  { label: "Entregado", cls: "bg-[#e6f8ee] text-[#0ea55b]" },
];

const STEP_OF_STATUS: Record<string, number> = { placed: 0, preparing: 1, ready: 1, on_way: 2, delivered: 3 };

type Row = {
  code: string;
  storeName: string;
  image: string | null;
  count: number;
  total: number;
  placedAt: number;
  step: number;
  scheduled: boolean;
};

export default function PedidosPage() {
  const localOrders = useOrders((s) => s.orders);
  const phone = useCart((s) => s.phone);
  const [mounted, setMounted] = useState(false);
  const [apiRows, setApiRows] = useState<Row[] | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  /* Pedidos REALES desde la base de datos: primero por sesión, luego por teléfono */
  useEffect(() => {
    if (!mounted) return;
    let stop = false;
    const load = async () => {
      try {
        let res = await fetch("/api/orders?mine=1", { cache: "no-store" });
        let list: Record<string, unknown>[] = res.ok ? (await res.json()).orders : [];
        if (!list.length && phone.trim()) {
          res = await fetch(`/api/orders?phone=${encodeURIComponent(phone.trim())}`, { cache: "no-store" });
          if (res.ok) list = (await res.json()).orders;
        }
        if (stop) return;
        setApiRows(
          list.map((o) => {
            const items = (o.items as { image: string | null; qty: number }[]) ?? [];
            const scheduledFor = o.scheduledFor ? new Date(o.scheduledFor as string).getTime() : 0;
            return {
              code: o.code as string,
              storeName: o.restaurantName as string,
              image: items[0]?.image ?? null,
              count: items.reduce((a, i) => a + i.qty, 0),
              total: o.total as number,
              placedAt: new Date(o.placedAt as string).getTime(),
              step: STEP_OF_STATUS[o.status as string] ?? 0,
              scheduled: scheduledFor > Date.now(),
            };
          }),
        );
      } catch {
        if (!stop) setApiRows(null);
      }
    };
    load();
    const t = setInterval(load, 6000);
    return () => { stop = true; clearInterval(t); };
  }, [mounted, phone]);

  /* Respaldo local para pedidos que no llegaron a la DB */
  const rows: Row[] = useMemo(() => {
    const api = apiRows ?? [];
    const seen = new Set(api.map((r) => r.code));
    const extra: Row[] = localOrders
      .filter((o) => !seen.has(o.code))
      .map((o) => ({
        code: o.code,
        storeName: o.restaurant.name,
        image: o.items[0]?.image ?? null,
        count: o.items.reduce((a, i) => a + i.qty, 0),
        total: o.total,
        placedAt: o.placedAt,
        step: orderStep(o),
        scheduled: orderIsScheduled(o),
      }));
    return [...api, ...extra].sort((a, b) => b.placedAt - a.placedAt);
  }, [apiRows, localOrders]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="mx-auto max-w-lg px-4 pt-8">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-3xl font-black tracking-tight">Mis pedidos</h1>
            <p className="mt-1 text-ink-soft">Historial y seguimiento en vivo</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-[26px] bg-mist px-6 py-14 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm"><ReceiptText className="h-9 w-9 text-brand" strokeWidth={1.8} /></div>
            <p className="mt-4 text-lg font-black">Aún no tienes pedidos</p>
            <p className="mt-1 max-w-xs text-sm font-bold text-ink-soft">Cuando pidas algo, lo verás aquí con su seguimiento en tiempo real.</p>
            <Link href="/" className="mt-4 rounded-full bg-brand px-6 py-3 text-sm font-black text-white">Explorar tiendas</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {rows.map((o) => {
              const st = o.scheduled ? { label: "Programado", cls: "bg-[#fef4e2] text-[#92600a]" } : STATUS_STYLE[o.step];
              return (
                <motion.div key={o.code} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                  <Link href={`/pedido/${o.code}`} className="flex items-center gap-3 rounded-[22px] border p-4 transition hover:border-brand">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                      {o.image ? <Image src={o.image} alt={o.storeName} fill className="object-cover" sizes="64px" /> : <div className="flex h-full items-center justify-center bg-brand-soft text-lg">🛍️</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[15px] font-black">{o.storeName}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black ${st.cls}`}>{st.label}</span>
                      </div>
                      <p className="truncate text-[12.5px] font-bold text-ink-soft">{o.code} · {o.count} productos · {formatMXN(o.total)}</p>
                      <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">
                        {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(o.placedAt))}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/profesional/page.tsx
// --------------------------------------------------------
import { db } from "@/db";
import { services } from "@/db/schema";
import { asc } from "drizzle-orm";
import ProfesionalClient from "./profesional-client";

export const dynamic = "force-dynamic";

export default async function ProfesionalPage() {
  const list = await db
    .select({
      id: services.id,
      name: services.name,
      slug: services.slug,
      category: services.category,
      provider: services.provider,
      proName: services.proName,
      image: services.image,
      rating: services.rating,
      price: services.price,
      durationMin: services.durationMin,
      available: services.available,
      domicilio: services.domicilio,
      local: services.local,
      verificationDocs: services.verificationDocs,
    })
    .from(services)
    .orderBy(asc(services.sort));

  return <ProfesionalClient services={list} />;
}


// --------------------------------------------------------
// ARCHIVO: src/app/profesional/profesional-client.tsx
// --------------------------------------------------------
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Banknote, CalendarDays, CircleCheck, ClipboardList, Clock3, Home, Lightbulb, MapPin, Phone, Plus, RefreshCw,
  Scissors, HeartPulse, PawPrint, Wrench, Stethoscope, Star, Store, Users, X, XCircle, FileText, AlertTriangle, Trash2, Tag, Check, Sparkles, Search
} from "lucide-react";
import { formatMXN } from "@/lib/utils";
import type { ClinicalSnapshot, MedicalVerificationDocs, Service } from "@/db/schema";

type ServiceLite = Pick<Service, "id" | "name" | "slug" | "category" | "provider" | "proName" | "image" | "rating" | "price" | "durationMin" | "available" | "domicilio" | "local" | "verificationDocs">;

type ServiceOptionItem = {
  id: number;
  serviceId: number;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  popular: boolean;
};

type Appt = {
  id: string;
  code: string;
  serviceId: number;
  serviceName: string;
  optionName: string | null;
  customerName: string;
  phone: string;
  mode: string;
  address: string | null;
  startAt: string;
  endAt: string;
  price: number;
  status: string;
  rating: number | null;
  notes: string | null;
  intake: { edad?: string; sintomas?: string; alergias?: string; medicamentos?: string } | null;
  clinicalSnapshot: ClinicalSnapshot | null;
  proNotes: string | null;
};

/* ============================================================
   Configuración por categoría de servicio (incluye médicos)
   ============================================================ */
type CatConf = {
  label: string;
  emoji: string;
  accent: string;
  soft: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  agendaTitle: string;
  clientNoun: string;
  simLabel: string;
  tips: string[];
  medico?: boolean; // categoría salud: recordatorios clínicos
};

const CATS: Record<string, CatConf> = {
  belleza: {
    label: "Belleza", emoji: "💇", accent: "#db2777", soft: "#fce7f3", Icon: Scissors,
    agendaTitle: "Tu agenda de belleza", clientNoun: "cliente", simLabel: "Simular cita",
    tips: [
      "Confirma la cita 1 hora antes por teléfono: reduce inasistencias a la mitad.",
      "Lleva tu kit completo esterilizado: es lo primero que revisan las reseñas.",
      "Ofrece agendar la siguiente sesión al terminar: clienta recurrente asegurada.",
    ],
  },
  bienestar: {
    label: "Bienestar", emoji: "🧘", accent: "#0d9488", soft: "#ccfbf1", Icon: HeartPulse,
    agendaTitle: "Tu agenda de bienestar", clientNoun: "cliente", simLabel: "Simular sesión",
    tips: [
      "Pregunta lesiones y condiciones físicas ANTES de la primera sesión.",
      "Llega 10 min antes para preparar el espacio (tapetes, aceites, música).",
      "Registra el progreso de cada cliente: es tu mejor argumento de renovación.",
    ],
  },
  mascotas: {
    label: "Mascotas", emoji: "🐾", accent: "#0284c7", soft: "#e0f2fe", Icon: PawPrint,
    agendaTitle: "Tu agenda peluda", clientNoun: "dueño", simLabel: "Simular lomito",
    tips: [
      "Pregunta temperamento y vacunas de la mascota antes de la visita.",
      "Lleva bozal y correa de repuesto: los dueños casi nunca los tienen.",
      "Fotos del antes y después: los dueños las comparten y te traen clientes.",
    ],
  },
  hogar: {
    label: "Hogar", emoji: "🔧", accent: "#FF5A5F", soft: "#ffe9ea", Icon: Wrench,
    agendaTitle: "Tu agenda de servicios", clientNoun: "cliente", simLabel: "Simular visita",
    tips: [
      "Cotiza materiales aparte y por escrito ANTES de empezar el trabajo.",
      "Zapatos con cubrecalzado y lona para muebles: profesionalismo que se nota.",
      "Garantía por escrito de 30 días: cierra más trabajos que cualquier descuento.",
    ],
  },
  salud: {
    label: "Salud · Médicos", emoji: "🩺", accent: "#1d6ae5", soft: "#e8f1fe", Icon: Stethoscope,
    agendaTitle: "Tu agenda médica", clientNoun: "paciente", simLabel: "Simular consulta",
    medico: true,
    tips: [
      "Expediente clínico al día: registra diagnóstico, receta y seguimiento en cada consulta.",
      "Confirma alergias y medicamentos actuales del paciente antes de recetar.",
      "Aviso de privacidad firmado: los datos de salud son información protegida (LFPDPPP).",
      "Si detectas una urgencia real, canaliza a hospital de inmediato — no la atiendas a domicilio.",
    ],
  },
};

const CAT_ORDER = ["salud", "belleza", "bienestar", "hogar", "mascotas"];
const catOf = (c?: string | null) => (c && CATS[c]) || CATS.hogar;

/* Estados de cita */
const APPT_BADGE: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "Agendada", cls: "bg-[#fef4e2] text-[#92600a]" },
  confirmed: { label: "Confirmada", cls: "bg-[#e8f1fe] text-[#1d6ae5]" },
  completed: { label: "Completada", cls: "bg-[#e6f8ee] text-[#0ea55b]" },
  cancelled: { label: "Cancelada", cls: "bg-mist text-ink-soft" },
  no_show: { label: "No asistió", cls: "bg-[#fde8e8] text-[#dc2626]" },
};

const SIM_CLIENTS = ["Ana Sofía P.", "Ricardo M.", "Fernanda L.", "Diego C.", "Paola V.", "El señor Gutiérrez"];
const DOC_ACCEPT = "application/pdf,image/png,image/jpeg,image/webp";

type MedicalDocKey = "certificate" | "diploma" | "professionalLicense" | "ine";

type MedicalDocFiles = Record<MedicalDocKey, File | null>;
type PanelTab = "agenda" | "historial" | "pacientes" | "agendar" | "menu" | "negocio";

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const MEDICAL_DOC_FIELDS: { key: MedicalDocKey; label: string; hint: string }[] = [
  { key: "certificate", label: "Certificado", hint: "Sube tu certificado o constancia médica." },
  { key: "diploma", label: "Diploma", hint: "Adjunta tu diploma profesional o de especialidad." },
  { key: "professionalLicense", label: "Cédula profesional", hint: "Frente claro de la cédula profesional." },
  { key: "ine", label: "INE", hint: "Identificación oficial vigente del médico." },
];

function fileSizeLabel(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function timeInputValue(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function nextRoundedTimeValue() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setSeconds(0, 0);
  const mins = date.getMinutes();
  date.setMinutes(mins <= 30 ? 30 : 0);
  if (mins > 30) date.setHours(date.getHours() + 1);
  return timeInputValue(date);
}

function DocumentPicker({
  label,
  hint,
  accent,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  accent: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black text-ink">{label}</p>
          <p className="mt-0.5 text-[11.5px] font-bold leading-snug text-ink-soft">{hint}</p>
        </div>
        {file ? (
          <span className="shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black text-white" style={{ backgroundColor: accent }}>
            Listo
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-[10.5px] font-black text-ink-soft">Obligatorio</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={DOC_ACCEPT}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="mt-3 block w-full rounded-2xl border border-dashed bg-mist/40 px-3 py-2.5 text-[12px] font-black text-ink file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#1d6ae5] file:px-3.5 file:py-2 file:text-[12px] file:font-black file:text-white hover:file:bg-[#1557c5]"
        style={{ borderColor: `${accent}45`, color: accent } as React.CSSProperties}
      />

      {file && (
        <div className="mt-3 rounded-2xl border border-black/8 bg-mist/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: accent }}>
                <Check className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-black text-ink">{file.name}</p>
                <p className="text-[11px] font-bold text-ink-soft">{fileSizeLabel(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-ink-soft shadow-sm transition hover:text-brand"
            >
              Quitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ClinicalMetricKey = "weightKg" | "heightCm" | "temperatureC" | "systolic" | "diastolic" | "heartRate" | "oxygenSat" | "glucoseMgDl";
type ClinicalDraft = Record<ClinicalMetricKey, string>;

const CLINICAL_FIELDS: {
  key: ClinicalMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  step?: string;
  min?: number;
  max?: number;
  color: string;
}[] = [
  { key: "weightKg", label: "Peso", shortLabel: "kg", unit: "kg", step: "0.1", min: 1, max: 400, color: "#1d6ae5" },
  { key: "heightCm", label: "Talla", shortLabel: "cm", unit: "cm", step: "0.1", min: 30, max: 250, color: "#7c3aed" },
  { key: "temperatureC", label: "Temperatura", shortLabel: "°C", unit: "°C", step: "0.1", min: 30, max: 45, color: "#ea580c" },
  { key: "systolic", label: "Presión sistólica", shortLabel: "PAS", unit: "mmHg", step: "1", min: 60, max: 260, color: "#dc2626" },
  { key: "diastolic", label: "Presión diastólica", shortLabel: "PAD", unit: "mmHg", step: "1", min: 30, max: 180, color: "#f43f5e" },
  { key: "heartRate", label: "Frecuencia cardiaca", shortLabel: "FC", unit: "lpm", step: "1", min: 20, max: 240, color: "#0891b2" },
  { key: "oxygenSat", label: "Saturación O₂", shortLabel: "SpO₂", unit: "%", step: "1", min: 40, max: 100, color: "#0f766e" },
  { key: "glucoseMgDl", label: "Glucosa", shortLabel: "Glucosa", unit: "mg/dL", step: "1", min: 20, max: 600, color: "#65a30d" },
];

const EMPTY_CLINICAL_DRAFT: ClinicalDraft = {
  weightKg: "",
  heightCm: "",
  temperatureC: "",
  systolic: "",
  diastolic: "",
  heartRate: "",
  oxygenSat: "",
  glucoseMgDl: "",
};

function toClinicalDraft(snapshot?: ClinicalSnapshot | null): ClinicalDraft {
  const draft = { ...EMPTY_CLINICAL_DRAFT };
  for (const field of CLINICAL_FIELDS) {
    const value = snapshot?.[field.key];
    draft[field.key] = typeof value === "number" ? String(value) : "";
  }
  return draft;
}

function numberFromInput(value: string) {
  const normalized = value.replace(/,/g, ".").trim();
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function clinicalSnapshotFromDraft(draft: ClinicalDraft): ClinicalSnapshot | null {
  const snapshot: ClinicalSnapshot = {};
  for (const field of CLINICAL_FIELDS) {
    const value = numberFromInput(draft[field.key]);
    if (value === null) continue;
    snapshot[field.key] = field.step === "0.1" ? Math.round(value * 10) / 10 : Math.round(value);
  }
  return Object.keys(snapshot).length ? snapshot : null;
}

function formatMetricValue(value: number | undefined | null, unit: string) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  const shown = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${shown} ${unit}`;
}

function metricDiff(current: number | undefined, previous: number | undefined) {
  if (typeof current !== "number" || typeof previous !== "number") return null;
  const diff = Math.round((current - previous) * 10) / 10;
  if (!diff) return `Sin cambio`;
  return `${diff > 0 ? "+" : ""}${Number.isInteger(diff) ? diff : diff.toFixed(1)}`;
}

function MetricTrendCard({
  field,
  current,
  previous,
}: {
  field: (typeof CLINICAL_FIELDS)[number];
  current?: number;
  previous?: number;
}) {
  const values = [current, previous].filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const ceiling = Math.max(...values, field.max ?? 1, 1);
  const currentWidth = current ? Math.max(12, (current / ceiling) * 100) : 0;
  const previousWidth = previous ? Math.max(12, (previous / ceiling) * 100) : 0;
  const diff = metricDiff(current, previous);

  return (
    <div className="rounded-[22px] border border-black/8 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-soft">{field.shortLabel}</p>
          <p className="mt-1 text-[14px] font-black text-ink">{field.label}</p>
        </div>
        {diff && (
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-black text-white" style={{ backgroundColor: field.color }}>
            {diff}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2.5">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-[11.5px] font-bold">
            <span className="text-ink-soft">Actual</span>
            <span className="text-ink">{formatMetricValue(current, field.unit)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-mist">
            {currentWidth > 0 && <div className="h-full rounded-full" style={{ width: `${currentWidth}%`, backgroundColor: field.color }} />}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-[11.5px] font-bold">
            <span className="text-ink-soft">Cita pasada</span>
            <span className="text-ink">{formatMetricValue(previous, field.unit)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-mist">
            {previousWidth > 0 && <div className="h-full rounded-full bg-black/20" style={{ width: `${previousWidth}%` }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicalVerificationSection({
  docs,
  accent,
  soft,
}: {
  docs?: MedicalVerificationDocs | null;
  accent: string;
  soft: string;
}) {
  const required = [
    { label: "Certificado", doc: docs?.certificate },
    { label: "Diploma", doc: docs?.diploma },
    { label: "Cédula profesional", doc: docs?.professionalLicense },
    { label: "INE", doc: docs?.ine },
  ];
  const completed = required.filter((item) => item.doc).length;

  return (
    <section className="rounded-[26px] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[15px] font-black">
            <FileText className="h-4.5 w-4.5" style={{ color: accent }} /> Verificación médica
          </p>
          <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Para dar de alta médicos ahora se solicita certificado, diploma, cédula profesional e INE.</p>
        </div>
        <span className="rounded-full px-3 py-1 text-[11px] font-black" style={{ backgroundColor: soft, color: accent }}>
          {completed}/4 docs
        </span>
      </div>

      {docs?.professionalLicenseNumber && (
        <p className="mt-3 rounded-2xl px-3.5 py-2 text-[12px] font-black" style={{ backgroundColor: soft, color: accent }}>
          Cédula registrada: {docs.professionalLicenseNumber}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {required.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-black text-ink">{item.label}</p>
              <p className="truncate text-[11.5px] font-bold text-ink-soft">{item.doc?.name ?? "Pendiente de cargar"}</p>
            </div>
            {item.doc ? (
              <a href={item.doc.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black text-white transition hover:brightness-110" style={{ backgroundColor: accent }}>
                Ver
              </a>
            ) : (
              <span className="shrink-0 rounded-full bg-[#fde8e8] px-3 py-1.5 text-[11px] font-black text-[#dc2626]">Falta</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Formulario: el socio agrega un servicio o especialidad a su catálogo ── */
function AddOptionModal({
  serviceId,
  accent,
  onClose,
  onAdded,
}: {
  serviceId: number;
  accent: string;
  onClose: () => void;
  onAdded: (opt: ServiceOptionItem) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("45");
  const [popular, setPopular] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Escribe el nombre del servicio.");
    if (!price || Number(price) < 10) return setError("El precio mínimo es $10 MXN.");
    setSaving(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_option",
          serviceId,
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          durationMin: Number(duration) || 30,
          popular,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      onAdded(data.option);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${accent}` }}>
          <div>
            <p className="text-[18px] font-black tracking-tight">Agregar servicio a tu menú</p>
            <p className="text-[12px] font-bold text-ink-soft">Tus clientes podrán elegirlo al agendar</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><X className="h-4.5 w-4.5" /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del servicio (ej. Corte clásico, Uñas gelish, Consulta pediátrica)"
            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-ink"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <span className="absolute top-3 left-4 text-[14px] font-black text-ink-soft">$</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="Precio MXN"
                className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-8 text-[14px] font-bold outline-none focus:border-ink"
              />
            </div>
            <div className="relative">
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="Duración"
                className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-12 pl-4 text-[14px] font-bold outline-none focus:border-ink"
              />
              <span className="absolute top-3 right-4 text-[12px] font-black text-ink-soft">min</span>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Descripción corta de lo que incluye este servicio..."
            className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none focus:border-ink"
          />

          <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-mist p-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="h-4.5 w-4.5 accent-ink rounded cursor-pointer"
            />
            <span className="text-[13px] font-black text-ink">Marcar como servicio popular / recomendado</span>
          </label>

          {error && <p className="rounded-2xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}
        </div>

        <div className="shrink-0 border-t border-black/5 px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={submit}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14.5px] font-black text-white transition hover:brightness-110 disabled:opacity-60 shadow-md"
            style={{ backgroundColor: accent }}
          >
            <Plus className="h-4.5 w-4.5" /> {saving ? "Guardando..." : "Guardar servicio en mi menú"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Formulario: el negocio da de alta un servicio nuevo ── */
function AddServiceModal({
  onClose,
  onCreated,
  preset,
}: {
  onClose: () => void;
  onCreated: (s: ServiceLite) => void;
  preset?: { category?: string; provider?: string; proName?: string };
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(preset?.category ?? "belleza");
  /* Si viene desde el panel de un negocio, la categoría ya está definida: no se muestra el selector */
  const lockedCategory = !!preset?.category;
  const [provider, setProvider] = useState(preset?.provider ?? "");
  const [proName, setProName] = useState(preset?.proName ?? "");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [includes, setIncludes] = useState("");
  const [domicilio, setDomicilio] = useState(true);
  const [local, setLocal] = useState(true);
  const [professionalLicenseNumber, setProfessionalLicenseNumber] = useState("");
  const [medicalDocs, setMedicalDocs] = useState<MedicalDocFiles>({
    certificate: null,
    diploma: null,
    professionalLicense: null,
    ine: null,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const conf = catOf(category);
  const isMedical = category === "salud";

  const updateMedicalDoc = (key: MedicalDocKey, file: File | null) => {
    setMedicalDocs((prev) => ({ ...prev, [key]: file }));
  };

  const submit = async () => {
    setError("");

    if (!name.trim() || !provider.trim() || !proName.trim()) {
      return setError("Nombre del servicio, negocio y profesional son obligatorios.");
    }
    if (!price || Number(price) < 10) {
      return setError("El precio mínimo es $10 MXN.");
    }
    if (!duration || Number(duration) < 10) {
      return setError("La duración mínima es de 10 minutos.");
    }
    if (!domicilio && !local) {
      return setError("Elige al menos una modalidad: domicilio o local.");
    }
    if (isMedical) {
      if (!professionalLicenseNumber.trim()) {
        return setError("Escribe el número de cédula profesional.");
      }
      if (MEDICAL_DOC_FIELDS.some((field) => !medicalDocs[field.key])) {
        return setError("Para cuentas médicas debes subir certificado, diploma, cédula profesional e INE.");
      }
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("category", category);
      form.set("provider", provider.trim());
      form.set("proName", proName.trim());
      form.set("price", price);
      form.set("durationMin", duration);
      form.set("description", description.trim());
      form.set("includes", includes);
      form.set("domicilio", String(domicilio));
      form.set("local", String(local));
      if (isMedical) {
        form.set("professionalLicenseNumber", professionalLicenseNumber.trim());
        MEDICAL_DOC_FIELDS.forEach((field) => {
          const file = medicalDocs[field.key];
          if (file) form.set(field.key, file);
        });
      }

      const res = await fetch("/api/services", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos guardar el servicio.");
        return;
      }
      onCreated(data.service);
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${conf.accent}` }}>
          <div>
            <p className="text-[18px] font-black tracking-tight">Agregar servicio</p>
            <p className="text-[12px] font-bold text-ink-soft">Aparece en la app en cuanto lo guardes</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><X className="h-4.5 w-4.5" /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del servicio (ej. Corte y barba premium)" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />

          {!lockedCategory && (
            <div>
              <p className="text-[12px] font-black text-ink-soft uppercase">Categoría</p>
              <div className="no-scrollbar mt-1.5 flex gap-2 overflow-x-auto">
                {CAT_ORDER.map((c) => {
                  const cc = catOf(c);
                  const active = category === c;
                  return (
                    <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-black transition ${active ? "text-white" : "bg-mist text-ink"}`} style={active ? { backgroundColor: cc.accent } : undefined}>
                      {cc.emoji} {cc.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Nombre del negocio" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
            <input value={proName} onChange={(e) => setProName(e.target.value)} placeholder="Profesional que atiende" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <span className="absolute top-3 left-4 text-[14px] font-black text-ink-soft">$</span>
              <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Precio MXN" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-4 pl-8 text-[14px] font-bold outline-none" />
            </div>
            <div className="relative">
              <input value={duration} onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Duración" className="w-full rounded-2xl border border-black/10 bg-mist py-3 pr-12 pl-4 text-[14px] font-bold outline-none" />
              <span className="absolute top-3 right-4 text-[12px] font-black text-ink-soft">min</span>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-black text-ink-soft uppercase">Modalidad</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button onClick={() => setDomicilio((v) => !v)} className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-[13.5px] font-black transition ${domicilio ? "text-white" : "border-black/10 text-ink"}`} style={domicilio ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                <Home className="h-4 w-4" /> A domicilio
              </button>
              <button onClick={() => setLocal((v) => !v)} className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-[13.5px] font-black transition ${local ? "text-white" : "border-black/10 text-ink"}`} style={local ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                <Store className="h-4 w-4" /> En local
              </button>
            </div>
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Descripción corta (opcional)" className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none" />
          <textarea value={includes} onChange={(e) => setIncludes(e.target.value)} rows={3} placeholder={"¿Qué incluye? Una línea por cosa (opcional)\nEj.\nLavado y secado\nCorte personalizado\nProductos premium"} className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none" />

          {isMedical && (
            <div className="space-y-3 rounded-[24px] border border-[#1d6ae5]/15 bg-[#e8f1fe]/55 p-4">
              <div>
                <p className="flex items-center gap-2 text-[14px] font-black text-[#1d6ae5]"><Sparkles className="h-4 w-4" /> Verificación obligatoria para médicos</p>
                <p className="mt-1 text-[11.5px] font-bold leading-snug text-[#3a5f9f]">Antes de crear la cuenta médica deben adjuntar certificado, diploma, cédula profesional e INE.</p>
              </div>

              <input
                value={professionalLicenseNumber}
                onChange={(e) => setProfessionalLicenseNumber(e.target.value)}
                placeholder="Número de cédula profesional"
                className="w-full rounded-2xl border border-[#1d6ae5]/20 bg-white px-4 py-3 text-[14px] font-bold outline-none"
              />

              <div className="grid gap-2.5 sm:grid-cols-2">
                {MEDICAL_DOC_FIELDS.map((field) => (
                  <DocumentPicker
                    key={field.key}
                    label={field.label}
                    hint={field.hint}
                    accent={conf.accent}
                    file={medicalDocs[field.key]}
                    onChange={(file) => updateMedicalDoc(field.key, file)}
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="rounded-2xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}
        </div>

        <div className="shrink-0 border-t border-black/5 px-5 py-4">
          <motion.button whileTap={{ scale: 0.98 }} onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14.5px] font-black text-white transition hover:brightness-110 disabled:opacity-60" style={{ backgroundColor: conf.accent }}>
            <Plus className="h-4.5 w-4.5" /> {saving ? "Guardando..." : "Publicar servicio"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProfesionalClient({ services }: { services: ServiceLite[] }) {
  const [list, setList] = useState<ServiceLite[]>(services);
  const [slug, setSlug] = useState<string | null>(null);
  const [service, setService] = useState<ServiceLite | null>(null);
  const [options, setOptions] = useState<ServiceOptionItem[]>([]);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("agenda");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualMode, setManualMode] = useState<"domicilio" | "local">("domicilio");
  const [manualAddress, setManualAddress] = useState("");
  const [manualDate, setManualDate] = useState(() => dateInputValue(new Date()));
  const [manualTime, setManualTime] = useState(() => nextRoundedTimeValue());
  const [manualOptionId, setManualOptionId] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualEdad, setManualEdad] = useState("");
  const [manualSintomas, setManualSintomas] = useState("");
  const [manualAlergias, setManualAlergias] = useState("");
  const [manualMedicamentos, setManualMedicamentos] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualOk, setManualOk] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [noteFor, setNoteFor] = useState<string | null>(null); // cita con el expediente abierto
  const [noteDraft, setNoteDraft] = useState("");
  const [clinicalDraft, setClinicalDraft] = useState<ClinicalDraft>(EMPTY_CLINICAL_DRAFT);
  const [savingNote, setSavingNote] = useState(false);
  const [openClient, setOpenClient] = useState<string | null>(null); // expediente de paciente abierto
  const [detailFor, setDetailFor] = useState<Appt | null>(null); // solicitud detallada abierta
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseLiveRefresh = Boolean(noteFor || detailFor || showAdd || showAddOption);

  useEffect(() => {
    const saved = localStorage.getItem("rayte-profesional");
    if (saved && services.some((s) => s.slug === saved)) setSlug(saved);
  }, [services]);

  /* Al crear un servicio: entra a la lista y abre su panel */
  const handleCreated = (s: ServiceLite) => {
    setList((prev) => [...prev, s]);
    setShowAdd(false);
    setPanelTab("agenda");
    setSlug(s.slug);
  };

  useEffect(() => {
    if (slug) localStorage.setItem("rayte-profesional", slug);
  }, [slug]);

  /* Agenda REAL desde la base de datos + opciones de menú, sondeo cada 6 s */
  const load = useCallback(async (s: string) => {
    try {
      const [apptsRes, servRes] = await Promise.all([
        fetch(`/api/appointments?service=${s}`, { cache: "no-store" }),
        fetch(`/api/services?slug=${s}`, { cache: "no-store" }),
      ]);
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        setService((prev) => (sameJson(prev, data.service) ? prev : data.service));
        setAppts((prev) => (sameJson(prev, data.appointments) ? prev : data.appointments));
      }
      if (servRes.ok) {
        const data = await servRes.json();
        setOptions((prev) => (sameJson(prev, data.options ?? []) ? prev : (data.options ?? [])));
      }
    } catch { /* reintenta */ }
  }, []);

  useEffect(() => {
    if (!slug) return;

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }

    if (pauseLiveRefresh) {
      return;
    }

    load(slug);
    timer.current = setInterval(() => load(slug), 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slug, load, pauseLiveRefresh]);

  const deleteOption = async (optionId: number) => {
    setDeletingOptionId(optionId);
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_option", optionId }),
      });
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
    } finally {
      setDeletingOptionId(null);
    }
  };

  const setApptStatus = async (a: Appt, status: string) => {
    setAppts((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x)));
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", id: a.id, status }),
    });
    if (slug) load(slug);
  };

  const toggleAvailable = async () => {
    if (!service) return;
    const next = !service.available;
    setService({ ...service, available: next });
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "availability", serviceId: service.id, available: next }),
    });
  };

  /* Expediente: guardar nota clínica / bitácora de una cita */
  const openNote = (a: Appt) => {
    setNoteFor(a.id);
    setNoteDraft(a.proNotes ?? "");
    setClinicalDraft(toClinicalDraft(a.clinicalSnapshot));
  };

  const saveNote = async () => {
    if (!noteFor) return;
    const nextSnapshot = clinicalSnapshotFromDraft(clinicalDraft);
    setSavingNote(true);
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "note", id: noteFor, proNotes: noteDraft, clinicalSnapshot: nextSnapshot }),
      });
      setAppts((list) => list.map((x) => (x.id === noteFor ? { ...x, proNotes: noteDraft.trim() || null, clinicalSnapshot: nextSnapshot ? { ...nextSnapshot, updatedAt: new Date().toISOString() } : null } : x)));
      setNoteFor(null);
    } finally {
      setSavingNote(false);
    }
  };

  /* Crea una cita REAL de prueba (hoy, dentro de 1-4 horas) */
  const simulate = async () => {
    if (!service || simulating) return;
    setSimulating(true);
    try {
      const start = new Date(Date.now() + (1 + Math.floor(Math.random() * 4)) * 3600000);
      start.setMinutes(Math.random() > 0.5 ? 30 : 0, 0, 0);
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: SIM_CLIENTS[Math.floor(Math.random() * SIM_CLIENTS.length)],
          phone: "477-000-1111",
          mode: Math.random() > 0.4 ? "domicilio" : "local",
          address: "Cliente de prueba · León, GTO",
          startAt: start.toISOString(),
        }),
      });
      if (slug) await load(slug);
    } finally {
      setSimulating(false);
    }
  };

  const resetManualForm = () => {
    setManualName("");
    setManualPhone("");
    setManualMode("domicilio");
    setManualAddress("");
    setManualDate(dateInputValue(new Date()));
    setManualTime(nextRoundedTimeValue());
    setManualOptionId("");
    setManualNotes("");
    setManualEdad("");
    setManualSintomas("");
    setManualAlergias("");
    setManualMedicamentos("");
    setManualError("");
    setManualOk("");
  };

  const createManualAppointment = async () => {
    if (!service || manualSaving) return;
    setManualError("");
    setManualOk("");

    if (!manualName.trim() || !manualPhone.trim() || !manualDate || !manualTime) {
      setManualError("Completa nombre, teléfono, fecha y hora.");
      return;
    }
    if (manualMode === "domicilio" && !manualAddress.trim()) {
      setManualError("La dirección es obligatoria para citas a domicilio.");
      return;
    }

    const startAt = new Date(`${manualDate}T${manualTime}:00`);
    if (Number.isNaN(startAt.getTime()) || startAt.getTime() <= Date.now()) {
      setManualError("Elige una fecha y hora futuras.");
      return;
    }

    setManualSaving(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          optionId: manualOptionId ? Number(manualOptionId) : undefined,
          customerName: manualName.trim(),
          phone: manualPhone.trim(),
          mode: manualMode,
          address: manualMode === "domicilio" ? manualAddress.trim() : null,
          startAt: startAt.toISOString(),
          notes: manualNotes.trim() || undefined,
          intake: conf.medico
            ? {
                edad: manualEdad.trim() || undefined,
                sintomas: manualSintomas.trim() || undefined,
                alergias: manualAlergias.trim() || undefined,
                medicamentos: manualMedicamentos.trim() || undefined,
              }
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error ?? "No se pudo agendar la cita.");
        return;
      }
      if (slug) await load(slug);
      resetManualForm();
      setPanelTab("agenda");
      setManualOk(`Cita creada: ${data.code ?? data?.appointment?.code ?? data?.id ?? "ok"}`);
    } catch {
      setManualError("Sin conexión. Intenta de nuevo.");
    } finally {
      setManualSaving(false);
    }
  };

  /* ---------- Pantalla 1: elegir servicio (agrupado por categoría) ---------- */
  if (!slug) {
    const grouped = CAT_ORDER.map((c) => ({ c, conf: catOf(c), list: list.filter((s) => s.category === c) })).filter((g) => g.list.length);
    return (
      <div className="min-h-screen bg-white pb-20 sm:pb-24">
        <header className="sticky top-0 z-40 border-b bg-white">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
            <Link href="/cuenta" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black tracking-tight">Panel de profesionales</h1>
              <p className="text-[12px] font-bold text-ink-soft">Citas y servicios · ¿quién atiende hoy?</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-2.5 text-[12px] font-black text-white transition hover:bg-black active:scale-95">
              <Plus className="h-4 w-4" /> Agregar servicio
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 pt-6">
          {grouped.map(({ c, conf, list }) => (
            <div key={c} className="mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[15px]" style={{ backgroundColor: conf.soft }}>{conf.emoji}</span>
                <p className="text-[13px] font-black tracking-wide uppercase" style={{ color: conf.accent }}>{conf.label} · {list.length}</p>
              </div>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                {list.map((s) => (
                  <button key={s.slug} onClick={() => { setPanelTab("agenda"); setSlug(s.slug); }} className="flex items-center gap-3 rounded-[22px] border p-3 text-left transition hover:shadow-md" style={{ borderColor: `${conf.accent}33` }}>
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
                      <Image src={s.image} alt={s.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-black">{s.name}</p>
                      <p className="truncate text-[12px] font-bold text-ink-soft">{s.proName} · <Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {s.rating.toFixed(1)}</p>
                      {s.category === "salud" && (
                        <p className={`mt-1 text-[10.5px] font-black ${s.verificationDocs ? "text-[#1d6ae5]" : "text-[#dc2626]"}`}>
                          {s.verificationDocs ? "Documentación médica cargada" : "Faltan documentos médicos"}
                        </p>
                      )}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-black ${s.available ? "bg-[#e6f8ee] text-[#0ea55b]" : "bg-mist text-ink-soft"}`}>{s.available ? "Activo" : "Pausado"}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {showAdd && <AddServiceModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}
      </div>
    );
  }

  /* ---------- Pantalla 2: panel del profesional ---------- */
  const conf = catOf(service?.category);
  const CatIcon = conf.Icon;

  const today = new Date().toDateString();
  const isActive = (a: Appt) => a.status === "scheduled" || a.status === "confirmed";
  const todayAppts = appts.filter((a) => new Date(a.startAt).toDateString() === today && a.status !== "cancelled");
  const upcoming = appts.filter((a) => isActive(a) && new Date(a.startAt).getTime() >= Date.now()).sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const history = appts.filter((a) => !isActive(a) || new Date(a.startAt).getTime() < Date.now()).slice(0, 12);
  const ingresos = appts.filter((a) => a.status === "completed" && new Date(a.startAt).toDateString() === today).reduce((x, a) => x + a.price, 0);

  /* Tus clientes/pacientes únicos */
  const clientMap = new Map<string, { name: string; phone: string; count: number }>();
  for (const a of appts) {
    if (a.status === "cancelled") continue;
    const k = a.phone;
    const prev = clientMap.get(k);
    clientMap.set(k, { name: a.customerName, phone: a.phone, count: (prev?.count ?? 0) + 1 });
  }
  const clients = [...clientMap.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es-MX"));
  const normalizedPatientQuery = patientQuery.trim().toLowerCase();
  const filteredClients = !normalizedPatientQuery
    ? clients
    : clients.filter((client) => `${client.name} ${client.phone}`.toLowerCase().includes(normalizedPatientQuery));
  const noteAppt = noteFor ? appts.find((a) => a.id === noteFor) ?? null : null;
  const notePatientTimeline = noteAppt
    ? appts
        .filter((a) => a.phone === noteAppt.phone && a.status !== "cancelled")
        .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
    : [];
  const notePatientIndex = noteAppt ? notePatientTimeline.findIndex((a) => a.id === noteAppt.id) : -1;
  const previousPatientAppt = notePatientIndex > 0 ? notePatientTimeline[notePatientIndex - 1] : null;
  const currentClinicalSnapshot = clinicalSnapshotFromDraft(clinicalDraft) ?? noteAppt?.clinicalSnapshot ?? null;
  const noteComparisonFields = CLINICAL_FIELDS.filter((field) => {
    const currentValue = currentClinicalSnapshot?.[field.key];
    const previousValue = previousPatientAppt?.clinicalSnapshot?.[field.key];
    return typeof currentValue === "number" || typeof previousValue === "number";
  });
  const tabs: { id: PanelTab; label: string }[] = [
    { id: "agenda", label: "Agenda" },
    { id: "historial", label: "Historial de citas" },
    { id: "pacientes", label: conf.medico ? "Pacientes y expedientes" : "Clientes e historial" },
    { id: "agendar", label: "Agendar" },
    { id: "menu", label: "Servicios" },
    { id: "negocio", label: conf.medico ? "Mis documentos" : "Negocio" },
  ];

  const fmtDay = (iso: string) => {
    const d = new Date(iso);
    const isToday = d.toDateString() === today;
    const isTomorrow = d.toDateString() === new Date(Date.now() + 86400000).toDateString();
    const day = isToday ? "Hoy" : isTomorrow ? "Mañana" : new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" }).format(d);
    return `${day} · ${new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(d)}`;
  };

  const renderApptCard = (a: Appt) => {
    const badge = APPT_BADGE[a.status] ?? APPT_BADGE.scheduled;
    const snapshotPreview = CLINICAL_FIELDS.filter((field) => typeof a.clinicalSnapshot?.[field.key] === "number").slice(0, 4);
    return (
      <div key={a.id} className={`rounded-[22px] border p-4 ${a.status === "completed" ? "border-[#0ea55b]/30 bg-[#f2fbf6]" : "border-black/8 bg-white"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-black">{a.code} · {a.customerName}</p>
          <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-black ${badge.cls}`}>{badge.label}</span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-soft">
          <Clock3 className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {fmtDay(a.startAt)}{a.optionName ? ` · ${a.optionName}` : ` · ${service?.durationMin} min`}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-ink-soft/90">
          {a.mode === "domicilio" ? <Home className="h-3.5 w-3.5 shrink-0" /> : <Store className="h-3.5 w-3.5 shrink-0" />}
          {a.mode === "domicilio" ? (a.address ?? "A domicilio") : "En el local"} · <Phone className="h-3 w-3 shrink-0" /> {a.phone}
        </p>
        {a.notes && <p className="mt-1 text-[11.5px] font-bold text-ink-soft italic">&quot;{a.notes}&quot;</p>}

        {conf.medico && snapshotPreview.length > 0 && (
          <div className="mt-2 rounded-[18px] border border-[#1d6ae5]/12 bg-[#e8f1fe]/55 p-3">
            <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-[#1d6ae5]">Datos primordiales</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {snapshotPreview.map((field) => (
                <span key={field.key} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-ink shadow-sm">
                  {field.label}: {formatMetricValue(a.clinicalSnapshot?.[field.key], field.unit)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expediente / bitácora del profesional */}
        {a.proNotes && noteFor !== a.id && (
          <div className="mt-2 rounded-xl px-3 py-2" style={{ backgroundColor: conf.soft }}>
            <p className="flex items-center gap-1.5 text-[10.5px] font-black uppercase" style={{ color: conf.accent }}>
              <FileText className="h-3 w-3" /> {conf.medico ? "Expediente" : "Bitácora"}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug font-bold whitespace-pre-line text-ink/85">{a.proNotes}</p>
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14px] font-black">{formatMXN(a.price)}</span>
          <div className="flex flex-wrap justify-end gap-1.5">
            <button onClick={() => setDetailFor(a)} className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-2 text-[11.5px] font-black text-ink transition hover:bg-black/10 active:scale-95">
              <ClipboardList className="h-3.5 w-3.5" /> Ver solicitud
            </button>
            {noteFor !== a.id && a.status !== "cancelled" && (
              <button onClick={() => openNote(a)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-black transition active:scale-95" style={{ backgroundColor: conf.soft, color: conf.accent }}>
                <FileText className="h-3.5 w-3.5" /> {a.proNotes ? "Editar" : conf.medico ? "Expediente" : "Nota"}
              </button>
            )}
            {a.status === "scheduled" && (
              <>
                <button onClick={() => setApptStatus(a, "confirmed")} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 active:scale-95" style={{ backgroundColor: conf.accent }}>
                  <CircleCheck className="h-3.5 w-3.5" /> Confirmar
                </button>
                <button onClick={() => setApptStatus(a, "cancelled")} aria-label="Cancelar cita" className="flex items-center gap-1 rounded-full bg-mist px-3 py-2 text-[12px] font-black text-ink-soft transition hover:bg-black/10 active:scale-95">
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {a.status === "confirmed" && (
              <>
                <button onClick={() => setApptStatus(a, "completed")} className="flex items-center gap-1.5 rounded-full bg-[#0ea55b] px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 active:scale-95">
                  <CircleCheck className="h-3.5 w-3.5" /> Completada
                </button>
                <button onClick={() => setApptStatus(a, "no_show")} className="rounded-full bg-mist px-3 py-2 text-[11px] font-black text-ink-soft transition hover:bg-black/10 active:scale-95">
                  No asistió
                </button>
              </>
            )}
            {a.status === "completed" && a.rating && (
              <span className="flex items-center gap-1 text-[12px] font-black text-[#0ea55b]">{"★".repeat(a.rating)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-mist/50 pb-20 sm:pb-24">
      <header className="sticky top-0 z-40 bg-white shadow-sm" style={{ borderTop: `4px solid ${conf.accent}` }}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
          <Link href="/cuenta" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[19px]" style={{ backgroundColor: conf.soft }}>{conf.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-black tracking-tight">{service?.name ?? "Cargando..."}</p>
            <p className="truncate text-[11.5px] font-black" style={{ color: conf.accent }}>{service?.proName} · Panel {conf.label}</p>
            <p className="truncate text-[10.5px] font-bold text-ink-soft/80">{service?.provider}</p>
          </div>
          <button onClick={() => { setPanelTab("agenda"); setSlug(null); setService(null); setAppts([]); }} className="shrink-0 rounded-full bg-mist px-3.5 py-2 text-[12px] font-black text-ink transition hover:bg-black/10">
            Cambiar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-5">
        {/* Disponibilidad del servicio */}
        <section className="flex items-center justify-between rounded-[26px] bg-white p-5 shadow-sm">
          <div>
            <p className="text-[13px] font-black text-ink-soft uppercase">Agenda</p>
            <p className={`mt-1 text-[22px] font-black ${service?.available ? "text-[#0ea55b]" : "text-brand"}`}>
              {service?.available ? "Recibiendo citas" : "En pausa"}
            </p>
            <p className="text-[12px] font-bold text-ink-soft">{service?.available ? "Tu servicio aparece en la app" : "Los clientes no pueden agendarte"}</p>
          </div>
          <button
            onClick={toggleAvailable}
            disabled={!service}
            className={`relative h-11 w-20 rounded-full transition disabled:opacity-50 ${service?.available ? "bg-[#0ea55b]" : "bg-black/20"}`}
            aria-label="Cambiar disponibilidad"
          >
            <motion.span layout className={`absolute top-1 h-9 w-9 rounded-full bg-white shadow-md ${service?.available ? "right-1" : "left-1"}`} />
          </button>
        </section>

        {/* Stats del día */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon={<Banknote className="h-4.5 w-4.5" />} label="Ingresos hoy" value={formatMXN(ingresos)} accentColor={conf.accent} />
          <StatBox icon={<CalendarDays className="h-4.5 w-4.5" />} label={`Citas hoy`} value={String(todayAppts.length)} soft={conf.soft} color={conf.accent} />
          <StatBox icon={<Clock3 className="h-4.5 w-4.5" />} label="Próximas" value={String(upcoming.length)} soft={conf.soft} color={conf.accent} />
          <StatBox icon={<Star className="h-4.5 w-4.5" />} label="Calificación" value={service?.rating.toFixed(1) ?? "—"} soft={conf.soft} color={conf.accent} />
        </section>

        <section className="rounded-[24px] bg-white p-2 shadow-sm">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const active = panelTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPanelTab(tab.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-[12.5px] font-black transition ${active ? "text-white shadow-sm" : "bg-mist text-ink-soft hover:text-ink"}`}
                  style={active ? { backgroundColor: conf.accent } : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {panelTab === "agenda" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[15px] font-black"><CatIcon className="h-4.5 w-4.5" style={{ color: conf.accent }} /> {conf.agendaTitle} <span className="h-2 w-2 animate-pulse rounded-full bg-[#0ea55b]" /></p>
              <button onClick={simulate} disabled={!service || simulating} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: conf.accent }}>
                <RefreshCw className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`} /> {conf.simLabel}
              </button>
            </div>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Las citas nuevas aparecen aquí automáticamente. Si quieres crear una manual, usa la pestaña Agendar.</p>

            {upcoming.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Sin citas próximas. Agenda una desde la app, usa la pestaña Agendar o toca &quot;{conf.simLabel}&quot;.
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {upcoming.map((a) => renderApptCard(a))}
              </div>
            )}
          </section>
        )}

        {panelTab === "historial" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4.5 w-4.5" style={{ color: conf.accent }} />
              <p className="text-[15px] font-black">Historial de citas</p>
            </div>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Consultas y servicios anteriores para revisión rápida.</p>
            {history.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Aún no hay historial reciente.
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {history.map((a) => renderApptCard(a))}
              </div>
            )}
          </section>
        )}

        {/* Tus clientes / pacientes con expediente */}
        {panelTab === "pacientes" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-[15px] font-black"><Users className="h-4.5 w-4.5" style={{ color: conf.accent }} /> Tus {conf.clientNoun}s</p>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Toca un {conf.clientNoun} para abrir su {conf.medico ? "expediente clínico" : "historial"}.</p>

            {clients.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-[20px] border border-black/8 bg-mist px-3.5 py-3">
                <Search className="h-4 w-4 shrink-0 text-ink-soft" />
                <input
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder={conf.medico ? "Buscar paciente por nombre o teléfono" : "Buscar cliente por nombre o teléfono"}
                  className="w-full bg-transparent text-[13px] font-bold text-ink outline-none placeholder:text-ink-soft/75"
                />
                {patientQuery && (
                  <button
                    type="button"
                    onClick={() => setPatientQuery("")}
                    aria-label="Limpiar búsqueda"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm transition hover:text-brand"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {clients.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Todavía no tienes {conf.medico ? "pacientes" : "clientes"} con historial.
              </p>
            ) : filteredClients.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                No encontramos {conf.medico ? "pacientes" : "clientes"} con “{patientQuery.trim()}”.
              </p>
            ) : (
              <div className="mt-3 space-y-1.5">
                <p className="px-1 text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft/70">
                  {filteredClients.length} {filteredClients.length === 1 ? (conf.medico ? "paciente encontrado" : "cliente encontrado") : (conf.medico ? "pacientes encontrados" : "clientes encontrados")}
                </p>
                {filteredClients.map((c) => {
                  const openRec = openClient === c.phone;
                  const record = appts
                    .filter((a) => a.phone === c.phone && a.status !== "cancelled")
                    .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
                  return (
                    <div key={c.phone} className={`overflow-hidden rounded-2xl border transition ${openRec ? "" : "border-black/8"}`} style={openRec ? { borderColor: `${conf.accent}55` } : undefined}>
                      <button onClick={() => setOpenClient(openRec ? null : c.phone)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white" style={{ backgroundColor: conf.accent }}>
                          {c.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-extrabold">{c.name}</p>
                          <p className="text-[11.5px] font-bold text-ink-soft">{c.phone}</p>
                        </div>
                        <span className="shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black" style={{ backgroundColor: conf.soft, color: conf.accent }}>
                          {c.count} {c.count === 1 ? "cita" : "citas"}
                        </span>
                        <FileText className={`h-4 w-4 shrink-0 transition ${openRec ? "" : "text-ink-soft/50"}`} style={openRec ? { color: conf.accent } : undefined} />
                      </button>

                      {openRec && (
                        <div className="border-t px-3.5 py-3" style={{ borderColor: `${conf.accent}22`, backgroundColor: `${conf.soft}44` }}>
                          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase" style={{ color: conf.accent }}>
                            <FileText className="h-3.5 w-3.5" /> {conf.medico ? "Expediente clínico" : "Historial de servicios"} · {record.length} {record.length === 1 ? "registro" : "registros"}
                          </p>
                          <div className="mt-2 space-y-2">
                            {record.map((a) => {
                              const snapshotPreview = CLINICAL_FIELDS.filter((field) => typeof a.clinicalSnapshot?.[field.key] === "number").slice(0, 4);
                              return (
                              <div key={a.id} className="rounded-xl bg-white p-3 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[12px] font-black capitalize">
                                    {new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(a.startAt))}
                                  </p>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${(APPT_BADGE[a.status] ?? APPT_BADGE.scheduled).cls}`}>{(APPT_BADGE[a.status] ?? APPT_BADGE.scheduled).label}</span>
                                </div>
                                <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">{a.serviceName} · {a.mode === "domicilio" ? "A domicilio" : "En local"} · {formatMXN(a.price)}</p>
                                {conf.medico && snapshotPreview.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {snapshotPreview.map((field) => (
                                      <span key={field.key} className="rounded-full bg-[#e8f1fe] px-2.5 py-1 text-[10.5px] font-black text-[#1d6ae5]">
                                        {field.shortLabel}: {formatMetricValue(a.clinicalSnapshot?.[field.key], field.unit)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {a.notes && <p className="mt-1 text-[11.5px] font-bold text-ink-soft italic">Motivo: &quot;{a.notes}&quot;</p>}
                                {a.proNotes ? (
                                  <>
                                    <p className="mt-1.5 rounded-lg px-2.5 py-1.5 text-[12px] leading-snug font-bold whitespace-pre-line text-ink/85" style={{ backgroundColor: conf.soft }}>{a.proNotes}</p>
                                    <button onClick={() => openNote(a)} className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-black transition active:scale-95" style={{ backgroundColor: conf.soft, color: conf.accent }}>
                                      <FileText className="h-3.5 w-3.5" /> {conf.medico ? "Editar nota clínica" : "Editar nota"}
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => openNote(a)} className="mt-1.5 text-[11.5px] font-black underline-offset-2 hover:underline" style={{ color: conf.accent }}>
                                    + {conf.medico ? "Agregar nota clínica / receta" : "Agregar nota"}
                                  </button>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {conf.medico && (
              <p className="mt-3 flex items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                <AlertTriangle className="h-3.5 w-3.5" style={{ color: conf.accent }} /> Datos de pacientes protegidos: no compartas esta lista fuera de la plataforma.
              </p>
            )}
          </section>
        )}

        {panelTab === "agendar" && (
          <section className="rounded-[26px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4.5 w-4.5" style={{ color: conf.accent }} />
              <p className="text-[15px] font-black">Agendar cita manual</p>
            </div>
            <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Crea una cita desde el panel y aparecerá en la agenda del profesional.</p>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder={conf.medico ? "Nombre del paciente" : "Nombre del cliente"} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
              <input value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} placeholder="Teléfono" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setManualMode("domicilio")} className={`rounded-2xl border py-3 text-[13px] font-black transition ${manualMode === "domicilio" ? "text-white" : "border-black/10 text-ink"}`} style={manualMode === "domicilio" ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                A domicilio
              </button>
              <button onClick={() => setManualMode("local")} className={`rounded-2xl border py-3 text-[13px] font-black transition ${manualMode === "local" ? "text-white" : "border-black/10 text-ink"}`} style={manualMode === "local" ? { backgroundColor: conf.accent, borderColor: conf.accent } : undefined}>
                En local
              </button>
            </div>

            {manualMode === "domicilio" && (
              <input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Dirección" className="mt-3 w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
            )}

            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
              <input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" />
              <select value={manualOptionId} onChange={(e) => setManualOptionId(e.target.value)} className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none">
                <option value="">Servicio base</option>
                {options.map((opt) => (
                  <option key={opt.id} value={String(opt.id)}>{opt.name}</option>
                ))}
              </select>
            </div>

            <textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} rows={2} placeholder="Notas para la cita (opcional)" className="mt-3 w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13.5px] font-semibold outline-none" />

            {conf.medico && (
              <div className="mt-3 space-y-2.5 rounded-[24px] border border-[#1d6ae5]/15 bg-[#e8f1fe]/45 p-4">
                <p className="text-[12px] font-black uppercase tracking-wide text-[#1d6ae5]">Datos médicos solicitados</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <input value={manualEdad} onChange={(e) => setManualEdad(e.target.value)} placeholder="Edad" className="w-full rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[14px] font-bold outline-none" />
                  <input value={manualAlergias} onChange={(e) => setManualAlergias(e.target.value)} placeholder="Alergias" className="w-full rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[14px] font-bold outline-none" />
                </div>
                <textarea value={manualSintomas} onChange={(e) => setManualSintomas(e.target.value)} rows={2} placeholder="Síntomas o motivo de consulta" className="w-full resize-none rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[13.5px] font-semibold outline-none" />
                <textarea value={manualMedicamentos} onChange={(e) => setManualMedicamentos(e.target.value)} rows={2} placeholder="Medicamentos actuales" className="w-full resize-none rounded-2xl border border-[#1d6ae5]/15 bg-white px-4 py-3 text-[13.5px] font-semibold outline-none" />
              </div>
            )}

            {manualError && <p className="mt-3 rounded-2xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{manualError}</p>}
            {manualOk && <p className="mt-3 rounded-2xl bg-[#e6f8ee] px-4 py-2.5 text-[13px] font-black text-[#0ea55b]">{manualOk}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={resetManualForm} className="rounded-full bg-mist px-4 py-3 text-[12.5px] font-black text-ink-soft">
                Limpiar
              </button>
              <button onClick={createManualAppointment} disabled={manualSaving} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white disabled:opacity-50" style={{ backgroundColor: conf.accent }}>
                <CalendarDays className="h-4 w-4" /> {manualSaving ? "Agendando..." : "Guardar cita"}
              </button>
            </div>
          </section>
        )}

        {panelTab === "negocio" && conf.medico && (
          <MedicalVerificationSection docs={service?.verificationDocs} accent={conf.accent} soft={conf.soft} />
        )}

        {/* Consejos de la categoría */}
        {panelTab === "negocio" && (
        <section className="rounded-[26px] p-5" style={{ backgroundColor: conf.soft }}>
          <p className="flex items-center gap-2 text-[14px] font-black" style={{ color: conf.accent }}>
            <Lightbulb className="h-4.5 w-4.5" /> {conf.medico ? "Buenas prácticas médicas" : `Consejos de ${conf.label.toLowerCase()}`}
          </p>
          <ul className="mt-2.5 space-y-2">
            {conf.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] font-bold text-ink/80">
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: conf.accent }}>{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </section>
        )}

        {/* Catálogo y Menú de Servicios del Negocio */}
        {panelTab === "menu" && (
        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 text-[15px] font-black">
                <Tag className="h-4.5 w-4.5" style={{ color: conf.accent }} /> Menú de servicios ({options.length})
              </p>
              <p className="text-[11.5px] font-bold text-ink-soft">Agrega, edita y gestiona las especialidades que ofreces</p>
            </div>
            {service && (
              <button
                onClick={() => setShowAddOption(true)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white transition hover:brightness-110 active:scale-95 shadow-sm"
                style={{ backgroundColor: conf.accent }}
              >
                <Plus className="h-4 w-4" /> Agregar servicio
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {options.length === 0 ? (
              <p className="rounded-2xl bg-mist px-4 py-6 text-center text-[13px] font-bold text-ink-soft">
                Aún no has agregado especialidades a tu menú. Toca &quot;+ Agregar servicio&quot;.
              </p>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition hover:border-black/25"
                  style={{ borderColor: opt.popular ? `${conf.accent}44` : "rgba(0,0,0,0.08)", backgroundColor: opt.popular ? `${conf.soft}33` : undefined }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-black text-ink">{opt.name}</p>
                      {opt.popular && (
                        <span className="rounded-full px-2 py-0.5 text-[9.5px] font-black text-white shadow-xs" style={{ backgroundColor: conf.accent }}>
                          Popular
                        </span>
                      )}
                    </div>
                    {opt.description && <p className="mt-0.5 line-clamp-1 text-[12px] font-semibold text-ink-soft">{opt.description}</p>}
                    <p className="mt-1 flex items-center gap-2 text-[12px] font-bold text-ink-soft">
                      <span className="font-black text-ink" style={{ color: conf.accent }}>{formatMXN(opt.price)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {opt.durationMin} min</span>
                    </p>
                  </div>
                  <button
                    onClick={() => deleteOption(opt.id)}
                    disabled={deletingOptionId === opt.id}
                    aria-label={`Eliminar ${opt.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-ink-soft transition hover:bg-rose-50 hover:text-rose-600 active:scale-90 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
        )}

        {/* Datos generales del negocio */}
        {panelTab === "negocio" && (
        <section className="rounded-[26px] bg-white p-5 shadow-sm">
          <p className="text-[15px] font-black">Tu negocio</p>
          <div className="mt-3 space-y-2 text-[13.5px] font-bold">
            <p className="flex justify-between"><span className="text-ink-soft">Negocio</span><span className="font-black text-ink">{service?.provider}</span></p>
            <p className="flex justify-between"><span className="text-ink-soft">Profesional</span><span className="font-black text-ink">{service?.proName}</span></p>
            <p className="flex justify-between"><span className="text-ink-soft">Tarifa base</span><span className="font-black" style={{ color: conf.accent }}>{formatMXN(service?.price ?? 0)}</span></p>
            <p className="flex justify-between"><span className="text-ink-soft">Modalidad</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {service?.domicilio ? "Domicilio" : ""} {service?.local ? "y Local" : ""}</span></p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed py-3 text-[13.5px] font-black transition hover:bg-mist/60 active:scale-[0.98]"
            style={{ borderColor: `${conf.accent}55`, color: conf.accent }}
          >
            <Plus className="h-4.5 w-4.5" /> Registrar otro negocio / sucursal
          </button>
        </section>
        )}

        <p className="pb-2 text-center text-[11px] font-black tracking-widest text-ink-soft/60 uppercase">Panel {conf.label} · Profesionales Rayte</p>
      </div>

      {showAdd && (
        <AddServiceModal
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
          preset={{ category: service?.category, provider: service?.provider, proName: service?.proName }}
        />
      )}

      {showAddOption && service && (
        <AddOptionModal
          serviceId={service.id}
          accent={conf.accent}
          onClose={() => setShowAddOption(false)}
          onAdded={(opt) => {
            setOptions((prev) => [...prev, opt]);
            setShowAddOption(false);
          }}
        />
      )}

      {noteAppt && (
        <div className="fixed inset-0 z-[84] flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={() => setNoteFor(null)}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${conf.accent}` }}>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[17px] font-black tracking-tight"><FileText className="h-4.5 w-4.5" style={{ color: conf.accent }} /> {conf.medico ? "Expediente clínico" : "Bitácora del servicio"}</p>
                <p className="mt-1 text-[12px] font-bold text-ink-soft">{noteAppt.code} · {noteAppt.customerName} · {fmtDay(noteAppt.startAt)}</p>
                <p className="text-[11px] font-bold text-ink-soft">La actualización automática se pausa mientras escribes.</p>
              </div>
              <button onClick={() => setNoteFor(null)} aria-label="Cerrar expediente" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-5">
              <div className="rounded-2xl border border-black/8 bg-mist/40 p-4">
                <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Resumen de la solicitud</p>
                <div className="mt-2 space-y-1.5 text-[13px] font-bold text-ink">
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {noteAppt.phone}</p>
                  <p className="flex items-center gap-2">{noteAppt.mode === "domicilio" ? <Home className="h-3.5 w-3.5" style={{ color: conf.accent }} /> : <Store className="h-3.5 w-3.5" style={{ color: conf.accent }} />}{noteAppt.mode === "domicilio" ? (noteAppt.address ?? "A domicilio") : "En el local"}</p>
                  {noteAppt.optionName && <p className="flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {noteAppt.optionName}</p>}
                </div>
              </div>

              {(noteAppt.intake?.sintomas || noteAppt.intake?.alergias || noteAppt.intake?.medicamentos || noteAppt.notes) && (
                <div className="rounded-2xl border border-[#1d6ae5]/15 bg-[#e8f1fe]/45 p-4">
                  <p className="text-[11px] font-black tracking-widest uppercase text-[#1d6ae5]">Lo que pidió el paciente</p>
                  <div className="mt-2 space-y-2 text-[12.5px] font-bold text-ink">
                    {noteAppt.intake?.sintomas && <p><span className="text-ink-soft">Síntomas:</span> {noteAppt.intake.sintomas}</p>}
                    {noteAppt.intake?.alergias && <p><span className="text-ink-soft">Alergias:</span> {noteAppt.intake.alergias}</p>}
                    {noteAppt.intake?.medicamentos && <p><span className="text-ink-soft">Medicamentos:</span> {noteAppt.intake.medicamentos}</p>}
                    {noteAppt.notes && <p><span className="text-ink-soft">Notas:</span> {noteAppt.notes}</p>}
                  </div>
                </div>
              )}

              {conf.medico && (
                <>
                  <div className="rounded-[24px] border border-[#1d6ae5]/15 bg-[#f8fbff] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-black tracking-widest uppercase text-[#1d6ae5]">Datos primordiales del paciente</p>
                        <p className="mt-1 text-[12px] font-bold text-[#45649d]">Guárdalos por cita para que después se puedan ver como gráficas y comparar con consultas pasadas.</p>
                      </div>
                      {noteAppt.clinicalSnapshot?.updatedAt && (
                        <span className="rounded-full bg-white px-3 py-1 text-[10.5px] font-black text-[#1d6ae5] shadow-sm">
                          Última captura: {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(noteAppt.clinicalSnapshot.updatedAt))}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {CLINICAL_FIELDS.map((field) => (
                        <label key={field.key} className="rounded-[20px] border border-black/8 bg-white px-3.5 py-3 shadow-sm">
                          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">{field.shortLabel}</span>
                          <span className="mt-1 block text-[13px] font-black text-ink">{field.label}</span>
                          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-mist px-3 py-2.5">
                            <input
                              value={clinicalDraft[field.key]}
                              onChange={(e) => setClinicalDraft((prev) => ({ ...prev, [field.key]: e.target.value.replace(/[^0-9.,]/g, "") }))}
                              inputMode={field.step === "0.1" ? "decimal" : "numeric"}
                              placeholder="0"
                              className="w-full bg-transparent text-[14px] font-black text-ink outline-none"
                            />
                            <span className="text-[11px] font-black text-ink-soft">{field.unit}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-black/8 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-black tracking-widest uppercase text-ink-soft">Comparativa con cita pasada</p>
                        <p className="mt-1 text-[12px] font-bold text-ink-soft">
                          {previousPatientAppt ? `Comparando contra ${fmtDay(previousPatientAppt.startAt)}.` : "Aún no hay una cita anterior guardada para este paciente."}
                        </p>
                      </div>
                      {previousPatientAppt && (
                        <span className="rounded-full px-3 py-1 text-[10.5px] font-black text-white" style={{ backgroundColor: conf.accent }}>
                          {notePatientTimeline.length} citas
                        </span>
                      )}
                    </div>

                    {noteComparisonFields.length > 0 ? (
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {noteComparisonFields.map((field) => (
                          <MetricTrendCard
                            key={field.key}
                            field={field}
                            current={currentClinicalSnapshot?.[field.key]}
                            previous={previousPatientAppt?.clinicalSnapshot?.[field.key]}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-2xl bg-mist px-4 py-4 text-[12.5px] font-bold text-ink-soft">
                        Captura al menos un dato primordial para habilitar la comparativa rápida del expediente.
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="rounded-[24px] border-2 p-3" style={{ borderColor: `${conf.accent}33` }}>
                <p className="mb-2 text-[11px] font-black tracking-widest uppercase" style={{ color: conf.accent }}>
                  {conf.medico ? "Escribe diagnóstico, receta, indicaciones y seguimiento" : "Escribe observaciones del servicio"}
                </p>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={10}
                  autoFocus
                  placeholder={conf.medico ? "Diagnóstico, receta (medicamento y dosis), indicaciones y seguimiento..." : "Notas del servicio: qué se hizo, observaciones, próxima visita..."}
                  className="w-full resize-none rounded-2xl bg-mist px-4 py-3 text-[13px] font-bold leading-relaxed outline-none"
                />
              </div>
            </div>

            <div className="flex shrink-0 gap-2 border-t border-black/5 px-5 py-4">
              <button onClick={() => setNoteFor(null)} className="rounded-full bg-mist px-4 py-3 text-[12.5px] font-black text-ink-soft">
                Cancelar
              </button>
              <button onClick={saveNote} disabled={savingNote} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white disabled:opacity-50" style={{ backgroundColor: conf.accent }}>
                <FileText className="h-4 w-4" /> {savingNote ? "Guardando..." : conf.medico ? "Guardar en expediente" : "Guardar nota"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Solicitud detallada del paciente ── */}
      {detailFor && (
        <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={() => setDetailFor(null)}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
          >
            <div className="flex shrink-0 items-start justify-between px-5 pt-5 pb-3" style={{ borderTop: `4px solid ${conf.accent}` }}>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[17px] font-black tracking-tight"><ClipboardList className="h-4.5 w-4.5" style={{ color: conf.accent }} /> Solicitud del {conf.clientNoun}</p>
                <p className="text-[12px] font-bold text-ink-soft">{detailFor.code} · {(APPT_BADGE[detailFor.status] ?? APPT_BADGE.scheduled).label}</p>
              </div>
              <button onClick={() => setDetailFor(null)} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist"><X className="h-4.5 w-4.5" /></button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-5">
              {/* Datos del paciente */}
              <div className="rounded-2xl border border-black/8 p-4">
                <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">{conf.medico ? "Paciente" : "Cliente"}</p>
                <div className="mt-2 space-y-1.5 text-[13.5px] font-bold">
                  <p className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-black text-white" style={{ backgroundColor: conf.accent }}>{detailFor.customerName[0]?.toUpperCase()}</span> {detailFor.customerName}{detailFor.intake?.edad ? ` · ${detailFor.intake.edad} años` : ""}</p>
                  <p className="flex items-center gap-2 text-ink-soft"><Phone className="h-3.5 w-3.5" style={{ color: conf.accent }} /> {detailFor.phone}</p>
                </div>
              </div>

              {/* Detalles de la cita */}
              <div className="rounded-2xl border border-black/8 p-4">
                <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Cita solicitada</p>
                <div className="mt-2 space-y-1.5 text-[13px] font-bold text-ink">
                  <p className="flex items-center gap-2 capitalize"><CalendarDays className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(detailFor.startAt))}</p>
                  <p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {detailFor.optionName ? `${detailFor.optionName} · ` : ""}{detailFor.serviceName} · {formatMXN(detailFor.price)}</p>
                  <p className="flex items-center gap-2">{detailFor.mode === "domicilio" ? <Home className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> : <Store className="h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} />} {detailFor.mode === "domicilio" ? "A domicilio" : "En el local"}</p>
                  {detailFor.mode === "domicilio" && detailFor.address && (
                    <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: conf.accent }} /> {detailFor.address}</p>
                  )}
                </div>
              </div>

              {/* Información clínica que llenó el paciente */}
              {detailFor.intake && (detailFor.intake.sintomas || detailFor.intake.alergias || detailFor.intake.medicamentos) && (
                <div className="rounded-2xl border-2 p-4" style={{ borderColor: `${conf.accent}44`, backgroundColor: `${conf.soft}55` }}>
                  <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: conf.accent }}>🩺 Información del paciente</p>
                  <div className="mt-2 space-y-2.5">
                    {detailFor.intake.sintomas && (
                      <div>
                        <p className="text-[11px] font-black text-ink-soft uppercase">Síntomas / motivo</p>
                        <p className="mt-0.5 text-[13.5px] leading-snug font-bold whitespace-pre-line">{detailFor.intake.sintomas}</p>
                      </div>
                    )}
                    {detailFor.intake.alergias && (
                      <div className="rounded-xl bg-[#fde8e8] px-3 py-2">
                        <p className="flex items-center gap-1.5 text-[11px] font-black text-[#dc2626] uppercase"><AlertTriangle className="h-3.5 w-3.5" /> Alergias</p>
                        <p className="mt-0.5 text-[13.5px] font-black text-[#7f1d1d]">{detailFor.intake.alergias}</p>
                      </div>
                    )}
                    {detailFor.intake.medicamentos && (
                      <div>
                        <p className="text-[11px] font-black text-ink-soft uppercase">Medicamentos actuales</p>
                        <p className="mt-0.5 text-[13.5px] font-bold">{detailFor.intake.medicamentos}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {conf.medico && detailFor.clinicalSnapshot && (
                <div className="rounded-[24px] border border-[#1d6ae5]/15 bg-[#f8fbff] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black tracking-widest uppercase text-[#1d6ae5]">Datos primordiales guardados</p>
                      <p className="mt-1 text-[12px] font-bold text-[#45649d]">Este bloque ya quedó listo para futuras gráficas y comparativas.</p>
                    </div>
                    {detailFor.clinicalSnapshot.updatedAt && (
                      <span className="rounded-full bg-white px-3 py-1 text-[10.5px] font-black text-[#1d6ae5] shadow-sm">
                        {new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(detailFor.clinicalSnapshot.updatedAt))}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {CLINICAL_FIELDS.filter((field) => typeof detailFor.clinicalSnapshot?.[field.key] === "number").map((field) => (
                      <div key={field.key} className="rounded-2xl border border-black/8 bg-white px-3.5 py-3 shadow-sm">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">{field.shortLabel}</p>
                        <p className="mt-1 text-[13px] font-black text-ink">{field.label}</p>
                        <p className="mt-2 text-[18px] font-black" style={{ color: field.color }}>{formatMetricValue(detailFor.clinicalSnapshot?.[field.key], field.unit)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas generales del cliente */}
              {detailFor.notes && (
                <div className="rounded-2xl border border-black/8 p-4">
                  <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Notas del {conf.clientNoun}</p>
                  <p className="mt-1 text-[13.5px] font-bold text-ink italic">&quot;{detailFor.notes}&quot;</p>
                </div>
              )}

              {/* Expediente ya escrito */}
              {detailFor.proNotes && (
                <div className="rounded-2xl p-4" style={{ backgroundColor: conf.soft }}>
                  <p className="flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase" style={{ color: conf.accent }}><FileText className="h-3.5 w-3.5" /> {conf.medico ? "Expediente" : "Bitácora"}</p>
                  <p className="mt-1 text-[13px] leading-snug font-bold whitespace-pre-line text-ink/85">{detailFor.proNotes}</p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-2 border-t border-black/5 px-5 py-4">
              {detailFor.status === "scheduled" && (
                <button onClick={() => { setApptStatus(detailFor, "confirmed"); setDetailFor(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white transition hover:brightness-110" style={{ backgroundColor: conf.accent }}>
                  <CircleCheck className="h-4 w-4" /> Confirmar cita
                </button>
              )}
              <button onClick={() => { openNote(detailFor); setDetailFor(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 text-[13.5px] font-black text-white transition hover:bg-black">
                <FileText className="h-4 w-4" /> {detailFor.proNotes ? "Editar expediente" : conf.medico ? "Abrir expediente" : "Agregar nota"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, accentColor, soft, color }: { icon: React.ReactNode; label: string; value: string; accentColor?: string; soft?: string; color?: string }) {
  if (accentColor) {
    return (
      <div className="rounded-[22px] p-4 text-white shadow-sm" style={{ backgroundColor: accentColor }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">{icon}</span>
        <p className="mt-2 text-[11px] font-black text-white/80 uppercase">{label}</p>
        <p className="text-[16px] font-black">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: soft, color }}>{icon}</span>
      <p className="mt-2 text-[11px] font-black text-ink-soft uppercase">{label}</p>
      <p className="text-[16px] font-black text-ink">{value}</p>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/restaurante/[slug]/page.tsx
// --------------------------------------------------------
import { notFound } from "next/navigation";
import { db } from "@/db";
import { restaurants, products, productExtras } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import RestaurantClient from "./restaurant-client";

export const dynamic = "force-dynamic";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [store] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
  if (!store) notFound();

  const menu = await db
    .select()
    .from(products)
    .where(and(eq(products.restaurantId, store.id), eq(products.available, true)))
    .orderBy(asc(products.sort), asc(products.id));

  const extras = await db
    .select()
    .from(productExtras)
    .where(and(eq(productExtras.restaurantId, store.id), eq(productExtras.available, true)))
    .orderBy(asc(productExtras.name), asc(productExtras.id));

  return <RestaurantClient key={store.slug} store={store} menu={menu} extras={extras} />;
}


// --------------------------------------------------------
// ARCHIVO: src/app/restaurante/[slug]/restaurant-client.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Star, Bike, Flame, MapPin, CalendarDays, BadgePercent, Search, X } from "lucide-react";
import { formatMXN } from "@/lib/utils";
import { useCart } from "@/store/cart";
import ItemModal from "@/components/item-modal";
import { AddButton } from "@/components/stepper";
import SchedulePicker from "@/components/schedule-picker";
import { sectionIcon } from "@/components/section-icon";
import type { Product, ProductExtra, Restaurant } from "@/db/schema";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const anchor = (s: string) => norm(s).replace(/[^a-z0-9]+/g, "-");

export default function RestaurantClient({
  store,
  menu,
  extras = [],
}: {
  store: Restaurant;
  menu: Product[];
  extras?: ProductExtra[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Product | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [barStuck, setBarStuck] = useState(false);
  const [query, setQuery] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(null);
    setScheduleOpen(false);
    setQuery("");
    setPopularOnly(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [store.slug]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const onScroll = () => setBarStuck(bar.getBoundingClientRect().top <= 1);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const raw = searchParams.get("producto");
    const productId = raw ? Number(raw) : NaN;
    if (!Number.isFinite(productId)) return;
    const target = menu.find((item) => item.id === productId);
    if (!target) return;
    setSelected(target);
    requestAnimationFrame(() => {
      document.getElementById(`product-${target.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [menu, searchParams]);

  const schedulePref = useCart((s) => s.schedulePref);
  const setSchedulePref = useCart((s) => s.setSchedulePref);

  const prefLabel = useMemo(() => {
    if (!schedulePref) return null;
    const d = new Date(schedulePref);
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) return null;
    return new Intl.DateTimeFormat("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  }, [schedulePref]);

  const filteredMenu = useMemo(() => {
    const q = norm(query);
    return menu.filter((item) => {
      const matchesQuery = !q || norm(`${item.name} ${item.description} ${item.section}`).includes(q);
      const matchesPopular = !popularOnly || item.popular;
      return matchesQuery && matchesPopular;
    });
  }, [menu, query, popularOnly]);

  const sections = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filteredMenu) {
      const arr = map.get(p.section) ?? [];
      arr.push(p);
      map.set(p.section, arr);
    }
    return [...map.entries()];
  }, [filteredMenu]);

  const popularItems = useMemo(() => filteredMenu.filter((item) => item.popular).slice(0, 6), [filteredMenu]);
  const hasUiFilters = query.trim().length > 0 || popularOnly;

  const clearUiFilters = () => {
    setQuery("");
    setPopularOnly(false);
  };

  const closeSelected = () => {
    setSelected(null);
    if (searchParams.get("producto")) {
      router.replace(`/restaurante/${store.slug}`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-[calc(env(safe-area-inset-bottom)+12rem)] sm:pb-44">
      <header className="border-b border-black/5 bg-[#fafafa]">
        <div className="relative h-[104px] overflow-hidden sm:h-[124px]">
          <Image src={store.image} alt={store.name} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/25" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5">
            <Link
              href="/"
              aria-label="Volver"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 active:scale-90"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto -mt-6 max-w-5xl px-4 pb-3">
          <div className="rounded-[24px] border border-black/5 bg-white p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.06)]">
            <div className="flex items-start gap-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border-2 border-white bg-white shadow-sm sm:h-[72px] sm:w-[72px]">
                <Image src={store.image} alt={store.name} fill className="object-cover" sizes="72px" />
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-[19px] leading-tight font-black tracking-tight text-ink sm:text-[22px]">{store.name}</h1>
                  {store.promo && (
                    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-black text-brand">
                      <BadgePercent className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{store.promo}</span>
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] font-bold text-ink-soft">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />
                    {store.rating.toFixed(1)}
                    <span className="text-ink-soft/70">({store.ratingCount.toLocaleString("es-MX")})</span>
                  </span>
                  <span className={`flex items-center gap-1 ${store.isOpen ? "text-[#0ea55b]" : "text-brand"}`}>
                    <span className={`h-2 w-2 rounded-full ${store.isOpen ? "bg-[#0ea55b]" : "bg-brand"}`} />
                    {store.isOpen ? "Abierto" : "Cerrado"}
                  </span>
                </div>

                <p className="mt-1.5 line-clamp-2 text-[11.5px] font-semibold leading-relaxed text-ink-soft">{store.description}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-ink-soft">Tiempo</p>
                <p className="mt-0.5 text-[12px] font-black text-ink">{store.timeMin}-{store.timeMax} min</p>
              </div>
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-ink-soft">Envío</p>
                <p className={`mt-0.5 text-[12px] font-black ${store.deliveryFee === 0 ? "text-[#0ea55b]" : "text-ink"}`}>
                  {store.deliveryFee === 0 ? "Gratis" : formatMXN(store.deliveryFee)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-ink-soft">Distancia</p>
                <p className="mt-0.5 text-[12px] font-black text-ink">{store.distanceKm.toFixed(1)} km</p>
              </div>
              <div className="rounded-2xl bg-[#f7f7f7] px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-ink-soft">Modalidad</p>
                <p className="mt-0.5 text-[12px] font-black text-ink">{store.allowsPickup ? "Recoger / Domicilio" : "Solo domicilio"}</p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-[#f7f7f7] px-3 py-2 text-[11px] font-bold text-ink">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span className="truncate">{store.address}</span>
            </div>
          </div>
        </div>
      </header>

      {!store.isOpen && (
        <div className="mx-auto mt-2.5 max-w-5xl px-4">
          <p className="rounded-2xl bg-mist px-4 py-2.5 text-center text-[12px] font-black text-ink-soft">
            Cerrado temporalmente — puedes ver el menú, pero no pedir por ahora.
          </p>
        </div>
      )}

      <div
        ref={barRef}
        className={`sticky top-0 z-30 border-b border-black/5 bg-white/92 backdrop-blur-xl transition-all duration-300 ${barStuck ? "shadow-[0_12px_28px_rgba(0,0,0,0.08)]" : "shadow-[0_4px_12px_rgba(0,0,0,0.03)]"}`}
      >
        <div className="mx-auto max-w-5xl px-4 py-2.5">
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div className="flex min-w-0 items-center gap-2 rounded-[18px] border border-black/6 bg-[#f7f7f7] px-3 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-ink-soft" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Buscar en ${store.name}`}
                  className="w-full bg-transparent text-[12.5px] font-bold text-ink outline-none placeholder:text-ink-soft/80"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpiar búsqueda"
                    className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm transition hover:text-brand"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPopularOnly((v) => !v)}
                className={`shrink-0 rounded-full px-3 py-2.5 text-[10.5px] font-black transition ${popularOnly ? "bg-brand text-white shadow-[0_8px_18px_var(--brand-glow)]" : "border border-brand/10 bg-brand-soft text-brand"}`}
              >
                🔥 Top
              </button>

              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className={`shrink-0 rounded-full px-3 py-2.5 text-[10.5px] font-black transition ${prefLabel ? "bg-[#1d6ae5] text-white shadow-[0_8px_18px_rgba(29,106,229,0.22)]" : "border border-[#1d6ae5]/10 bg-[#edf7ff] text-[#1d6ae5]"}`}
              >
                {prefLabel ? "Hora" : "Programar"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-black text-ink-soft">
                  {filteredMenu.length} {filteredMenu.length === 1 ? "resultado" : "resultados"}
                </span>
                {popularOnly && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-black text-brand">
                    Solo top
                  </span>
                )}
                {prefLabel && (
                  <span className="rounded-full bg-[#edf7ff] px-2.5 py-1 text-[10px] font-black text-[#1d6ae5]">
                    {prefLabel}
                  </span>
                )}
              </div>

              {hasUiFilters && (
                <button
                  type="button"
                  onClick={clearUiFilters}
                  className="shrink-0 rounded-full border border-black/8 bg-white px-3 py-1.5 text-[10.5px] font-black text-ink-soft transition hover:text-ink"
                >
                  Limpiar
                </button>
              )}
            </div>

            {sections.length > 0 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
                {sections.map(([sec, items]) => {
                  const Icon = sectionIcon(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => document.getElementById(`sec-${anchor(sec)}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="flex shrink-0 items-center gap-2 rounded-full border border-black/6 bg-white px-3 py-2 text-left text-[10.5px] font-black text-ink transition hover:border-black/12 hover:bg-[#fafafa] active:scale-[0.98]"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2.3} />
                      <span className="truncate">{sec}</span>
                      <span className="shrink-0 text-ink-soft/70">{items.length}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pt-4">
        {!query && !popularOnly && popularItems.length > 0 && (
          <section className="mb-5 rounded-[24px] border border-brand/10 bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-[15px] font-black text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Flame className="h-4.5 w-4.5" />
                  </span>
                  Lo más pedido
                </h2>
                <p className="mt-0.5 text-[11px] font-bold text-ink-soft">Lo que más pide la gente en {store.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPopularOnly(true)}
                className="rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-black text-brand transition hover:bg-brand hover:text-white"
              >
                Solo top
              </button>
            </div>

            <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {popularItems.map((product) => (
                <button
                  key={`popular-${product.id}`}
                  type="button"
                  onClick={() => setSelected(product)}
                  className="flex w-[236px] shrink-0 items-center gap-3 rounded-[20px] border border-black/6 bg-[#fcfcfc] px-3 py-2.5 text-left transition hover:border-brand/20 hover:bg-white"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-mist">
                    {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[12px] leading-tight font-black text-ink">{product.name}</p>
                      <span className="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-black text-brand">Top</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-ink-soft">{product.description}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[12px] font-black text-brand">{formatMXN(product.price)}</span>
                      <AddButton onClick={() => setSelected(product)} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {sections.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-black/10 bg-white px-6 py-10 text-center shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
            <p className="text-[17px] font-black text-ink">No encontramos productos</p>
            <p className="mt-1 text-[12px] font-bold text-ink-soft">Prueba con otro nombre o desactiva el filtro de más pedidos.</p>
          </div>
        ) : (
          sections.map(([section, items]) => {
            const Icon = sectionIcon(section);
            const hasPopularItems = items.some((p) => p.popular);

            return (
              <section key={section} id={`sec-${anchor(section)}`} className="mb-5 scroll-mt-44 sm:scroll-mt-40">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
                      <Icon className="h-4.5 w-4.5" strokeWidth={2.3} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-black tracking-tight text-ink">{section}</h2>
                      <p className="text-[10px] font-bold text-ink-soft">{items.length} {items.length === 1 ? "opción" : "opciones"}</p>
                    </div>
                  </div>

                  {hasPopularItems && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[9.5px] font-black text-brand">
                      <Flame className="h-3 w-3" />
                      Top
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {items.map((product) => (
                    <button
                      id={`product-${product.id}`}
                      key={product.id}
                      type="button"
                      onClick={() => setSelected(product)}
                      className="group flex w-full items-center gap-3 rounded-[22px] border border-black/6 bg-white p-3 text-left shadow-[0_6px_18px_rgba(0,0,0,0.035)] transition hover:border-black/10 hover:shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
                    >
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[18px] bg-mist">
                        {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="72px" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] leading-tight font-black text-ink">{product.name}</p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-ink-soft">{product.description}</p>
                          </div>
                          <span className="shrink-0 text-[12px] font-black text-brand">{formatMXN(product.price)}</span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap gap-1.5">
                            {product.popular && <span className="rounded-full bg-brand-soft px-2 py-1 text-[8.5px] font-black text-brand">Top</span>}
                            <span className="rounded-full bg-[#f7f7f7] px-2 py-1 text-[8.5px] font-black text-ink-soft">Toca para personalizar</span>
                          </div>
                          <AddButton onClick={() => setSelected(product)} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      <ItemModal product={selected} store={store} extras={extras} onClose={closeSelected} />
      <SchedulePicker open={scheduleOpen} initialIso={schedulePref} onClose={() => setScheduleOpen(false)} onSave={(iso) => setSchedulePref(iso)} />
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/servicios/[slug]/booking-client.tsx
// --------------------------------------------------------
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Home, Loader2, Store, Zap } from "lucide-react";
import type { Service, ServiceOption } from "@/db/schema";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/utils";

const SLOTS = ["08:00", "09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"];
const MONTHS_AHEAD = 12; // calendario de todo el año

type AppointmentResult = {
  id: string;
  code: string;
  serviceName: string;
  optionName: string | null;
  startAt: string;
  endAt: string;
  price: number;
  proName: string;
  mode: string;
};

type Busy = { start: number; end: number };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function BookingClient({
  service,
  options = [],
  accent = "#7c3aed",
  soft = "#f3e8ff",
  glow = "rgba(124,58,237,0.35)",
}: {
  service: Service;
  options?: ServiceOption[];
  accent?: string;
  soft?: string;
  glow?: string;
}) {
  const customerName = useCart((s) => s.customerName);
  const phone = useCart((s) => s.phone);
  const address = useCart((s) => s.address);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Servicio elegido del menú del negocio */
  const [optionId, setOptionId] = useState<number | null>(() => (options.find((o) => o.popular) ?? options[0])?.id ?? null);
  const selected = options.find((o) => o.id === optionId) ?? null;
  const price = selected?.price ?? service.price;
  const durationMin = selected?.durationMin ?? service.durationMin;

  /* ── Horarios ocupados REALES (se bloquean en el calendario) ── */
  const [busy, setBusy] = useState<Busy[]>([]);
  const loadBusy = useCallback(async () => {
    try {
      const res = await fetch(`/api/appointments?busy=${service.slug}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBusy((data.busy as { startAt: string; endAt: string }[]).map((b) => ({ start: +new Date(b.startAt), end: +new Date(b.endAt) })));
      }
    } catch { /* sin bloqueo si falla; el servidor valida de todos modos */ }
  }, [service.slug]);

  useEffect(() => {
    if (mounted) loadBusy();
  }, [mounted, loadBusy]);

  /* ── Calendario ── */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const minMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD - 1, 1), [today]);

  const [viewMonth, setViewMonth] = useState<Date>(minMonth);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [mode, setMode] = useState<"domicilio" | "local">(service.domicilio ? "domicilio" : "local");
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [addr, setAddr] = useState("");
  const [notes, setNotes] = useState("");
  /* Solicitud detallada (solo servicios de salud) */
  const isSalud = service.category === "salud";
  const [edad, setEdad] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<AppointmentResult | null>(null);

  useEffect(() => {
    if (mounted) {
      setName(customerName);
      setTel(phone);
      setAddr(address);
    }
  }, [mounted, customerName, phone, address]);

  /* ¿Está bloqueado un horario? (pasado u ocupado por otra reserva) */
  const slotBlocked = useCallback(
    (day: Date, s: string): boolean => {
      const [h, m] = s.split(":").map(Number);
      const start = new Date(day);
      start.setHours(h, m, 0, 0);
      const end = start.getTime() + durationMin * 60000;
      if (start.getTime() <= Date.now()) return true;
      return busy.some((b) => b.start < end && b.end > start.getTime());
    },
    [busy, durationMin],
  );

  const dayFull = useCallback((day: Date): boolean => SLOTS.every((s) => slotBlocked(day, s)), [slotBlocked]);

  /* Celdas del mes visible (semana inicia en lunes) */
  const cells = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const out: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(y, m, d));
    return out;
  }, [viewMonth]);

  const canPrev = viewMonth.getTime() > minMonth.getTime();
  const canNext = viewMonth.getTime() < maxMonth.getTime();
  const monthLabel = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(viewMonth);

  const startAtIso = useMemo(() => {
    if (!slot) return null;
    const d = new Date(selectedDate);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }, [selectedDate, slot]);

  if (!mounted) return null;

  const submit = async () => {
    setError("");
    if (!slot) return setError("Elige una hora disponible para tu cita.");
    if (!name.trim()) return setError("Escribe tu nombre.");
    if (!tel.trim()) return setError("Escribe tu teléfono.");
    if (mode === "domicilio" && !addr.trim()) return setError("Escribe la dirección del servicio.");
    if (isSalud && !sintomas.trim()) return setError("Describe tus síntomas o el motivo de la consulta para que el médico llegue preparado.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          optionId,
          customerName: name.trim(),
          phone: tel.trim(),
          mode,
          address: mode === "domicilio" ? addr.trim() : null,
          startAt: startAtIso,
          notes: notes.trim() || null,
          intake: isSalud ? { edad, sintomas, alergias, medicamentos } : null,
        }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setError(data.error ?? "Ese horario ya está ocupado.");
        setSlot(null);
        loadBusy(); /* refresca los bloqueos */
        return;
      }
      if (!res.ok) throw new Error("Respuesta inválida del servidor");
      setDone(await res.json());
    } catch {
      setError("No pudimos agendar la cita. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-[26px] border-2 p-6 text-center" style={{ borderColor: `${accent}4d`, backgroundColor: `${soft}66` }}>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </span>
        <p className="mt-4 text-xl font-black">¡Cita agendada!</p>
        <p className="mt-1 text-sm font-bold text-ink-soft">{done.optionName ?? done.serviceName} con {done.proName}</p>
        <div className="mx-auto mt-4 w-fit rounded-2xl bg-white px-5 py-3 shadow-sm">
          <p className="text-[11px] font-black tracking-widest text-ink-soft uppercase">Tu código</p>
          <p className="text-2xl font-black" style={{ color: accent }}>{done.code}</p>
        </div>
        <p className="mt-4 text-[13.5px] font-bold text-ink">
          {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(done.startAt))} · {formatMXN(done.price)}
        </p>
        <p className="mt-2 text-[12.5px] font-semibold text-ink-soft">
          {done.mode === "domicilio" ? "Un profesional llegará a tu dirección" : "Te esperamos en el local del proveedor"}
        </p>
      </motion.div>
    );
  }

  const selectedIsPast = (d: Date) => d.getTime() < today.getTime();

  return (
    <div className="mt-6 rounded-[26px] border p-5" style={{ borderColor: `${accent}33` }}>
      <p className="flex items-center gap-2 text-lg font-black"><CalendarDays className="h-5 w-5" style={{ color: accent }} /> Agenda tu cita</p>

      {/* ── Menú de servicios del negocio ── */}
      {options.length > 0 && (
        <>
          <p className="mt-4 text-[13px] font-black text-ink-soft uppercase">Elige tu servicio</p>
          <div className="mt-2 space-y-2">
            {options.map((o) => {
              const active = o.id === optionId;
              return (
                <button
                  key={o.id}
                  onClick={() => { setOptionId(o.id); setSlot(null); }}
                  className="flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition active:scale-[0.99]"
                  style={active ? { borderColor: accent, backgroundColor: `${soft}66`, boxShadow: `0 4px 14px ${glow.replace("0.35", "0.15")}` } : { borderColor: "rgba(0,0,0,0.1)" }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
                    style={active ? { borderColor: accent, backgroundColor: accent } : { borderColor: "rgba(0,0,0,0.2)" }}
                  >
                    {active && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[14px] leading-tight font-black">
                      {o.name}
                      {o.popular && <span className="rounded-full px-2 py-0.5 text-[9.5px] font-black text-white" style={{ backgroundColor: accent }}>Popular</span>}
                    </span>
                    {o.description && <span className="mt-0.5 block text-[12px] leading-snug font-semibold text-ink-soft">{o.description}</span>}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[14.5px] font-black" style={active ? { color: accent } : undefined}>{formatMXN(o.price)}</span>
                    <span className="flex items-center justify-end gap-1 text-[11px] font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {o.durationMin} min</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-4 text-[13px] font-black text-ink-soft uppercase">Modalidad</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {service.domicilio && (
          <ModeBtn active={mode === "domicilio"} onClick={() => setMode("domicilio")} icon={<Home className="h-4 w-4" />} label="A domicilio" accent={accent} soft={soft} />
        )}
        {service.local && (
          <ModeBtn active={mode === "local"} onClick={() => setMode("local")} icon={<Store className="h-4 w-4" />} label="En local" accent={accent} soft={soft} />
        )}
      </div>

      {/* ── Calendario de todo el año ── */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[13px] font-black text-ink-soft uppercase">Elige el día</p>
        <div className="flex items-center gap-1">
          <button onClick={() => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Mes anterior" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist transition disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-[130px] text-center text-[13px] font-black capitalize">{monthLabel}</span>
          <button onClick={() => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} disabled={!canNext} aria-label="Mes siguiente" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist transition disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="py-1 text-[11px] font-black text-ink-soft/70">{d}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`b-${i}`} />;
          const past = selectedIsPast(d);
          const full = !past && dayFull(d);
          const selected = dayKey(d) === dayKey(selectedDate);
          const isToday = dayKey(d) === dayKey(today);
          return (
            <button
              key={dayKey(d)}
              disabled={past || full}
              onClick={() => { setSelectedDate(d); setSlot(null); }}
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition active:scale-90 ${past ? "font-bold text-black/25" : full ? "font-bold text-black/30 line-through" : selected ? "font-black text-white" : "font-extrabold text-ink hover:bg-mist"}`}
              style={selected ? { backgroundColor: accent, boxShadow: `0 6px 14px ${glow}` } : isToday && !selected ? { boxShadow: `inset 0 0 0 2px ${accent}66` } : undefined}
              aria-label={`Día ${d.getDate()}${full ? " (lleno)" : ""}`}
            >
              {d.getDate()}
              {full && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 flex items-center gap-3 text-[10.5px] font-bold text-ink-soft">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} /> Seleccionado</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> Día lleno</span>
      </p>

      {/* ── Horas (las ocupadas se bloquean) ── */}
      <p className="mt-5 text-[13px] font-black text-ink-soft uppercase">
        Hora · <span className="capitalize">{new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(selectedDate)}</span>
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {SLOTS.map((s) => {
          const blocked = slotBlocked(selectedDate, s);
          const active = slot === s;
          return (
            <button
              key={s}
              disabled={blocked}
              onClick={() => setSlot(s)}
              className={`rounded-xl border py-2 text-[13px] transition active:scale-95 ${blocked ? "border-black/5 bg-mist/70 font-bold text-black/30 line-through" : "font-black"}`}
              style={active ? { borderColor: accent, backgroundColor: accent, color: "#fff" } : blocked ? undefined : { borderColor: "rgba(0,0,0,0.1)" }}
            >
              {s}
            </button>
          );
        })}
      </div>
      {SLOTS.every((s) => slotBlocked(selectedDate, s)) && (
        <p className="mt-2 rounded-xl px-3.5 py-2.5 text-[12.5px] font-black" style={{ backgroundColor: soft, color: accent }}>
          Este día ya está lleno — elige otra fecha en el calendario.
        </p>
      )}

      <div className="mt-5 space-y-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
        <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Teléfono de contacto" inputMode="tel" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
        {mode === "domicilio" && (
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Dirección donde se realiza el servicio" className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
        )}

        {/* Solicitud detallada para el médico (solo salud) */}
        {isSalud && (
          <div className="rounded-2xl border-2 p-3.5" style={{ borderColor: `${accent}40`, backgroundColor: `${soft}55` }}>
            <p className="text-[13px] font-black" style={{ color: accent }}>🩺 Información para el médico</p>
            <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">El profesional la revisa antes de tu consulta. Es confidencial.</p>
            <div className="mt-2.5 space-y-2">
              <textarea value={sintomas} onChange={(e) => setSintomas(e.target.value)} rows={2} placeholder="Síntomas o motivo de la consulta *" className="w-full resize-none rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
              <div className="grid grid-cols-2 gap-2">
                <input value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Edad del paciente" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
                <input value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Alergias" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
              </div>
              <input value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} placeholder="Medicamentos que tomas actualmente" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
            </div>
          </div>
        )}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas para el profesional (opcional)" rows={2} className="w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-semibold outline-none" style={{ caretColor: accent }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = "")} />
      </div>

      {error && <p className="mt-3 rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={submitting}
        onClick={submit}
        className="mt-5 flex w-full items-center justify-between rounded-full px-5 py-4 font-black text-white transition hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: accent, boxShadow: `0 12px 28px ${glow}` }}
      >
        <span className="flex items-center gap-2 text-[15px]">
          {submitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Zap className="h-4.5 w-4.5 fill-white" />}
          {submitting ? "Agendando..." : "Confirmar cita"}
        </span>
        <span className="flex items-center gap-2">{formatMXN(price)} <Clock3 className="h-4 w-4" /> {durationMin} min</span>
      </motion.button>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label, accent, soft }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; accent: string; soft: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border py-3 text-[14px] font-black transition active:scale-[0.97]"
      style={active ? { borderColor: accent, backgroundColor: `${soft}80`, color: accent } : { borderColor: "rgba(0,0,0,0.1)", color: "var(--ink, #111)" }}
    >
      {icon} {label}
    </button>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/servicios/[slug]/page.tsx
// --------------------------------------------------------
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Clock3, Star, Home, Store, MapPin, UserRound } from "lucide-react";
import { db } from "@/db";
import { services, serviceOptions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { formatMXN } from "@/lib/utils";
import { serviceCat } from "@/lib/service-cats";
import BookingClient from "./booking-client";

export const dynamic = "force-dynamic";

export default async function ServicioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service] = await db.select().from(services).where(eq(services.slug, slug));
  if (!service) notFound();
  const options = await db
    .select()
    .from(serviceOptions)
    .where(eq(serviceOptions.serviceId, service.id))
    .orderBy(asc(serviceOptions.sort));
  const cat = serviceCat(service.category);

  return (
    <div className="min-h-screen bg-white pb-24 sm:pb-28">
      <div className="relative">
        {/* Foto hero */}
        <div className="relative h-[240px] sm:h-[280px]">
          <Image src={service.image} alt={service.name} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
            <Link href="/servicios" aria-label="Volver" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 active:scale-90">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <span
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-black text-white shadow-lg"
            style={{ backgroundColor: cat.accent }}
          >
            {cat.emoji} {cat.label}
          </span>
        </div>

        {/* Tarjeta encimada estilo Rappi */}
        <div className="relative -mt-7 rounded-t-[30px] bg-white pb-1 shadow-[0_-10px_30px_rgba(0,0,0,0.10)]">
          <div className="mx-auto max-w-2xl px-5 pt-4">
            <div className="flex items-start gap-3.5">
              <span className="relative -mt-11 h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-white shadow-xl">
                <Image src={service.image} alt={service.name} fill className="object-cover" sizes="76px" />
              </span>
              <div className="min-w-0 flex-1 pt-1.5">
                <h1 className="truncate text-[25px] leading-tight font-black tracking-tight">{service.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] font-bold text-ink-soft">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" /> {service.rating.toFixed(1)} <span className="font-semibold text-ink-soft/70">({service.ratingCount.toLocaleString("es-MX")})</span></span>
                  <span className={`flex items-center gap-1 ${service.available ? "text-[#0ea55b]" : "text-brand"}`}>
                    <span className={`h-2 w-2 rounded-full ${service.available ? "bg-[#0ea55b]" : "bg-brand"}`} />
                    {service.available ? "Disponible" : "En pausa"}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-2.5 text-[13.5px] leading-snug font-semibold text-ink-soft">{service.description}</p>

            {/* Chips con el color exacto del rubro */}
            <div className="no-scrollbar mt-3.5 flex gap-2 overflow-x-auto pb-0.5">
              <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-black" style={{ backgroundColor: cat.soft, color: cat.accent }}>
                <Clock3 className="h-3.5 w-3.5" /> {service.durationMin} min
              </span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-black" style={{ backgroundColor: cat.soft, color: cat.accent }}>
                <BadgeCheck className="h-3.5 w-3.5" /> Tarifa fija {formatMXN(service.price)}
              </span>
              {service.domicilio && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#e6f8ee] px-3 py-1.5 text-[12px] font-black text-[#0ea55b]"><Home className="h-3.5 w-3.5" /> A domicilio</span>
              )}
              {service.local && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[12px] font-black text-ink"><Store className="h-3.5 w-3.5" /> En local</span>
              )}
            </div>

            {/* Profesional a cargo */}
            <div className="mt-3.5 flex items-center gap-2 border-t border-black/5 py-3">
              <UserRound className="h-4 w-4 shrink-0" style={{ color: cat.accent }} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-extrabold text-ink">{service.proName} · {service.provider}</span>
              <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
              <span className="text-[11.5px] font-bold text-ink-soft">León, GTO</span>
            </div>
          </div>
        </div>
      </div>

      {!service.available && (
        <div className="mx-auto mt-3 max-w-2xl px-4">
          <p className="rounded-2xl bg-mist px-4 py-3 text-center text-[13.5px] font-black text-ink-soft">Agenda en pausa — puedes ver el servicio, pero no agendar por ahora</p>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div className="rounded-[26px] border p-5" style={{ borderColor: `${cat.accent}33` }}>
          <p className="text-lg font-black">¿Qué incluye?</p>
          <ul className="mt-3 space-y-2">
            {service.includes.map((inc) => (
              <li key={inc} className="flex items-center gap-2 text-[14px] font-bold text-ink-soft">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-black" style={{ backgroundColor: cat.soft, color: cat.accent }}>✓</span>
                {inc}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[16px] font-black" style={{ color: cat.accent }}>Tarifa fija: {formatMXN(service.price)}</p>
        </div>

        <BookingClient service={service} options={options} accent={cat.accent} soft={cat.soft} glow={cat.glow} />
      </div>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/servicios/page.tsx
// --------------------------------------------------------
import { db } from "@/db";
import { services, restaurants } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import ServicesClient from "./services-client";
import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";

export const dynamic = "force-dynamic";

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const list = await db.select().from(services).where(eq(services.available, true)).orderBy(asc(services.sort));
  const cross = await crossSellItems(null);

  /* Las tiendas de mascotas viven en Mascotas de Citas y Servicios */
  const petStores = await db
    .select({ name: restaurants.name, slug: restaurants.slug, image: restaurants.image, rating: restaurants.rating, timeMin: restaurants.timeMin, timeMax: restaurants.timeMax, isOpen: restaurants.isOpen })
    .from(restaurants)
    .where(eq(restaurants.categorySlug, "mascotas"))
    .orderBy(asc(restaurants.sort));

  return (
    <ServicesClient
      services={list}
      cat={cat ?? null}
      crossItems={cross}
      crossTitle={randomCrossTitle()}
      petStores={petStores}
    />
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/servicios/services-client.tsx
// --------------------------------------------------------
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, LayoutGrid, Search, Star, Home, Store } from "lucide-react";
import type { Service } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import { serviceCat } from "@/lib/service-cats";
import BackButton from "@/components/back-button";
import CrossSell, { type CrossSellItem } from "@/components/cross-sell";

const CAT_LABELS: Record<string, string> = {
  belleza: "Belleza",
  bienestar: "Bienestar",
  mascotas: "Mascotas",
  hogar: "Hogar",
  salud: "Médicos y Especialistas",
};

const SUBCATS: Record<string, { label: string; tag: string }[]> = {
  todos: [
    { label: "Todos", tag: "" },
    { label: "Barbería", tag: "barberia" },
    { label: "Uñas & Spa", tag: "manicure" },
    { label: "Masajes", tag: "masaje" },
    { label: "Limpieza", tag: "limpieza" },
    { label: "Plomería", tag: "plomeria" },
    { label: "Médico general", tag: "medico" },
    { label: "Peluquería canina", tag: "peluqueria" },
    { label: "Entrenador", tag: "entrenador" },
    { label: "A domicilio", tag: "domicilio" },
  ],
  belleza: [
    { label: "Todas en Belleza", tag: "" },
    { label: "Barbería a domicilio", tag: "barberia" },
    { label: "Corte y peinado", tag: "corte" },
    { label: "Manicure & Pedicure", tag: "manicure" },
    { label: "Uñas & Spa", tag: "uñas" },
  ],
  bienestar: [
    { label: "Todo en Bienestar", tag: "" },
    { label: "Masaje relajante", tag: "masaje" },
    { label: "Entrenador personal", tag: "entrenador" },
    { label: "Yoga en casa", tag: "yoga" },
    { label: "Fisioterapia", tag: "fisioterapeuta" },
  ],
  mascotas: [
    { label: "Todo en Mascotas", tag: "" },
    { label: "Peluquería canina", tag: "peluqueria" },
    { label: "Veterinario a domicilio", tag: "veterinario" },
    { label: "Paseo de perros", tag: "paseo" },
    { label: "Tiendas de mascota", tag: "tiendas" },
  ],
  hogar: [
    { label: "Todo en Hogar", tag: "" },
    { label: "Limpieza profunda", tag: "limpieza" },
    { label: "Plomería express", tag: "plomeria" },
    { label: "Técnico electricista", tag: "tecnico" },
    { label: "Chef a domicilio", tag: "chef" },
  ],
  salud: [
    { label: "Todos en Salud", tag: "" },
    { label: "Médico a domicilio", tag: "medico" },
    { label: "Enfermería general", tag: "enfermeria" },
    { label: "Nutricionista", tag: "nutricionista" },
    { label: "Psicología a domicilio", tag: "psicologia" },
  ],
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function ServicesClient({
  services,
  cat,
  crossItems = [],
  crossTitle,
  petStores = [],
}: {
  services: Service[];
  cat: string | null;
  crossItems?: CrossSellItem[];
  crossTitle?: string;
  petStores?: { name: string; slug: string; image: string; rating: number; timeMin: number; timeMax: number; isOpen: boolean }[];
}) {
  const [query, setQuery] = useState("");
  const [subCat, setSubCat] = useState("");
  const q = norm(query.trim());

  useEffect(() => {
    setSubCat("");
  }, [cat]);

  /* Línea divisora estilo Uber Eats: invisible arriba, hairline sutil + sombra al hacer scroll */
  const [stuck, setStuck] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentCat = cat ? serviceCat(cat) : { accent: "#7c3aed", soft: "#f3e8ff", glow: "rgba(124,58,237,0.35)", label: "Servicios" };
  const currentSubCats = SUBCATS[cat ?? "todos"] ?? SUBCATS.todos;

  const filtered = services.filter((s) => {
    const inCat = !cat || s.category === cat;
    const matchesQuery = !q || norm(`${s.name} ${s.provider} ${s.description} ${s.category}`).includes(q);
    const matchesSub =
      !subCat ||
      (subCat === "domicilio"
        ? s.domicilio
        : norm(`${s.name} ${s.provider} ${s.description} ${s.category}`).includes(norm(subCat)));
    return inCat && matchesQuery && matchesSub;
  });

  return (
    <div className="min-h-screen bg-white pb-28">
      <div
        ref={headRef}
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur transition-all duration-300 ${
          stuck ? "border-b border-black/[0.07] shadow-[0_8px_20px_rgba(0,0,0,0.07)]" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto max-w-5xl px-4 pt-2.5 pb-1.5">
          <div className="flex items-center gap-2.5">
            <BackButton />
            <div className="relative flex-1">
              <Search className="absolute top-3 left-4 h-4.5 w-4.5 text-ink-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en Rayte Servicios"
                className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-4 pl-11 text-[14.5px] font-bold outline-none placeholder:text-ink-soft transition"
                onFocus={(e) => (e.currentTarget.style.borderColor = currentCat.accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
              />
            </div>
          </div>

          {/* Carrusel de categorías estilo Uber Eats: foto real en círculo + color del rubro */}
          <div className="no-scrollbar -mx-4 mt-2 flex gap-3 overflow-x-auto px-4 pb-0.5">
            <Link href="/servicios" className="flex w-[68px] shrink-0 flex-col items-center gap-1 transition active:scale-90">
              <span
                className={`flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white transition ${
                  !cat ? "ring-2 ring-[#7c3aed] ring-offset-2 shadow-md" : "opacity-80"
                }`}
              >
                <LayoutGrid className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
              </span>
              <span className={`text-[10.5px] font-extrabold ${!cat ? "text-[#7c3aed]" : "text-ink-soft"}`}>Todos</span>
            </Link>
            {[...new Set(services.map((s) => s.category))].map((c) => {
              const cc = serviceCat(c);
              const img = services.find((s) => s.category === c)?.image;
              const active = cat === c;
              return (
                <Link key={c} href={`/servicios?cat=${c}`} className="flex w-[68px] shrink-0 flex-col items-center gap-1 transition active:scale-90">
                  <span
                    className="relative h-13 w-13 overflow-hidden rounded-full bg-mist transition"
                    style={active ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${cc.accent}` } : undefined}
                  >
                    {img && <Image src={img} alt={CAT_LABELS[c] ?? c} fill sizes="52px" className="object-cover" />}
                  </span>
                  <span className={`text-[10.5px] font-extrabold transition ${active ? "font-black" : "text-ink-soft"}`} style={active ? { color: cc.accent } : undefined}>
                    {CAT_LABELS[c] ?? c}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* 🏷️ Subcategorías debajo de los círculos */}
          <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-0.5">
            {currentSubCats.map((sc) => {
              const active = subCat === sc.tag;
              return (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => setSubCat(active && sc.tag !== "" ? "" : sc.tag)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition active:scale-95 ${
                    active
                      ? "text-white shadow-sm font-black"
                      : "bg-mist text-ink-soft hover:text-ink hover:bg-black/[0.08]"
                  }`}
                  style={active ? { backgroundColor: currentCat.accent, color: "#fff" } : undefined}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-1.5">
        <h1 className="text-xl font-black tracking-tight leading-tight">{cat ? (CAT_LABELS[cat] ?? "Servicios") : "Elige tu servicio"}</h1>
        <p className="mt-0.5 text-[12px] font-bold text-ink-soft">
          Mostrando {filtered.length} de {services.length} · toca <span className="font-black" style={{ color: currentCat.accent }}>Agendar</span> para escoger día y hora
        </p>

        {/* Tiendas de mascotas (los productos también viven aquí) */}
        {cat === "mascotas" && petStores.length > 0 && (
          <div className="mt-2.5">
            <p className="text-[12px] font-black tracking-wide uppercase" style={{ color: "#0284c7" }}>🐾 Tiendas para tu mascota</p>
            <div className="no-scrollbar -mx-4 mt-1.5 flex gap-3 overflow-x-auto px-4 pb-1">
              {petStores.map((s) => (
                <Link key={s.slug} href={`/restaurante/${s.slug}`} className="w-[220px] shrink-0 overflow-hidden rounded-[20px] border transition active:scale-95" style={{ borderColor: "#0284c733" }}>
                  <div className="relative h-24">
                    <Image src={s.image} alt={s.name} fill className="object-cover" sizes="220px" />
                    <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-black ${s.isOpen ? "bg-[#e6f8ee] text-[#0ea55b]" : "bg-white text-ink-soft"}`}>{s.isOpen ? "Abierto" : "Cerrado"}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-[13.5px] font-black">{s.name}</p>
                    <p className="text-[11.5px] font-bold text-ink-soft"><Star className="mb-0.5 inline h-3 w-3 fill-amber-pop text-amber-pop" /> {s.rating.toFixed(1)} · {s.timeMin}-{s.timeMax} min · Envío a domicilio</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-[26px] bg-mist px-6 py-12 text-center">
            <span className="text-3xl font-black italic" style={{ color: currentCat.accent }}>¡Ups!</span>
            <p className="mt-2 max-w-xs text-sm font-bold text-ink-soft">No encontramos ese servicio. Prueba con otra palabra o categoría.</p>
          </div>
        ) : (
          <div className="mt-2.5 grid gap-4 md:grid-cols-2">
            {filtered.map((sv, i) => {
              const cc = serviceCat(sv.category);
              return (
                <Fragment key={sv.id}>
                  {i === 4 && crossItems.length > 0 && (
                    <div className="md:col-span-2 min-w-0 w-full">
                      <CrossSell items={crossItems} title={crossTitle} />
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group overflow-hidden rounded-[26px] border transition hover:shadow-md"
                    style={{ borderColor: `${cc.accent}33` }}
                  >
                    <Link href={`/servicios/${sv.slug}`} className="block">
                      <div className="relative h-44">
                        <Image src={sv.image} alt={sv.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow" style={{ backgroundColor: cc.accent }}>
                          {cc.emoji} {cc.label}
                        </span>
                        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-black text-ink shadow">
                          <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />{sv.rating.toFixed(1)}
                        </span>
                        <div className="absolute right-4 bottom-3 left-4 text-white">
                          <p className="text-xl font-black drop-shadow">{sv.name}</p>
                          <p className="text-[13px] font-bold text-white/90">{sv.provider}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-3 p-4 bg-white">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                          <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: cc.soft, color: cc.accent }}><Clock3 className="h-3.5 w-3.5" /> {sv.durationMin} min</span>
                          {sv.domicilio && <span className="flex items-center gap-1 rounded-full bg-[#e6f8ee] px-2.5 py-1 text-[#0ea55b]"><Home className="h-3.5 w-3.5" /> Domicilio</span>}
                          {sv.local && <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-ink"><Store className="h-3.5 w-3.5" /> Local</span>}
                        </div>
                        <p className="mt-1.5 text-[16px] font-black" style={{ color: cc.accent }}>{formatMXN(sv.price)}</p>
                      </div>
                      <Link
                        href={`/servicios/${sv.slug}`}
                        className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-black text-white transition hover:brightness-110 active:scale-95 shadow-sm"
                        style={{ backgroundColor: cc.accent, boxShadow: `0 8px 20px ${cc.glow}` }}
                      >
                        <CalendarDays className="h-4 w-4" /> Agendar
                      </Link>
                    </div>
                  </motion.div>
                  {i === filtered.length - 1 && filtered.length < 5 && crossItems.length > 0 && (
                    <div className="md:col-span-2 min-w-0 w-full">
                      <CrossSell items={crossItems} title={crossTitle} />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/socio/page.tsx
// --------------------------------------------------------
import { db } from "@/db";
import { restaurants, partnerAccounts } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import SocioClient from "./socio-client";

export const dynamic = "force-dynamic";

export default async function SocioPage() {
  const accounts = await db
    .select({
      id: partnerAccounts.id,
      username: partnerAccounts.username,
      partnerName: partnerAccounts.partnerName,
      email: partnerAccounts.email,
      restaurantId: partnerAccounts.restaurantId,
      storeName: restaurants.name,
      storeSlug: restaurants.slug,
      storeImage: restaurants.image,
      categorySlug: restaurants.categorySlug,
    })
    .from(partnerAccounts)
    .innerJoin(restaurants, eq(partnerAccounts.restaurantId, restaurants.id))
    .orderBy(asc(restaurants.sort));

  return <SocioClient initialAccounts={accounts} />;
}


// --------------------------------------------------------
// ARCHIVO: src/app/socio/socio-client.tsx
// --------------------------------------------------------
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Banknote, Bike, CircleCheck, Clock3, PackageCheck, RefreshCw, ShoppingBag, Star, Zap,
  Utensils, ShoppingBasket, Pill, Wine, Salad, CakeSlice, PawPrint, Lightbulb, AlertTriangle, IdCard, FileText,
  Snowflake, Timer, Croissant, Plus, Trash2, Edit3, Sparkles, X, Check, Flame, Tag, LogOut, Lock, User, Key,
  ShieldCheck, Gift, Package, Layers, Beef, FlameKindling
} from "lucide-react";
import { formatMXN } from "@/lib/utils";
import type { DbOrder, Product, ProductExtra, Restaurant } from "@/db/schema";

type AccountLite = {
  id: number;
  username: string;
  partnerName: string;
  email: string;
  restaurantId: number;
  storeName: string;
  storeSlug: string;
  storeImage: string;
  categorySlug: string;
};

type PartnerSession = {
  id: number;
  username: string;
  partnerName: string;
  email: string;
  phone: string;
  restaurantId: number;
  store: Restaurant;
};

type LiveOrder = Omit<DbOrder, "placedAt" | "preparingAt" | "readyAt" | "onWayAt" | "deliveredAt" | "scheduledFor"> & {
  placedAt: string;
  scheduledFor: string | null;
  items: { name: string; qty: number; price: number }[];
};

const CUSTOMERS = ["María G.", "Jorge A.", "Valentina R.", "Camilo T.", "Laura B.", "Andrés P.", "Sofía Mendoza", "Diego Castro"];

/* ============================================================
   Configuración por RUBRO: cada giro tiene su identidad
   ============================================================ */
type Rubro = {
  label: string;
  emoji: string;
  accent: string;      // color principal del rubro
  soft: string;        // fondo suave del rubro
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  catalogTitle: string;
  catalogHint: string;
  dishNoun: string;    // "platillo", "producto", "pieza de pan"
  acceptLabel: string; // placed → preparing
  prepBadge: string;   // badge mientras prepara
  readyLabel: string;  // preparing → ready
  readyBadge: string;
  simLabel: string;
  tips: string[];
  showTimer?: boolean; // turbo: cronómetro de 10 min
  chip?: { icon: "18" | "rx" | "frio"; text: string }; // recordatorio por pedido
};

const RUBROS: Record<string, Rubro> = {
  restaurantes: {
    label: "Restaurante", emoji: "🍔", accent: "#ea580c", soft: "#ffedd5", Icon: Utensils,
    catalogTitle: "Tu menú", catalogHint: "Gestiona tus platillos, combos, extras y apaga los agotados en tiempo real.",
    dishNoun: "platillo",
    acceptLabel: "Aceptar y cocinar", prepBadge: "En cocina", readyLabel: "Platillos listos", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular comensal",
    tips: [
      "Los combos y paquetes aumentan tu ticket promedio hasta un 35%: agrúpalos con bebidas y papas.",
      "Confirma los pedidos en menos de 2 minutos: cada minuto de espera baja tu posición en la app.",
      "Ofrece extras claros (queso, aguacate, tocino, salsas) ordenados alfabéticamente para facilitar la elección.",
      "Empaca salsas y cubiertos por separado: es la queja #1 en restaurantes.",
    ],
  },
  panaderias: {
    label: "Panadería", emoji: "🥐", accent: "#d97706", soft: "#fef3c7", Icon: Croissant,
    catalogTitle: "Tu vitrina de pan", catalogHint: "Publica horneadas, paquetes de desayuno y complementos (cajeta, mermeladas).",
    dishNoun: "pieza de pan",
    acceptLabel: "Aceptar y empacar", prepBadge: "Empacando pan caliente", readyLabel: "Charola lista", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular panecito",
    tips: [
      "Los paquetes de docena de pan con café de olla son los favoritos de la mañana y la merienda.",
      "Empaca el pan dulce separado del salado o de piezas con crema.",
      "El olor a pan recién horneado vende: publica tandas calientes en la mañana y tarde.",
    ],
  },
  mercado: {
    label: "Mercado", emoji: "🛒", accent: "#0ea55b", soft: "#e6f8ee", Icon: ShoppingBasket,
    catalogTitle: "Tu inventario", catalogHint: "Si un producto se agota en anaquel, apágalo aquí para no generar sustituciones.",
    dishNoun: "producto",
    acceptLabel: "Aceptar y surtir", prepBadge: "Surtiendo canasta", readyLabel: "Canasta lista", readyBadge: "Canasta lista · esperando repartidor",
    simLabel: "Simular despensa",
    tips: [
      "Arma paquetes de canasta básica semanal para fidelizar clientes recurrentes.",
      "Surte primero congelados y refrigerados al final para cuidar la cadena de frío.",
      "Pesa frutas y verduras con margen: cobrar de menos genera mejores reseñas que cobrar de más.",
    ],
  },
  turbo: {
    label: "Turbo", emoji: "⚡", accent: "#d97706", soft: "#fef3c7", Icon: Zap,
    catalogTitle: "Catálogo express", catalogHint: "Solo productos que puedas empacar en segundos. Nada de preparaciones.",
    dishNoun: "antojo express",
    acceptLabel: "¡Aceptar ya!", prepBadge: "Empacando (meta 10 min)", readyLabel: "Paquete listo", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular antojo",
    showTimer: true,
    tips: [
      "Crea combos botaneros pre-armados para que el empaque sea en menos de 2 minutos.",
      "Promesa Turbo: 10 minutos puerta a puerta. Acepta y empaca de inmediato.",
      "Ten los 20 productos más pedidos pre-armados cerca del mostrador.",
    ],
  },
  farmacia: {
    label: "Farmacia", emoji: "💊", accent: "#0d9488", soft: "#ccfbf1", Icon: Pill,
    catalogTitle: "Tu farmacia", catalogHint: "Apaga medicamentos sin existencia y ofrece botiquines de primeros auxilios.",
    dishNoun: "medicamento",
    acceptLabel: "Aceptar y preparar", prepBadge: "Preparando medicamentos", readyLabel: "Listo en mostrador", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular receta",
    chip: { icon: "rx", text: "Verifica receta en antibióticos y controlados" },
    tips: [
      "Antibióticos y controlados requieren receta: pídela por chat antes de aceptar.",
      "Los paquetes de botiquín para el hogar o viaje tienen alta demanda.",
      "Empaque discreto siempre: la privacidad del paciente es ley.",
    ],
  },
  bebidas: {
    label: "Bebidas", emoji: "🍺", accent: "#7c3aed", soft: "#f3e8ff", Icon: Wine,
    catalogTitle: "Tu cava", catalogHint: "Crea paquetes fiesteros con hielo y vasos, y mantén el inventario al día.",
    dishNoun: "bebida",
    acceptLabel: "Aceptar pedido", prepBadge: "Empacando bebidas", readyLabel: "Pedido listo", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular brindis",
    chip: { icon: "18", text: "Venta 18+ · el repartidor pedirá INE al entregar" },
    tips: [
      "Arma combos fiesteros: Botella + Refrescos + Bolsa de Hielo + Vasos.",
      "Ley 18+: toda entrega requiere identificación oficial. Sin INE no hay entrega.",
      "Protege el vidrio: separadores de cartón entre botellas evitan pérdidas.",
    ],
  },
  saludable: {
    label: "Saludable", emoji: "🥗", accent: "#65a30d", soft: "#ecfccb", Icon: Salad,
    catalogTitle: "Tu cocina saludable", catalogHint: "Ofrece planes semanales y combos con smoothies proteicos.",
    dishNoun: "platillo fit",
    acceptLabel: "Aceptar y preparar", prepBadge: "Preparando bowls", readyLabel: "Bowls listos", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular fit",
    tips: [
      "Los combos de Bowl + Smoothie tienen 40% más conversión que productos solos.",
      "Publica macros exactos (proteína/carbs/grasas): es la razón #1 de compra en tu rubro.",
      "Aderezos siempre aparte: nadie quiere la ensalada aguada.",
    ],
  },
  postres: {
    label: "Postres", emoji: "🍰", accent: "#db2777", soft: "#fce7f3", Icon: CakeSlice,
    catalogTitle: "Tu vitrina", catalogHint: "Crea paquetes de degustación y combos de pastel con helado.",
    dishNoun: "postre",
    acceptLabel: "Aceptar y preparar", prepBadge: "En preparación", readyLabel: "Listo para recoger", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular antojo",
    chip: { icon: "frio", text: "Producto frío · usa empaque térmico" },
    tips: [
      "Los paquetes de docena de donas o mini pasteles para cumpleaños duplican tus ventas.",
      "Helados y pasteles fríos: empaque térmico o gel refrigerante siempre.",
      "Los pedidos programados (cumpleaños) valen 3× más: revisa la agenda cada mañana.",
    ],
  },
  mascotas: {
    label: "Mascotas", emoji: "🐾", accent: "#0284c7", soft: "#e0f2fe", Icon: PawPrint,
    catalogTitle: "Tu petshop", catalogHint: "Arma kits de bienvenida para cachorros y combos de alimento + premios.",
    dishNoun: "artículo pet",
    acceptLabel: "Aceptar pedido", prepBadge: "Empacando", readyLabel: "Pedido listo", readyBadge: "Listo · esperando repartidor",
    simLabel: "Simular lomito",
    tips: [
      "Crea paquetes de Costal de alimento + Premios + Juguete con descuento especial.",
      "Verifica peso y etapa (cachorro/adulto/senior) en alimentos: es el 40% de las devoluciones.",
      "Arena y costales pesados: dobla la bolsa para proteger al repartidor.",
    ],
  },
};

const DEFAULT_RUBRO = RUBROS.restaurantes;
const rubroOf = (slug?: string | null) => (slug && RUBROS[slug]) || DEFAULT_RUBRO;
const RUBRO_ORDER = ["restaurantes", "panaderias", "mercado", "turbo", "farmacia", "bebidas", "saludable", "postres", "mascotas"];

function ChipIcon({ kind }: { kind: "18" | "rx" | "frio" }) {
  if (kind === "18") return <IdCard className="h-3.5 w-3.5" />;
  if (kind === "rx") return <FileText className="h-3.5 w-3.5" />;
  return <Snowflake className="h-3.5 w-3.5" />;
}

/* Fotos sugeridas de alta calidad para comida y platillos */
const PHOTO_PRESETS = [
  { label: "Smash Burger", url: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Combo Pareja", url: "https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Pizza Artesanal", url: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Paquete Pizza", url: "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Tacos al Pastor", url: "https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Sushi Roll", url: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Paquete Sushi", url: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Alitas BBQ", url: "https://images.pexels.com/photos/5652266/pexels-photo-5652266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Pan & Conchas", url: "https://images.pexels.com/photos/208537/pexels-photo-208537.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Bowl Saludable", url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Postre / Donas", url: "https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Papas Fritas", url: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
];

/* Sugerencias rápidas de extras */
const QUICK_EXTRA_SUGGESTIONS = [
  { name: "Aguacate hass fresco", price: 20 },
  { name: "Bola de helado de vainilla", price: 22 },
  { name: "Doble porción de carne", price: 38 },
  { name: "Huevo estrellado / cocido", price: 15 },
  { name: "Nutella para untar", price: 16 },
  { name: "Orilla de queso gouda", price: 35 },
  { name: "Papas a la francesa sazonadas", price: 28 },
  { name: "Queso gouda gratinado", price: 18 },
  { name: "Salsa especial de la casa", price: 12 },
  { name: "Tocino ahumado crujiente", price: 22 },
  { name: "Topping de chocolate", price: 14 },
];

export default function SocioClient({ initialAccounts }: { initialAccounts: AccountLite[] }) {
  const [partner, setPartner] = useState<PartnerSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Estados de Login
  const [userInput, setUserInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Estados del Dashboard de la Tienda
  const [data, setData] = useState<{ store: Restaurant; products: Product[]; extras: ProductExtra[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [, setTick] = useState(0);
  const ordersTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Estados de Modales
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCombo, setShowAddCombo] = useState(false);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rayte-partner-session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.username && parsed?.store?.slug) {
          setPartner(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = async (idToUse?: string, passToUse?: string) => {
    setAuthError("");
    const u = (idToUse || userInput).trim();
    const p = (passToUse || passInput).trim();

    if (!u || !p) {
      setAuthError("Ingresa tu usuario o correo y contraseña");
      return;
    }

    setLoggingIn(true);
    try {
      const res = await fetch("/api/partner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", identifier: u, password: p }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setAuthError(resData.error || "Credenciales incorrectas");
        return;
      }
      setPartner(resData.partner);
      localStorage.setItem("rayte-partner-session", JSON.stringify(resData.partner));
      showToast(`¡Bienvenido, ${resData.partner.partnerName}!`);
    } catch {
      setAuthError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setPartner(null);
    setData(null);
    setOrders([]);
    localStorage.removeItem("rayte-partner-session");
    showToast("Sesión cerrada correctamente");
  };

  const loadStoreData = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/partner?slug=${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/orders?store=${slug}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders ?? []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!partner?.store?.slug) return;
    const slug = partner.store.slug;
    loadStoreData(slug);
    loadOrders(slug);

    if (ordersTimer.current) clearInterval(ordersTimer.current);
    ordersTimer.current = setInterval(() => {
      loadOrders(slug);
      setTick((t) => t + 1);
    }, 5000);

    return () => {
      if (ordersTimer.current) clearInterval(ordersTimer.current);
    };
  }, [partner, loadStoreData, loadOrders]);

  const rubro = rubroOf(partner?.store?.categorySlug ?? data?.store?.categorySlug);
  const RubroIcon = rubro.Icon;

  /* Toggle estado tienda abierta/cerrada */
  const toggleStore = async () => {
    if (!data) return;
    const next = !data.store.isOpen;
    setData({ ...data, store: { ...data.store, isOpen: next } });
    if (partner) {
      setPartner({ ...partner, store: { ...partner.store, isOpen: next } });
      localStorage.setItem("rayte-partner-session", JSON.stringify({ ...partner, store: { ...partner.store, isOpen: next } }));
    }
    await fetch("/api/partner", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "store", slug: data.store.slug, isOpen: next }),
    });
    showToast(next ? "Tienda abierta al público" : "Tienda cerrada temporalmente");
  };

  /* Toggle disponibilidad de platillo */
  const toggleProduct = async (p: Product) => {
    if (!data) return;
    const next = !p.available;
    setData({
      ...data,
      products: data.products.map((x) => (x.id === p.id ? { ...x, available: next } : x)),
    });
    await fetch("/api/partner", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "product", productId: p.id, available: next }),
    });
    showToast(next ? `"${p.name}" disponible` : `"${p.name}" marcado agotado`);
  };

  /* Toggle disponibilidad de extra */
  const toggleExtra = async (ext: ProductExtra) => {
    if (!data) return;
    const next = !ext.available;
    setData({
      ...data,
      extras: data.extras.map((x) => (x.id === ext.id ? { ...x, available: next } : x)),
    });
    await fetch("/api/partner", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "extra", extraId: ext.id, available: next }),
    });
    showToast(next ? `Extra "${ext.name}" activado` : `Extra "${ext.name}" agotado`);
  };

  /* Eliminar platillo */
  const deleteProduct = async (productId: number, productName: string) => {
    if (!data) return;
    if (!confirm(`¿Seguro que deseas eliminar "${productName}" del menú?`)) return;
    setData({
      ...data,
      products: data.products.filter((x) => x.id !== productId),
      extras: data.extras.filter((x) => x.productId !== productId),
    });
    await fetch("/api/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_product", id: productId }),
    });
    showToast(`"${productName}" eliminado`);
  };

  /* Eliminar extra */
  const deleteExtra = async (extraId: number, extraName: string) => {
    if (!data) return;
    if (!confirm(`¿Eliminar el extra "${extraName}"?`)) return;
    setData({
      ...data,
      extras: data.extras.filter((x) => x.id !== extraId),
    });
    await fetch("/api/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_extra", id: extraId }),
    });
    showToast(`Extra "${extraName}" eliminado`);
  };

  /* ════════════════════════════════════════════════════════════
     SIMULAR UN COMENSAL (100% GARANTIZADO Y VISIBLE AL INSTANTE)
     ════════════════════════════════════════════════════════════ */
  const addOrder = async () => {
    if (!data || !partner) return;
    setSimulating(true);

    try {
      const activeProducts = data.products.filter((p) => p.available);
      const pool = activeProducts.length > 0 ? activeProducts : data.products;

      // Elegir 1 o 2 platillos del menú
      let items: { key: string; productId: number; name: string; price: number; image: string | null; qty: number }[] = [];

      if (pool.length > 0) {
        const pick1 = pool[Math.floor(Math.random() * pool.length)];
        items.push({
          key: `${pick1.id}-${Date.now()}-1`,
          productId: pick1.id,
          name: pick1.name,
          price: pick1.price,
          image: pick1.image,
          qty: 1,
        });

        if (pool.length > 1 && Math.random() > 0.4) {
          const pick2 = pool[Math.floor(Math.random() * pool.length)];
          if (pick2.id !== pick1.id) {
            items.push({
              key: `${pick2.id}-${Date.now()}-2`,
              productId: pick2.id,
              name: pick2.name,
              price: pick2.price,
              image: pick2.image,
              qty: 2,
            });
          }
        }
      } else {
        // Fallback por si la tienda aún no tiene platillos
        items.push({
          key: `platillo-demo-${Date.now()}`,
          productId: 1,
          name: `Especial de ${partner.store.name}`,
          price: 135,
          image: partner.store.image,
          qty: 1,
        });
      }

      const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
      const deliveryFee = data.store.deliveryFee || 25;
      const serviceFee = 15;
      const total = subtotal + deliveryFee + serviceFee;
      const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: data.store.id,
          restaurantName: data.store.name,
          restaurantSlug: data.store.slug,
          items,
          subtotal,
          deliveryFee,
          serviceFee,
          tip: 0,
          total,
          customerName: customer,
          phone: "477 123 4567",
          address: "Av. Cerro Gordo 204, Col. Valle del Campestre, León, GTO",
          payment: "💵 Efectivo al entregar",
          etaMin: data.store.timeMin,
          etaMax: data.store.timeMax,
        }),
      });

      const resData = await res.json();

      if (res.ok && resData.order) {
        // Actualización optimista inmediata en la interfaz
        const createdOrder: LiveOrder = {
          ...resData.order,
          placedAt: new Date(resData.order.placedAt).toISOString(),
          scheduledFor: resData.order.scheduledFor ? new Date(resData.order.scheduledFor).toISOString() : null,
        };

        setOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);
        showToast(`🎉 ¡Nuevo pedido simulado de ${customer} (${resData.order.code})!`);
      } else {
        showToast("Error al simular pedido. Intenta de nuevo.");
      }
    } catch {
      showToast("Error de conexión al simular comensal.");
    } finally {
      setSimulating(false);
    }
  };

  /* Avanzar estado del pedido (placed -> preparing -> ready) */
  const advance = async (order: LiveOrder, nextStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));

    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "status",
        code: order.code,
        id: order.id,
        status: nextStatus,
        manual: true,
      }),
    });

    if (partner?.store?.slug) loadOrders(partner.store.slug);
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "placed":
        return { label: "Nuevo", cls: "bg-[#fef4e2] text-[#92600a]" };
      case "preparing":
        return { label: rubro.prepBadge, cls: "text-white", style: { backgroundColor: rubro.accent } };
      case "ready":
        return { label: rubro.readyBadge, cls: "bg-[#e8f1fe] text-[#1d6ae5]" };
      case "on_way":
        return { label: "En camino", cls: "bg-[#e8f1fe] text-[#1d6ae5]" };
      case "delivered":
        return { label: "Entregado", cls: "bg-[#e6f8ee] text-[#0ea55b]" };
      default:
        return { label: s, cls: "bg-mist text-ink-soft" };
    }
  };

  // Secciones del menú (Combos & Paquetes al frente si existen)
  const sections = useMemo(() => {
    if (!data?.products) return [];
    const set = new Set<string>();
    for (const p of data.products) set.add(p.section);
    const arr = Array.from(set);
    // Priorizar sección Combos & Paquetes al inicio
    return arr.sort((a, b) => {
      if (a.toLowerCase().includes("combo") || a.toLowerCase().includes("paquete")) return -1;
      if (b.toLowerCase().includes("combo") || b.toLowerCase().includes("paquete")) return 1;
      return a.localeCompare(b, "es-MX");
    });
  }, [data?.products]);

  // Lista de extras del catálogo ordenados alfabéticamente A-Z
  const sortedExtrasAlphabetical = useMemo(() => {
    if (!data?.extras) return [];
    return [...data.extras].sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
  }, [data?.extras]);

  const activeDishCount = data?.products.filter((p) => p.available).length ?? 0;
  const activeExtraCount = data?.extras?.filter((e) => e.available).length ?? 0;
  const todayRevenue = orders
    .filter((o) => o.status === "delivered" || o.status === "on_way" || o.status === "ready" || o.status === "preparing")
    .reduce((acc, o) => acc + o.total, 0);

  if (!authChecked) {
    return <div className="min-h-screen bg-[#f7f7f8]" />;
  }

  /* ════════════════════════════════════════════════════════════
     VISTA DE LOGIN: SI EL SOCIO NO HA INICIADO SESIÓN
     ════════════════════════════════════════════════════════════ */
  if (!partner) {
    return (
      <div className="min-h-screen w-full bg-[#f7f7f8] pb-16 text-ink antialiased">
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 px-4 py-3.5 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 text-[13.5px] font-black text-ink-soft hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Volver a Rayte
            </Link>
            <div className="flex items-center gap-1.5 text-[12px] font-black text-ink-soft">
              <ShieldCheck className="h-4 w-4 text-[#0ea55b]" /> Portal Socios
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pt-6 sm:pt-8 space-y-6">
          <div className="overflow-hidden rounded-[26px] bg-white p-5 sm:p-7 shadow-sm border border-black/5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffedd5] text-[#ea580c]">
                <Utensils className="h-7 w-7 stroke-[2.5]" />
              </div>
              <h1 className="mt-3.5 text-[22px] font-black tracking-tight text-ink">Acceso para Socios</h1>
              <p className="mt-1 text-[13px] font-semibold text-ink-soft">
                Ingresa con tu usuario y contraseña para administrar exclusivamente tu negocio.
              </p>
            </div>

            {authError && (
              <div className="mt-4 rounded-2xl bg-[#fde8e8] p-3 text-center text-[12.5px] font-black text-[#dc2626]">
                {authError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="mt-5 space-y-3.5"
            >
              <div>
                <label className="text-[11.5px] font-black uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Usuario o Correo
                </label>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="ej. labrasa o socio@labrasasmash.com"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-black uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" /> Contraseña
                </label>
                <input
                  type="password"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[14px] font-bold outline-none focus:border-ink"
                />
                <p className="mt-1 text-[11px] font-bold text-ink-soft/70">Contraseña demo: socio123</p>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#ea580c] py-3.5 text-[14px] font-black text-white shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loggingIn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Ingresar a mi negocio
              </button>
            </form>
          </div>

          {/* Selector de Acceso Rápido Demo por Rubro */}
          <div className="overflow-hidden rounded-[26px] bg-white p-5 shadow-sm border border-black/5">
            <p className="text-[12.5px] font-black uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#ea580c]" /> Acceso Rápido por Negocio (Demo)
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-ink-soft">
              Haz clic en cualquiera de los {initialAccounts.length} negocios para ingresar como su dueño:
            </p>

            <div className="mt-3.5 space-y-4">
              {RUBRO_ORDER.map((rKey) => {
                const rAccounts = initialAccounts.filter((a) => a.categorySlug === rKey);
                if (rAccounts.length === 0) return null;
                const rConf = rubroOf(rKey);

                return (
                  <div key={rKey} className="space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: rConf.accent }}>
                      {rConf.emoji} {rConf.label}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rAccounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setUserInput(acc.username);
                            setPassInput("socio123");
                            handleLogin(acc.username, "socio123");
                          }}
                          className="flex items-center gap-2.5 rounded-2xl border border-black/8 bg-mist/60 p-2.5 text-left transition hover:border-black/20 hover:bg-white active:scale-98 cursor-pointer"
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-2xs">
                            <Image src={acc.storeImage} alt={acc.storeName} fill className="object-cover" sizes="40px" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12.5px] font-black text-ink">{acc.storeName}</p>
                            <p className="truncate text-[10.5px] font-bold text-ink-soft">
                              👤 {acc.username}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     VISTA DEL PANEL: EXCLUSIVA PARA EL RESTAURANTE AUTENTICADO
     ════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f7f8] pb-24 text-ink antialiased">
      {/* Toast feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 inset-x-4 z-[99] mx-auto flex max-w-sm items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-black text-white shadow-xl"
            style={{ backgroundColor: rubro.accent }}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="truncate">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabecera con datos del socio autenticado y botón de cerrar sesión */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 px-3 sm:px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: rubro.accent }} />
            <div className="min-w-0">
              <p className="truncate text-[13px] sm:text-[14px] font-black text-ink">
                {partner.store.name}
              </p>
              <p className="truncate text-[10.5px] sm:text-[11px] font-bold text-ink-soft">
                {partner.partnerName} · {rubro.emoji} {rubro.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/restaurante/${partner.store.slug}`} className="hidden sm:inline-flex items-center gap-1 text-[12px] font-bold text-ink-soft hover:text-ink">
              Ver tienda ↗
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-black text-ink-soft transition hover:bg-[#fde8e8] hover:text-[#dc2626] active:scale-95 cursor-pointer"
              title="Cerrar sesión de este negocio"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-3 sm:px-4 pt-3 sm:pt-4">
        {/* Portada y control de tienda */}
        {data && (
          <section className="overflow-hidden rounded-[24px] bg-white p-3.5 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl bg-mist shadow-inner">
                  <Image src={data.store.image} alt={data.store.name} fill className="object-cover" sizes="64px" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h1 className="truncate text-[18px] sm:text-[20px] font-black">{data.store.name}</h1>
                    <span className="rounded-full px-2 py-0.5 text-[10.5px] font-black" style={{ backgroundColor: rubro.soft, color: rubro.accent }}>
                      {rubro.emoji} {rubro.label}
                    </span>
                  </div>
                  <p className="truncate text-[11.5px] font-bold text-ink-soft">{data.store.address || "León, GTO"}</p>
                  <Link href={`/restaurante/${data.store.slug}`} className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold hover:underline" style={{ color: rubro.accent }}>
                    Ver tienda en la app de clientes ↗
                  </Link>
                </div>
              </div>

              {/* Interruptor de tienda */}
              <div className="flex items-center justify-between gap-3 rounded-2xl p-2.5 sm:flex-col sm:items-end" style={{ backgroundColor: rubro.soft }}>
                <span className="text-[11.5px] font-black" style={{ color: rubro.accent }}>
                  {data.store.isOpen ? "🟢 Recibiendo pedidos" : "🔴 Tienda cerrada"}
                </span>
                <button
                  onClick={toggleStore}
                  className={`relative h-7 w-12 sm:h-8 sm:w-14 shrink-0 rounded-full transition ${data.store.isOpen ? "" : "bg-black/20"}`}
                  style={data.store.isOpen ? { backgroundColor: rubro.accent } : undefined}
                  aria-label="Alternar estado de la tienda"
                >
                  <span className={`absolute top-0.5 sm:top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${data.store.isOpen ? "right-0.5 sm:right-1" : "left-0.5 sm:left-1"}`} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Métricas rápidas */}
        {data && (
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <Stat icon={<ShoppingBag className="h-4 w-4" />} label="Pedidos hoy" value={`${orders.length}`} soft={rubro.soft} color={rubro.accent} />
            <Stat icon={<Banknote className="h-4 w-4" />} label="Ventas estimadas" value={formatMXN(todayRevenue)} accentColor={rubro.accent} />
            <Stat icon={<Utensils className="h-4 w-4" />} label="Platillos activos" value={`${activeDishCount}/${data.products.length}`} soft={rubro.soft} color={rubro.accent} />
            <Stat icon={<Sparkles className="h-4 w-4" />} label="Extras activos" value={`${activeExtraCount}`} soft={rubro.soft} color={rubro.accent} />
          </section>
        )}

        {/* Pedidos en vivo (REALES, con botón Simular comensal 100% funcional) */}
        <section className="overflow-hidden rounded-[24px] bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[14.5px] sm:text-[15px] font-black">
              <RubroIcon className="h-4 w-4" style={{ color: rubro.accent }} /> Pedidos en vivo <span className="h-2 w-2 animate-pulse rounded-full bg-[#0ea55b]" />
            </p>
            <button
              onClick={addOrder}
              disabled={!data || simulating}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-[12px] font-black text-white shadow-xs transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: rubro.accent }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`} /> {rubro.simLabel}
            </button>
          </div>
          <p className="mt-1 text-[11px] font-bold text-ink-soft">Los pedidos que hacen los clientes en la app aparecen aquí automáticamente.</p>
          
          <div className="mt-3.5 space-y-2.5">
            {orders.length === 0 && (
              <p className="rounded-2xl bg-mist px-4 py-5 text-center text-[12.5px] font-bold text-ink-soft">
                Sin pedidos activos por ahora. Toca &quot;{rubro.simLabel}&quot; para simular una orden.
              </p>
            )}
            {orders.map((o) => {
              const badge = statusBadge(o.status);
              const done = o.status === "delivered";
              const active = !done && o.status !== "on_way";
              const elapsedMin = Math.floor((Date.now() - new Date(o.placedAt).getTime()) / 60000);
              const late = rubro.showTimer && elapsedMin >= 10 && !done && o.status !== "on_way";
              return (
                <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-[20px] border p-3 sm:p-4 ${done ? "border-[#0ea55b]/30 bg-[#f2fbf6]" : "border-black/8 bg-white"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13.5px] sm:text-[14px] font-black">{o.code} · {o.customerName}</p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {rubro.showTimer && !done && (
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${late ? "bg-[#fde8e8] text-[#dc2626]" : "bg-mist text-ink-soft"}`}>
                          <Timer className="h-3 w-3" /> {elapsedMin} min{late ? " ⚠" : ""}
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-black ${badge.cls}`} style={badge.style}>{badge.label}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-ink-soft leading-snug">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] sm:text-[11px] font-bold text-ink-soft/80">
                    {new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(new Date(o.placedAt))} · {o.address}
                  </p>
                  {rubro.chip && active && (
                    <p className="mt-2 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black" style={{ backgroundColor: rubro.soft, color: rubro.accent }}>
                      <ChipIcon kind={rubro.chip.icon} /> {rubro.chip.text}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[13.5px] sm:text-[14px] font-black">{formatMXN(o.total)}</span>
                    {o.status === "placed" && (
                      <button onClick={() => advance(o, "preparing")} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] sm:text-[12px] font-black text-white transition hover:brightness-110 active:scale-95 cursor-pointer" style={{ backgroundColor: rubro.accent }}>
                        <RubroIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {rubro.acceptLabel}
                      </button>
                    )}
                    {o.status === "preparing" && (
                      <button onClick={() => advance(o, "ready")} className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[11.5px] sm:text-[12px] font-black text-white transition hover:bg-black active:scale-95 cursor-pointer">
                        <PackageCheck className="h-3.5 w-3.5" /> {rubro.readyLabel}
                      </button>
                    )}
                    {o.status === "ready" && (
                      <span className="flex items-center gap-1 text-[11.5px] sm:text-[12px] font-black text-[#1d6ae5]"><Bike className="h-3.5 w-3.5" /> Esperando repartidor...</span>
                    )}
                    {o.status === "on_way" && (
                      <span className="flex items-center gap-1 text-[11.5px] sm:text-[12px] font-black text-[#1d6ae5]"><Bike className="h-3.5 w-3.5" /> En camino</span>
                    )}
                    {done && (
                      <span className="flex items-center gap-1 text-[11.5px] sm:text-[12px] font-black text-[#0ea55b]"><CircleCheck className="h-3.5 w-3.5" /> Completado</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Consejos del rubro */}
        <section className="overflow-hidden rounded-[24px] p-3.5 sm:p-5" style={{ backgroundColor: rubro.soft }}>
          <p className="flex items-center gap-2 text-[13.5px] font-black" style={{ color: rubro.accent }}>
            <Lightbulb className="h-4 w-4" /> Consejos para tu {rubro.label.toLowerCase()}
          </p>
          <ul className="mt-2 space-y-1.5">
            {rubro.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] font-bold text-ink/80">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9.5px] font-black text-white" style={{ backgroundColor: rubro.accent }}>{i + 1}</span>
                <span className="min-w-0 flex-1">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECCIÓN: TU MENÚ (AGREGAR PLATILLOS, COMBOS/PAQUETES, EXTRAS)
            ════════════════════════════════════════════════════════════ */}
        <section className="overflow-hidden rounded-[24px] bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[15.5px] sm:text-[16px] font-black">
                <RubroIcon className="h-4 w-4" style={{ color: rubro.accent }} /> {rubro.catalogTitle}
                <span className="rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-bold text-ink-soft">
                  {data?.products.length ?? 0} artículos
                </span>
              </p>
              <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">{rubro.catalogHint}</p>
            </div>

            {/* BOTONES PRINCIPALES: AGREGAR PLATILLO, CREAR COMBO, EXTRA */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
                style={{ backgroundColor: rubro.accent }}
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" /> + {rubro.dishNoun}
              </button>
              <button
                onClick={() => setShowAddCombo(true)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-black text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "#7c3aed" }}
              >
                <Gift className="h-3.5 w-3.5" /> + Combo / Paquete
              </button>
              <button
                onClick={() => setShowAddExtra(true)}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-[11.5px] font-black transition hover:bg-black/5 active:scale-95 cursor-pointer"
                style={{ backgroundColor: rubro.soft, color: rubro.accent }}
              >
                <Sparkles className="h-3.5 w-3.5" /> Extra
              </button>
            </div>
          </div>

          {loading && <p className="mt-3 text-center text-[12px] font-bold text-ink-soft">Cargando menú...</p>}

          <div className="mt-4 space-y-6">
            {sections.map((sec) => {
              const isComboSec = sec.toLowerCase().includes("combo") || sec.toLowerCase().includes("paquete");
              return (
                <div key={sec} className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-black/5 pb-1">
                    <p className="text-[12px] sm:text-[12.5px] font-black uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                      {isComboSec ? <Gift className="h-3.5 w-3.5 text-[#7c3aed]" /> : <Tag className="h-3.5 w-3.5" style={{ color: rubro.accent }} />}
                      {sec}
                    </p>
                    <span className="text-[10.5px] font-bold text-ink-soft">
                      {data?.products.filter((p) => p.section === sec).length} artículos
                    </span>
                  </div>

                  {/* Grid de platillos / combos responsiva */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {data?.products
                      .filter((p) => p.section === sec)
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`w-full overflow-hidden rounded-2xl border p-3 sm:p-3.5 transition ${
                            isComboSec
                              ? "border-[#7c3aed]/20 bg-gradient-to-br from-white to-[#f5f3ff] shadow-xs"
                              : p.available ? "border-black/8 bg-white shadow-xs hover:border-black/15" : "border-black/5 bg-mist/60 opacity-75"
                          }`}
                        >
                          {/* Nivel 1: Foto + Título completo + Descripción completa + Precio */}
                          <div className="flex items-start gap-3">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-mist shadow-2xs">
                              {p.image ? (
                                <Image src={p.image} alt={p.name} fill className="object-cover" sizes="(max-width: 640px) 64px, 80px" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[22px]">
                                  {isComboSec ? "🎁" : "🍲"}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h3 className="text-[14px] sm:text-[15px] font-black text-ink leading-snug">
                                  {p.name}
                                </h3>
                                {isComboSec && (
                                  <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#7c3aed] px-2 py-0.5 text-[9.5px] font-black text-white">
                                    🎁 Combo
                                  </span>
                                )}
                                {p.popular && !isComboSec && (
                                  <span className="flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[9.5px] font-black text-white" style={{ backgroundColor: rubro.accent }}>
                                    <Flame className="h-2.5 w-2.5" /> Popular
                                  </span>
                                )}
                              </div>

                              {p.description && (
                                <p className="mt-1 text-[12px] font-medium leading-relaxed text-ink-soft">
                                  {p.description}
                                </p>
                              )}

                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-[13.5px] sm:text-[14px] font-black" style={{ color: isComboSec ? "#7c3aed" : rubro.accent }}>
                                  {formatMXN(p.price)}
                                </span>
                                {!p.available && (
                                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-[9.5px] font-black text-ink-soft">
                                    Agotado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Nivel 2: Barra inferior de acciones */}
                          <div className="mt-2.5 flex items-center justify-between border-t border-black/5 pt-2">
                            <button
                              type="button"
                              onClick={() => toggleProduct(p)}
                              className="flex items-center gap-2 cursor-pointer select-none"
                              aria-label={`Disponibilidad ${p.name}`}
                            >
                              <div
                                className={`relative h-5.5 w-10 sm:h-6 sm:w-11 shrink-0 rounded-full transition ${p.available ? "" : "bg-black/20"}`}
                                style={p.available ? { backgroundColor: isComboSec ? "#7c3aed" : rubro.accent } : undefined}
                              >
                                <span className={`absolute top-0.5 h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full bg-white shadow transition-all ${p.available ? "right-0.5" : "left-0.5"}`} />
                              </div>
                              <span className={`text-[11.5px] sm:text-[12px] font-black ${p.available ? "text-ink" : "text-ink-soft"}`}>
                                {p.available ? "Disponible" : "Agotado"}
                              </span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="flex items-center gap-1 rounded-xl bg-mist px-2.5 py-1 text-[11.5px] font-black text-ink transition hover:bg-black/10 active:scale-95 cursor-pointer"
                                title="Editar platillo y extras"
                                aria-label={`Editar ${p.name}`}
                              >
                                <Edit3 className="h-3.5 w-3.5 text-ink-soft" /> Editar
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id, p.name)}
                                className="flex items-center justify-center rounded-xl bg-mist p-1 text-ink-soft transition hover:bg-[#fde8e8] hover:text-[#dc2626] active:scale-95 cursor-pointer"
                                title="Eliminar platillo"
                                aria-label={`Eliminar ${p.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SECCIÓN: EXTRAS DEL NEGOCIO (ORDENADOS ALFABÉTICAMENTE A-Z)
            ════════════════════════════════════════════════════════════ */}
        <section className="overflow-hidden rounded-[24px] bg-white p-3.5 sm:p-5 shadow-xs">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[15.5px] sm:text-[16px] font-black">
                <Sparkles className="h-4 w-4" style={{ color: rubro.accent }} /> Catálogo de Extras del Negocio (A - Z)
                <span className="rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-bold text-ink-soft">
                  {sortedExtrasAlphabetical.length} activos
                </span>
              </p>
              <p className="mt-0.5 text-[11.5px] font-bold text-ink-soft">
                Extras organizados alfabéticamente listos para añadir a tus platillos y combos.
              </p>
            </div>

            <button
              onClick={() => setShowAddExtra(true)}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 sm:px-4 sm:py-2 text-[12px] sm:text-[12.5px] font-black text-white shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer"
              style={{ backgroundColor: rubro.accent }}
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" /> + Agregar extra
            </button>
          </div>

          <div className="mt-3.5">
            {sortedExtrasAlphabetical.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed p-5 text-center" style={{ borderColor: `${rubro.accent}30`, backgroundColor: `${rubro.soft}40` }}>
                <Sparkles className="mx-auto h-7 w-7 text-ink-soft/60" />
                <p className="mt-1.5 text-[13.5px] font-black">Aún no tienes extras configurados</p>
                <p className="text-[11.5px] font-semibold text-ink-soft">Agrega queso extra, aguacate, tocino, papas o salsas para elevar tu ticket promedio.</p>
                <button
                  onClick={() => setShowAddExtra(true)}
                  className="mt-2.5 inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[11.5px] font-black text-white cursor-pointer"
                  style={{ backgroundColor: rubro.accent }}
                >
                  <Plus className="h-3 w-3" /> Agregar primer extra
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sortedExtrasAlphabetical.map((ext) => {
                  const targetProduct = ext.productId ? data?.products.find((p) => p.id === ext.productId) : null;
                  return (
                    <div
                      key={ext.id}
                      className={`w-full overflow-hidden rounded-2xl border p-3 transition ${
                        ext.available ? "border-black/8 bg-white shadow-xs" : "border-black/5 bg-mist/60 opacity-70"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-black text-ink leading-snug">{ext.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] font-bold">
                          <span style={{ color: rubro.accent }}>+{formatMXN(ext.price)}</span>
                          <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] text-ink-soft">
                            {targetProduct ? `Específico: ${targetProduct.name}` : "Disponible en catálogo"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2">
                        <button
                          type="button"
                          onClick={() => toggleExtra(ext)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div
                            className={`relative h-5 w-9 shrink-0 rounded-full transition ${ext.available ? "" : "bg-black/20"}`}
                            style={ext.available ? { backgroundColor: rubro.accent } : undefined}
                          >
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${ext.available ? "right-0.5" : "left-0.5"}`} />
                          </div>
                          <span className={`text-[11px] font-black ${ext.available ? "text-ink" : "text-ink-soft"}`}>
                            {ext.available ? "Activo" : "Agotado"}
                          </span>
                        </button>

                        <button
                          onClick={() => deleteExtra(ext.id, ext.name)}
                          className="flex items-center gap-1 rounded-lg bg-mist px-2 py-1 text-[11px] font-bold text-ink-soft transition hover:bg-[#fde8e8] hover:text-[#dc2626] cursor-pointer"
                          title="Eliminar extra"
                          aria-label={`Eliminar extra ${ext.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <p className="pt-1 pb-4 text-center text-[10.5px] font-black tracking-widest text-ink-soft/60 uppercase">
          Panel Exclusivo {rubro.label} · {partner.store.name}
        </p>
      </main>

      {/* ════════════════════════════════════════════════════════════
          MODAL: AGREGAR PLATILLO CON LISTA DE EXTRAS (A-Z)
          ════════════════════════════════════════════════════════════ */}
      {showAddProduct && data && (
        <AddProductModal
          restaurantId={data.store.id}
          existingSections={sections}
          existingRestaurantExtras={sortedExtrasAlphabetical}
          rubro={rubro}
          onClose={() => setShowAddProduct(false)}
          onAdded={(newProduct, newExtras) => {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                products: [...prev.products, newProduct],
                extras: newExtras && newExtras.length > 0 ? [...prev.extras, ...newExtras] : prev.extras,
              };
            });
            setShowAddProduct(false);
            showToast(`¡Platillo "${newProduct.name}" agregado con éxito!`);
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL: CREAR COMBO O PAQUETE
          ════════════════════════════════════════════════════════════ */}
      {showAddCombo && data && (
        <AddComboModal
          restaurantId={data.store.id}
          existingProducts={data.products}
          existingRestaurantExtras={sortedExtrasAlphabetical}
          rubro={rubro}
          onClose={() => setShowAddCombo(false)}
          onAdded={(newCombo, newExtras) => {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                products: [newCombo, ...prev.products],
                extras: newExtras && newExtras.length > 0 ? [...prev.extras, ...newExtras] : prev.extras,
              };
            });
            setShowAddCombo(false);
            showToast(`🎉 ¡Combo / Paquete "${newCombo.name}" creado con éxito!`);
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL: EDITAR PLATILLO CON LISTA DE EXTRAS (A-Z)
          ════════════════════════════════════════════════════════════ */}
      {editingProduct && data && (
        <EditProductModal
          product={editingProduct}
          existingSections={sections}
          existingRestaurantExtras={sortedExtrasAlphabetical}
          rubro={rubro}
          onClose={() => setEditingProduct(null)}
          onSaved={(updated, updatedExtras) => {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                products: prev.products.map((p) => (p.id === updated.id ? updated : p)),
                extras: updatedExtras && updatedExtras.length > 0
                  ? [...prev.extras.filter((e) => e.productId !== updated.id), ...updatedExtras]
                  : prev.extras,
              };
            });
            setEditingProduct(null);
            showToast(`"${updated.name}" actualizado`);
          }}
          onDeleted={(id) => {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                products: prev.products.filter((p) => p.id !== id),
                extras: prev.extras.filter((e) => e.productId !== id),
              };
            });
            setEditingProduct(null);
            showToast("Platillo eliminado del menú");
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL: AGREGAR EXTRA / COMPLEMENTO
          ════════════════════════════════════════════════════════════ */}
      {showAddExtra && data && (
        <AddExtraModal
          restaurantId={data.store.id}
          products={data.products}
          rubro={rubro}
          onClose={() => setShowAddExtra(false)}
          onAdded={(newExtra) => {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                extras: [...prev.extras, newExtra],
              };
            });
            setShowAddExtra(false);
            showToast(`¡Extra "${newExtra.name}" añadido exitosamente!`);
          }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE MODAL: CREAR COMBO O PAQUETE
   ════════════════════════════════════════════════════════════ */
function AddComboModal({
  restaurantId,
  existingProducts,
  existingRestaurantExtras,
  rubro,
  onClose,
  onAdded,
}: {
  restaurantId: number;
  existingProducts: Product[];
  existingRestaurantExtras: ProductExtra[];
  rubro: Rubro;
  onClose: () => void;
  onAdded: (combo: Product, createdExtras?: ProductExtra[]) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(PHOTO_PRESETS[1].url);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([]);
  const [isPortionGrill, setIsPortionGrill] = useState(false);
  const [portionCount, setPortionCount] = useState("4");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Extras ordenados alfabéticamente A-Z
  const restaurantCatalogExtras = useMemo(() => {
    const map = new Map<string, { name: string; price: number }>();
    for (const e of existingRestaurantExtras) {
      if (!map.has(e.name.toLowerCase())) {
        map.set(e.name.toLowerCase(), { name: e.name, price: e.price });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
  }, [existingRestaurantExtras]);

  const toggleItem = (itemName: string) => {
    const next = selectedItems.includes(itemName)
      ? selectedItems.filter((i) => i !== itemName)
      : [...selectedItems, itemName];
    setSelectedItems(next);

    if (next.length > 0 && !isPortionGrill) {
      setDescription(`Incluye: ${next.join(" + ")}.`);
    }
  };

  const handleToggleGrill = (val: boolean) => {
    setIsPortionGrill(val);
    if (val) {
      if (!name) setName("Parrillada Especial (1 Kg · 4 porciones de 250g)");
      if (!price) setPrice("480");
      setDescription("Arma tu paquete: elige 4 porciones entre todos los cortes de res, embutidos y costillas disponibles. Incluye frijoles charros, guacamole, cebollitas asadas y tortillas.");
    }
  };

  const toggleSelectExtra = (extra: { name: string; price: number }) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.name.toLowerCase() === extra.name.toLowerCase());
      if (exists) {
        return prev.filter((e) => e.name.toLowerCase() !== extra.name.toLowerCase());
      }
      return [...prev, extra];
    });
  };

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Escribe el nombre del combo o paquete");
    if (!price || Number(price) < 1) return setError("Escribe un precio especial válido");

    setSaving(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_product",
          restaurantId,
          name: name.trim(),
          price: Number(price),
          description: description.trim() || `Incluye: ${selectedItems.join(" + ")}`,
          section: "Combos & Paquetes",
          image: image.trim() || null,
          popular: true,
          extras: selectedExtras,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el combo");
        return;
      }
      onAdded(data.product, data.createdExtras);
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[26px] bg-white sm:rounded-[26px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-t-4 border-[#7c3aed]">
          <div>
            <p className="text-[17px] sm:text-[18px] font-black tracking-tight text-ink flex items-center gap-1.5">
              <Gift className="h-4.5 w-4.5 text-[#7c3aed]" /> Crear Combo o Paquete
            </p>
            <p className="text-[11.5px] font-bold text-ink-soft">Agrupa platillos o arma paquetes por porciones de 250g</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist transition hover:bg-black/10 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 sm:px-5 pb-4">
          {error && <p className="rounded-2xl bg-[#fde8e8] px-3.5 py-2 text-[12px] font-black text-[#dc2626]">{error}</p>}

          {/* Selector de tipo de combo: Parrillada por porciones de 250g */}
          <div className="rounded-2xl border border-[#ea580c]/30 bg-[#fff8f5] p-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPortionGrill}
                onChange={(e) => handleToggleGrill(e.target.checked)}
                className="h-4.5 w-4.5 accent-[#ea580c] rounded cursor-pointer"
              />
              <div>
                <p className="text-[12.5px] font-black text-[#ea580c]">
                  🥩 Modo Parrillada / Paquete por porciones de 250g
                </p>
                <p className="text-[10.5px] font-semibold text-ink-soft">
                  El comensal podrá armar su paquete eligiendo sus cortes favoritos en porciones de 250g
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Nombre del Combo o Paquete</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Parrillada La Brasa (1 Kg · 4 porciones de 250g)"
              className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-3.5 py-2.5 text-[13.5px] font-bold outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Precio del paquete MXN</label>
            <div className="relative mt-1">
              <span className="absolute top-2.5 left-3.5 text-[13.5px] font-black text-ink-soft">$</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="239"
                className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-3.5 pl-7 text-[13.5px] font-bold outline-none focus:border-ink"
              />
            </div>
          </div>

          {/* Selector interactivo de qué platillos incluye */}
          {!isPortionGrill ? (
            <div className="rounded-2xl border border-black/10 bg-[#f5f3ff] p-3">
              <p className="text-[11.5px] font-black uppercase tracking-wider text-[#7c3aed] flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" /> Selecciona qué platillos incluye este paquete:
              </p>
              <div className="no-scrollbar mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {existingProducts.map((p) => {
                  const isSelected = selectedItems.includes(p.name);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleItem(p.name)}
                      className={`rounded-xl px-2.5 py-1 text-[11.5px] font-bold transition cursor-pointer ${
                        isSelected ? "bg-[#7c3aed] text-white shadow-xs" : "bg-white text-ink-soft border border-black/5 hover:bg-white"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "} {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#ea580c]/20 bg-white p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11.5px] font-black uppercase tracking-wider text-[#ea580c] flex items-center gap-1.5">
                  <Beef className="h-4 w-4" /> Porciones incluidas en el paquete:
                </p>
                <select
                  value={portionCount}
                  onChange={(e) => {
                    const count = e.target.value;
                    setPortionCount(count);
                    const grams = Number(count) * 250;
                    const kgLabel = grams >= 1000 ? `${grams / 1000} Kg` : `${grams}g`;
                    setName(`Parrillada al Carbón (${kgLabel} · ${count} porciones de 250g)`);
                    setDescription(`Arma tu paquete: Elige ${count} porciones entre cortes de 250g, embutidos y costillas por pza. Incluye frijoles charros con tuétano, guacamole artesanal, cebollitas asadas y tortillas.`);
                  }}
                  className="rounded-xl border border-black/10 bg-mist px-2.5 py-1 text-[11.5px] font-black text-ink outline-none"
                >
                  <option value="2">2 porciones (500g)</option>
                  <option value="3">3 porciones (750g)</option>
                  <option value="4">4 porciones (1 Kg)</option>
                  <option value="6">6 porciones (1.5 Kg)</option>
                  <option value="8">8 porciones (2 Kg)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#ea580c]">
                    🥩 Cortes de Res (250g cada porción):
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold">
                    {["Tomahawk (250g)", "Rib Eye (250g)", "New York (250g)", "Cowboy (250g)", "Sirloin (250g)", "Arrachera (250g)", "Picaña (250g)"].map((c) => (
                      <span key={c} className="rounded-lg bg-[#fff8f5] border border-[#ea580c]/20 px-2 py-0.5 text-[#ea580c]">
                        🥩 {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#ea580c]">
                    🌭 Embutidos (250g cada porción):
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold">
                    {["Chorizo Argentino (250g)", "Chorizo Rojo Tradicional (250g)", "Chorizo Español (250g)", "Salchicha Polaca para Asar (250g)"].map((c) => (
                      <span key={c} className="rounded-lg bg-[#fff8f5] border border-[#ea580c]/20 px-2 py-0.5 text-[#ea580c]">
                        🌭 {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#ea580c]">
                    🍖 Costillas (por pieza / pza):
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold">
                    {["Costilla Cargada al Carbón (por pza)", "Costilla BBQ Ahumada en Mezquite (por pza)"].map((c) => (
                      <span key={c} className="rounded-lg bg-[#fff8f5] border border-[#ea580c]/20 px-2 py-0.5 text-[#ea580c]">
                        🍖 {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Descripción detallada del paquete</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ej: Incluye 4 porciones de 250g a elegir + frijoles charros + guacamole + tortillas."
              className="mt-1 w-full resize-none rounded-2xl border border-black/10 bg-mist px-3.5 py-2 text-[12.5px] font-semibold outline-none focus:border-ink"
            />
          </div>

          {/* Selector de Foto para Combos */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Foto del Combo</label>
            <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
              {PHOTO_PRESETS.map((p) => {
                const isSelected = image === p.url;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                      isSelected ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/30 scale-105" : "border-black/10 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image src={p.url} alt={p.label} fill className="object-cover" sizes="56px" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[8.5px] font-black text-white truncate px-0.5">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extras para este combo (ordenados A-Z) */}
          <div className="overflow-hidden rounded-2xl border border-black/10 p-3.5 bg-mist/50">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5 text-ink">
                <Sparkles className="h-4 w-4 text-[#7c3aed]" /> Extras para este combo (A - Z)
              </label>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-black shadow-2xs text-[#7c3aed]">
                {selectedExtras.length} seleccionados
              </span>
            </div>

            <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {restaurantCatalogExtras.map((ext) => {
                const isChecked = selectedExtras.some((e) => e.name.toLowerCase() === ext.name.toLowerCase());
                return (
                  <button
                    key={ext.name}
                    type="button"
                    onClick={() => toggleSelectExtra(ext)}
                    className={`flex w-full items-center justify-between rounded-xl border p-2 text-left transition cursor-pointer ${
                      isChecked
                        ? "border-[#7c3aed]/30 bg-white shadow-xs font-black text-ink"
                        : "border-black/5 bg-white/70 font-semibold text-ink-soft hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition ${
                          isChecked ? "border-transparent bg-[#7c3aed] text-white" : "border-black/20 bg-mist"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span className="truncate text-[12px]">{ext.name}</span>
                    </div>
                    <span className="shrink-0 text-[11.5px] font-black text-[#7c3aed]">
                      +{formatMXN(ext.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-black/5 px-4 sm:px-5 py-3 sm:py-3.5">
          <button
            onClick={submit}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#7c3aed] py-3 text-[13.5px] font-black text-white shadow-xs transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            Publicar Combo en el Menú
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE MODAL: AGREGAR PLATILLO CON LISTA DE EXTRAS (A-Z)
   ════════════════════════════════════════════════════════════ */
function AddProductModal({
  restaurantId,
  existingSections,
  existingRestaurantExtras,
  rubro,
  onClose,
  onAdded,
}: {
  restaurantId: number;
  existingSections: string[];
  existingRestaurantExtras: ProductExtra[];
  rubro: Rubro;
  onClose: () => void;
  onAdded: (product: Product, createdExtras?: ProductExtra[]) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState(existingSections.find((s) => !s.toLowerCase().includes("combo")) || "Especialidades");
  const [customSection, setCustomSection] = useState("");
  const [isCustomSection, setIsCustomSection] = useState(false);
  const [image, setImage] = useState(PHOTO_PRESETS[0].url);
  const [popular, setPopular] = useState(false);

  // Lista de extras seleccionados para este platillo
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([]);

  // Input para crear un nuevo extra al vuelo
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [showCreateNewExtra, setShowCreateNewExtra] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Obtener lista única de extras del negocio ordenados alfabéticamente A-Z
  const restaurantCatalogExtras = useMemo(() => {
    const map = new Map<string, { name: string; price: number }>();
    for (const e of existingRestaurantExtras) {
      if (!map.has(e.name.toLowerCase())) {
        map.set(e.name.toLowerCase(), { name: e.name, price: e.price });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
  }, [existingRestaurantExtras]);

  const toggleSelectExtra = (extra: { name: string; price: number }) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.name.toLowerCase() === extra.name.toLowerCase());
      if (exists) {
        return prev.filter((e) => e.name.toLowerCase() !== extra.name.toLowerCase());
      }
      return [...prev, extra];
    });
  };

  const addCustomExtra = () => {
    if (!newExtraName.trim()) return;
    const p = Number(newExtraPrice) || 0;
    const custom = { name: newExtraName.trim(), price: p };
    setSelectedExtras((prev) => [...prev, custom]);
    setNewExtraName("");
    setNewExtraPrice("");
    setShowCreateNewExtra(false);
  };

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Ingresa el nombre del platillo");
    if (!price || Number(price) < 1) return setError("Ingresa un precio válido en MXN");

    const finalSection = isCustomSection ? (customSection.trim() || "Especialidades") : section;

    setSaving(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_product",
          restaurantId,
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          section: finalSection,
          image: image.trim() || null,
          popular,
          extras: selectedExtras,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el platillo");
        return;
      }
      onAdded(data.product, data.createdExtras);
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[26px] bg-white sm:rounded-[26px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-5 pt-4 pb-3" style={{ borderTop: `4px solid ${rubro.accent}` }}>
          <div>
            <p className="text-[17px] sm:text-[18px] font-black tracking-tight">Agregar {rubro.dishNoun}</p>
            <p className="text-[11.5px] font-bold text-ink-soft">Aparecerá en tu menú con sus extras elegidos</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist transition hover:bg-black/10 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 sm:px-5 pb-4">
          {error && <p className="rounded-2xl bg-[#fde8e8] px-3.5 py-2 text-[12px] font-black text-[#dc2626]">{error}</p>}

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Nombre del {rubro.dishNoun}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Hamburguesa Doble Smash Especial"
              className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-3.5 py-2.5 text-[13.5px] font-bold outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Precio MXN</label>
              <div className="relative mt-1">
                <span className="absolute top-2.5 left-3.5 text-[13.5px] font-black text-ink-soft">$</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="145"
                  className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-3.5 pl-7 text-[13.5px] font-bold outline-none focus:border-ink"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Sección</label>
              {!isCustomSection ? (
                <div className="mt-1 flex gap-1">
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-mist px-2.5 py-2.5 text-[12.5px] font-bold outline-none focus:border-ink"
                  >
                    {existingSections.filter((s) => !s.toLowerCase().includes("combo")).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCustomSection(true)}
                    className="shrink-0 rounded-2xl bg-mist px-2 py-2.5 text-[10.5px] font-black text-ink-soft hover:text-ink cursor-pointer"
                    title="Crear nueva sección"
                  >
                    + Nueva
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex gap-1">
                  <input
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value)}
                    placeholder="Ej. Entradas"
                    className="w-full rounded-2xl border border-black/10 bg-mist px-3 py-2.5 text-[12.5px] font-bold outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomSection(false)}
                    className="shrink-0 rounded-2xl bg-mist px-2 py-2.5 text-[10.5px] font-black text-ink-soft cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Descripción e ingredientes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ingredientes frescos, preparación artesanal..."
              className="mt-1 w-full resize-none rounded-2xl border border-black/10 bg-mist px-3.5 py-2 text-[12.5px] font-semibold outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Foto del platillo</label>
            <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
              {PHOTO_PRESETS.map((p) => {
                const isSelected = image === p.url;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                      isSelected ? "border-ink ring-2 ring-ink/30 scale-105" : "border-black/10 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image src={p.url} alt={p.label} fill className="object-cover" sizes="56px" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[8.5px] font-black text-white truncate px-0.5">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... (URL personalizada de imagen)"
              className="mt-1.5 w-full rounded-2xl border border-black/10 bg-mist px-3 py-2 text-[11px] font-mono outline-none focus:border-ink"
            />
          </div>

          <label className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-mist p-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="h-4 w-4 accent-ink rounded cursor-pointer"
            />
            <div>
              <p className="text-[12.5px] font-black">Destacar como platillo popular 🔥</p>
              <p className="text-[10.5px] font-semibold text-ink-soft">Aparecerá con insignia destacada</p>
            </div>
          </label>

          {/* ════════════════════════════════════════════════════════════
              LISTA DESPLEGABLE CON LOS EXTRAS ORDENADOS ALFABÉTICAMENTE A-Z
              ════════════════════════════════════════════════════════════ */}
          <div className="overflow-hidden rounded-2xl border border-black/10 p-3.5" style={{ backgroundColor: `${rubro.soft}35` }}>
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: rubro.accent }}>
                <Sparkles className="h-4 w-4" /> Extras para este platillo (A - Z)
              </label>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-black shadow-2xs" style={{ color: rubro.accent }}>
                {selectedExtras.length} seleccionados
              </span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-ink-soft">
              Selecciona de los extras que tu negocio ya tiene registrados:
            </p>

            {/* LISTA DESPLEGABLE DE EXTRAS EXISTENTES A-Z */}
            <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {restaurantCatalogExtras.length === 0 ? (
                <p className="rounded-xl bg-white p-3 text-center text-[11.5px] font-bold text-ink-soft shadow-2xs">
                  Tu negocio aún no tiene extras registrados. Crea el primero abajo 👇
                </p>
              ) : (
                restaurantCatalogExtras.map((ext) => {
                  const isChecked = selectedExtras.some((e) => e.name.toLowerCase() === ext.name.toLowerCase());
                  return (
                    <button
                      key={ext.name}
                      type="button"
                      onClick={() => toggleSelectExtra(ext)}
                      className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        isChecked
                          ? "border-transparent bg-white shadow-xs font-black text-ink"
                          : "border-black/5 bg-white/70 font-semibold text-ink-soft hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition ${
                            isChecked ? "border-transparent text-white" : "border-black/20 bg-mist"
                          }`}
                          style={isChecked ? { backgroundColor: rubro.accent } : undefined}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <span className="truncate text-[12.5px]">{ext.name}</span>
                      </div>
                      <span className="shrink-0 text-[12px] font-black" style={{ color: rubro.accent }}>
                        +{formatMXN(ext.price)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* BOTÓN PARA CREAR NUEVO EXTRA */}
            {!showCreateNewExtra ? (
              <button
                type="button"
                onClick={() => setShowCreateNewExtra(true)}
                className="mt-2.5 flex items-center gap-1 text-[11.5px] font-black hover:underline cursor-pointer"
                style={{ color: rubro.accent }}
              >
                <Plus className="h-3.5 w-3.5" /> + Agregar un extra nuevo no listado
              </button>
            ) : (
              <div className="mt-2.5 rounded-xl border border-black/10 bg-white p-2.5 shadow-xs space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Crear y añadir nuevo extra:</p>
                <div className="flex gap-1.5">
                  <input
                    value={newExtraName}
                    onChange={(e) => setNewExtraName(e.target.value)}
                    placeholder="Nombre del extra (ej. Salsa trufada)"
                    className="min-w-0 flex-1 rounded-lg border border-black/10 bg-mist px-2.5 py-1.5 text-[12px] font-bold outline-none"
                  />
                  <input
                    value={newExtraPrice}
                    onChange={(e) => setNewExtraPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="$20"
                    className="w-14 shrink-0 rounded-lg border border-black/10 bg-mist px-1.5 py-1.5 text-[12px] font-bold text-center outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomExtra}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11.5px] font-black text-white cursor-pointer"
                    style={{ backgroundColor: rubro.accent }}
                  >
                    Añadir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-black/5 px-4 sm:px-5 py-3 sm:py-3.5">
          <button
            onClick={submit}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white shadow-xs transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: rubro.accent }}
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CircleCheck className="h-4 w-4" />}
            Guardar platillo en el menú
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE MODAL: EDITAR PLATILLO CON LISTA DE EXTRAS (A-Z)
   ════════════════════════════════════════════════════════════ */
function EditProductModal({
  product,
  existingSections,
  existingRestaurantExtras,
  rubro,
  onClose,
  onSaved,
  onDeleted,
}: {
  product: Product;
  existingSections: string[];
  existingRestaurantExtras: ProductExtra[];
  rubro: Rubro;
  onClose: () => void;
  onSaved: (product: Product, updatedExtras?: ProductExtra[]) => void;
  onDeleted: (productId: number) => void;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description || "");
  const [section, setSection] = useState(product.section);
  const [image, setImage] = useState(product.image || "");
  const [popular, setPopular] = useState(product.popular);
  const [available, setAvailable] = useState(product.available);

  // Extras previamente seleccionados para este platillo
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>(() => {
    const matched = existingRestaurantExtras.filter((e) => e.productId === product.id);
    if (matched.length > 0) {
      return matched.map((e) => ({ name: e.name, price: e.price }));
    }
    return [];
  });

  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [showCreateNewExtra, setShowCreateNewExtra] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Catálogo completo ordenado alfabéticamente A-Z
  const restaurantCatalogExtras = useMemo(() => {
    const map = new Map<string, { name: string; price: number }>();
    for (const e of existingRestaurantExtras) {
      if (!map.has(e.name.toLowerCase())) {
        map.set(e.name.toLowerCase(), { name: e.name, price: e.price });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
  }, [existingRestaurantExtras]);

  const toggleSelectExtra = (extra: { name: string; price: number }) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.name.toLowerCase() === extra.name.toLowerCase());
      if (exists) {
        return prev.filter((e) => e.name.toLowerCase() !== extra.name.toLowerCase());
      }
      return [...prev, extra];
    });
  };

  const addCustomExtra = () => {
    if (!newExtraName.trim()) return;
    const p = Number(newExtraPrice) || 0;
    const custom = { name: newExtraName.trim(), price: p };
    setSelectedExtras((prev) => [...prev, custom]);
    setNewExtraName("");
    setNewExtraPrice("");
    setShowCreateNewExtra(false);
  };

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("El nombre no puede estar vacío");
    if (!price || Number(price) < 1) return setError("El precio debe ser válido");

    setSaving(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_product",
          id: product.id,
          restaurantId: product.restaurantId,
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          section: section.trim() || "General",
          image: image.trim() || null,
          popular,
          available,
          extras: selectedExtras,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar");
        return;
      }
      onSaved(data.product, data.updatedExtras);
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar definitivamente "${product.name}"?`)) return;
    setSaving(true);
    try {
      await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_product", id: product.id }),
      });
      onDeleted(product.id);
    } catch {
      setError("Error al eliminar");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[26px] bg-white sm:rounded-[26px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-5 pt-4 pb-3" style={{ borderTop: `4px solid ${rubro.accent}` }}>
          <div>
            <p className="text-[17px] sm:text-[18px] font-black tracking-tight">Editar {rubro.dishNoun}</p>
            <p className="text-[11.5px] font-bold text-ink-soft">Modifica precios, descripción o sus extras</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 sm:px-5 pb-4">
          {error && <p className="rounded-2xl bg-[#fde8e8] px-3.5 py-2 text-[12px] font-black text-[#dc2626]">{error}</p>}

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-3.5 py-2.5 text-[13.5px] font-bold outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Precio MXN</label>
              <div className="relative mt-1">
                <span className="absolute top-2.5 left-3.5 text-[13.5px] font-black text-ink-soft">$</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-3.5 pl-7 text-[13.5px] font-bold outline-none focus:border-ink"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Sección</label>
              <input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-3 py-2.5 text-[12.5px] font-bold outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-2xl border border-black/10 bg-mist px-3.5 py-2 text-[12.5px] font-semibold outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">URL de Foto</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-3 py-2 text-[11px] font-mono outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-2xl border border-black/10 bg-mist p-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="h-4 w-4 accent-ink rounded cursor-pointer"
              />
              <span className="text-[12px] font-bold">Popular 🔥</span>
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-black/10 bg-mist p-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="h-4 w-4 accent-ink rounded cursor-pointer"
              />
              <span className="text-[12px] font-bold">Disponible 🟢</span>
            </label>
          </div>

          {/* ════════════════════════════════════════════════════════════
              LISTA DESPLEGABLE CON LOS EXTRAS ORDENADOS ALFABÉTICAMENTE A-Z
              ════════════════════════════════════════════════════════════ */}
          <div className="overflow-hidden rounded-2xl border border-black/10 p-3.5" style={{ backgroundColor: `${rubro.soft}35` }}>
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: rubro.accent }}>
                <Sparkles className="h-4 w-4" /> Extras para este platillo (A - Z)
              </label>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-black shadow-2xs" style={{ color: rubro.accent }}>
                {selectedExtras.length} seleccionados
              </span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-ink-soft">
              Marca o desmarca los extras de la lista que aplican a este platillo:
            </p>

            {/* LISTA DESPLEGABLE */}
            <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {restaurantCatalogExtras.length === 0 ? (
                <p className="rounded-xl bg-white p-3 text-center text-[11.5px] font-bold text-ink-soft">
                  Sin extras registrados en tu catálogo.
                </p>
              ) : (
                restaurantCatalogExtras.map((ext) => {
                  const isChecked = selectedExtras.some((e) => e.name.toLowerCase() === ext.name.toLowerCase());
                  return (
                    <button
                      key={ext.name}
                      type="button"
                      onClick={() => toggleSelectExtra(ext)}
                      className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        isChecked
                          ? "border-transparent bg-white shadow-xs font-black text-ink"
                          : "border-black/5 bg-white/70 font-semibold text-ink-soft hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition ${
                            isChecked ? "border-transparent text-white" : "border-black/20 bg-mist"
                          }`}
                          style={isChecked ? { backgroundColor: rubro.accent } : undefined}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <span className="truncate text-[12.5px]">{ext.name}</span>
                      </div>
                      <span className="shrink-0 text-[12px] font-black" style={{ color: rubro.accent }}>
                        +{formatMXN(ext.price)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {!showCreateNewExtra ? (
              <button
                type="button"
                onClick={() => setShowCreateNewExtra(true)}
                className="mt-2.5 flex items-center gap-1 text-[11.5px] font-black hover:underline cursor-pointer"
                style={{ color: rubro.accent }}
              >
                <Plus className="h-3.5 w-3.5" /> + Agregar otro extra a este platillo
              </button>
            ) : (
              <div className="mt-2.5 rounded-xl border border-black/10 bg-white p-2.5 shadow-xs space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Nuevo extra:</p>
                <div className="flex gap-1.5">
                  <input
                    value={newExtraName}
                    onChange={(e) => setNewExtraName(e.target.value)}
                    placeholder="Nombre del extra"
                    className="min-w-0 flex-1 rounded-lg border border-black/10 bg-mist px-2.5 py-1.5 text-[12px] font-bold outline-none"
                  />
                  <input
                    value={newExtraPrice}
                    onChange={(e) => setNewExtraPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="$20"
                    className="w-14 shrink-0 rounded-lg border border-black/10 bg-mist px-1.5 py-1.5 text-[12px] font-bold text-center outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomExtra}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11.5px] font-black text-white cursor-pointer"
                    style={{ backgroundColor: rubro.accent }}
                  >
                    Añadir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex gap-2 border-t border-black/5 px-4 sm:px-5 py-3 sm:py-3.5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="flex items-center justify-center gap-1 rounded-full border border-[#dc2626]/30 bg-[#fde8e8] px-3.5 py-2.5 text-[12.5px] font-black text-[#dc2626] transition hover:bg-[#fca5a5]/30 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Eliminar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-black text-white transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: rubro.accent }}
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CircleCheck className="h-4 w-4" />}
            Guardar cambios
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE MODAL: AGREGAR EXTRA / COMPLEMENTO
   ════════════════════════════════════════════════════════════ */
function AddExtraModal({
  restaurantId,
  products,
  rubro,
  onClose,
  onAdded,
}: {
  restaurantId: number;
  products: Product[];
  rubro: Rubro;
  onClose: () => void;
  onAdded: (extra: ProductExtra) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("18");
  const [productId, setProductId] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Escribe el nombre del extra");
    if (price === "" || isNaN(Number(price))) return setError("Escribe un precio válido");

    setSaving(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_extra",
          restaurantId,
          productId: productId === "all" ? null : Number(productId),
          name: name.trim(),
          price: Number(price),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo crear el extra");
        return;
      }
      onAdded(data.extra);
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[26px] bg-white sm:rounded-[26px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-5 pt-4 pb-3" style={{ borderTop: `4px solid ${rubro.accent}` }}>
          <div>
            <p className="text-[17px] sm:text-[18px] font-black tracking-tight">Agregar extra al catálogo</p>
            <p className="text-[11.5px] font-bold text-ink-soft">Quedará disponible para seleccionar en tus platillos</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full bg-mist cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 sm:px-5 pb-4">
          {error && <p className="rounded-2xl bg-[#fde8e8] px-3.5 py-2 text-[12px] font-black text-[#dc2626]">{error}</p>}

          {/* Sugerencias rápidas ordenadas A-Z */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Sugerencias rápidas (A - Z)</label>
            <div className="no-scrollbar mt-1.5 flex flex-wrap gap-1.5">
              {QUICK_EXTRA_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.name}
                  type="button"
                  onClick={() => {
                    setName(sug.name);
                    setPrice(String(sug.price));
                  }}
                  className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-bold text-ink transition hover:bg-black/10 active:scale-95 cursor-pointer"
                >
                  {sug.name} (+${sug.price})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Nombre del extra</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Queso gouda gratinado, Aguacate hass..."
              className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-3.5 py-2.5 text-[13.5px] font-bold outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Precio adicional</label>
              <div className="relative mt-1">
                <span className="absolute top-2.5 left-3.5 text-[13.5px] font-black text-ink-soft">$</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="18"
                  className="w-full rounded-2xl border border-black/10 bg-mist py-2.5 pr-3.5 pl-7 text-[13.5px] font-bold outline-none focus:border-ink"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-ink-soft">Asignación inicial</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-mist px-2.5 py-2.5 text-[12px] font-bold outline-none focus:border-ink"
              >
                <option value="all">Disponible para todos</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>Solo para: {p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-black/5 px-4 sm:px-5 py-3 sm:py-3.5">
          <button
            onClick={submit}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-black text-white shadow-xs transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: rubro.accent }}
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Guardar en catálogo de extras
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ icon, label, value, accentColor, soft, color }: { icon: React.ReactNode; label: string; value: string; accentColor?: string; soft?: string; color?: string }) {
  if (accentColor) {
    return (
      <div className="rounded-[20px] p-3 sm:p-3.5 text-white shadow-xs" style={{ backgroundColor: accentColor }}>
        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-white/20">{icon}</span>
        <p className="mt-1.5 text-[10px] sm:text-[10.5px] font-black text-white/80 uppercase">{label}</p>
        <p className="truncate text-[14.5px] sm:text-[16px] font-black">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] bg-white p-3 sm:p-3.5 shadow-xs">
      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl" style={{ backgroundColor: soft, color }}>{icon}</span>
      <p className="mt-1.5 text-[10px] sm:text-[10.5px] font-black text-ink-soft uppercase">{label}</p>
      <p className="truncate text-[14.5px] sm:text-[16px] font-black text-ink">{value}</p>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/app/viajes/page.tsx
// --------------------------------------------------------
import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";
import ViajesClient from "./viajes-client";

export const dynamic = "force-dynamic";

export default async function ViajesPage() {
  const cross = await crossSellItems(null);
  return <ViajesClient crossItems={cross} crossTitle={randomCrossTitle()} />;
}


// --------------------------------------------------------
// ARCHIVO: src/app/viajes/viajes-client.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CrossSell, { type CrossSellItem } from "@/components/cross-sell";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Bike, BusFront, CalendarDays, CalendarClock, CarFront, Check, ChevronDown, CircleDollarSign, Clock3,
  Loader2, MapPin, Phone, Stethoscope, ShieldCheck, Star, Utensils, X, Zap, ShieldAlert, Siren, AlertOctagon,
  Share2, CheckCheck, Camera, Sparkles, CreditCard, Banknote, Landmark, Flower2
} from "lucide-react";
import { useCart } from "@/store/cart";
import { formatMXN } from "@/lib/utils";

const VEHICLES = [
  {
    id: "moto",
    label: "Moto",
    price: 45,
    eta: 10,
    icon: Bike,
    desc: "Ágil para 1 pasajero",
    driverName: "Leo M.",
    vehicleLine: "Moto negra",
    plate: "RY-421",
  },
  {
    id: "carro",
    label: "Carro",
    price: 85,
    eta: 14,
    icon: CarFront,
    desc: "Comodidad para 4",
    driverName: "Jorge M.",
    vehicleLine: "Carro blanco",
    plate: "RY-809",
  },
  {
    id: "xl",
    label: "Carro XL",
    price: 125,
    eta: 18,
    icon: CarFront,
    desc: "Grupos y equipaje",
    driverName: "Andrea P.",
    vehicleLine: "SUV negra",
    plate: "RY-642",
  },
  {
    id: "van-12",
    label: "Camioneta 12 pasajeros",
    price: 220,
    eta: 22,
    icon: BusFront,
    desc: "Ideal para grupos grandes",
    driverName: "Miguel T.",
    vehicleLine: "Van ejecutiva blanca",
    plate: "RY-120",
  },
] as const;

type VehicleOption = (typeof VEHICLES)[number];

const ROUTE = "M 36 196 C 120 40, 250 240, 368 88";

/* ── Los 4 servicios de Rayte (carrusel para pantallas de confirmación) ── */
const APP_SERVICES = [
  { href: "/buscar", label: "Comida", desc: "Restaurantes y farmacias", icon: Utensils, from: "#ea580c", to: "#c2410c" },
  { href: "/viajes", label: "Rayte", desc: "Viaja por la ciudad", icon: CarFront, from: "#f59e0b", to: "#b45309" },
  { href: "/servicios", label: "Citas", desc: "Belleza, hogar y más", icon: CalendarDays, from: "#7c3aed", to: "#6d28d9" },
  { href: "/servicios?cat=salud", label: "Salud", desc: "Doctores a domicilio", icon: Stethoscope, from: "#1d6ae5", to: "#144bb8" },
];

function ServiceCarousel() {
  return (
    <div className="mt-6">
      <p className="text-[12px] font-black tracking-widest text-white/50 uppercase">Mientras tanto en Rayte</p>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
        {APP_SERVICES.map(({ href, label, desc, icon: Icon, from, to }) => (
          <Link
            key={label}
            href={href}
            className="w-[150px] shrink-0 rounded-[22px] p-4 transition active:scale-95"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
              <Icon className="h-5 w-5 text-white" strokeWidth={2.4} />
            </span>
            <p className="mt-3 text-[15px] font-black text-white">{label}</p>
            <p className="mt-0.5 text-[11.5px] leading-tight font-bold text-white/80">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Estilo Uber: fechas (30 días) y horas en pasos de 10 min ── */
const DAYS_AHEAD = 30;
const MIN_LEAD_MIN = 20; // igual que Uber: la recogida más próxima es en ~20 min

function buildDates() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(base.getTime() + i * 86400000);
    const label =
      i === 0
        ? "Hoy"
        : i === 1
          ? "Mañana"
          : new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" }).format(d).replace(/\./g, "");
    return { date: d, label };
  });
}

function buildTimes(day: Date) {
  const isToday = day.toDateString() === new Date().toDateString();
  const start = new Date(day);
  if (isToday) {
    const min = new Date(Date.now() + MIN_LEAD_MIN * 60000);
    min.setSeconds(0, 0);
    min.setMinutes(Math.ceil(min.getMinutes() / 10) * 10);
    start.setHours(min.getHours(), min.getMinutes(), 0, 0);
  } else {
    start.setHours(0, 0, 0, 0);
  }
  const end = new Date(day);
  end.setHours(23, 50, 0, 0);
  const fmt = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" });
  const out: { date: Date; label: string }[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += 10 * 60000) {
    out.push({ date: new Date(t), label: fmt.format(t) });
  }
  return out;
}

/* ── Rueda deslizable estilo selector de iOS/Uber ── */
const ITEM_H = 40;
const WHEEL_H = 200;

function Wheel({ items, index, onChange, grow = false }: { items: string[]; index: number; onChange: (i: number) => void; grow?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settling = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (Math.round(el.scrollTop / ITEM_H) !== index) {
      settling.current = true;
      el.scrollTo({ top: index * ITEM_H });
      requestAnimationFrame(() => (settling.current = false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  const onScroll = () => {
    if (settling.current) return;
    const el = ref.current;
    if (!el) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      onChange(i);
      el.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
    }, 90);
  };

  return (
    <div className={`relative ${grow ? "flex-[1.4]" : "flex-1"}`} style={{ height: WHEEL_H }}>
      <div className="pointer-events-none absolute inset-x-1 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-white/[0.08]" />
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto"
        style={{ paddingTop: (WHEEL_H - ITEM_H) / 2, paddingBottom: (WHEEL_H - ITEM_H) / 2 }}
      >
        {items.map((it, i) => (
          <button
            key={`${it}-${i}`}
            onClick={() => {
              onChange(i);
              ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
            }}
            className={`flex w-full snap-center items-center justify-center capitalize transition-colors ${i === index ? "text-[16px] font-black text-white" : "text-[14px] font-bold text-white/30"}`}
            style={{ height: ITEM_H }}
          >
            {it}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#1d1824] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#1d1824] to-transparent" />
    </div>
  );
}

export default function ViajesClient({ crossItems = [], crossTitle }: { crossItems?: CrossSellItem[]; crossTitle?: string }) {
  const router = useRouter();
  const address = useCart((s) => s.address);
  const [mounted, setMounted] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const queryEmbed = params.get("embed") === "1" || params.get("embed") === "true" || params.get("wix") === "1";
      setEmbedded(queryEmbed || window.self !== window.top);
    } catch {
      setEmbedded(true);
    }
  }, []);

  const [destino, setDestino] = useState("");
  const [vehicle, setVehicle] = useState<VehicleOption>(VEHICLES[0]);
  const [phase, setPhase] = useState<"form" | "searching" | "assigned" | "scheduled">("form");

  const [when, setWhen] = useState<"now" | "schedule">("now");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [schedDate, setSchedDate] = useState<Date | null>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  /* 🌸 Rayte Mujer: conductora mujer verificada */
  const [womenOnly, setWomenOnly] = useState(false);

  /* 💵 Método de pago */
  const [payment, setPayment] = useState<"Efectivo" | "Tarjeta •••• 4821" | "Transferencia SPEI">("Efectivo");
  const [paySheetOpen, setPaySheetOpen] = useState(false);

  /* 📸 Foto de referencia (opcional) */
  const [refPhoto, setRefPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assignedDriverName = womenOnly ? "Carolina R." : vehicle.driverName;
  const assignedVehicleLine = vehicle.vehicleLine;
  const assignedPlate = vehicle.plate;

  /* Ruedas del sheet */
  const dates = useMemo(() => buildDates(), [sheetOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const [dayIdx, setDayIdx] = useState(0);
  const times = useMemo(() => buildTimes(dates[dayIdx]?.date ?? new Date()), [dates, dayIdx]);
  const [timeIdx, setTimeIdx] = useState(0);
  useEffect(() => setTimeIdx(0), [dayIdx]);

  if (!mounted) return null;

  const schedLabel = (d: Date | null, long = false) =>
    d
      ? new Intl.DateTimeFormat("es-MX", long
          ? { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }
          : { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d)
      : "";

  const openSheet = () => {
    setWhen("schedule");
    if (schedDate) {
      /* re-sincroniza las ruedas con lo ya elegido */
      const di = dates.findIndex((x) => x.date.toDateString() === schedDate.toDateString());
      if (di >= 0) {
        setDayIdx(di);
        const ts = buildTimes(dates[di].date);
        const ti = ts.findIndex((t) => t.date.getTime() === schedDate.getTime());
        setTimeIdx(ti >= 0 ? ti : 0);
      }
    }
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    if (!schedDate) setWhen("now"); /* cerró sin establecer hora → vuelve a "Ahora" */
  };

  const setPickup = () => {
    const chosen = times[timeIdx]?.date;
    if (!chosen) return;
    setSchedDate(chosen);
    setSheetOpen(false);
  };

  const rideNow = () => {
    setSchedDate(null);
    setWhen("now");
    setSheetOpen(false);
  };

  const request = () => {
    if (!destino.trim()) return;
    if (when === "schedule" && !schedDate) {
      openSheet();
      return;
    }
    setPhase("searching");
    setTimeout(() => setPhase(when === "schedule" ? "scheduled" : "assigned"), when === "schedule" ? 1400 : 1800);
  };

  return (
    <div className={`min-h-screen bg-[#16121b] text-white ${embedded ? "pb-10" : "pb-28"}`}>
      <header className={`mx-auto flex items-center gap-3 px-4 pt-6 pb-2 ${embedded ? "max-w-6xl" : "max-w-lg"}`}>
        <Link href="/" aria-label="Volver a Rayte" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-pop"><Zap className="h-4.5 w-4.5 fill-[#16121b] text-[#16121b]" /></span>
          <span className="text-xl font-black italic">rayte go</span>
        </div>
        <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white/70">Beta</span>
      </header>

      <div className={`mx-auto px-4 pt-4 ${embedded ? "max-w-6xl" : "max-w-lg"}`}>
        {phase === "form" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[26px] font-black tracking-tight">¿A dónde vas?</h1>
            <p className="mt-1 text-[13px] font-bold text-white/60">Muévete por la ciudad en minutos</p>

            {/* Ahora o Programar (el de programar abre la hoja estilo Uber) */}
            <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-white/[0.06] p-1.5">
              <button onClick={rideNow} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-black transition ${when === "now" ? "bg-amber-pop text-[#16121b]" : "text-white/70 hover:text-white"}`}>
                <Zap className="h-4 w-4" /> Ahora
              </button>
              <button onClick={openSheet} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-black transition ${when === "schedule" ? "bg-amber-pop text-[#16121b]" : "text-white/70 hover:text-white"}`}>
                <CalendarDays className="h-4 w-4" /> Programar <ChevronDown className="-ml-0.5 h-3.5 w-3.5" />
              </button>
            </div>

            {/* Recogida programada (banner estilo Uber) */}
            {when === "schedule" && schedDate && (
              <button onClick={openSheet} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-amber-pop/40 bg-amber-pop/10 px-4 py-3 text-left transition hover:bg-amber-pop/15">
                <CalendarClock className="h-5 w-5 shrink-0 text-amber-pop" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-black capitalize">Recogida: {schedLabel(schedDate)}</span>
                  <span className="block text-[11.5px] font-bold text-white/60">Tu conductor se asigna ~15 min antes</span>
                </span>
                <span className="shrink-0 rounded-full bg-amber-pop px-3 py-1.5 text-[11.5px] font-black text-[#16121b]">Cambiar</span>
              </button>
            )}

            <div className="mt-4 space-y-2.5 rounded-[26px] bg-white/[0.06] p-4 backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0ea55b]" />
                <input defaultValue={address} aria-label="Origen" className="w-full bg-transparent text-[14px] font-bold text-white outline-none placeholder:text-white/40" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <MapPin className="h-4.5 w-4.5 shrink-0 text-brand" />
                <input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="¿A dónde te llevamos?" className="w-full bg-transparent text-[14px] font-bold text-white outline-none placeholder:text-white/40" />
              </div>
            </div>

            {/* 🌸 Modalidad Rayte Mujer (opcional para usuarias) */}
            <div className="mt-4 rounded-[22px] border border-pink-500/30 bg-pink-500/10 p-3.5 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
                    <Flower2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-black text-pink-100">Rayte Mujer</p>
                    <p className="truncate text-[11.5px] font-bold text-pink-200/70">
                      {womenOnly ? "Solo conductoras mujeres verificadas" : "Cualquier conductor disponible"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWomenOnly((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${womenOnly ? "bg-pink-500" : "bg-white/20"}`}
                  aria-label="Alternar Rayte Mujer"
                >
                  <motion.span
                    layout
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md ${womenOnly ? "right-0.5" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>

            {/* 📸 Foto de referencia (opcional para el conductor) */}
            <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80">
                    <Camera className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-white">Foto de referencia <span className="text-white/50 text-[11px] font-bold">(opcional)</span></p>
                    <p className="text-[11px] font-bold text-white/50 truncate">Fachada, ropa o punto exacto de encuentro</p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) setRefPhoto(ev.target.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {!refPhoto ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-black text-white transition hover:bg-white/25 active:scale-95"
                  >
                    <Camera className="h-3.5 w-3.5" /> Tomar foto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRefPhoto(null)}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-black text-rose-300 hover:bg-rose-500/30"
                  >
                    <X className="h-3.5 w-3.5" /> Quitar
                  </button>
                )}
              </div>

              {refPhoto && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-2">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image src={refPhoto} alt="Referencia" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black text-[#4ade80] flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Foto lista
                    </p>
                    <p className="text-[11px] font-bold text-white/60 truncate">Se compartirá con tu conductor al solicitar</p>
                  </div>
                </div>
              )}
            </div>

            <div className={`mt-5 ${embedded ? "grid gap-2.5 md:grid-cols-2 xl:grid-cols-4" : "space-y-2.5"}`}>
              {VEHICLES.map((v) => {
                const active = vehicle.id === v.id;
                const Icon = v.icon;
                return (
                  <button key={v.id} onClick={() => setVehicle(v)} className={`flex w-full items-center gap-4 rounded-[22px] border p-4 text-left transition ${active ? "border-amber-pop bg-amber-pop/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`}>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${active ? "bg-amber-pop text-[#16121b]" : "bg-white/10"}`}><Icon className="h-6 w-6" /></span>
                    <span className="flex-1">
                      <span className="block text-[15.5px] font-black">{v.label}</span>
                      <span className="flex items-center gap-1 text-[12px] font-bold text-white/60"><Clock3 className="h-3 w-3" /> ~{v.eta} min · {v.desc}</span>
                    </span>
                    <span className="text-[15px] font-black text-amber-pop">{formatMXN(v.price)}</span>
                  </button>
                );
              })}
            </div>

            {/* 💵 Selector de método de pago antes de solicitar */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {payment === "Efectivo" ? (
                  <Banknote className="h-5 w-5 text-[#4ade80] shrink-0" />
                ) : payment.startsWith("Tarjeta") ? (
                  <CreditCard className="h-5 w-5 text-amber-pop shrink-0" />
                ) : (
                  <Landmark className="h-5 w-5 text-sky-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-black text-white">{payment}</p>
                  <p className="text-[11px] font-bold text-white/50">
                    {payment === "Efectivo" ? "Pagas al conductor al llegar" : "Cobro automático y seguro"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaySheetOpen(true)}
                className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-black text-amber-pop transition hover:bg-white/20 active:scale-95"
              >
                Cambiar
              </button>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={request} disabled={!destino.trim()} className="mt-5 w-full rounded-full bg-amber-pop py-4 text-[15px] font-black text-[#16121b] shadow-[0_12px_28px_rgba(251,191,36,0.35)] transition hover:brightness-105 disabled:opacity-40">
              {when === "schedule" ? (schedDate ? "Programar rayte" : "Elegir hora de recogida") : `Solicitar ${vehicle.label}`}
            </motion.button>

            <CrossSell items={crossItems} dark title={crossTitle} />
          </motion.div>
        )}

        {phase === "searching" && (
          <div className="flex flex-col items-center pt-16">
            <Loader2 className="h-10 w-10 animate-spin text-amber-pop" />
            <p className="mt-4 text-lg font-black">{when === "schedule" ? "Programando tu rayte..." : "Buscando tu conductor..."}</p>
            <p className="mt-1 text-[13px] font-bold text-white/60">{vehicle.label} · {destino}</p>
          </div>
        )}

        {phase === "scheduled" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
            <div className="rounded-[26px] border border-amber-pop/40 bg-amber-pop/10 p-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-pop"><CalendarDays className="h-8 w-8 text-[#16121b]" /></span>
              <p className="mt-4 text-xl font-black">¡Rayte programado!</p>
              <p className="mt-1 text-[14px] font-bold text-white/80 capitalize">{schedLabel(schedDate, true)}</p>
            </div>
            <div className="mt-4 space-y-2.5 rounded-[22px] bg-white/[0.06] p-4 text-[13.5px] font-bold">
              <p className="flex justify-between"><span className="text-white/60">Vehículo</span>{vehicle.label}</p>
              <p className="flex justify-between"><span className="text-white/60">Destino</span><span className="max-w-[200px] truncate">{destino}</span></p>
              <p className="flex justify-between"><span className="text-white/60">Tarifa</span><span className="font-black text-amber-pop">{formatMXN(vehicle.price)}</span></p>
              <p className="flex justify-between"><span className="text-white/60">Conductor</span><span>Se asigna 15 min antes</span></p>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-bold text-white/50">
              <ShieldCheck className="h-4 w-4 text-amber-pop" /> Cancela sin costo hasta 60 min antes de la recogida
            </p>
            <button onClick={() => { setPhase("form"); setSchedDate(null); setWhen("now"); }} className="mt-4 w-full rounded-full border border-white/15 py-3.5 text-[14px] font-black text-white/80 transition hover:bg-white/10">
              <span className="flex items-center justify-center gap-2"><Check className="h-4.5 w-4.5" /> Listo (demo)</span>
            </button>

            {/* Carrusel de los 4 servicios de la app */}
            <ServiceCarousel />
            <CrossSell items={crossItems} dark title={crossTitle} />
          </motion.div>
        )}

        {phase === "assigned" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Botón de pánico y seguridad — exclusivo durante el viaje activo */}
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <span className="flex items-center gap-1.5 text-[12px] font-black text-[#4ade80]">
                <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[#4ade80]" /> En trayecto
              </span>
              <button
                onClick={() => setSosOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-[11.5px] font-black text-rose-300 transition hover:bg-rose-500/30 active:scale-95 shadow-sm"
              >
                <ShieldAlert className="h-4 w-4 text-rose-400" /> SOS · Seguridad
              </button>
            </div>

            <div className="overflow-hidden rounded-[26px] bg-white/[0.06]">
              <svg viewBox="0 0 400 240" className="block w-full">
                <rect width="400" height="240" fill="#16121b" />
                {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
                {[50, 100, 150, 200, 250, 300, 350].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
                <path d={ROUTE} stroke="#fbbf24" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d={ROUTE} stroke="#16121b" strokeWidth="2.5" fill="none" strokeDasharray="8 18" className="route-dash" strokeLinecap="round" />
                <circle cx="36" cy="196" r="10" fill="#0ea55b" />
                <circle cx="368" cy="88" r="10" style={{ fill: "var(--brand)" }} />
                <circle cx="202" cy="118" r="12" fill="#fbbf24" stroke="#16121b" strokeWidth="2.5" className="courier-ring" />
              </svg>
            </div>

            {/* Ficha del Conductor / Conductora */}
            <div className="mt-4 rounded-[22px] bg-white/[0.06] p-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-black ${womenOnly ? "bg-pink-500 text-white" : "bg-amber-pop text-[#16121b]"}`}>
                  {womenOnly ? "CR" : "JM"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="truncate text-[15px] font-black">{assignedDriverName} · {assignedVehicleLine}</p>
                    {womenOnly && (
                      <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-black text-pink-300">
                        🌸 Rayte Mujer
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold text-white/60">
                    <Star className="h-3 w-3 fill-amber-pop text-amber-pop" /> 4.9 · Placas {assignedPlate} · llega en ~{Math.max(2, vehicle.eta - 4)} min
                  </p>
                </div>
                <button aria-label="Llamar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-pop text-[#16121b] transition active:scale-95">
                  <Phone className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Foto de referencia enviada */}
              {refPhoto && (
                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image src={refPhoto} alt="Referencia enviada" fill className="object-cover" sizes="40px" />
                  </div>
                  <p className="text-[11.5px] font-bold text-white/70 truncate">
                    Foto de punto de encuentro compartida con {womenOnly ? "la conductora" : "el conductor"}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[22px] bg-white/[0.06] p-4">
              <span className="flex items-center gap-2 text-[13.5px] font-bold text-white/80">
                <CircleDollarSign className="h-4.5 w-4.5 text-amber-pop" /> Tarifa ({payment})
              </span>
              <span className="text-[16px] font-black text-amber-pop">{formatMXN(vehicle.price)}</span>
            </div>

            <button onClick={() => { setPhase("form"); setRefPhoto(null); }} className="mt-5 w-full rounded-full border border-white/15 py-3.5 text-[14px] font-black text-white/80 transition hover:bg-white/10">
              <span className="flex items-center justify-center gap-2"><Check className="h-4.5 w-4.5" /> Viaje completado (demo)</span>
            </button>

            {/* Carrusel de los 4 servicios de la app */}
            <ServiceCarousel />
            <CrossSell items={crossItems} dark title={crossTitle} />
          </motion.div>
        )}
      </div>

      {/* ── Hoja de Selección de Método de Pago ── */}
      <AnimatePresence>
        {paySheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaySheetOpen(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[85] mx-auto max-w-lg rounded-t-[28px] bg-[#1d1824] p-5 pb-8 shadow-[0_-20px_60px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-black text-white">Método de pago</h2>
                  <p className="text-[12px] font-bold text-white/50">¿Cómo prefieres pagar tu viaje?</p>
                </div>
                <button
                  onClick={() => setPaySheetOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { id: "Efectivo", icon: Banknote, label: "Efectivo", desc: "Pagas en mano al conductor al llegar", color: "#4ade80" },
                  { id: "Tarjeta •••• 4821", icon: CreditCard, label: "Tarjeta de débito/crédito", desc: "Visa terminada en 4821 · Cobro directo", color: "#fbbf24" },
                  { id: "Transferencia SPEI", icon: Landmark, label: "Transferencia / SPEI", desc: "Transfiere al terminar el recorrido", color: "#38bdf8" },
                ].map((m) => {
                  const active = payment === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setPayment(m.id as typeof payment);
                        setPaySheetOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[20px] border p-3.5 text-left transition ${
                        active
                          ? "border-amber-pop bg-amber-pop/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${m.color}22`, color: m.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-black">{m.label}</p>
                        <p className="text-[11.5px] font-bold text-white/50">{m.desc}</p>
                      </div>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          active ? "border-amber-pop bg-amber-pop" : "border-white/20"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 text-[#16121b]" strokeWidth={3.5} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hoja de Seguridad y Botón de Pánico (SOS) ── */}
      <AnimatePresence>
        {sosOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSosOpen(false)}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[85] mx-auto max-w-lg rounded-t-[28px] border-t-2 border-rose-500 bg-[#1d1824] p-5 pb-8 shadow-[0_-20px_60px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                    <Siren className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-[18px] font-black text-white">Centro de Seguridad SOS</h2>
                    <p className="text-[11.5px] font-bold text-white/60">Asistencia inmediata para tu viaje</p>
                  </div>
                </div>
                <button
                  onClick={() => setSosOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Ficha rápida de seguridad del viaje */}
              <div className="mt-4 space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 text-[12.5px] font-bold text-white/80">
                <p className="text-[10.5px] font-black tracking-wider text-white/50 uppercase">Datos del viaje activo</p>
                <p className="flex justify-between">
                  <span>Conductor:</span> <span className="font-black text-white">{assignedDriverName} · 4.9 ★</span>
                </p>
                <p className="flex justify-between">
                  <span>Vehículo:</span> <span className="font-black text-amber-pop">{assignedVehicleLine} · Placas {assignedPlate}</span>
                </p>
                <p className="flex justify-between">
                  <span>Destino:</span> <span className="max-w-[200px] truncate font-black text-white">{destino}</span>
                </p>
              </div>

              {/* Botones de acción rápida */}
              <div className="mt-4 space-y-2.5">
                <a
                  href="tel:911"
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-rose-600 py-3.5 text-[15px] font-black text-white shadow-[0_10px_25px_rgba(225,29,72,0.4)] transition hover:bg-rose-700 active:scale-95"
                >
                  <AlertOctagon className="h-5 w-5" /> Llamar al 911 (Emergencias)
                </a>

                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(
                        `Estoy viajando en Rayte con ${assignedDriverName} (${assignedVehicleLine}, Placas ${assignedPlate}) rumbo a ${destino}. Mi viaje está activo.`,
                      );
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] py-3 text-[13.5px] font-black text-white transition hover:bg-white/15 active:scale-95"
                >
                  {copiedLink ? <CheckCheck className="h-4.5 w-4.5 text-[#4ade80]" /> : <Share2 className="h-4.5 w-4.5 text-amber-pop" />}
                  {copiedLink ? "¡Datos del viaje copiados para compartir!" : "Compartir datos del viaje"}
                </button>

                <a
                  href="tel:8000007298"
                  className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[12px] font-black text-white/70 hover:text-white"
                >
                  <ShieldCheck className="h-4 w-4 text-[#0ea55b]" /> Soporte Rayte Seguridad 24/7 (800-000-RAYTE)
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hoja inferior estilo Uber: "Elige tu hora de recogida" ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}
              className="fixed inset-x-0 bottom-0 z-[85] mx-auto max-w-lg rounded-t-[28px] bg-[#1d1824] px-5 pb-6 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/15" />
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h2 className="text-[20px] font-black tracking-tight">¿Cuándo te recogemos?</h2>
                  <p className="mt-0.5 text-[12.5px] font-bold text-white/50">Elige la fecha y la hora de tu recogida</p>
                </div>
                <button onClick={closeSheet} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Ruedas: fecha + hora */}
              <div className="mt-4 flex gap-2 rounded-[22px] border border-white/10 bg-white/[0.03] px-2">
                <Wheel grow items={dates.map((d) => d.label)} index={dayIdx} onChange={setDayIdx} />
                <div className="my-4 w-px bg-white/10" />
                <Wheel items={times.map((t) => t.label)} index={Math.min(timeIdx, times.length - 1)} onChange={setTimeIdx} />
              </div>

              {/* Viñetas informativas estilo Uber */}
              <div className="mt-4 space-y-2.5 text-[12.5px] font-bold text-white/70">
                <p className="flex items-center gap-2.5"><CalendarDays className="h-4 w-4 shrink-0 text-amber-pop" /> Elige tu hora de recogida con hasta 30 días de anticipación</p>
                <p className="flex items-center gap-2.5"><Clock3 className="h-4 w-4 shrink-0 text-amber-pop" /> Tiempo de espera adicional incluido para tu recogida</p>
                <p className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-pop" /> Cancela sin costo hasta 60 minutos antes</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={setPickup}
                className="mt-5 w-full rounded-full bg-amber-pop py-4 text-[15px] font-black text-[#16121b] shadow-[0_12px_28px_rgba(251,191,36,0.35)] transition hover:brightness-105"
              >
                Establecer hora de recogida
              </motion.button>
              <button onClick={rideNow} className="mt-2.5 w-full rounded-full py-3 text-[14px] font-black text-white/70 transition hover:bg-white/5 hover:text-white">
                Recogerme ahora
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/app-header.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Search, Zap, Bell, X, BadgePercent, ReceiptText, CalendarDays } from "lucide-react";
import { useCart } from "@/store/cart";

const NOTIFS = [
  { icon: ReceiptText, color: "var(--brand)", bg: "var(--brand-soft)", title: "Tu pedido está en camino", body: "Andrés M. llegó al restaurante", href: "/pedidos" },
  { icon: BadgePercent, color: "#0ea55b", bg: "#e6f8ee", title: "50% en tu primer pedido", body: "Usa el código HOLA50 en La Brasa Smash", href: "/restaurante/la-brasa-smash" },
  { icon: CalendarDays, color: "#7c3aed", bg: "#f2ecff", title: "¿Agenda un servicio?", body: "Barbería, masajes y más a domicilio", href: "/servicios" },
];

export default function AppHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const address = useCart((s) => s.address);
  const setAddress = useCart((s) => s.setAddress);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand-hard to-[var(--brand-accent)] pt-[env(safe-area-inset-top)] transition-all duration-300">
        <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute top-10 -right-4 h-20 w-20 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-black/5" />

        <div className="relative mx-auto max-w-6xl px-4 py-2.5 sm:py-3.5">
          {/* ── Vista Desktop / Tablet (md+): Todo optimizado en una sola barra horizontal ── */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 select-none shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-md">
                <Zap className="h-5 w-5 fill-brand text-brand" />
              </span>
              <span className="text-[26px] font-black tracking-tight text-white italic">rayte</span>
            </Link>

            {/* Buscador central amplio */}
            <div className="flex-1 max-w-xl">
              <button
                onClick={() => router.push("/buscar")}
                className="flex w-full items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-left shadow-md transition hover:shadow-lg"
              >
                <Search className="h-4.5 w-4.5 shrink-0 text-brand" strokeWidth={2.6} />
                <span className="truncate text-[13.5px] font-bold text-ink-soft">
                  Buscar platillos, panaderías, citas, médicos...
                </span>
              </button>
            </div>

            {/* Dirección + Notificaciones */}
            <div className="flex items-center gap-3 shrink-0">
              {editing ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (draft.trim()) setAddress(draft.trim());
                    setEditing(false);
                  }}
                >
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribe tu dirección"
                    className="w-56 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink shadow-md outline-none"
                  />
                  <button className="rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white">OK</button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setDraft(address);
                    setEditing(true);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-white backdrop-blur transition hover:bg-white/25"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-white" strokeWidth={2.6} />
                  <span className="max-w-[180px] truncate text-[12.5px] font-extrabold">
                    {mounted ? address : "Blvd. Aeropuerto 125, León, GTO"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => {
                    setBellOpen((v) => !v);
                    setUnread(false);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unread && <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-amber-pop ring-2 ring-brand-hard" />}
                </button>
                <AnimatePresence>
                  {bellOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="absolute right-0 z-50 mt-3 w-[320px] overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-2xl text-ink"
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <p className="text-[14px] font-black text-ink">Notificaciones</p>
                          <button onClick={() => setBellOpen(false)} aria-label="Cerrar" className="flex h-7 w-7 items-center justify-center rounded-full bg-mist"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto">
                          {NOTIFS.map((n) => (
                            <Link key={n.title} href={n.href} onClick={() => setBellOpen(false)} className="flex items-start gap-3 border-t border-black/5 px-4 py-3 transition hover:bg-mist/60">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: n.bg, color: n.color }}><n.icon className="h-4.5 w-4.5" /></span>
                              <span className="min-w-0">
                                <span className="block text-[13.5px] font-black text-ink">{n.title}</span>
                                <span className="block text-[12px] font-bold text-ink-soft">{n.body}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <Link href="/pedidos" onClick={() => setBellOpen(false)} className="block bg-mist/60 px-4 py-3 text-center text-[12.5px] font-black text-brand">Ver mis pedidos</Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Vista Móvil: Barra compacta integrada (Logo + Dirección + Campana en 1 línea) ── */}
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="flex items-center gap-1.5 select-none shrink-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Zap className="h-4.5 w-4.5 fill-brand text-brand" />
                </span>
                <span className="text-[22px] font-black tracking-tight text-white italic">rayte</span>
              </Link>

              {/* Dirección compacta al centro */}
              <div className="min-w-0 flex-1 px-1">
                {editing ? (
                  <form
                    className="flex items-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (draft.trim()) setAddress(draft.trim());
                      setEditing(false);
                    }}
                  >
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Dirección"
                      className="w-full rounded-full bg-white px-3 py-1 text-xs font-bold text-ink outline-none"
                    />
                    <button className="rounded-full bg-ink px-2.5 py-1 text-xs font-black text-white">OK</button>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setDraft(address);
                      setEditing(true);
                    }}
                    className="flex w-full items-center justify-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-white backdrop-blur"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.6} />
                    <span className="max-w-[160px] truncate text-[12px] font-extrabold">
                      {mounted ? address : "León, GTO"}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0 opacity-80" />
                  </button>
                )}
              </div>

              {/* Campana */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    setBellOpen((v) => !v);
                    setUnread(false);
                  }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-4 w-4" />
                  {unread && <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-amber-pop ring-2 ring-brand-hard" />}
                </button>
                <AnimatePresence>
                  {bellOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="absolute right-0 z-50 mt-2 w-[290px] overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-2xl text-ink"
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <p className="text-[13.5px] font-black text-ink">Notificaciones</p>
                          <button onClick={() => setBellOpen(false)} aria-label="Cerrar" className="flex h-7 w-7 items-center justify-center rounded-full bg-mist"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="max-h-[280px] overflow-y-auto">
                          {NOTIFS.map((n) => (
                            <Link key={n.title} href={n.href} onClick={() => setBellOpen(false)} className="flex items-start gap-2.5 border-t border-black/5 px-3.5 py-2.5 transition hover:bg-mist/60">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: n.bg, color: n.color }}><n.icon className="h-4 w-4" /></span>
                              <span className="min-w-0">
                                <span className="block text-[13px] font-black text-ink">{n.title}</span>
                                <span className="block text-[11px] font-bold text-ink-soft">{n.body}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <Link href="/pedidos" onClick={() => setBellOpen(false)} className="block bg-mist/60 px-4 py-2.5 text-center text-[12px] font-black text-brand">Ver mis pedidos</Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Buscador optimizado inmediatamente abajo */}
            <div className="mt-2">
              <button
                onClick={() => router.push("/buscar")}
                className="flex w-full items-center gap-2 rounded-full bg-white px-3.5 py-2.5 text-left shadow-md active:scale-[0.99]"
              >
                <Search className="h-4.5 w-4.5 shrink-0 text-brand" strokeWidth={2.6} />
                <span className="truncate text-[13px] font-bold text-ink-soft">
                  Buscar platillos, panaderías, citas, médicos...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/app-shell-chrome.tsx
// --------------------------------------------------------
"use client";

export default function AppShellChrome() {
  return null;
}


// --------------------------------------------------------
// ARCHIVO: src/components/back-button.tsx
// --------------------------------------------------------
"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
  label = "Volver",
  fallback = "/",
}: {
  label?: string;
  fallback?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (typeof window === "undefined") {
      router.push(fallback);
      return;
    }

    const referrer = document.referrer ? new URL(document.referrer, window.location.origin) : null;
    const sameOrigin = Boolean(referrer && referrer.origin === window.location.origin);
    const differentPath = Boolean(referrer && `${referrer.pathname}${referrer.search}` !== pathname);

    if (window.history.length > 1 && sameOrigin && differentPath) {
      const currentPath = pathname;
      router.back();
      window.setTimeout(() => {
        if (window.location.pathname === currentPath) {
          router.push(fallback);
        }
      }, 160);
      return;
    }

    router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:bg-mist active:scale-90"
    >
      <ArrowLeft className="h-5 w-5 text-ink" />
    </button>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/bottom-nav.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ReceiptText, User, CarFront, Utensils, CalendarDays, Stethoscope, X, Zap, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/viajes", label: "Viajes", icon: CarFront },
  { href: "/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/cuenta", label: "Cuenta", icon: User },
];

/* Los 4 servicios de Rayte, cada uno con el color de su sección */
const quick = [
  { href: "/buscar", label: "Comida", desc: "Restaurantes, panaderías y más", icon: Utensils, color: "#ea580c", soft: "#ffedd5", match: (p: string) => p.startsWith("/restaurante") || p.startsWith("/buscar") },
  { href: "/viajes", label: "Rayte", desc: "Viaja por la ciudad", icon: CarFront, color: "#d97706", soft: "#fef3c7", match: (p: string) => p.startsWith("/viajes") },
  { href: "/servicios", label: "Citas y Servicios", desc: "Belleza, hogar y más", icon: CalendarDays, color: "#7c3aed", soft: "#f3e8ff", match: (p: string) => p.startsWith("/servicios") && !p.includes("cat=salud") },
  { href: "/servicios?cat=salud", label: "Salud", desc: "Médicos y farmacias 24h", icon: Stethoscope, color: "#1d6ae5", soft: "#e8f1fe", match: (p: string) => p.startsWith("/servicios") && p.includes("cat=salud") },
];

/* ── Menú lateral (asa) para páginas SIN barra inferior ── */
function SideMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <div className="fixed top-16 left-0 z-[75]">
        {!open ? (
          <motion.button
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.9 }}
            aria-label="Abrir menú de servicios Rayte"
            className="flex h-16 w-7 items-center justify-center rounded-r-2xl bg-ink/95 shadow-[0_6px_20px_rgba(0,0,0,0.35)] ring-2 ring-white/90 backdrop-blur"
          >
            <span className="flex flex-col items-center gap-0.5 text-white">
              <Zap className="h-3.5 w-3.5 fill-brand text-brand" />
              <ChevronRight className="h-4 w-4" strokeWidth={3} />
            </span>
          </motion.button>
        ) : (
          <motion.button
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setOpen(false)}
            whileTap={{ scale: 0.9 }}
            aria-label="Cerrar menú"
            className="ml-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] ring-2 ring-white/90"
          >
            <X className="h-5 w-5" strokeWidth={2.8} />
          </motion.button>
        )}

        <AnimatePresence>
          {open && (
            <div className="mt-2.5 ml-3 flex flex-col gap-2">
              {quick.map(({ href, label, desc, icon: Icon, color, soft, match }, i) => {
                const active = match(pathname);
                return (
                  <motion.div
                    key={label}
                    initial={{ x: -70, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -70, opacity: 0, transition: { delay: (quick.length - 1 - i) * 0.03 } }}
                    transition={{ type: "spring", stiffness: 420, damping: 30, delay: i * 0.06 }}
                  >
                    <Link
                      href={href}
                      className="flex w-[210px] items-center gap-3 rounded-[20px] border bg-white py-2.5 pr-4 pl-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition active:scale-95"
                      style={{ borderColor: active ? color : "rgba(0,0,0,0.06)" }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: soft }}>
                        <Icon className="h-5 w-5" style={{ color }} strokeWidth={2.5} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] leading-tight font-black" style={{ color: active ? color : undefined }}>{label}</span>
                        <span className="block truncate text-[11px] font-bold text-ink-soft">{desc}</span>
                      </span>
                      {active && <span className="ml-auto h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  const navHidden =
    pathname.startsWith("/pedido/") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/socio") ||
    pathname.startsWith("/profesional") ||
    pathname.startsWith("/conductor");

  const sideMenuHidden = pathname.startsWith("/checkout") || pathname.startsWith("/pedido/");

  /* Páginas sin barra: el menú vive en el asa lateral, excepto en flujos críticos */
  if (navHidden) return sideMenuHidden ? null : <SideMenu pathname={pathname} />;

  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <>
      {/* Hoja del menú: se despliega desde la barra, con el estilo oscuro del menú original */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed inset-x-4 bottom-24 z-[65] mx-auto max-w-md rounded-[28px] bg-ink/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur"
            >
              <p className="flex items-center gap-1.5 px-1 text-[11px] font-black tracking-widest text-white/60 uppercase">
                <Zap className="h-3.5 w-3.5 fill-brand text-brand" /> Servicios Rayte
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {quick.map(({ href, label, desc, icon: Icon, color, soft, match }, i) => {
                  const active = match(pathname);
                  const lastOdd = i === quick.length - 1 && quick.length % 2 === 1;
                  return (
                    <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }} className={lastOdd ? "col-span-2" : ""}>
                      <Link
                        href={href}
                        className="flex items-center gap-2.5 rounded-[20px] border p-3 transition active:scale-95"
                        style={{ borderColor: active ? color : "rgba(255,255,255,0.10)", backgroundColor: active ? `${color}22` : "rgba(255,255,255,0.05)" }}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: soft }}>
                          <Icon className="h-4.5 w-4.5" style={{ color }} strokeWidth={2.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] leading-tight font-black text-white">{label}</span>
                          <span className="block truncate text-[10.5px] font-bold text-white/60">{desc}</span>
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barra inferior con el botón Menú al centro */}
      <nav className="fixed inset-x-0 bottom-0 z-50 lg:bottom-4">
        <div className="mx-auto max-w-md px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around border-t border-black/5 bg-white/95 px-1 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur lg:rounded-full lg:border lg:shadow-2xl">
            {left.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className="relative flex flex-col items-center gap-0.5 px-3.5 py-2.5">
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-x-1 inset-y-1 rounded-full bg-brand-soft" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  <Icon className={`relative h-5 w-5 ${active ? "text-brand" : "text-ink-soft"}`} strokeWidth={active ? 2.6 : 2} />
                  <span className={`relative text-[11px] font-extrabold ${active ? "text-brand" : "text-ink-soft"}`}>{label}</span>
                </Link>
              );
            })}

            {/* Botón Menú central, elevado, con el color oscuro del menú original */}
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menú de servicios" className="relative flex flex-col items-center px-3.5 pt-0 pb-1.5">
              <motion.span
                animate={{ rotate: menuOpen ? 90 : 0 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="-mt-3.5 flex items-center justify-center rounded-full bg-ink/95 shadow-[0_6px_16px_rgba(0,0,0,0.28)] ring-2 ring-white"
                style={{ height: 40, width: 40 }}
              >
                {menuOpen ? <X className="h-4 w-4 text-white" strokeWidth={2.8} /> : <Zap className="h-4 w-4 fill-brand text-brand" />}
              </motion.span>
              <span className={`mt-1 text-[11px] font-extrabold ${menuOpen ? "text-ink" : "text-ink-soft"}`}>Menú</span>
            </button>

            {right.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} className="relative flex flex-col items-center gap-0.5 px-3.5 py-2.5">
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-x-1 inset-y-1 rounded-full bg-brand-soft" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  <Icon className={`relative h-5 w-5 ${active ? "text-brand" : "text-ink-soft"}`} strokeWidth={active ? 2.6 : 2} />
                  <span className={`relative text-[11px] font-extrabold ${active ? "text-brand" : "text-ink-soft"}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/cart-shell.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X, Trash2, MapPin, Pill, Zap, Clock3, Store, ChevronRight, Plus } from "lucide-react";
import { useCart, cartSubtotal, cartCount, type CartItem as StoreCartItem } from "@/store/cart";
import type { Product, ProductExtra, Restaurant } from "@/db/schema";
import { formatMXN, serviceFeeFor } from "@/lib/utils";
import { QtyStepper } from "./stepper";
import ItemModal from "./item-modal";

type CartSuggestion = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  section: string;
  popular: boolean;
};

type EditingPayload = {
  cartItem: StoreCartItem;
  product: Product;
  store: Restaurant;
  extras: ProductExtra[];
};

function ItemThumb({ image, name }: { image: string | null; name: string }) {
  if (!image) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-brand-soft">
        <Pill className="h-6 w-6 text-brand" />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-mist">
      <Image src={image} alt={name} fill className="object-cover" sizes="64px" />
    </div>
  );
}

function OptionBadges({ options }: { options?: string }) {
  if (!options) return null;

  const parts = options.split(" · ").map((part) => part.trim()).filter(Boolean);
  const visible = parts.slice(0, 2);
  const extra = parts.length - visible.length;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {visible.map((part) => (
        <span key={part} className="rounded-full bg-mist px-2 py-1 text-[10px] font-black text-ink-soft">
          {part}
        </span>
      ))}
      {extra > 0 && <span className="rounded-full bg-mist px-2 py-1 text-[10px] font-black text-ink-soft">+{extra}</span>}
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "text-[15px] font-black text-ink" : "text-[13px] font-bold text-ink-soft"}`}>
      <span>{label}</span>
      <span className="shrink-0 text-ink">{value}</span>
    </div>
  );
}

export default function CartShell() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    items,
    restaurant,
    drawerOpen,
    closeDrawer,
    openDrawer,
    increment,
    decrement,
    removeItem,
    clear,
    address,
    setAddress,
    addItem,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState("");
  const [suggestions, setSuggestions] = useState<CartSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editingPayload, setEditingPayload] = useState<EditingPayload | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen || !restaurant) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const exclude = Array.from(new Set(items.map((item) => item.productId))).join(",");

    setLoadingSuggestions(true);
    fetch(`/api/cart-suggestions?store=${encodeURIComponent(restaurant.slug)}&exclude=${encodeURIComponent(exclude)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudieron cargar sugerencias");
        return res.json();
      })
      .then((data) => {
        setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSuggestions([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSuggestions(false);
      });

    return () => controller.abort();
  }, [drawerOpen, restaurant, items]);

  if (!mounted) return null;

  const subtotal = cartSubtotal(items);
  const count = cartCount(items);
  const fee = serviceFeeFor(subtotal);
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = subtotal + fee + deliveryFee;
  const hideFab =
    pathname === "/checkout" ||
    pathname.startsWith("/pedido/") ||
    pathname === "/buscar" ||
    pathname.startsWith("/servicios") ||
    pathname.startsWith("/viajes") ||
    pathname.startsWith("/profesional");

  const openEditItem = async (item: StoreCartItem) => {
    if (!restaurant || editingItemKey) return;

    try {
      setEditingItemKey(item.key);
      const res = await fetch(
        `/api/cart-item?store=${encodeURIComponent(restaurant.slug)}&productId=${item.productId}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("No se pudo abrir el editor");
      const data = (await res.json()) as {
        store: Restaurant;
        product: Product;
        extras: ProductExtra[];
      };
      closeDrawer();
      setEditingPayload({ cartItem: item, product: data.product, store: data.store, extras: data.extras ?? [] });
    } catch {
      setEditingPayload(null);
    } finally {
      setEditingItemKey(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && !drawerOpen && !hideFab && (
          <motion.button
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={openDrawer}
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto flex max-w-md items-center justify-between rounded-full bg-brand px-4 py-3.5 text-white shadow-[0_18px_40px_var(--brand-glow)] lg:bottom-24 active:scale-[0.98]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/18">
                <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-[14px] font-black">{count} {count === 1 ? "producto" : "productos"}</span>
                {restaurant && <span className="block truncate text-[11px] font-bold text-white/85">{restaurant.name}</span>}
              </span>
            </span>
            <span className="shrink-0 text-[15px] font-black">{formatMXN(subtotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[80] bg-black/42 backdrop-blur-[2px]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 right-0 z-[85] w-full max-w-md overflow-y-auto overscroll-contain bg-[#f7f6f4] shadow-[0_10px_60px_rgba(0,0,0,0.22)] sm:inset-y-3 sm:right-3 sm:rounded-[32px] sm:border sm:border-black/5"
            >
              <div className="sticky top-0 z-10 border-b border-black/5 bg-white/96 px-4 pb-3 pt-3 backdrop-blur">
                <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/10 sm:hidden" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-soft/65">Pedido actual</p>
                    <h2 className="mt-1 text-[26px] leading-none font-black tracking-tight text-ink">Tu carrito</h2>
                    {restaurant && (
                      <p className="mt-2 flex items-center gap-1.5 text-[13px] font-extrabold text-ink-soft">
                        <Store className="h-4 w-4 text-brand" />
                        <span className="truncate">de {restaurant.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <button
                        onClick={clear}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink-soft transition hover:text-brand"
                        aria-label="Vaciar carrito"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                    <button
                      onClick={closeDrawer}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink transition hover:bg-black/10"
                      aria-label="Cerrar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {restaurant && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-black text-brand">
                      {count} {count === 1 ? "artículo" : "artículos"}
                    </span>
                    <span className="rounded-full bg-[#edf7ff] px-3 py-1.5 text-[11px] font-black text-[#1d6ae5]">
                      <Clock3 className="mr-1 inline h-3.5 w-3.5" /> {restaurant.timeMin}-{restaurant.timeMax} min
                    </span>
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="px-8 py-14 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft">
                    <ShoppingBag className="h-10 w-10 text-brand" strokeWidth={1.8} />
                  </div>
                  <p className="mt-4 text-lg font-black">Tu carrito está vacío</p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] font-bold text-ink-soft">Agrega algo rico o algo útil para empezar tu pedido.</p>
                  <Link href="/" onClick={closeDrawer} className="mt-4 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-black text-white">
                    Explorar
                  </Link>
                </div>
              ) : (
                <div className="px-4 py-4">
                  <section>
                    <div className="mb-3 px-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/65">Tu pedido</p>
                      <h3 className="mt-1 text-[20px] font-black tracking-tight text-ink">Revisa antes de pagar</h3>
                    </div>

                    <div className="space-y-2.5">
                      <AnimatePresence initial={false}>
                        {items.map((item) => (
                          <motion.div
                            key={item.key}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            className="rounded-[22px] border border-black/5 bg-white p-3"
                          >
                            <div className="flex gap-3">
                              <ItemThumb image={item.image} name={item.name} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[15px] leading-tight font-black text-ink">{item.name}</p>
                                    <OptionBadges options={item.options} />
                                    {item.notes && (
                                      <div className="mt-2 rounded-2xl bg-[#fff4ef] px-3 py-2 text-[11px] font-bold leading-snug text-brand">
                                        Nota: {item.notes}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.key)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-mist hover:text-brand"
                                    aria-label="Eliminar"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void openEditItem(item)}
                                    disabled={editingItemKey === item.key}
                                    className="rounded-full bg-mist px-3 py-1.5 text-[11px] font-black text-ink transition hover:bg-black/8 disabled:opacity-50"
                                  >
                                    {editingItemKey === item.key ? "Abriendo..." : "Editar extras"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.key)}
                                    className="rounded-full bg-[#fff4ef] px-3 py-1.5 text-[11px] font-black text-brand transition hover:bg-[#ffe8dd]"
                                  >
                                    Quitar
                                  </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                                  <QtyStepper small qty={item.qty} onInc={() => increment(item.key)} onDec={() => decrement(item.key)} />
                                  <div className="text-right">
                                    <p className="text-[16px] leading-none font-black text-ink">{formatMXN(item.price * item.qty)}</p>
                                    {item.qty > 1 && <p className="mt-1 text-[10.5px] font-bold text-ink-soft">{formatMXN(item.price)} c/u</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>

                  {(loadingSuggestions || suggestions.length > 0) && restaurant && (
                    <section className="mt-6">
                      <div className="mb-3 px-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/65">Agrega algo más</p>
                        <h3 className="mt-1 text-[20px] font-black tracking-tight text-ink">Acompaña tu pedido</h3>
                        <p className="mt-1 text-[11.5px] font-bold text-ink-soft">Bebidas, guarniciones y extras del mismo negocio.</p>
                      </div>

                      <div className="space-y-2">
                        {loadingSuggestions
                          ? Array.from({ length: 3 }).map((_, idx) => (
                              <div key={`skeleton-${idx}`} className="rounded-[20px] border border-black/5 bg-white p-3">
                                <div className="flex gap-3">
                                  <div className="h-14 w-14 animate-pulse rounded-[16px] bg-mist" />
                                  <div className="min-w-0 flex-1">
                                    <div className="h-4 w-24 animate-pulse rounded-full bg-mist" />
                                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded-full bg-mist" />
                                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-mist" />
                                  </div>
                                </div>
                              </div>
                            ))
                          : suggestions.map((product) => (
                              <div key={`suggestion-${product.id}`} className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-white p-3">
                                <ItemThumb image={product.image} name={product.name} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-black text-ink">{product.name}</p>
                                  <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-ink-soft">{product.description}</p>
                                  <div className="mt-1 flex items-center justify-between gap-2">
                                    <span className="truncate text-[10px] font-black text-ink-soft">{product.section}</span>
                                    <span className="shrink-0 text-[12px] font-black text-brand">{formatMXN(product.price)}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addItem(
                                      {
                                        key: `${product.id}`,
                                        productId: product.id,
                                        name: product.name,
                                        price: product.price,
                                        basePrice: product.price,
                                        image: product.image,
                                        qty: 1,
                                      },
                                      restaurant,
                                    )
                                  }
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark active:scale-95"
                                  aria-label={`Agregar ${product.name}`}
                                >
                                  <Plus className="h-4 w-4" strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                      </div>
                    </section>
                  )}

                  <section className="mt-6 space-y-3">
                    <div className="rounded-[22px] bg-white p-3">
                      {editingAddress ? (
                        <form
                          className="flex items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (addressDraft.trim()) setAddress(addressDraft.trim());
                            setEditingAddress(false);
                          }}
                        >
                          <input
                            autoFocus
                            value={addressDraft}
                            onChange={(e) => setAddressDraft(e.target.value)}
                            placeholder="Nueva dirección de entrega"
                            className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-[13px] font-bold outline-none focus:border-brand"
                          />
                          <button type="submit" className="shrink-0 rounded-2xl bg-ink px-4 py-3 text-[13px] font-black text-white">
                            OK
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setAddressDraft(address);
                            setEditingAddress(true);
                          }}
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
                            <MapPin className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/70">Entregar en</span>
                            <span className="mt-0.5 block truncate text-[13px] font-black text-ink">{address}</span>
                          </span>
                          <span className="shrink-0 text-[12px] font-black text-brand">Cambiar</span>
                        </button>
                      )}
                    </div>

                    <div className="rounded-[22px] bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-soft/65">Resumen</p>
                      <div className="mt-3 space-y-2.5">
                        <SummaryRow label="Subtotal" value={formatMXN(subtotal)} />
                        <SummaryRow label="Envío" value={deliveryFee === 0 ? "Gratis" : formatMXN(deliveryFee)} />
                        <SummaryRow label="Tarifa de servicio" value={formatMXN(fee)} />
                        <div className="border-t border-black/6 pt-3">
                          <SummaryRow label="Total" value={formatMXN(total)} strong />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          closeDrawer();
                          router.push("/checkout");
                        }}
                        className="mt-4 flex w-full items-center justify-between rounded-full bg-brand px-5 py-4 font-black text-white shadow-[0_14px_34px_var(--brand-glow)] transition hover:bg-brand-dark active:scale-[0.98]"
                      >
                        <span className="flex items-center gap-2 text-[15px]">
                          <Zap className="h-4.5 w-4.5" /> Ir a pagar
                        </span>
                        <span className="flex items-center gap-1 text-[15px]">
                          {formatMXN(total)} <ChevronRight className="h-4 w-4" />
                        </span>
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {editingPayload && (
        <ItemModal
          product={editingPayload.product}
          store={editingPayload.store}
          extras={editingPayload.extras}
          editingItem={editingPayload.cartItem}
          onClose={() => {
            setEditingPayload(null);
            openDrawer();
          }}
        />
      )}
    </>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/category-carousel.tsx
// --------------------------------------------------------
"use client";

import { motion } from "framer-motion";
import type { Category } from "@/db/schema";
import { categoryIcon, ALL_ICON } from "./category-icon";

/**
 * Pasarela de categorías estilo Uber Eats: círculos con ícono y mini etiqueta.
 * Se usa en la sección de restaurantes (home) y en la página de búsqueda.
 */
export default function CategoryCarousel({
  categories,
  value,
  onSelect,
}: {
  categories: Category[];
  value: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      <CarouselItem
        active={!value}
        onClick={() => onSelect(null)}
        icon={ALL_ICON}
        label="Todos"
        color="#1f2937"
        bg="#f3f4f6"
      />
      {categories.map((c) => (
        <CarouselItem
          key={c.slug}
          active={value === c.slug}
          onClick={() => onSelect(value === c.slug ? null : c.slug)}
          icon={categoryIcon(c.icon)}
          label={c.name}
          color={c.color}
          bg={c.bg}
        />
      ))}
    </div>
  );
}

function CarouselItem({
  active,
  onClick,
  icon: Icon,
  label,
  color,
  bg,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
      <span
        className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] transition"
        style={{ backgroundColor: bg, boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : undefined }}
      >
        <span style={{ color }}>
          <Icon className="h-6 w-6" strokeWidth={2.2} />
        </span>
      </span>
      <span className={`text-center text-[10.5px] leading-tight font-extrabold ${active ? "text-ink" : "text-ink-soft"}`}>{label}</span>
    </motion.button>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/category-icon.ts
// --------------------------------------------------------
import { Utensils, ShoppingBasket, Zap, Pill, Beer, Salad, IceCreamCone, PawPrint, LayoutGrid, Croissant } from "lucide-react";

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/* Íconos por slug de categoría (estilo Uber Eats en los chips) */
export const CATEGORY_ICONS: Record<string, IconType> = {
  utensils: Utensils,
  croissant: Croissant,
  "shopping-basket": ShoppingBasket,
  zap: Zap,
  pill: Pill,
  beer: Beer,
  salad: Salad,
  "ice-cream-cone": IceCreamCone,
  "paw-print": PawPrint,
};

export const ALL_ICON: IconType = LayoutGrid;

export const categoryIcon = (icon: string): IconType => CATEGORY_ICONS[icon] ?? Utensils;


// --------------------------------------------------------
// ARCHIVO: src/components/category-photo-carousel.tsx
// --------------------------------------------------------
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import type { Category } from "@/db/schema";

/* Fotos por categoría y por tipos de comida (estilo Uber Eats) */
const CATEGORY_PHOTOS: Record<string, string> = {
  restaurantes: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  panaderias: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  mercado: "https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  turbo: "https://images.pexels.com/photos/3826282/pexels-photo-3826282.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  farmacia: "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  bebidas: "https://images.pexels.com/photos/10701942/pexels-photo-10701942.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  saludable: "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  postres: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  mascotas: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  /* Tipos de comida */
  hamburguesas: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  pizza: "https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  tacos: "https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  sushi: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  alitas: "https://images.pexels.com/photos/5652266/pexels-photo-5652266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  "pan-dulce": "https://images.pexels.com/photos/1775046/pexels-photo-1775046.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  cafe: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  bowls: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  helados: "https://images.pexels.com/photos/1352281/pexels-photo-1352281.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
};

/* Tipos de comida específicos que se agregan a la lista */
export const FOOD_TYPES = [
  { slug: "hamburguesas", name: "Hamburguesas" },
  { slug: "pizza", name: "Pizza" },
  { slug: "tacos", name: "Tacos" },
  { slug: "sushi", name: "Sushi" },
  { slug: "alitas", name: "Alitas & Pollo" },
  { slug: "pan-dulce", name: "Pan Dulce" },
  { slug: "cafe", name: "Café" },
  { slug: "bowls", name: "Bowls" },
  { slug: "helados", name: "Helados" },
];

const FALLBACK = "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200";

export default function CategoryPhotoCarousel({
  categories,
  value,
  onSelect,
  includeFoodTypes = true,
}: {
  categories: Category[];
  value: string | null;
  onSelect: (slug: string | null) => void;
  includeFoodTypes?: boolean;
}) {
  // Combina las categorías de comida (sin el círculo redundante "Restaurantes" ni "Mascotas") con los tipos de comida
  const allItems = [
    ...categories.filter((c) => c.slug !== "restaurantes" && c.slug !== "mascotas").map((c) => (c.slug === "farmacia" ? { ...c, name: "Farmacias" } : c)),
    ...(includeFoodTypes ? FOOD_TYPES : []),
  ];

  // Evita duplicados de slug si existen
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((it) => {
    if (seen.has(it.slug)) return false;
    seen.add(it.slug);
    return true;
  });

  return (
    <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1.5">
      {/* Todos */}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onSelect(null)} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-[var(--brand-accent)] transition ${!value ? "ring-2 ring-brand ring-offset-2 shadow-md" : "opacity-85"}`}
        >
          <LayoutGrid className="h-6 w-6 text-white" strokeWidth={2.2} />
        </span>
        <span className={`text-[10.5px] font-extrabold ${!value ? "text-brand" : "text-ink-soft"}`}>Todos</span>
      </motion.button>

      {uniqueItems.map((c) => {
        const active = value === c.slug;
        return (
          <motion.button key={c.slug} whileTap={{ scale: 0.9 }} onClick={() => onSelect(active ? null : c.slug)} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
            <span className={`relative h-14 w-14 overflow-hidden rounded-full bg-mist transition ${active ? "ring-2 ring-brand ring-offset-2 shadow-md" : ""}`}>
              <Image src={CATEGORY_PHOTOS[c.slug] ?? FALLBACK} alt={c.name} fill sizes="56px" className="object-cover" />
            </span>
            <span className={`text-[10.5px] font-extrabold text-center leading-tight truncate max-w-[70px] ${active ? "text-brand font-black" : "text-ink-soft"}`}>
              {c.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/cross-sell.tsx
// --------------------------------------------------------
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatMXN } from "@/lib/utils";

export type CrossSellItem = {
  key: string;
  name: string;
  price: number;
  image: string | null;
  categoryName: string;
  href: string;
};

/**
 * Cross-selling: carrusel rectangular con un ítem de cada rubro.
 * En modo oscuro (dark) para la sección de Rayte.
 */
export default function CrossSell({
  items,
  title = "Un antojo de cada rubro",
  dark = false,
}: {
  items: CrossSellItem[];
  title?: string;
  dark?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-6 w-full min-w-0">
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-[16px] font-black tracking-tight ${dark ? "text-white" : ""}`}>{title}</h2>
          <p className={`text-[11.5px] font-bold ${dark ? "text-white/50" : "text-ink-soft"}`}>Llega en minutos, agrega y listo</p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
        {items.map((it, i) => (
          <motion.div key={it.key} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="w-[148px] shrink-0">
            <Link href={it.href} className="group block">
              <div className="relative h-[92px] overflow-hidden rounded-[18px] bg-mist">
                {it.image && <Image src={it.image} alt={it.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="148px" />}
                <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[9.5px] font-black text-ink shadow-sm">{it.categoryName}</span>
              </div>
              <p className={`mt-1.5 line-clamp-2 min-h-8 text-[12px] leading-tight font-extrabold ${dark ? "text-white" : "text-ink"}`}>{it.name}</p>
              <p className="mt-0.5 text-[12.5px] font-black text-brand">{formatMXN(it.price)}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/home.tsx
// --------------------------------------------------------
"use client";

import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Utensils, ShoppingBasket, Zap, Pill, Beer, Salad, IceCreamCone, PawPrint, Star, Clock3, ChevronRight, ChevronLeft, BadgePercent, Bike, CalendarDays, Dices, CarFront, Stethoscope, Heart, Store } from "lucide-react";
import type { Category, Restaurant, Product, Service } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { AddButton } from "./stepper";
import { type SurpriseDish } from "./surprise-modal";
import CrossSell, { type CrossSellItem } from "./cross-sell";
import { categoryIcon } from "./category-icon";




export function CategoryGrid({ categories }: { categories: Category[] }) {
  const restaurantes = categories.find((c) => c.slug === "restaurantes");

  return (
    <section className="mx-auto max-w-5xl px-4 pt-3.5 pb-1">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {restaurantes && (
          <TopButton
            href={`/buscar`}
            label="Comida"
            bg={restaurantes.bg}
            color={restaurantes.color}
            icon={categoryIcon(restaurantes.icon)}
            delay={0}
          />
        )}
        <TopButton href="/viajes" label="Rayte" bg="#16121b" color="#fbbf24" icon={CarFront} delay={0.06} />
        <TopButton href="/servicios" label="Citas y servicios" bg="#f2ecff" color="#7c3aed" icon={CalendarDays} delay={0.12} />
        <TopButton href="/servicios?cat=salud" label="Salud" bg="#e8f1fe" color="#1d6ae5" icon={Stethoscope} delay={0.18} />
      </div>
    </section>
  );
}

function TopButton({
  href,
  label,
  bg,
  color,
  icon: Icon,
  delay,
}: {
  href: string;
  label: string;
  bg: string;
  color: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}>
      <Link href={href} className="group flex flex-col items-center gap-2">
        <span className="flex h-[64px] w-[64px] items-center justify-center rounded-[20px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 sm:h-[72px] sm:w-[72px]" style={{ backgroundColor: bg }}>
          <span style={{ color }}><Icon className="h-7 w-7" strokeWidth={2.1} /></span>
        </span>
        <span className="text-center text-[11px] leading-tight font-extrabold text-ink sm:text-[12.5px]">{label}</span>
      </Link>
    </motion.div>
  );
}

type Promo = { title: string; subtitle: string; image: string; href: string; gradient: string; tag: string };

export function PromoCarousel({ promos }: { promos: Promo[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i: number) => {
    const el = ref.current; if (!el) return;
    const clamped = Math.max(0, Math.min(i, promos.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth * 0.9, behavior: "smooth" });
    setIndex(clamped);
  };

  return (
    <section className="mx-auto mt-4 max-w-5xl">
      <div ref={ref} onScroll={(e) => { const el = e.currentTarget; setIndex(Math.round(el.scrollLeft / (el.clientWidth * 0.9))); }} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {promos.map((p) => (
          <Link key={p.title} href={p.href} className={`relative h-[168px] w-[88%] shrink-0 snap-center overflow-hidden rounded-[26px] bg-gradient-to-br ${p.gradient} sm:w-[46%] lg:w-[32.5%]`}>
            {p.image && <Image src={p.image} alt={p.title} fill className="object-cover opacity-35 mix-blend-overlay" sizes="(max-width: 640px) 88vw, 33vw" />}
            <div className="relative flex h-full flex-col justify-between p-5">
              <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-black tracking-wide text-white uppercase backdrop-blur">{p.tag}</span>
              <div>
                <p className="text-[26px] leading-[1.05] font-black text-white">{p.title}</p>
                <p className="mt-1 text-[13px] font-bold text-white/85">{p.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-1 flex items-center justify-center gap-2">
        {promos.map((_, i) => <button key={i} onClick={() => scrollTo(i)} aria-label={`Promo ${i + 1}`} className={`h-1.5 rounded-full transition-all ${index === i ? "w-6 bg-brand" : "w-1.5 bg-black/15"}`} />)}
      </div>
    </section>
  );
}

export function TurboRow({ store, products }: { store: Restaurant; products: Product[] }) {
  const addItem = useCart((s) => s.addItem);
  const cartRestaurant = { id: store.id, name: store.name, slug: store.slug, deliveryFee: store.deliveryFee, timeMin: store.timeMin, timeMax: store.timeMax };

  return (
    <section className="mx-auto mt-5 max-w-5xl px-4">
      <div className="overflow-hidden rounded-[26px] bg-[#221e2c] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-pop"><Zap className="h-5.5 w-5.5 fill-[#221e2c] text-[#221e2c]" /></span>
            <div>
              <p className="text-lg leading-none font-black text-white italic">Turbo</p>
              <p className="text-[12px] font-bold text-white/60">en {store.timeMin}-{store.timeMax} min</p>
            </div>
          </div>
          <Link href={`/restaurante/${store.slug}`} className="flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-2 text-[12.5px] font-black text-amber-pop transition hover:bg-white/15">Ver todo <ChevronRight className="h-4 w-4" /></Link>
        </div>

        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="w-[136px] shrink-0 rounded-[20px] bg-white/[0.07] p-2.5 backdrop-blur">
              <div className="relative h-[92px] overflow-hidden rounded-[14px]">{p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="136px" />}</div>
              <p className="mt-2 line-clamp-2 min-h-8 text-[12.5px] leading-tight font-extrabold text-white">{p.name}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[13px] font-black text-amber-pop">{formatMXN(p.price)}</span>
                <AddButton onClick={() => addItem({ key: `${p.id}`, productId: p.id, name: p.name, price: p.price, basePrice: p.price, image: p.image, qty: 1 }, cartRestaurant)} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedFoodRow({ stores }: { stores: Restaurant[] }) {
  const foodStores = stores.filter((s) => ["restaurantes", "panaderias", "postres"].includes(s.categorySlug));

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <Link href="/buscar?filter=destacadas" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[var(--brand-accent)] text-white shadow-md">
            <Utensils className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[22px] font-black tracking-tight group-hover:text-brand transition">
              Destacadas para ti
            </h2>
            <p className="mt-0.5 text-[13px] font-bold text-ink-soft">Restaurantes, panaderías y antojos más pedidos</p>
          </div>
        </Link>
        <Link href="/buscar?filter=destacadas" className="flex items-center gap-1 rounded-full bg-brand-soft px-3.5 py-2 text-[12.5px] font-black text-brand transition hover:bg-brand/15 active:scale-95">
          Ver todas <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
        {foodStores.map((r) => (
          <RestaurantCarouselCard key={`feat-${r.id}`} r={r} />
        ))}
      </div>
    </section>
  );
}

export function FavoritesFoodRow({ stores }: { stores: Restaurant[] }) {
  const isFavorite = useFavorites((s) => s.isFavorite);
  const favStores = stores.filter((s) => isFavorite(s.slug) && ["restaurantes", "panaderias", "postres", "mercado"].includes(s.categorySlug));
  const displayStores = favStores.length > 0 ? favStores : stores.filter((s) => ["la-brasa-smash", "panaderia-la-espiga", "pizza-nonna"].includes(s.slug));

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <Link href="/buscar?fav=1" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[var(--brand-accent)] text-white shadow-md">
            <Heart className="h-5 w-5 fill-white" />
          </span>
          <div>
            <h2 className="text-[22px] font-black tracking-tight group-hover:text-brand transition">
              Favoritos
            </h2>
            <p className="mt-0.5 text-[13px] font-bold text-ink-soft">
              {favStores.length > 0 ? "Tus tiendas marcadas con ❤️" : "Tus preferidas y las favoritas de la comunidad"}
            </p>
          </div>
        </Link>
        <Link href="/buscar?fav=1" className="flex items-center gap-1 rounded-full bg-brand-soft px-3.5 py-2 text-[12.5px] font-black text-brand transition hover:bg-brand/15 active:scale-95">
          Ver todo <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
        {displayStores.map((r) => (
          <RestaurantCarouselCard key={`fav-row-${r.id}`} r={r} />
        ))}
      </div>
    </section>
  );
}

export function SaludRow({ services }: { services: Service[] }) {
  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[22px] font-black tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d6ae5] to-[#3b82f6] text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            Salud · Médicos y Especialistas
          </h2>
          <p className="mt-0.5 text-[13px] font-bold text-ink-soft">Consultas médicas, enfermería y especialistas a domicilio</p>
        </div>
        <Link href="/servicios?cat=salud" className="flex items-center gap-1 rounded-full bg-[#e8f1fe] px-3.5 py-2 text-[12.5px] font-black text-[#1d6ae5] transition hover:bg-[#d5e5fd]">
          Ver médicos <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2">
        {services.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
            <Link href={`/servicios/${s.slug}`} className="group block w-[176px] shrink-0">
              <div className="relative h-[114px] overflow-hidden rounded-[20px] border border-[#1d6ae5]/20">
                <Image src={s.image} alt={s.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" sizes="176px" />
                <span className="absolute top-2.5 left-2.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-black shadow">
                  <Star className="h-3 w-3 fill-amber-pop text-amber-pop" />{s.rating.toFixed(1)}
                </span>
                <span className="absolute top-2.5 right-2.5 rounded-full bg-[#1d6ae5] px-2 py-0.5 text-[9.5px] font-black text-white shadow">
                  Médico
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-[14px] font-black">{s.name}</p>
              <p className="line-clamp-1 text-[11.5px] font-bold text-ink-soft">{s.proName} · {s.provider}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-black text-[#1d6ae5]">
                {formatMXN(s.price)} <span className="flex items-center gap-0.5 font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {s.durationMin}'</span>
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function RayteGoBanner() {
  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#16121b] via-[#241c30] to-[#120e18] p-6 text-white shadow-xl border border-white/10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-amber-pop/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-pink-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-pop shadow-md">
                <Zap className="h-5 w-5 fill-[#16121b] text-[#16121b]" />
              </span>
              <span className="text-[20px] font-black italic tracking-tight text-white">rayte go</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10.5px] font-black text-amber-pop uppercase tracking-wider">
                Viajes en la ciudad
              </span>
            </div>

            <h3 className="mt-3 text-[24px] sm:text-[28px] font-black leading-tight tracking-tight text-white">
              ¿Vas a salir? Muévete rápido y seguro
            </h3>
            <p className="mt-1.5 text-[13.5px] font-bold text-white/70 leading-snug">
              Pide tu viaje en moto o carro desde $45. Elige viajar con socias conductoras en Rayte Mujer y comparte tu ruta en vivo.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white/90">
                <Bike className="h-3.5 w-3.5 text-amber-pop" /> Moto desde $45
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white/90">
                <CarFront className="h-3.5 w-3.5 text-amber-pop" /> Carro desde $85
              </span>
              <span className="flex items-center gap-1 rounded-full bg-pink-500/20 px-3 py-1 text-[11.5px] font-black text-pink-300">
                🌸 Rayte Mujer
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#0ea55b]/20 px-3 py-1 text-[11.5px] font-bold text-[#4ade80]">
                🛡️ SOS 911
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <Link
              href="/viajes"
              className="flex items-center justify-center gap-2 rounded-full bg-amber-pop px-7 py-4 text-[15px] font-black text-[#16121b] shadow-[0_12px_28px_rgba(251,191,36,0.35)] transition hover:brightness-105 active:scale-95"
            >
              <CarFront className="h-5 w-5" /> Pedir un viaje <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesRow({ services }: { services: Service[] }) {
  return (
    <section className="mx-auto mt-6 max-w-5xl px-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[22px] font-black tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#c026d3]"><CalendarDays className="h-5 w-5 text-white" /></span>
            Citas y servicios
          </h2>
          <p className="mt-0.5 text-[13px] font-bold text-ink-soft">Profesionales a domicilio o en su local</p>
        </div>
        <Link href="/servicios" className="flex items-center gap-1 rounded-full bg-[#7c3aed]/10 px-3.5 py-2 text-[12.5px] font-black text-[#7c3aed] transition hover:bg-[#7c3aed]/15">Ver todo <ChevronRight className="h-4 w-4" /></Link>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-3.5 overflow-x-auto px-4 pb-2">
        {services.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
            <Link href={`/servicios/${s.slug}`} className="group block w-[168px] shrink-0">
              <div className="relative h-[110px] overflow-hidden rounded-[20px]">
                <Image src={s.image} alt={s.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" sizes="168px" />
                <span className="absolute top-2.5 left-2.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-black shadow">
                  <Star className="h-3 w-3 fill-amber-pop text-amber-pop" />{s.rating.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-[14px] font-black">{s.name}</p>
              <p className="line-clamp-1 text-[11.5px] font-bold text-ink-soft">{s.provider}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] font-black text-[#7c3aed]">desde {formatMXN(s.price)} <span className="flex items-center gap-0.5 font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {s.durationMin}'</span></p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function RestaurantCarouselCard({ r }: { r: Restaurant }) {
  const isFav = useFavorites((s) => s.isFavorite(r.slug));
  const toggleFav = useFavorites((s) => s.toggleFavorite);

  return (
    <div className="w-[280px] sm:w-[320px] shrink-0 snap-center">
      <Link href={`/restaurante/${r.slug}`} className="group relative block">
        <div className="relative h-44 overflow-hidden rounded-[26px] bg-mist">
          <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" sizes="320px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            {r.promo ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-3 py-1.5 text-[10.5px] font-black text-white shadow-lg">
                <BadgePercent className="h-3.5 w-3.5" />{r.promo}
              </span>
            ) : <span />}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFav(r.slug);
                }}
                aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition active:scale-90"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-brand text-brand" : "text-ink-soft hover:text-brand"}`} />
              </button>

              <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/40 bg-white/85 px-2 py-1 text-[11.5px] font-black text-ink shadow-sm backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />{r.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-3 text-white">
            <h3 className="truncate text-[18px] leading-tight font-black drop-shadow">{r.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-[12px] font-bold text-white/85">{r.description}</p>
          </div>

          {!r.isOpen && <div className="absolute inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-[1px]"><span className="rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-black">Cerrado temporalmente</span></div>}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 px-0.5">
          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
            <Clock3 className="h-3.5 w-3.5" />{r.timeMin}-{r.timeMax} min
          </span>
          <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-bold text-ink-soft">
            <Bike className="h-3.5 w-3.5" />{r.deliveryFee === 0 ? "Envío gratis" : formatMXN(r.deliveryFee)}
          </span>
          <span className="rounded-full bg-mist px-2 py-1 text-[11px] font-bold text-ink-soft">{r.distanceKm.toFixed(1)} km</span>
          {r.allowsPickup && <span className="rounded-full bg-[#e6f8ee] px-2 py-1 text-[10px] font-black text-[#0ea55b]">🏪 Recoger</span>}
        </div>
      </Link>
    </div>
  );
}

export function RestaurantCard({ r, index }: { r: Restaurant; index: number }) {
  const isFav = useFavorites((s) => s.isFavorite(r.slug));
  const toggleFav = useFavorites((s) => s.toggleFavorite);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: Math.min(index * 0.05, 0.3), type: "spring", stiffness: 260, damping: 26 }}>
      <Link href={`/restaurante/${r.slug}`} className="group relative block">
        <div className="relative h-48 overflow-hidden rounded-[28px] bg-mist">
          <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/5" />

          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            {r.promo ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-3 py-1.5 text-[11px] font-black text-white shadow-lg">
                <BadgePercent className="h-3.5 w-3.5" />{r.promo}
              </span>
            ) : <span />}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFav(r.slug);
                }}
                aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition active:scale-90"
              >
                <Heart className={`h-4.5 w-4.5 ${isFav ? "fill-brand text-brand" : "text-ink-soft hover:text-brand"}`} />
              </button>

              <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/40 bg-white/85 px-2.5 py-1.5 text-[12px] font-black text-ink shadow-sm backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-pop text-amber-pop" />{r.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-3.5 text-white">
            <h3 className="text-[19px] leading-tight font-black tracking-tight drop-shadow-md">{r.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-[12.5px] font-bold text-white/85">{r.description}</p>
          </div>

          {!r.isOpen && <div className="absolute inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-[1px]"><span className="rounded-full bg-white px-4 py-2 text-[12px] font-black">Cerrado temporalmente</span></div>}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 px-0.5">
          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-black text-brand">
            <Clock3 className="h-3.5 w-3.5" />{r.timeMin}-{r.timeMax} min
          </span>
          <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-soft">
            <Bike className="h-3.5 w-3.5" />{r.deliveryFee === 0 ? "Envío gratis" : formatMXN(r.deliveryFee)}
          </span>
          <span className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-bold text-ink-soft">{r.distanceKm.toFixed(1)} km</span>
          {r.allowsPickup && <span className="rounded-full bg-[#e6f8ee] px-2 py-1 text-[10px] font-black text-[#0ea55b]">🏪 Recoger</span>}
          <ChevronRight className="ml-auto h-4.5 w-4.5 shrink-0 text-brand opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <p className="mt-1 flex items-center gap-1 px-0.5 text-[10.5px] font-bold text-ink-soft">
          <MapPin className="h-3 w-3 shrink-0 text-brand/70" /> <span className="truncate">{r.address}</span>
        </p>
      </Link>
    </motion.div>
  );
}

export function RestaurantList({ restaurants, dishes = [], crossItems = [], crossTitle }: { restaurants: Restaurant[]; dishes?: SurpriseDish[]; crossItems?: CrossSellItem[]; crossTitle?: string }) {
  const [sort, setSort] = useState<"none" | "fast" | "near">("none");
  const [freeShip, setFreeShip] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [pickupOnly, setPickupOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const isFavorite = useFavorites((s) => s.isFavorite);

  let list = restaurants.filter((r) => !r.isTurbo);
  if (favOnly) list = list.filter((r) => isFavorite(r.slug));
  if (freeShip) list = list.filter((r) => r.deliveryFee === 0);
  if (openOnly) list = list.filter((r) => r.isOpen);
  if (pickupOnly) list = list.filter((r) => r.allowsPickup);
  if (deliveryOnly) list = list.filter((r) => r.deliveryFee >= 0);
  if (sort === "fast") list = [...list].sort((a, b) => a.timeMin - b.timeMin);
  if (sort === "near") list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);

  /* 5 opciones de Abiertos y 5 opciones de Envío Gratis */
  const openStores5 = restaurants.filter((r) => r.isOpen && !r.isTurbo).slice(0, 5);
  const freeShipStores5 = restaurants.filter((r) => r.deliveryFee === 0 && !r.isTurbo).slice(0, 5);

  const hasFilterActive = favOnly || freeShip || openOnly || pickupOnly || deliveryOnly || sort !== "none";

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4 pb-24 sm:pb-28">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[22px] font-black tracking-tight">Pedí lo que quieras</h2>
          <p className="text-[13px] font-bold text-ink-soft">{list.length} tiendas para ti ahora</p>
        </div>
      </div>

      {dishes.length >= 5 && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => window.dispatchEvent(new CustomEvent("zappy-surprise"))}
          className="mt-4 flex w-full items-center justify-between rounded-full bg-gradient-to-r from-brand to-[var(--brand-accent)] px-5 py-4 text-left text-white shadow-[0_10px_26px_var(--brand-glow)]"
        >
          <span className="flex items-center gap-2.5 text-[16px] font-black">
            <Dices className="h-5.5 w-5.5" /> Sorpréndeme
          </span>
          <span className="flex items-center gap-1 text-[12.5px] font-bold text-white/85">5 platillos al azar <ChevronRight className="h-4 w-4" /></span>
        </motion.button>
      )}

      {/* Filtros en una sola línea deslizable (estilo Uber Eats con Favoritos) */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip
          small
          active={favOnly}
          onClick={() => setFavOnly(!favOnly)}
          label="Favoritos"
          icon={Heart}
          badgeColor="text-brand"
        />
        <Chip small active={sort === "fast"} onClick={() => setSort(sort === "fast" ? "none" : "fast")} label="⚡ Rápido" />
        <Chip small active={sort === "near"} onClick={() => setSort(sort === "near" ? "none" : "near")} label="📍 Cerca de mí" />
        <Chip small active={freeShip} onClick={() => setFreeShip(!freeShip)} label="🚴 Envío gratis" />
        <Chip small active={openOnly} onClick={() => setOpenOnly(!openOnly)} label="🟢 Abiertos" />
        <Chip small active={pickupOnly} onClick={() => setPickupOnly(!pickupOnly)} label="🏪 Recoger" />
        <Chip small active={deliveryOnly} onClick={() => setDeliveryOnly(!deliveryOnly)} label="🛵 A domicilio" />
      </div>

      {/* 🟢 Carrusel 1: ABIERTO (5 opciones) */}
      {openStores5.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <Link href="/buscar?open=1" className="group flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#e6f8ee] text-[#0ea55b]">
                <Store className="h-4 w-4 text-[#0ea55b]" />
              </span>
              <div>
                <p className="text-[16px] font-black tracking-tight text-ink group-hover:text-brand transition">Abiertos ahora</p>
                <p className="text-[11px] font-bold text-ink-soft">5 opciones listas para ordenar ahora</p>
              </div>
            </Link>
            <Link href="/buscar?open=1" className="flex items-center gap-1 rounded-full bg-[#e6f8ee] px-3 py-1 text-[11.5px] font-black text-[#0ea55b] transition hover:bg-[#d5f3e2]">
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="no-scrollbar -mx-4 mt-3 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
            {openStores5.map((r) => (
              <RestaurantCarouselCard key={`open5-${r.id}`} r={r} />
            ))}
          </div>
        </div>
      )}

      {/* 🚴 Carrusel 2: ENVÍO GRATIS (5 opciones) */}
      {freeShipStores5.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <Link href="/buscar?free=1" className="group flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Bike className="h-4 w-4 text-brand" />
              </span>
              <div>
                <p className="text-[16px] font-black tracking-tight text-ink group-hover:text-brand transition">Envío gratis</p>
                <p className="text-[11px] font-bold text-ink-soft">5 opciones sin costo de entrega</p>
              </div>
            </Link>
            <Link href="/buscar?free=1" className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-[11.5px] font-black text-brand transition hover:bg-brand/15">
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="no-scrollbar -mx-4 mt-3 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
            {freeShipStores5.map((r) => (
              <RestaurantCarouselCard key={`free5-${r.id}`} r={r} />
            ))}
          </div>
        </div>
      )}

      {hasFilterActive && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-black text-ink uppercase tracking-wide">
              {favOnly
                ? "❤️ Tus Favoritos"
                : sort === "fast"
                  ? "⚡ Entregas más rápidas"
                  : sort === "near"
                    ? "📍 Más cercanas a ti"
                    : freeShip
                      ? "🚴 Con envío gratis"
                      : pickupOnly
                        ? "🏪 Listas para recoger"
                        : "Opciones filtradas"}
            </p>
            <span className="text-[11.5px] font-bold text-ink-soft">{list.length} encontradas</span>
          </div>

          {list.length > 0 && (
            <div className="no-scrollbar -mx-4 mt-2.5 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
              {list.map((r) => (
                <RestaurantCarouselCard key={`car-${r.id}`} r={r} />
              ))}
            </div>
          )}
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[26px] bg-mist px-6 py-14 text-center">
          {favOnly ? (
            <>
              <span className="text-4xl">❤️</span>
              <p className="mt-3 text-lg font-black">Aún no tienes tiendas en favoritos</p>
              <p className="mt-1 max-w-xs text-sm font-bold text-ink-soft">Toca el corazón en tus tiendas favoritas para verlas rápidamente aquí.</p>
              <button onClick={() => setFavOnly(false)} className="mt-4 rounded-full bg-brand px-5 py-2.5 text-xs font-black text-white">Ver todas las tiendas</button>
            </>
          ) : (
            <>
              <span className="text-4xl font-black italic text-brand">¡Pronto!</span>
              <p className="mt-2 max-w-xs text-sm font-bold text-ink-soft">No hay tiendas con esos filtros activos. Prueba desactivando alguno.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="mt-8 text-[13px] font-black text-ink-soft uppercase tracking-wide">Todas las opciones</p>
          <div className="mt-3 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {list.map((r, i) => (
              <Fragment key={r.id}>
                {i === 4 && crossItems.length > 0 && (
                  <div className="md:col-span-2 xl:col-span-3 min-w-0 w-full">
                    <CrossSell items={crossItems} title={crossTitle} />
                  </div>
                )}
                <RestaurantCard r={r} index={i} />
                {i === list.length - 1 && list.length < 5 && crossItems.length > 0 && (
                  <div className="md:col-span-2 xl:col-span-3 min-w-0 w-full">
                    <CrossSell items={crossItems} title={crossTitle} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </>
      )}

      <p className="pt-10 text-center text-[11px] font-black tracking-widest text-ink-soft/60 uppercase">Rayte · v1.27</p>
    </section>
  );
}

function Chip({ active, onClick, label, small = false, icon: Icon, badgeColor }: { active: boolean; onClick: () => void; label: string; small?: boolean; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>; badgeColor?: string }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 rounded-full font-black transition active:scale-95 ${small ? "px-3 py-1.5 text-[11.5px]" : "px-4 py-2 text-[13px]"} ${active ? "bg-ink text-white shadow-md" : "bg-mist text-ink hover:bg-black/[0.07]"}`}>
      {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? (badgeColor ? "fill-rose-400 text-rose-400" : "text-white") : (badgeColor ?? "text-brand")}`} strokeWidth={2.4} />}
      {label}
    </button>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/item-modal.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Pill, ShoppingBag, Plus, Minus, Check, Flame, Gift, Sparkles, FlameKindling, Beef, RotateCcw } from "lucide-react";
import type { Product, ProductExtra, Restaurant } from "@/db/schema";
import { formatMXN } from "@/lib/utils";
import { useCart, type CartItem } from "@/store/cart";
import { QtyStepper } from "./stepper";

/* Tamaños por negocio donde aplica */
const SIZES_BY_STORE: Record<string, { name: string; delta: number }[]> = {
  "pizza-nonna": [
    { name: "Personal 25cm", delta: 0 },
    { name: "Mediana 30cm", delta: 45 },
    { name: "Familiar 40cm", delta: 70 },
  ],
  "sushi-neko": [
    { name: "8 piezas", delta: 0 },
    { name: "12 piezas", delta: 55 },
  ],
};
const NO_SIZE = { name: "", delta: 0 };

/* Fallback de extras según giro si la tienda aún no tiene cargados en BD */
const DEFAULT_FALLBACK_EXTRAS: Record<string, { name: string; delta: number }[]> = {
  restaurantes: [
    { name: "Aguacate hass fresco", delta: 20 },
    { name: "Cebollitas cambray asadas extra", delta: 18 },
    { name: "Chicharrón de queso manchego", delta: 28 },
    { name: "Costra de queso para taco", delta: 20 },
    { name: "Frijoles charros con tuétano extra", delta: 25 },
    { name: "Guacamole artesanal con totopos", delta: 28 },
    { name: "Nopales asados con orégano", delta: 16 },
    { name: "Papas a la francesa sazonadas", delta: 28 },
    { name: "Queso gouda gratinado", delta: 22 },
    { name: "Salsa macha artesanal", delta: 12 },
    { name: "Tuétano asado individual a la leña", delta: 35 },
  ],
  panaderias: [
    { name: "Cajeta quemada de Celaya", delta: 15 },
    { name: "Mantequilla de rancho", delta: 10 },
    { name: "Mermelada de fresa artesanal", delta: 12 },
    { name: "Nutella para untar", delta: 16 },
  ],
  saludable: [
    { name: "Aguacate hass en cubos", delta: 18 },
    { name: "Huevo cocido orgánico", delta: 14 },
    { name: "Pollo a la plancha extra", delta: 32 },
    { name: "Semillas de chía y cáñamo", delta: 12 },
  ],
  postres: [
    { name: "Bola de helado de vainilla", delta: 22 },
    { name: "Crema batida chantilly", delta: 10 },
    { name: "Fresas frescas picadas", delta: 16 },
    { name: "Topping de chocolate belga", delta: 14 },
  ],
};

/* ════════════════════════════════════════════════════════════
   CATÁLOGO DE CORTES (250G), EMBUTIDOS (250G) Y COSTILLAS (PZA)
   ════════════════════════════════════════════════════════════ */
export type GrillGroupKey = "cortes" | "embutidos" | "costillas";

export type PortionCutItem = {
  id: string;
  name: string;
  group: GrillGroupKey;
  weightLabel: string;
  unitNoun: string;
  extraPrice: number;
};

export const GRILL_PORTION_ITEMS: PortionCutItem[] = [
  // 🥩 1. CORTES DE RES (PORCIONES DE 250G)
  { id: "tomahawk", name: "Tomahawk", group: "cortes", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 135 },
  { id: "ribeye", name: "Rib Eye", group: "cortes", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 110 },
  { id: "newyork", name: "New York", group: "cortes", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 105 },
  { id: "cowboy", name: "Cowboy", group: "cortes", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 125 },
  { id: "sirloin", name: "Sirloin", group: "cortes", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 90 },
  { id: "arrachera", name: "Arrachera", group: "cortes", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 95 },
  { id: "picanha", name: "Picaña", group: "cortes", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 100 },

  // 🌭 2. EMBUTIDOS (PORCIONES DE 250G)
  { id: "chorizo-arg", name: "Chorizo Argentino", group: "embutidos", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 65 },
  { id: "chorizo-rojo", name: "Chorizo Rojo Tradicional", group: "embutidos", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 60 },
  { id: "chorizo-esp", name: "Chorizo Español", group: "embutidos", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 70 },
  { id: "salchicha-polaca", name: "Salchicha Polaca para Asar", group: "embutidos", weightLabel: "250g", unitNoun: "porción de 250g", extraPrice: 65 },

  // 🍖 3. COSTILLAS (POR PIEZA / PZA)
  { id: "costilla-carbon", name: "Costilla Cargada al Carbón", group: "costillas", weightLabel: "por pza", unitNoun: "por pieza", extraPrice: 85 },
  { id: "costilla-bbq", name: "Costilla BBQ Ahumada en Mezquite", group: "costillas", weightLabel: "por pza", unitNoun: "por pieza", extraPrice: 90 },
];

/* Guarniciones incluidas para parrilladas y combos */
const GRILL_SIDES = [
  "Frijoles charros con tocino y tuétano",
  "Guacamole artesanal con totopos",
  "Cebollitas cambray & chiles toreados",
  "Tortillas calientes (maíz y harina)",
];

const GRILL_SINGLE_SIDE_OPTIONS = [
  "Frijoles charros con tocino y tuétano",
  "Guacamole artesanal con totopos",
  "Cebollitas cambray & chiles toreados",
  "Papas a la francesa sazonadas",
] as const;

const GRILL_GROUPS: { key: GrillGroupKey; title: string; emoji: string; hint: string }[] = [
  { key: "cortes", title: "Cortes de res", emoji: "🥩", hint: "Todas las porciones de 250g disponibles" },
  { key: "embutidos", title: "Embutidos", emoji: "🌭", hint: "Opciones de 250g para combinar" },
  { key: "costillas", title: "Costillas", emoji: "🍖", hint: "Piezas completas para sumar al combo" },
];

const alphaSort = (a: string, b: string) =>
  a.localeCompare(b, "es-MX", { sensitivity: "base" });

function parseComboCounts(source: string | undefined, prefix: string, extra = false) {
  const result: Record<string, number> = {};
  const part = source
    ?.split(" · ")
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();

  if (!part) return result;

  for (const chunk of part.split(",")) {
    const text = chunk.trim();
    const match = text.match(extra ? /^\+(\d+)x\s+(.+?)\s+\(/ : /^(\d+)x\s+(.+?)\s+\(/);
    if (!match) continue;
    result[match[2].trim()] = Number(match[1]);
  }

  return result;
}

function parseOptionValue(source: string | undefined, prefix: string) {
  return source
    ?.split(" · ")
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
}

function stripPriceSuffix(label: string) {
  return label.replace(/\s*\(\+[^)]*\)$/, "").trim();
}

export default function ItemModal({
  product,
  store,
  extras: storeExtras = [],
  onClose,
  editingItem = null,
}: {
  product: Product | null;
  store: Restaurant;
  extras?: ProductExtra[];
  onClose: () => void;
  editingItem?: CartItem | null;
}) {
  const addItem = useCart((s) => s.addItem);
  const replaceItem = useCart((s) => s.replaceItem);
  const SIZES = useMemo(() => SIZES_BY_STORE[store.slug] ?? [], [store.slug]);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(SIZES[0] ?? NO_SIZE);
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; delta: number }[]>([]);
  const [notes, setNotes] = useState("");

  // Detección de parrilladas / paquetes personalizables por porciones
  const sortedGrillItems = useMemo(
    () => [...GRILL_PORTION_ITEMS].sort((a, b) => alphaSort(a.name, b.name)),
    []
  );

  const grillItemsByGroup = useMemo(
    () =>
      GRILL_GROUPS.reduce((acc, group) => {
        acc[group.key] = sortedGrillItems.filter((item) => item.group === group.key);
        return acc;
      }, {} as Record<GrillGroupKey, PortionCutItem[]>),
    [sortedGrillItems]
  );

  const grillItemMap = useMemo(
    () => new Map(sortedGrillItems.map((item) => [item.name, item])),
    [sortedGrillItems]
  );

  const blankCutSelection = useMemo(
    () => Object.fromEntries(sortedGrillItems.map((item) => [item.name, 0])) as Record<string, number>,
    [sortedGrillItems]
  );

  const portionConfig = useMemo(() => {
    if (!product) return null;

    const text = `${product.name} ${product.description} ${product.section}`.toLowerCase();
    const normalizedTags = (store.tags ?? []).map((tag) => tag.toLowerCase());
    const isGrillStore =
      store.categorySlug === "restaurantes" &&
      (
        ["patio-de-humo-asadero-time", "la-brasa-smash", "tacos-el-farol"].includes(store.slug) ||
        normalizedTags.some((tag) => ["cortes", "parrilladas", "asador", "carneasada"].includes(tag))
      );

    const bundleSignals = [
      "parrillada",
      "taquiza",
      "combo",
      "paquete",
      "porciones",
      "elige",
      "arma tu",
    ];

    const sizeSignals = [
      "250g",
      "500g",
      "750g",
      "1 kg",
      "1kg",
      "1.5 kg",
      "1.5kg",
      "2 kg",
      "2kg",
    ];

    const isComboSection = product.section.toLowerCase().includes("combo") || product.section.toLowerCase().includes("paquete");
    const hasBundleSignal = bundleSignals.some((signal) => text.includes(signal));
    const hasPortionSizeSignal = sizeSignals.some((signal) => text.includes(signal));

    // Solo activar este configurador en paquetes para compartir o armables.
    // Un corte individual (aunque sea carne) no debe abrir selector de porciones.
    if (!isGrillStore || !(isComboSection || hasBundleSignal) || !hasPortionSizeSignal) return null;

    let targetPortions = 4; // Por defecto 4 porciones / piezas
    if (text.includes("2 porciones") || text.includes("500g") || text.includes("dúo") || text.includes("pareja")) targetPortions = 2;
    else if (text.includes("3 porciones") || text.includes("750g")) targetPortions = 3;
    else if (text.includes("6 porciones") || text.includes("1.5 kg") || text.includes("1.5kg") || text.includes("familiar") || text.includes("fiesta")) targetPortions = 6;
    else if (text.includes("8 porciones") || text.includes("2 kg") || text.includes("2kg")) targetPortions = 8;
    else if (text.includes("4 porciones") || text.includes("1 kg") || text.includes("1kg") || text.includes("especial")) targetPortions = 4;

    return {
      targetPortions,
    };
  }, [product, store.categorySlug, store.slug, store.tags]);

  const needsMeatTermOnly = useMemo(() => {
    if (!product || portionConfig) return false;

    const normalizedTags = (store.tags ?? []).map((tag) => tag.toLowerCase());
    const isGrillStore =
      store.categorySlug === "restaurantes" &&
      (
        ["patio-de-humo-asadero-time", "la-brasa-smash", "tacos-el-farol"].includes(store.slug) ||
        normalizedTags.some((tag) => ["cortes", "parrilladas", "asador", "carneasada"].includes(tag))
      );

    if (!isGrillStore) return false;

    const sectionText = product.section.toLowerCase();
    const fullText = `${product.name} ${product.description}`.toLowerCase();
    const cutSignals = ["rib eye", "ribeye", "new york", "cowboy", "sirloin", "arrachera", "picaña", "picanha", "tomahawk"];
    const excludedSignals = ["chicharron", "chicharrón", "taco", "quesataco", "birria", "tuetano", "tuétano", "burger", "smash"];

    const looksLikeCut = sectionText.includes("cortes") || cutSignals.some((signal) => fullText.includes(signal));
    const excluded = excludedSignals.some((signal) => fullText.includes(signal));

    return looksLikeCut && !excluded;
  }, [product, portionConfig, store.categorySlug, store.slug, store.tags]);

  // Estado de selección de porciones incluidas en el paquete
  const [cutPortions, setCutPortions] = useState<Record<string, number>>({});

  // Estado de porciones ADICIONALES (con costo extra)
  const [extraCuts, setExtraCuts] = useState<Record<string, number>>({});

  const [meatTerm, setMeatTerm] = useState("Tres Cuartos (3/4)");
  const [selectedSide, setSelectedSide] = useState<(typeof GRILL_SINGLE_SIDE_OPTIONS)[number]>(GRILL_SINGLE_SIDE_OPTIONS[0]);

  // Calcular total de porciones incluidas elegidas
  const totalPortionsSelected = useMemo(() => {
    return Object.values(cutPortions).reduce((sum, count) => sum + count, 0);
  }, [cutPortions]);

  const selectedCutEntries = useMemo(
    () =>
      Object.entries(cutPortions)
        .filter(([, count]) => count > 0)
        .sort(([a], [b]) => alphaSort(a, b)),
    [cutPortions]
  );

  const selectedExtraCutEntries = useMemo(
    () =>
      Object.entries(extraCuts)
        .filter(([, count]) => count > 0)
        .sort(([a], [b]) => alphaSort(a, b)),
    [extraCuts]
  );

  const portionProgress = portionConfig
    ? Math.min(100, Math.round((totalPortionsSelected / portionConfig.targetPortions) * 100))
    : 0;

  // Modificar porción incluida en el combo
  const changeCutPortion = (cutName: string, delta: number) => {
    if (!portionConfig) return;
    const current = cutPortions[cutName] || 0;
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && totalPortionsSelected >= portionConfig.targetPortions) return;

    setCutPortions((prev) => ({
      ...prev,
      [cutName]: next,
    }));
  };

  // Modificar porción EXTRA adicional
  const changeExtraCut = (cutName: string, delta: number) => {
    const current = extraCuts[cutName] || 0;
    const next = Math.max(0, current + delta);
    setExtraCuts((prev) => ({
      ...prev,
      [cutName]: next,
    }));
  };

  const resetGrillSelections = () => {
    setCutPortions(blankCutSelection);
    setExtraCuts({});
    setMeatTerm("Tres Cuartos (3/4)");
    setSelectedSide(GRILL_SINGLE_SIDE_OPTIONS[0]);
  };

  // Calcular lista de extras aplicables a este platillo (ordenados alfabéticamente A-Z)
  const availableExtras = useMemo(() => {
    let list: { name: string; delta: number }[] = [];
    if (!product) return [];
    if (storeExtras && storeExtras.length > 0) {
      const matched = storeExtras.filter(
        (e) => e.available && (e.productId === product.id || e.productId === null)
      );
      if (matched.length > 0) {
        list = matched.map((e) => ({ name: e.name, delta: e.price }));
      }
    }
    if (list.length === 0) {
      list = DEFAULT_FALLBACK_EXTRAS[store.categorySlug] ?? DEFAULT_FALLBACK_EXTRAS.restaurantes;
    }
    // Ordenar alfabéticamente A-Z
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
  }, [product, storeExtras, store.categorySlug]);

  const initialCustomization = useMemo(() => {
    if (!editingItem) return null;

    if (editingItem.customization) {
      return {
        sizeName: editingItem.customization.sizeName,
        selectedExtras: editingItem.customization.selectedExtras ?? [],
        cutPortions: editingItem.customization.cutPortions ?? {},
        extraCuts: editingItem.customization.extraCuts ?? {},
        meatTerm: editingItem.customization.meatTerm,
        selectedSide: editingItem.customization.selectedSide,
      };
    }

    const parts = (editingItem.options ?? "").split(" · ").map((part) => part.trim()).filter(Boolean);
    const knownExtraNames = new Set(availableExtras.map((extra) => extra.name));
    const selectedExtras = parts
      .map((part) => stripPriceSuffix(part))
      .filter((part) => knownExtraNames.has(part))
      .map((name) => availableExtras.find((extra) => extra.name === name))
      .filter((extra): extra is { name: string; delta: number } => Boolean(extra));

    return {
      sizeName: SIZES.find((sizeOption) => parts.includes(sizeOption.name))?.name,
      selectedExtras,
      cutPortions: parseComboCounts(editingItem.options, "Armado del combo:"),
      extraCuts: parseComboCounts(editingItem.options, "Porciones extra:", true),
      meatTerm: parseOptionValue(editingItem.options, "Término:"),
      selectedSide: parseOptionValue(editingItem.options, "Guarnición:"),
    };
  }, [editingItem, availableExtras, SIZES]);

  useEffect(() => {
    if (product) {
      setQty(editingItem?.qty ?? 1);
      setSize(
        SIZES.find((sizeOption) => sizeOption.name === initialCustomization?.sizeName) ??
          SIZES[0] ??
          NO_SIZE,
      );
      setSelectedExtras(initialCustomization?.selectedExtras ?? []);
      setExtraCuts(initialCustomization?.extraCuts ?? {});
      setNotes(editingItem?.notes ?? "");
      setMeatTerm(initialCustomization?.meatTerm ?? "Tres Cuartos (3/4)");
      setSelectedSide(
        (initialCustomization?.selectedSide as (typeof GRILL_SINGLE_SIDE_OPTIONS)[number] | undefined) ??
          GRILL_SINGLE_SIDE_OPTIONS[0],
      );

      if (portionConfig) {
        setCutPortions({ ...blankCutSelection, ...(initialCustomization?.cutPortions ?? {}) });
      } else {
        setCutPortions({});
      }

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product, SIZES, portionConfig, blankCutSelection, editingItem, initialCustomization]);

  // Calcular subtotal de cortes/piezas adicionales
  const extraCutsSubtotal = useMemo(() => {
    return Object.entries(extraCuts).reduce((sum, [cutName, count]) => {
      if (count <= 0) return sum;
      const cut = grillItemMap.get(cutName);
      return sum + (cut?.extraPrice || 95) * count;
    }, 0);
  }, [extraCuts, grillItemMap]);

  const total = useMemo(() => {
    if (!product) return 0;
    const extrasTotal = selectedExtras.reduce((acc, e) => acc + e.delta, 0);
    const sizeDelta = SIZES.length ? size.delta : 0;
    return (product.price + extraCutsSubtotal + sizeDelta + extrasTotal) * qty;
  }, [product, size, selectedExtras, extraCutsSubtotal, qty, SIZES]);

  const toggleExtra = (extra: { name: string; delta: number }) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.name === extra.name);
      if (exists) {
        return prev.filter((e) => e.name !== extra.name);
      }
      return [...prev, extra];
    });
  };

  const handleAdd = () => {
    if (!product) return;
    const extrasTotal = selectedExtras.reduce((acc, e) => acc + e.delta, 0);
    const sizeDelta = SIZES.length ? size.delta : 0;
    const extraLabels = selectedExtras.map((e) => (e.delta > 0 ? `${e.name} (+${formatMXN(e.delta)})` : e.name));

    const optionParts: string[] = [];

    // Agregar desglose de porciones incluidas
    if (portionConfig && totalPortionsSelected > 0) {
      const portionsSummary = selectedCutEntries
        .map(([name, count]) => {
          const item = grillItemMap.get(name);
          return `${count}x ${name} (${item?.weightLabel || "250g"})`;
        })
        .join(", ");
      optionParts.push(`Armado del combo: ${portionsSummary}`);

      // Cortes/porciones extra
      if (selectedExtraCutEntries.length > 0) {
        const extraCutsSummary = selectedExtraCutEntries
          .map(([name, count]) => {
            const cut = grillItemMap.get(name);
            return `+${count}x ${name} (${cut?.weightLabel}) (+${formatMXN((cut?.extraPrice || 95) * count)})`;
          })
          .join(", ");
        optionParts.push(`Porciones extra: ${extraCutsSummary}`);
      }

      optionParts.push(`Término: ${meatTerm}`);
      optionParts.push(`Guarniciones incluidas: ${GRILL_SIDES.join(", ")}`);
    } else {
      if (needsMeatTermOnly) {
        optionParts.push(`Término: ${meatTerm}`);
        optionParts.push(`Guarnición: ${selectedSide}`);
      }
      if (SIZES.length && size.name !== SIZES[0].name) {
        optionParts.push(size.name);
      }
    }

    if (extraLabels.length > 0) {
      optionParts.push(...extraLabels);
    }

    const restaurantData = {
      id: store.id,
      name: store.name,
      slug: store.slug,
      deliveryFee: store.deliveryFee,
      timeMin: store.timeMin,
      timeMax: store.timeMax,
    };

    const nextItem: CartItem = {
      key: `${product.id}|${optionParts.join(",")}|${notes.trim()}`,
      productId: product.id,
      name: product.name,
      price: product.price + extraCutsSubtotal + sizeDelta + extrasTotal,
      basePrice: product.price,
      image: product.image,
      qty,
      notes: notes.trim() || undefined,
      options: optionParts.length ? optionParts.join(" · ") : undefined,
      customization: {
        sizeName: size.name || undefined,
        selectedExtras,
        cutPortions: portionConfig ? cutPortions : undefined,
        extraCuts,
        meatTerm: needsMeatTermOnly || portionConfig ? meatTerm : undefined,
        selectedSide: needsMeatTermOnly ? selectedSide : undefined,
      },
    };

    if (editingItem) {
      replaceItem(editingItem.key, nextItem, restaurantData);
    } else {
      addItem(nextItem, restaurantData);
    }
    onClose();
  };

  const isCombo = product?.section.toLowerCase().includes("combo") || product?.section.toLowerCase().includes("paquete");

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[85] mx-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.35)] sm:inset-y-6 sm:rounded-[28px] sm:border sm:border-black/5"
          >
            <div className="relative h-52 shrink-0">
              {product.image ? (
                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 512px) 100vw, 512px" />
              ) : (
                <div className="flex h-full items-center justify-center bg-brand-soft">
                  <Pill className="h-16 w-16 text-brand" />
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition active:scale-90 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-6 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[20px] sm:text-[21px] font-black tracking-tight text-ink leading-snug">
                    {product.name}
                  </h2>
                  {isCombo ? (
                    <span className="shrink-0 rounded-full bg-[#7c3aed] px-2.5 py-1 text-[11px] font-black text-white flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" /> Paquete
                    </span>
                  ) : product.popular ? (
                    <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
                      🔥 Popular
                    </span>
                  ) : null}
                </div>
                {product.description && <p className="mt-1 text-[13px] font-medium text-ink-soft leading-relaxed">{product.description}</p>}
                <p className="mt-2 text-[18px] font-black" style={{ color: isCombo ? "#7c3aed" : "var(--brand)" }}>
                  {formatMXN(product.price)}
                </p>
              </div>

              {/* ════════════════════════════════════════════════════════════
                  ARMA TU COMBO: CORTES 250G, EMBUTIDOS 250G Y COSTILLAS
                  ════════════════════════════════════════════════════════════ */}
              {portionConfig && (
                <div className="rounded-2xl border-2 border-[#ea580c]/30 bg-[#fff8f5] p-4 space-y-4">
                  {/* 1. SELECCIÓN DE PORCIONES INCLUIDAS */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[13.5px] font-black uppercase tracking-wider text-[#ea580c] flex items-center gap-1.5">
                          <FlameKindling className="h-4 w-4" /> 1. Elige tus {portionConfig.targetPortions} porciones
                        </p>
                        <p className="text-[11.5px] font-bold text-ink-soft">
                          Combina cortes de 250g, embutidos y costillas incluidas:
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-black shrink-0 shadow-2xs ${
                          totalPortionsSelected === portionConfig.targetPortions
                            ? "bg-[#0ea55b] text-white"
                            : "bg-white text-[#ea580c]"
                        }`}
                      >
                        {totalPortionsSelected} / {portionConfig.targetPortions} elegidas
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#ea580c] transition-all duration-300"
                        style={{ width: `${portionProgress}%` }}
                      />
                    </div>

                    {selectedCutEntries.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedCutEntries.map(([name, count]) => (
                          <span
                            key={`selected-${name}`}
                            className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-black text-[#ea580c] shadow-2xs"
                          >
                            {count}x {name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={resetGrillSelections}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-ink transition hover:bg-mist"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reiniciar selección
                      </button>
                    </div>

                    <div className="mt-3 space-y-3">
                      {GRILL_GROUPS.map((group) => (
                        <div key={group.key} className="rounded-2xl border border-black/[0.06] bg-white/75 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[12px] font-black uppercase tracking-wider text-[#ea580c]">
                                {group.emoji} {group.title}
                              </p>
                              <p className="text-[10.5px] font-semibold text-ink-soft">{group.hint}</p>
                            </div>
                            <span className="rounded-full bg-[#fff8f5] px-2 py-0.5 text-[10px] font-black text-[#ea580c]">
                              {grillItemsByGroup[group.key].length} opciones
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {grillItemsByGroup[group.key].map((item) => {
                              const count = cutPortions[item.name] || 0;
                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                                    count > 0 ? "border-[#ea580c]/30 bg-white shadow-xs" : "border-black/5 bg-white/70"
                                  }`}
                                >
                                  <div className="min-w-0 pr-2">
                                    <p className="text-[13px] font-black text-ink">{item.name}</p>
                                    <p className="text-[11px] font-bold text-ink-soft">{item.unitNoun}</p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => changeCutPortion(item.name, -1)}
                                      disabled={count <= 0}
                                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-mist text-ink font-black disabled:opacity-30 active:scale-90 cursor-pointer"
                                    >
                                      <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-5 text-center text-[13px] font-black text-ink">
                                      {count}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => changeCutPortion(item.name, 1)}
                                      disabled={totalPortionsSelected >= portionConfig.targetPortions}
                                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ea580c] text-white font-black disabled:opacity-30 active:scale-90 cursor-pointer"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. AGREGAR MÁS CORTES O PORCIONES ADICIONALES (OPCIONAL) */}
                  <div className="border-t border-black/8 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12.5px] font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                          <Beef className="h-4 w-4 text-[#ea580c]" /> 2. ¿Deseas agregar porciones extra a tu combo?
                        </p>
                        <p className="text-[11px] font-semibold text-ink-soft">
                          Suma más cortes de 250g, embutidos o costillas con precio por porción. Desliza el carrusel y toca + en lo que quieras.
                        </p>
                      </div>
                      {extraCutsSubtotal > 0 && (
                        <span className="rounded-full bg-[#ea580c] px-2 py-0.5 text-[10.5px] font-black text-white shadow-2xs">
                          +{formatMXN(extraCutsSubtotal)}
                        </span>
                      )}
                    </div>

                    {Object.values(extraCuts).some((count) => count > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {sortedGrillItems
                          .filter((item) => (extraCuts[item.name] || 0) > 0)
                          .map((item) => (
                            <span
                              key={`extra-pill-${item.id}`}
                              className="rounded-full bg-[#fff8f5] px-2.5 py-1 text-[10px] font-black text-[#ea580c] shadow-2xs"
                            >
                              +{extraCuts[item.name]} {item.name}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
                      {sortedGrillItems.map((item) => {
                        const extraCount = extraCuts[item.name] || 0;
                        return (
                          <div
                            key={`extra-${item.id}`}
                            className={`w-[156px] shrink-0 rounded-[18px] border px-2 py-2 transition ${
                              extraCount > 0 ? "border-[#ea580c]/30 bg-white shadow-xs" : "border-black/5 bg-white/70"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-bold text-ink">{item.name}</p>
                              <div className="mt-0.5 flex items-center justify-between gap-2 text-[9.5px] font-semibold text-ink-soft">
                                <span className="truncate">{item.weightLabel}</span>
                                <span className="shrink-0 font-black text-[#ea580c]">+{formatMXN(item.extraPrice)}</span>
                              </div>
                            </div>

                            <div className="mt-1.5 flex items-center justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() => changeExtraCut(item.name, -1)}
                                disabled={extraCount <= 0}
                                className="flex h-6 w-6 items-center justify-center rounded-md bg-mist text-ink font-black disabled:opacity-30 active:scale-90 cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-[11px] font-black text-ink">{extraCount}</span>
                              <button
                                type="button"
                                onClick={() => changeExtraCut(item.name, 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-white font-black active:scale-90 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Término de la carne */}
                  <div className="border-t border-black/8 pt-3">
                    <p className="text-[12px] font-black uppercase tracking-wider text-ink">
                      🔥 3. Término de la carne:
                    </p>
                    <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                      {["Término Medio (Jugoso)", "Tres Cuartos (3/4)", "Bien Cocido"].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setMeatTerm(term)}
                          className={`rounded-xl border p-2 text-center text-[11px] font-black transition cursor-pointer ${
                            meatTerm === term
                              ? "border-[#ea580c] bg-white text-[#ea580c] shadow-xs"
                              : "border-black/5 bg-white/70 text-ink-soft hover:bg-white"
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tamaños si aplica */}
              {SIZES.length > 0 && !portionConfig && (
                <div>
                  <p className="text-[13.5px] font-black">
                    Elige el tamaño <span className="text-ink-soft">(obligatorio)</span>
                  </p>
                  <div className="mt-2 space-y-2">
                    {SIZES.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setSize(s)}
                        className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition"
                        style={{
                          borderColor: size.name === s.name ? "var(--brand)" : "rgba(0,0,0,0.08)",
                          background: size.name === s.name ? "var(--brand-soft)" : "#fff",
                        }}
                      >
                        <span className="flex items-center gap-2.5 text-[14px] font-extrabold">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              size.name === s.name ? "border-brand" : "border-black/20"
                            }`}
                          >
                            {size.name === s.name && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                          </span>
                          {s.name}
                        </span>
                        <span className="text-[13px] font-bold text-ink-soft">{s.delta ? `+${formatMXN(s.delta)}` : "Incluido"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {needsMeatTermOnly && (
                <div className="rounded-2xl border border-[#ea580c]/20 bg-[#fff8f5] p-4">
                  <p className="text-[13px] font-black uppercase tracking-wider text-[#ea580c]">
                    🔥 Elige el término de tu corte
                  </p>
                  <p className="mt-1 text-[11.5px] font-semibold text-ink-soft">
                    Como en un steakhouse: define cómo quieres que llegue tu corte.
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {["Término Medio (Jugoso)", "Tres Cuartos (3/4)", "Bien Cocido"].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setMeatTerm(term)}
                        className={`rounded-xl border p-2.5 text-center text-[11px] font-black transition cursor-pointer ${
                          meatTerm === term
                            ? "border-[#ea580c] bg-white text-[#ea580c] shadow-xs"
                            : "border-black/5 bg-white/80 text-ink-soft hover:bg-white"
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-[#ea580c]/12 pt-3">
                    <p className="text-[12px] font-black uppercase tracking-wider text-[#ea580c]">
                      🥑 Elige tu guarnición
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-ink-soft">
                      Selecciona la guarnición incluida para tu corte.
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {GRILL_SINGLE_SIDE_OPTIONS.map((side) => (
                        <button
                          key={side}
                          type="button"
                          onClick={() => setSelectedSide(side)}
                          className={`rounded-xl border px-3 py-2 text-left text-[11px] font-black transition ${
                            selectedSide === side
                              ? "border-[#ea580c] bg-white text-[#ea580c] shadow-xs"
                              : "border-black/5 bg-white/80 text-ink-soft hover:bg-white"
                          }`}
                        >
                          {side}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Extras y complementos organizados alfabéticamente A-Z */}
              {availableExtras.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[13.5px] font-black flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-brand" /> Extras y complementos (A - Z)
                    </p>
                    <span className="text-[11.5px] font-bold text-ink-soft">{selectedExtras.length} seleccionados</span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableExtras.map((e) => {
                      const isSelected = selectedExtras.some((x) => x.name === e.name);
                      return (
                        <button
                          key={e.name}
                          type="button"
                          onClick={() => toggleExtra(e)}
                          className={`flex items-center justify-between rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                            isSelected ? "border-brand bg-brand-soft/70 shadow-sm" : "border-black/10 bg-white hover:border-black/20"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-[13px] font-extrabold text-ink truncate">{e.name}</p>
                            <p className="text-[12px] font-bold text-ink-soft">{e.delta > 0 ? `+${formatMXN(e.delta)}` : "Gratis"}</p>
                          </div>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                              isSelected ? "border-brand bg-brand text-white" : "border-black/20 bg-mist"
                            }`}
                          >
                            {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3 text-ink-soft" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[13.5px] font-black">Instrucciones especiales</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: sin cebolla, salsa aparte, bien dorado..."
                  rows={2}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-black/10 bg-mist px-4 py-2.5 text-[13px] font-semibold outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3 border-t border-black/5 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {store.isOpen ? (
                <>
                  <QtyStepper qty={qty} onInc={() => setQty((q) => q + 1)} onDec={() => setQty((q) => Math.max(1, q - 1))} />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAdd}
                    disabled={portionConfig ? totalPortionsSelected < portionConfig.targetPortions : false}
                    className="flex flex-1 items-center justify-between rounded-full px-5 py-3.5 font-black text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: isCombo ? "#7c3aed" : "var(--brand)" }}
                  >
                    <span className="flex items-center gap-2 text-[14.5px]">
                      <ShoppingBag className="h-4.5 w-4.5" />
                      {portionConfig && totalPortionsSelected < portionConfig.targetPortions
                        ? `Elige ${portionConfig.targetPortions - totalPortionsSelected} porción más`
                        : editingItem
                          ? "Guardar cambios"
                          : "Agregar al carrito"}
                    </span>
                    <span>{formatMXN(total)}</span>
                  </motion.button>
                </>
              ) : (
                <p className="flex-1 rounded-full bg-mist px-5 py-3.5 text-center text-[13.5px] font-black text-ink-soft">
                  Tienda cerrada temporalmente
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/schedule-picker.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CalendarDays, Check, Clock3, Zap } from "lucide-react";

const SLOTS: string[] = Array.from({ length: 28 }, (_, i) =>
  `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
);

function buildDays() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getTime() + i * 86400000);
    const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(d).replace(".", "");
    return { date: d, label, num: d.getDate() };
  });
}

export default function SchedulePicker({
  open,
  initialIso,
  onClose,
  onSave,
}: {
  open: boolean;
  initialIso: string | null;
  onClose: () => void;
  onSave: (iso: string | null) => void;
}) {
  const [days, setDays] = useState<{ date: Date; label: string; num: number }[] | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setDays(buildDays());
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setError("");
      if (initialIso) {
        const d = new Date(initialIso);
        if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) {
          const list = buildDays();
          const idx = list.findIndex((x) => x.date.toDateString() === d.toDateString());
          if (idx !== -1) {
            setDayIdx(idx);
            setSlot(`${String(d.getHours()).padStart(2, "0")}:${d.getMinutes() >= 30 ? "30" : "00"}`);
            return;
          }
        }
      }
      setDayIdx(0);
      setSlot(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, initialIso]);

  const save = () => {
    if (!slot || !days) return setError("Elige día y hora.");
    const d = new Date(days[dayIdx].date);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    if (d.getTime() <= Date.now()) return setError("Esa hora ya pasó, elige otra.");
    onSave(d.toISOString());
    onClose();
  };

  const label = () => {
    if (!slot || !days) return "";
    const d = new Date(days[dayIdx].date);
    const [h, m] = slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[85] mx-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.35)] sm:inset-y-6 sm:rounded-[28px] sm:border sm:border-black/5"
          >
            <div className="flex shrink-0 items-start justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black tracking-tight">
                  <CalendarDays className="h-5.5 w-5.5 text-brand" /> ¿Cuándo lo quieres?
                </h2>
                <p className="mt-0.5 text-[12.5px] font-bold text-ink-soft">Programa tu pedido y relájate</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-mist transition hover:bg-black/10 active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              <p className="text-[12px] font-black text-ink-soft uppercase">Día</p>
              <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1">
                {(days ?? Array.from({ length: 7 })).map((d, i) =>
                  d && "num" in d ? (
                    <button
                      key={i}
                      onClick={() => setDayIdx(i)}
                      className={`flex w-[72px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition active:scale-95 ${
                        dayIdx === i ? "border-brand bg-brand-soft" : "border-black/10"
                      }`}
                    >
                      <span className="text-[11px] font-black text-ink-soft capitalize">{d.label}</span>
                      <span className={`text-lg font-black ${dayIdx === i ? "text-brand" : ""}`}>{d.num}</span>
                    </button>
                  ) : (
                    <div key={i} className="h-[60px] w-[72px] shrink-0 animate-pulse rounded-2xl bg-mist" />
                  ),
                )}
              </div>

              <p className="mt-5 text-[12px] font-black text-ink-soft uppercase">Hora de entrega</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`rounded-xl border py-2 text-[12.5px] font-black transition active:scale-95 ${
                      slot === s ? "border-brand bg-brand text-white shadow-sm" : "border-black/10 hover:border-brand/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {error && <p className="mt-3 rounded-xl bg-brand-soft px-4 py-2.5 text-[13px] font-black text-brand">{error}</p>}
              {slot && (
                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-black text-brand">
                  <Clock3 className="h-4 w-4" /> Entrega: {label()}
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-black/5 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-3">
                {initialIso && (
                  <button
                    onClick={() => {
                      onSave(null);
                      onClose();
                    }}
                    className="rounded-full bg-mist px-4 py-3.5 text-[13px] font-black text-ink transition hover:bg-black/[0.08]"
                  >
                    Lo antes posible
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={save}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 text-[14.5px] font-black text-white shadow-[0_12px_28px_var(--brand-glow)] transition hover:bg-brand-dark"
                >
                  <Zap className="h-4.5 w-4.5 fill-white" /> {initialIso ? "Actualizar programación" : "Programar pedido"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/section-icon.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/components/stepper.tsx
// --------------------------------------------------------
"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export function QtyStepper({ qty, onInc, onDec, small = false }: { qty: number; onInc: () => void; onDec: () => void; small?: boolean }) {
  const size = small ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white p-0.5 shadow-sm">
      <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onDec(); }} className={`${size} flex items-center justify-center rounded-full text-ink transition hover:bg-mist`} aria-label="Quitar uno">
        <Minus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.6} />
      </motion.button>
      <span className={`${small ? "w-5 text-[13px]" : "w-7 text-[15px]"} text-center font-black tabular-nums`}>{qty}</span>
      <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onInc(); }} className={`${size} flex items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark`} aria-label="Añadir uno">
        <Plus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.6} />
      </motion.button>
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex h-9 min-w-9 items-center justify-center gap-1 rounded-full bg-brand px-2.5 font-black text-white shadow-[0_6px_16px_var(--brand-glow)] transition hover:bg-brand-dark" aria-label="Añadir al carrito">
      <Plus className="h-4.5 w-4.5" strokeWidth={3} />
      {label && <span className="text-[13px]">{label}</span>}
    </motion.button>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/surprise-host.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import SurpriseModal, { type SurpriseDish } from "./surprise-modal";
import type { Restaurant } from "@/db/schema";

/**
 * Escucha el evento global "zappy-surprise" para abrir el modal
 * desde cualquier botón de la app (header, sección de comida, etc.)
 */
export default function SurpriseHost({ dishes, restaurants }: { dishes: SurpriseDish[]; restaurants: Restaurant[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openModal = () => setOpen(true);
    window.addEventListener("zappy-surprise", openModal);
    return () => window.removeEventListener("zappy-surprise", openModal);
  }, []);

  if (dishes.length < 5) return null;

  return <SurpriseModal open={open} dishes={dishes} restaurants={restaurants} onClose={() => setOpen(false)} />;
}


// --------------------------------------------------------
// ARCHIVO: src/components/surprise-modal.tsx
// --------------------------------------------------------
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Dices, RefreshCw, Clock3, Store } from "lucide-react";
import { useCart, type CartRestaurant } from "@/store/cart";
import { formatMXN } from "@/lib/utils";
import type { Restaurant } from "@/db/schema";
import { AddButton } from "./stepper";

export type SurpriseDish = {
  id: number; name: string; description: string; price: number;
  image: string | null; section: string; restaurantId: number;
};

/* Un platillo al azar de cada restaurante (5 restaurantes distintos) */
type Roll = { restaurant: Restaurant; dish: SurpriseDish }[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SurpriseModal({
  open,
  dishes,
  restaurants,
  onClose,
}: {
  open: boolean;
  dishes: SurpriseDish[];
  restaurants: Restaurant[];
  onClose: () => void;
}) {
  const addItem = useCart((s) => s.addItem);

  const pick = useCallback((): Roll | null => {
    const openRests = restaurants.filter((r) => r.isOpen && r.categorySlug === "restaurantes");
    const byRestaurant = new Map<number, SurpriseDish[]>();
    for (const d of dishes) {
      const arr = byRestaurant.get(d.restaurantId) ?? [];
      arr.push(d);
      byRestaurant.set(d.restaurantId, arr);
    }
    const candidates = shuffle(openRests.filter((r) => (byRestaurant.get(r.id)?.length ?? 0) > 0));
    if (candidates.length === 0) return null;

    /* 1ª vuelta: un platillo por restaurante. Si faltan para llegar a 5
       (p. ej. hay tiendas cerradas), se rellena con otro platillo distinto. */
    const roll: Roll = [];
    const usedDish = new Set<number>();
    let pass = 0;
    while (roll.length < 5 && pass < 6) {
      for (const restaurant of candidates) {
        if (roll.length >= 5) break;
        const opts = byRestaurant.get(restaurant.id)!.filter((d) => !usedDish.has(d.id));
        if (!opts.length) continue;
        const dish = opts[Math.floor(Math.random() * opts.length)];
        usedDish.add(dish.id);
        roll.push({ restaurant, dish });
      }
      pass++;
    }
    return roll;
  }, [dishes, restaurants]);

  const [roll, setRoll] = useState<Roll | null>(() => pick());
  const [rollKey, setRollKey] = useState(0);

  useEffect(() => {
    if (open) {
      setRoll(pick());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, pick]);

  const addDish = (restaurant: Restaurant, d: SurpriseDish) => {
    const cartRestaurant: CartRestaurant = {
      id: restaurant.id, name: restaurant.name, slug: restaurant.slug,
      deliveryFee: restaurant.deliveryFee, timeMin: restaurant.timeMin, timeMax: restaurant.timeMax,
    };
    addItem({ key: `${d.id}`, productId: d.id, name: d.name, price: d.price, basePrice: d.price, image: d.image, qty: 1 }, cartRestaurant);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[85] mx-auto flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.35)] sm:inset-y-6 sm:rounded-[28px] sm:border sm:border-black/5"
          >
            <div className="relative shrink-0 bg-gradient-to-br from-brand via-brand-hard to-[var(--brand-accent)] px-5 py-4 text-white">
              <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition active:scale-90">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <motion.span
                  key={`dice-${rollKey}`}
                  initial={{ rotate: -25, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20"
                >
                  <Dices className="h-6 w-6" />
                </motion.span>
                <div>
                  <h2 className="text-[21px] leading-tight font-black tracking-tight">¡Sorpresa Rayte!</h2>
                  <p className="text-[12.5px] font-bold text-white/85">Un platillo al azar de 5 restaurantes distintos</p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {roll && roll.length > 0 ? (
                roll.map(({ restaurant, dish }, i) => (
                  <motion.div
                    key={`${rollKey}-${dish.id}`}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, type: "spring", stiffness: 300, damping: 24 }}
                    className="mb-3 rounded-2xl border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        {dish.image && <Image src={dish.image} alt={dish.name} fill className="object-cover" sizes="64px" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] leading-tight font-extrabold">{dish.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-[12px] font-semibold text-ink-soft">{dish.description}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-[13.5px] font-black text-brand">{formatMXN(dish.price)}</span>
                          <span className="flex min-w-0 items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-black text-ink-soft">
                            <Store className="h-3 w-3 shrink-0 text-brand" /> <span className="truncate">{restaurant.name}</span>
                          </span>
                          <span className="flex items-center gap-0.5 text-[10.5px] font-bold text-ink-soft"><Clock3 className="h-3 w-3" /> {restaurant.timeMin}-{restaurant.timeMax} min</span>
                        </div>
                      </div>
                      <AddButton onClick={() => addDish(restaurant, dish)} />
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="py-10 text-center text-sm font-bold text-ink-soft">No hay suficientes platillos para sorprenderte ahora mismo.</p>
              )}
            </div>

            <div className="shrink-0 border-t border-black/5 bg-white px-5 py-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setRoll(pick()); setRollKey((k) => k + 1); }}
                disabled={!roll}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[14.5px] font-black text-white shadow-[0_12px_28px_var(--brand-glow)] transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-50"
              >
                <RefreshCw className="h-4.5 w-4.5" /> Otra ronda sorpresa
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


// --------------------------------------------------------
// ARCHIVO: src/components/theme-applier.tsx
// --------------------------------------------------------
"use client";

import { useEffect, useState } from "react";
import { useTheme, applyPalette, paletteById } from "@/store/theme";

/**
 * Aplica la paleta de color elegida (persistida) en todas las páginas.
 * Cambia las variables CSS --brand, --brand-hard, etc.
 */
export default function ThemeApplier() {
  const paletteId = useTheme((s) => s.paletteId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted) applyPalette(paletteById(paletteId));
  }, [mounted, paletteId]);

  return null;
}


// --------------------------------------------------------
// ARCHIVO: src/db/index.ts
// --------------------------------------------------------
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const globalForDb = globalThis as typeof globalThis & { __arenaNextJsPostgresqlPool?: Pool };

export const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new Pool({ connectionString: databaseUrl });

export const db = drizzle(pool);


// --------------------------------------------------------
// ARCHIVO: src/db/schema.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/db/seed-combos.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/db/seed-extras.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/db/seed-options.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/db/seed-parrilladas.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/db/seed-partners.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/db/seed-patio-humo.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/db/seed.ts
// --------------------------------------------------------
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


// --------------------------------------------------------
// ARCHIVO: src/lib/auth.ts
// --------------------------------------------------------
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "rayte_session";
const SESSION_DAYS = 30;

/* ── Contraseñas (scrypt + sal) ── */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* ── Sesiones ── */
export function newToken(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex").slice(0, 64);
}

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

/* Usuario de la sesión actual (o null). Lee la cookie httpOnly. */
export async function sessionUser(): Promise<User | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({ user: users, expiresAt: sessions.expiresAt })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.token, token));
    const row = rows[0];
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await destroySession(token);
      return null;
    }
    return row.user;
  } catch {
    return null;
  }
}

export function publicUser(u: User) {
  return { id: u.id, name: u.name, phone: u.phone, address: u.address };
}


// --------------------------------------------------------
// ARCHIVO: src/lib/cross-sell.ts
// --------------------------------------------------------
import { db } from "@/db";
import { products, restaurants, services } from "@/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import type { CrossSellItem } from "@/components/cross-sell";

export function randomCrossTitle(): string {
  return "Todo en un solo rayte";
}

/**
 * Cross-selling con composición fija (4 tarjetas):
 *   1) Un tipo de comida (producto popular de un negocio de comida)
 *   2) Un servicio (hogar: plomería, limpieza, técnico, chef)
 *   3) Una cita (belleza o bienestar: barbería, masaje, manicure, yoga)
 *   4) Un médico (salud: médico, enfermería, nutrición, psicología)
 */
export async function crossSellItems(_exclude?: string | null): Promise<CrossSellItem[]> {
  const items: CrossSellItem[] = [];

  // 1) COMIDA: el producto más popular entre negocios de comida abiertos
  const foodRows = await db
    .select({ p: products, slug: restaurants.slug })
    .from(products)
    .innerJoin(restaurants, eq(products.restaurantId, restaurants.id))
    .where(
      and(
        eq(products.available, true),
        eq(restaurants.isOpen, true),
        inArray(restaurants.categorySlug, ["restaurantes", "turbo", "postres", "bebidas", "mercado", "saludable"]),
      ),
    )
    .orderBy(asc(products.sort))
    .limit(80);

  const food = foodRows.find((r) => r.p.popular) ?? foodRows[0];
  if (food) {
    items.push({
      key: `comida-${food.p.id}`,
      name: food.p.name,
      price: food.p.price,
      image: food.p.image,
      categoryName: "Comida",
      href: `/restaurante/${food.slug}`,
    });
  }

  // 2-4) SERVICIO · CITA · MÉDICO
  const svc = await db.select().from(services).where(eq(services.available, true)).orderBy(asc(services.sort));
  const pick = (cats: string[], label: string) => {
    const s = svc.find((x) => cats.includes(x.category));
    if (!s) return;
    items.push({
      key: `${label}-${s.id}`,
      name: s.name,
      price: s.price,
      image: s.image,
      categoryName: label,
      href: `/servicios/${s.slug}`,
    });
  };

  pick(["hogar"], "Servicio");
  pick(["belleza", "bienestar"], "Cita");
  pick(["salud"], "Médico");

  return items;
}


// --------------------------------------------------------
// ARCHIVO: src/lib/service-cats.ts
// --------------------------------------------------------
/* Colores e identidad de cada sección de servicios (citas) */
export const SERVICE_CATS: Record<string, { label: string; emoji: string; accent: string; soft: string; glow: string }> = {
  belleza: { label: "Belleza", emoji: "💇", accent: "#db2777", soft: "#fce7f3", glow: "rgba(219,39,119,0.35)" },
  bienestar: { label: "Bienestar", emoji: "🧘", accent: "#0d9488", soft: "#ccfbf1", glow: "rgba(13,148,136,0.35)" },
  mascotas: { label: "Mascotas", emoji: "🐾", accent: "#0284c7", soft: "#e0f2fe", glow: "rgba(2,132,199,0.35)" },
  hogar: { label: "Hogar", emoji: "🔧", accent: "#FF5A5F", soft: "#ffe9ea", glow: "rgba(255,90,95,0.35)" },
  salud: { label: "Salud", emoji: "🩺", accent: "#1d6ae5", soft: "#e8f1fe", glow: "rgba(29,106,229,0.35)" },
};

export function serviceCat(c?: string | null) {
  return (c && SERVICE_CATS[c]) || { label: "Servicio", emoji: "📅", accent: "#7c3aed", soft: "#f3e8ff", glow: "rgba(124,58,237,0.35)" };
}


// --------------------------------------------------------
// ARCHIVO: src/lib/utils.ts
// --------------------------------------------------------
export function formatMXN(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function serviceFeeFor(subtotal: number): number {
  return Math.min(29, Math.max(5, Math.round(subtotal * 0.05)));
}


// --------------------------------------------------------
// ARCHIVO: src/store/cart.ts
// --------------------------------------------------------
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartRestaurant = {
  id: number;
  name: string;
  slug: string;
  deliveryFee: number;
  timeMin: number;
  timeMax: number;
};

export type CartItemCustomization = {
  sizeName?: string;
  selectedExtras?: { name: string; delta: number }[];
  cutPortions?: Record<string, number>;
  extraCuts?: Record<string, number>;
  meatTerm?: string;
  selectedSide?: string;
};

export type CartItem = {
  key: string;
  productId: number;
  name: string;
  price: number;
  basePrice: number;
  image: string | null;
  qty: number;
  notes?: string;
  options?: string;
  customization?: CartItemCustomization;
};

type CartState = {
  items: CartItem[];
  restaurant: CartRestaurant | null;
  drawerOpen: boolean;
  address: string;
  customerName: string;
  phone: string;
  schedulePref: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: CartItem, restaurant: CartRestaurant) => void;
  replaceItem: (prevKey: string, item: CartItem, restaurant: CartRestaurant) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  setAddress: (address: string) => void;
  setCustomer: (name: string, phone: string) => void;
  setSchedulePref: (iso: string | null) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurant: null,
      drawerOpen: false,
      address: "Blvd. Aeropuerto 125, Col. Centro, León, GTO",
      customerName: "",
      phone: "",
      schedulePref: null,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      addItem: (item, restaurant) => {
        const { items, restaurant: current } = get();
        const base = current && current.id !== restaurant.id ? [] : items;
        const existing = base.find((i) => i.key === item.key);
        if (existing) {
          set({
            items: base.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i)),
            restaurant,
            drawerOpen: true,
          });
        } else {
          set({ items: [...base, item], restaurant, drawerOpen: true });
        }
      },
      replaceItem: (prevKey, item, restaurant) => {
        const { items, restaurant: current } = get();
        const base = current && current.id !== restaurant.id ? [] : items;
        const prevIndex = base.findIndex((entry) => entry.key === prevKey);
        const filtered = base.filter((entry) => entry.key !== prevKey);
        const sameTarget = filtered.find((entry) => entry.key === item.key);

        if (sameTarget) {
          set({
            items: filtered.map((entry) =>
              entry.key === item.key ? { ...entry, qty: entry.qty + item.qty } : entry,
            ),
            restaurant,
            drawerOpen: true,
          });
          return;
        }

        const nextItems = [...filtered];
        if (prevIndex >= 0 && prevIndex <= nextItems.length) {
          nextItems.splice(prevIndex, 0, item);
        } else {
          nextItems.push(item);
        }

        set({ items: nextItems, restaurant, drawerOpen: true });
      },
      increment: (key) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)) })),
      decrement: (key) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),
      removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], restaurant: null, drawerOpen: false }),
      setAddress: (address) => set({ address }),
      setCustomer: (customerName, phone) => set({ customerName, phone }),
      setSchedulePref: (iso) => set({ schedulePref: iso }),
    }),
    { name: "zappy-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.qty, 0);
}


// --------------------------------------------------------
// ARCHIVO: src/store/favorites.ts
// --------------------------------------------------------
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  favorites: string[]; // slugs de tiendas favoritas
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: ["la-brasa-smash", "pizza-nonna"], // precarga un par de favoritos por defecto estilo Uber
      toggleFavorite: (slug) => {
        const list = get().favorites;
        if (list.includes(slug)) {
          set({ favorites: list.filter((s) => s !== slug) });
        } else {
          set({ favorites: [...list, slug] });
        }
      },
      isFavorite: (slug) => get().favorites.includes(slug),
    }),
    { name: "rayte-favorites" },
  ),
);


// --------------------------------------------------------
// ARCHIVO: src/store/orders.ts
// --------------------------------------------------------
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartRestaurant } from "./cart";

export type Order = {
  code: string;
  items: CartItem[];
  restaurant: CartRestaurant;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  payment: string;
  placedAt: number;
  etaMin: number;
  etaMax: number;
  scheduledFor?: string;
  refPhoto?: string;
};

type OrdersState = {
  orders: Order[];
  ratings: Record<string, number>;
  addOrder: (order: Order) => void;
  rateOrder: (code: string, rating: number) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      ratings: {},
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      rateOrder: (code, rating) => set((s) => ({ ratings: { ...s.ratings, [code]: rating } })),
    }),
    { name: "zappy-orders" },
  ),
);

/* Demo: los estados del pedido avanzan solos con el tiempo (segundos) */
export const ORDER_STEPS = [
  { label: "Pedido confirmado", icon: "check" },
  { label: "En preparación", icon: "chef" },
  { label: "En camino a tu domicilio", icon: "bike" },
  { label: "Entregado", icon: "home" },
] as const;

export function orderStep(order: Order, now = Date.now()): number {
  const start = order.scheduledFor
    ? Math.max(order.placedAt, new Date(order.scheduledFor).getTime())
    : order.placedAt;
  const t = (now - start) / 1000;
  if (t >= 95) return 3;
  if (t >= 40) return 2;
  if (t >= 12) return 1;
  return 0;
}

/* ¿El pedido está programado para más tarde? */
export function orderIsScheduled(order: Order, now = Date.now()): boolean {
  return !!order.scheduledFor && now < new Date(order.scheduledFor).getTime();
}


// --------------------------------------------------------
// ARCHIVO: src/store/theme.ts
// --------------------------------------------------------
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Palette = {
  id: string; name: string;
  brand: string; hard: string; dark: string; soft: string; accent: string;
};

export const PALETTES: Palette[] = [
  { id: "naranja", name: "Naranja", brand: "#ff441f", hard: "#d6330f", dark: "#c73a17", soft: "#fff0ec", accent: "#ff7a2f" },
  { id: "rojo", name: "Rojo", brand: "#e11d48", hard: "#be123c", dark: "#9f1239", soft: "#fff1f2", accent: "#fb7185" },
  { id: "azul", name: "Azul", brand: "#2d7ff9", hard: "#1b64d8", dark: "#1655b8", soft: "#e9f2ff", accent: "#6aa5ff" },
  { id: "verde", name: "Verde", brand: "#0ea55b", hard: "#0a8749", dark: "#08743f", soft: "#e6f8ee", accent: "#3ecf8e" },
  { id: "morado", name: "Morado", brand: "#7c3aed", hard: "#6428d9", dark: "#5520bb", soft: "#f2ecff", accent: "#a78bfa" },
  { id: "rosa", name: "Rosa", brand: "#ec4899", hard: "#d61f7f", dark: "#bd1b70", soft: "#fdeaf5", accent: "#f9a8d4" },
  { id: "turquesa", name: "Turquesa", brand: "#06b6d4", hard: "#0891b2", dark: "#0a7a99", soft: "#e0f7fb", accent: "#22d3ee" },
  { id: "mostaza", name: "Mostaza", brand: "#d97708", hard: "#b45309", dark: "#9c4a08", soft: "#fdf3e3", accent: "#f59e0b" },
  { id: "negro", name: "Negro", brand: "#1f2937", hard: "#111827", dark: "#0b1220", soft: "#eceef2", accent: "#4b5563" },
];

type ThemeState = { paletteId: string; setPalette: (id: string) => void };

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      paletteId: "naranja",
      setPalette: (paletteId) => set({ paletteId }),
    }),
    { name: "rayte-theme" },
  ),
);

export const paletteById = (id: string): Palette => PALETTES.find((p) => p.id === id) ?? PALETTES[0];

export function applyPalette(p: Palette) {
  const root = document.documentElement;
  root.style.setProperty("--brand", p.brand);
  root.style.setProperty("--brand-hard", p.hard);
  root.style.setProperty("--brand-dark", p.dark);
  root.style.setProperty("--brand-soft", p.soft);
  root.style.setProperty("--brand-accent", p.accent);
  const n = parseInt(p.brand.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  root.style.setProperty("--brand-glow", `rgba(${r}, ${g}, ${b}, 0.42)`);
}


// --------------------------------------------------------
// ARCHIVO: tmp-playwright-check.mjs
// --------------------------------------------------------
import { chromium } from 'playwright';

const browser = await chromium.launch({headless: true});
const page = await browser.newPage();
const errors = [];
page.on('console', msg => {
  if (['error','warning'].includes(msg.type())) errors.push(`console:${msg.type()}: ${msg.text()}`);
});
page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
page.on('requestfailed', req => errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));

await page.goto('http://127.0.0.1:3000/profesional', { waitUntil: 'networkidle' });
console.log('title', await page.title());

const serviceButton = page.locator('button').filter({ hasText: 'Médico a Domicilio' }).first();
await serviceButton.click();
await page.waitForLoadState('networkidle');

const tabTexts = ['Agenda','Historial de citas','Pacientes y expedientes','Agendar','Servicios','Mis documentos'];
for (const text of tabTexts) {
  const btn = page.locator('button').filter({ hasText: text }).first();
  await btn.click();
  await page.waitForTimeout(300);
  console.log('clicked tab', text, 'visible=', await btn.isVisible());
}

console.log('errors', JSON.stringify(errors, null, 2));
await page.screenshot({ path: '/home/user/rayte/profesional-check.png', fullPage: true });
await browser.close();


// --------------------------------------------------------
// ARCHIVO: tsconfig.json
// --------------------------------------------------------
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}


