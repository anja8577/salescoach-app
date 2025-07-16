import React from "react";

export default function Toast({ open, message, type = "info", onClose }) {
  if (!open) return null;
  const color = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  }[type] || "bg-gray-800 text-white";

  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded shadow-lg ${color} flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
}
