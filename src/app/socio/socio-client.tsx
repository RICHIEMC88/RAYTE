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
