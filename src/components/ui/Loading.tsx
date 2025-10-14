"use client";
import React from "react";

type LoadingProps = {
  label?: string;
  className?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "minimal";
  tip?: string;
};

export default function Loading({
  label = "Loading...",
  className = "",
  fullScreen = false,
  size = "md",
  variant = "default",
  tip,
}: LoadingProps) {
  const wrapper = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
    : "w-full flex items-center justify-center py-10";

  const sizes = {
    sm: { spinner: 18, text: "text-xs", pad: "p-3" },
    md: { spinner: 22, text: "text-sm", pad: "p-4" },
    lg: { spinner: 28, text: "text-base", pad: "p-5" },
  } as const;

  const s = sizes[size];

  // Variants: default (inline row), card (glass card), minimal (centered spinner only)
  const isCard = variant === "card" || fullScreen;
  const isMinimal = variant === "minimal";

  return (
    <div className={`${wrapper} ${className}`} role="status" aria-live="polite" aria-busy="true">
      {isMinimal ? (
        <Spinner size={s.spinner} />
      ) : (
        <div
          className={`
            ${isCard ? `
              ${s.pad}
              rounded-xl border border-[var(--border-gray)]/60
              bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md
              shadow-sm ring-1 ring-black/5
            ` : ""}
            flex flex-col items-center justify-center gap-3 min-w-[220px]
          `}
        >
          <div className="relative flex items-center justify-center">
            <Halo />
            <Spinner size={s.spinner + 6} />
          </div>
          <div className={`text-foreground/90 font-medium ${s.text}`}>{label}</div>
          {tip ? (
            <div className="text-foreground/60 text-xs text-center max-w-[240px]">{tip}</div>
          ) : null}
          <ShimmerBar />
          <Dots />
        </div>
      )}
    </div>
  );
}

export function Spinner({ size = 22 }: { size?: number }) {
  const px = `${size}px`;
  return (
    <svg
      className="animate-spin text-foreground/70"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={px}
      height={px}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lg" x1="0" x2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="url(#lg)"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-90"
      />
      <path
        d="M12 3a9 9 0 019 9"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShimmerBar() {
  return (
    <div className="relative w-48 h-1.5 overflow-hidden rounded-full bg-muted/70">
      <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-foreground/30 to-transparent animate-[shimmer_1.4s_infinite]"></div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(0%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="size-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="size-1.5 rounded-full bg-foreground/30 animate-bounce"></span>
      <span className="size-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.2s]"></span>
    </div>
  );
}

function Halo() {
  return (
    <div className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-tr from-primary/10 via-transparent to-primary/10 blur-md" />
  );
}
