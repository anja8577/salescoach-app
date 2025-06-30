import { forwardRef } from "react";
import { cn } from "@/lib/utils";
// REMOVED: import { colors } from "@/styles/colors";

const Button = forwardRef(function Button(
  { className = "", variant = "solid", color = "primary", children, ...props },
  ref
) {
  // Define color classes using standard Tailwind
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return variant === "outline" 
          ? "border border-blue-800 text-blue-800 hover:bg-blue-50" 
          : "bg-blue-800 text-white hover:bg-blue-900";
      
      case "purple":
        return variant === "outline"
          ? "border border-purple-600 text-purple-600 hover:bg-purple-50"
          : "bg-purple-600 text-white hover:bg-purple-700";
      
      case "pink":
        return variant === "outline"
          ? "border border-pink-500 text-pink-500 hover:bg-pink-50"
          : "bg-pink-500 text-white hover:bg-pink-600";
      
      case "orange":
        return variant === "outline"
          ? "border border-orange-500 text-orange-500 hover:bg-orange-50"
          : "bg-orange-500 text-white hover:bg-orange-600";
      
      case "green":
        return variant === "outline"
          ? "border border-green-600 text-green-600 hover:bg-green-50"
          : "bg-green-600 text-white hover:bg-green-700";
      
      case "yellow":
        return variant === "outline"
          ? "border border-yellow-400 text-yellow-600 hover:bg-yellow-50"
          : "bg-yellow-400 text-black hover:bg-yellow-500";
      
      default:
        // Fallback to primary
        return variant === "outline" 
          ? "border border-blue-800 text-blue-800 hover:bg-blue-50" 
          : "bg-blue-800 text-white hover:bg-blue-900";
    }
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-lato font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        getColorClasses(),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export { Button };