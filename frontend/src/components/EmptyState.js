export default function EmptyState({ message }) {
  return (
    <div className="text-center text-gray-500 text-sm py-8">
      {message || "Nothing to display."}
    </div>
  );
}
