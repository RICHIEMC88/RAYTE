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
