"use client";
import React from "react";

export type AvatarInitialsProps = {
  name?: string | null;
  email?: string | null;
  size?: number; // in px
  className?: string;
};

function getInitial(name?: string | null, email?: string | null) {
  const src = (name && name.trim()) || (email && email.trim()) || "";
  const ch = src.charAt(0).toUpperCase();
  return ch || "U";
}

export default function AvatarInitials({ name, email, size = 24, className = "" }: AvatarInitialsProps) {
  const initial = getInitial(name, email);
  const style: React.CSSProperties = { width: size, height: size };
  // Ensure a consistent professional look
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gray-300 text-black text-[10px] font-medium ${className}`}
      style={style}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
