import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";
import ViajesClient from "./viajes-client";

export const revalidate = 10; // caché de borde 10 s: navegación casi instantánea, datos con ≤10 s de edad

export default async function ViajesPage() {
  const cross = await crossSellItems(null);
  return <ViajesClient crossItems={cross} crossTitle={randomCrossTitle()} />;
}
