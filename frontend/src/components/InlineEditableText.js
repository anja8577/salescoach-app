import { useState } from "react";

export default function InlineEditableText({ text, onSave, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  const handleBlur = () => {
    onSave(value);
    setEditing(false);
  };

  return editing ? (
    <input
      className="border p-1 rounded w-full"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleBlur();
      }}
      autoFocus
    />
  ) : (
    <span onClick={() => setEditing(true)} className="cursor-pointer hover:underline">
      {text || placeholder || "Click to edit"}
    </span>
  );
}
