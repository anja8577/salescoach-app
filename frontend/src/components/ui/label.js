// src/components/ui/label.js
import React from 'react';

const Label = React.forwardRef(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 ${className}`}
    {...props}
  />
));

Label.displayName = "Label";

export { Label };