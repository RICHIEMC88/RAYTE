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
