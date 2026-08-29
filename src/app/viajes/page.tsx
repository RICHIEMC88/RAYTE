import { crossSellItems, randomCrossTitle } from "@/lib/cross-sell";
import ViajesClient from "./viajes-client";

export const dynamic = "force-dynamic";

export default async function ViajesPage() {
  const cross = await crossSellItems(null);
  return <ViajesClient crossItems={cross} crossTitle={randomCrossTitle()} />;
}
