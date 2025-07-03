"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Users, Group, Layers, Home } from "lucide-react";

export default function LayoutAdmin({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case "/admin/users":
        return "Manage Users";
      case "/admin/teams":
        return "Manage Teams";
      case "/admin/frameworks":
        return "Manage Framework";
      case "/admin/frameworks/create":
        return "Manage Framework";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-inter pb-20 md:pb-0">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-white border-r p-4 hidden md:block">
        <div className="flex items-center space-x-2 mb-4">
          <Image src="/images/salescoach-icon.png" alt="SalesCoach" width={32} height={32} />
          <div>
            <div className="font-lato font-medium text-primary">SalesCoach</div>
            <div className="font-lato text-sm text-gray-600">Admin</div>
          </div>
        </div>
        <nav className="space-y-2">
          {/* Home Button */}
          <button 
            onClick={() => router.push("/")} 
            className="flex items-center gap-2 w-full text-left text-gray-700 hover:text-primary font-lato p-2 rounded hover:bg-gray-50"
          >
            <Home className="w-4 h-4" />
            Back to App
          </button>
          <hr className="my-2" />
          <button onClick={() => router.push("/admin/users")} className="block w-full text-left text-gray-700 hover:text-primary font-lato p-2 rounded hover:bg-gray-50">
            Manage Users
          </button>
          <button onClick={() => router.push("/admin/teams")} className="block w-full text-left text-gray-700 hover:text-primary font-lato p-2 rounded hover:bg-gray-50">
            Manage Teams
          </button>
          <button onClick={() => router.push("/admin/frameworks")} className="block w-full text-left text-gray-700 hover:text-primary font-lato p-2 rounded hover:bg-gray-50">
            Manage Framework
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <h1 className="text-lg font-medium font-lato mb-4">{getTitle()}</h1>
        {children}
      </main>

      {/* Bottom Navigation for Mobile/Tablet */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 shadow-md md:hidden">
        <button onClick={() => router.push("/")} className="flex flex-col items-center text-gray-700">
          <Home className="w-5 h-5" />
          <span className="text-xs font-lato">Home</span>
        </button>
        <button onClick={() => router.push("/admin/users")} className="flex flex-col items-center text-gray-700">
          <Users className="w-5 h-5" />
          <span className="text-xs font-lato">Users</span>
        </button>
        <button onClick={() => router.push("/admin/teams")} className="flex flex-col items-center text-gray-700">
          <Group className="w-5 h-5" />
          <span className="text-xs font-lato">Teams</span>
        </button>
        <button onClick={() => router.push("/admin/frameworks")} className="flex flex-col items-center text-gray-700">
          <Layers className="w-5 h-4" />
          <span className="text-xs font-lato">Framework</span>
        </button>
      </nav>
    </div>
  );
}