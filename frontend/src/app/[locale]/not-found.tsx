"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { Home, ArrowLeft } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full my-auto">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 shadow-xs"
        style={{
          background: "var(--accent-light)",
          borderColor: "var(--accent)",
          color: "var(--accent-dark)",
        }}
        aria-hidden="true"
      >
        <span className="text-3xl font-black">404</span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "var(--ink)" }}>
        Page Not Found
      </h1>

      <p className="text-base md:text-lg mb-8" style={{ color: "var(--ink-soft)" }}>
        The page you are looking for is not here. Let us guide you back to familiar ground.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        <Link href="/" className="no-underline w-full sm:w-auto">
          <BigButton
            label="Return Home"
            icon={<Home size={20} />}
            variant="primary"
            size="large"
            className="w-full sm:w-auto"
          />
        </Link>
        <Link href="/play" className="no-underline w-full sm:w-auto">
          <BigButton
            label="Patient Activities"
            variant="surface"
            size="large"
            className="w-full sm:w-auto"
          />
        </Link>
      </div>
    </div>
  );
}
