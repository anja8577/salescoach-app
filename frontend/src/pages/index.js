export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-primary text-2xl mb-4">If this text is blue, Tailwind works!</h1>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-gray-700">This card uses Tailwind's utility classes.</p>
      </div>
    </div>
  );
}
