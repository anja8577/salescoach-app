"use client";

import { useAuth } from '@/contexts/AuthContext';
export default function AdminPanelHome() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-lato">
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-lg text-gray-700 mb-6 font-lato">
          You are now in the <span className="font-semibold text-blue-800">Admin Panel</span>.<br />
          This panel is designed for <span className="font-semibold">desktop use</span>.<br />
          <br />
          Here you can manage your <span className="font-semibold text-blue-800">users</span>, <span className="font-semibold text-blue-800">teams</span>, and <span className="font-semibold text-blue-800">coaching frameworks</span>.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-800 p-4 rounded text-left text-blue-900 font-lato">
          <span className="font-semibold">Access these functions through the side menu on the left.</span>
        </div>
      </div>
    </div>
  );
}
