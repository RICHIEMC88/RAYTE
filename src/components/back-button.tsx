"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
  label = "Volver",
  fallback = "/",
}: {
  label?: string;
  fallback?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (typeof window === "undefined") {
      router.push(fallback);
      return;
    }

    const referrer = document.referrer ? new URL(document.referrer, window.location.origin) : null;
    const sameOrigin = Boolean(referrer && referrer.origin === window.location.origin);
    const differentPath = Boolean(referrer && `${referrer.pathname}${referrer.search}` !== pathname);

    if (window.history.length > 1 && sameOrigin && differentPath) {
      const currentPath = pathname;
      router.back();
      window.setTimeout(() => {
        if (window.location.pathname === currentPath) {
          router.push(fallback);
        }
      }, 160);
      return;
    }

    router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:bg-mist active:scale-90"
    >
      <ArrowLeft className="h-5 w-5 text-ink" />
    </button>
  );
}
