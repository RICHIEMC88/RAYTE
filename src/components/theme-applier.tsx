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
