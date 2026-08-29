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
