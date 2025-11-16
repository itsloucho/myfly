import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "text-[var(--primary-foreground)] hover:opacity-90",
      outline: "border border-[var(--border)] hover:bg-[var(--accent)]",
      ghost: "hover:bg-[var(--accent)]",
      destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
    }

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-8",
    }

    const gradientStyle = variant === "default" ? { background: "linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)" } : {};
    
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={gradientStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

