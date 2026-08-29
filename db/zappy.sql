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
