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
