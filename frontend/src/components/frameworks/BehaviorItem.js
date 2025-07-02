"use client";

export default function BehaviorItem({ behavior, onUpdate, onRemove }) {
  return (
    <div className="flex items-center justify-between group bg-white border border-gray-200 rounded px-3 py-2">
      <input
        type="text"
        placeholder="Enter behavior description"
        className="flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm"
        value={behavior.description || ""}
        onChange={(e) => onUpdate({ ...behavior, description: e.target.value })}
      />
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity ml-2 text-lg font-bold"
      >
        ×
      </button>
    </div>
  );
}