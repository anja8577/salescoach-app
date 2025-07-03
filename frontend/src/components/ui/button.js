import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Button = forwardRef(function Button(
  { className = "", variant = "solid", color = "primary", size = "default", children, ...props },
  ref
) {
  // Define size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-xs";
      case "lg":
        return "px-6 py-3 text-base";
      case "default":
      default:
        return "px-4 py-2 text-sm";
    }
  };

  // Define color classes using standard Tailwind
  const getColorClasses = () => {
    // Handle destructive variant specially
    if (variant === "destructive") {
      return "bg-red-600 text-white hover:bg-red-700 border-red-600";
    }

    switch (color) {
      case "primary":
        return variant === "outline" 
          ? "border border-blue-800 text-blue-800 hover:bg-blue-50 bg-white" 
          : "bg-blue-800 text-white hover:bg-blue-900";
      
      case "purple":
        return variant === "outline"
          ? "border border-purple-600 text-purple-600 hover:bg-purple-50 bg-white"
          : "bg-purple-600 text-white hover:bg-purple-700";
      
      case "pink":
        return variant === "outline"
          ? "border border-pink-500 text-pink-500 hover:bg-pink-50 bg-white"
          : "bg-pink-500 text-white hover:bg-pink-600";
      
      case "orange":
        return variant === "outline"
          ? "border border-orange-500 text-orange-500 hover:bg-orange-50 bg-white"
          : "bg-orange-500 text-white hover:bg-orange-600";
      
      case "green":
        return variant === "outline"
          ? "border border-green-600 text-green-600 hover:bg-green-50 bg-white"
          : "bg-green-600 text-white hover:bg-green-700";
      
      case "yellow":
        return variant === "outline"
          ? "border border-yellow-400 text-yellow-600 hover:bg-yellow-50 bg-white"
          : "bg-yellow-400 text-black hover:bg-yellow-500";
      
      default:
        // Fallback to primary
        return variant === "outline" 
          ? "border border-blue-800 text-blue-800 hover:bg-blue-50 bg-white" 
          : "bg-blue-800 text-white hover:bg-blue-900";
    }
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-lato font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        getSizeClasses(),
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