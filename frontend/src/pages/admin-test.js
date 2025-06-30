import LayoutAdmin from "@/components/LayoutAdmin";

export default function AdminTest() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Layout Test</h1>
      <p className="text-gray-700">This is a test page for the desktop admin layout.</p>
    </div>
  );
}

AdminTest.getLayout = function getLayout(page) {
  return <LayoutAdmin>{page}</LayoutAdmin>;
};
