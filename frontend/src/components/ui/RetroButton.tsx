import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const RetroButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    
    const variants = {
      primary: "bg-retro-cyan text-black border-black",
      secondary: "bg-white text-black border-black",
      danger: "bg-retro-pink text-black border-black",
      warning: "bg-retro-yellow text-black border-black",
      success: "bg-retro-green text-black border-black",
    }
    
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base font-bold uppercase",
      lg: "h-16 px-8 text-xl font-bold uppercase",
      icon: "h-12 w-12 flex justify-center items-center"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-heading border-retro retro-shadow retro-btn-active",
          variants[variant],
          sizes[size],
          "disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    )
  }
)
RetroButton.displayName = "RetroButton"

export { RetroButton }
