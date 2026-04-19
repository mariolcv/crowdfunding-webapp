"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({ analytics: true, marketing: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({ analytics: false, marketing: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            Usamos cookies para mejorar tu experiencia.{" "}
            <Link href="/cookies" className="text-blue-800 underline">Política de cookies</Link>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="secondary" size="sm" onClick={reject}>Rechazar</Button>
          <Button size="sm" onClick={accept}>Aceptar cookies</Button>
        </div>
      </div>
    </div>
  );
}
