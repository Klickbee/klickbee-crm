"use client"

import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = "", leadingIcon, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-1.5 w-[119px] h-9 px-4 py-2 border border-[var(--border-gray)] rounded-md bg-white text-gray-900 text-sm shadow-sm hover:bg-gray-50   disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {leadingIcon}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"


