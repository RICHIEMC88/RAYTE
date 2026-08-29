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
