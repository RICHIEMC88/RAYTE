"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CartShell from "@/components/cart-shell";
import BottomNav from "@/components/bottom-nav";
import ThemeApplier from "@/components/theme-applier";

function isEmbeddedBrowser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export default function AppShellChrome() {
  const searchParams = useSearchParams();
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    const queryEmbed =
      searchParams.get("embed") === "1" ||
      searchParams.get("embed") === "true" ||
      searchParams.get("wix") === "1";
    setEmbedded(queryEmbed || isEmbeddedBrowser());
  }, [searchParams]);

  return (
    <>
      <ThemeApplier />
      {!embedded && <CartShell />}
      {!embedded && <BottomNav />}
    </>
  );
}
