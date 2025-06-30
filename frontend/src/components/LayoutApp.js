// LayoutApp.js - Mobile/Tablet Layout for Coaches/Coachees
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Plus, History, User } from "lucide-react";
import Image from "next/image";

export default function LayoutApp({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Simple logic to derive screen title based on route
  const getTitle = () => {
    switch (pathname) {
      case "/":
        return "Home";
      case "/session/create":
        return "New Coaching Session";
      case "/history":
        return "History";
      case "/profile":
        return "Profile";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 font-inter">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <div className="flex items-center space-x-2">
          <Image src="/images/salescoach-icon.png" alt="SalesCoach" width={32} height={32} />
          <span className="font-lato font-medium text-primary">SalesCoach</span>
        </div>
        <span className="font-lato text-gray-800 text-sm font-medium">{getTitle()}</span>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 space-y-4">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 shadow-md">
        <button 
          onClick={() => router.push("/")} 
          className={`flex flex-col items-center ${pathname === "/" ? "text-primary" : "text-gray-700"}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-lato">Home</span>
        </button>
        <button 
          onClick={() => router.push("/session/create")} 
          className={`flex flex-col items-center ${pathname === "/session/create" ? "text-primary" : "text-gray-700"}`}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-lato">New Session</span>
        </button>
        <button 
          onClick={() => router.push("/history")} 
          className={`flex flex-col items-center ${pathname === "/history" ? "text-primary" : "text-gray-700"}`}
        >
          <History className="w-5 h-5" />
          <span className="text-xs font-lato">History</span>
        </button>
        <button 
          onClick={() => router.push("/profile")} 
          className={`flex flex-col items-center ${pathname === "/profile" ? "text-primary" : "text-gray-700"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-lato">Profile</span>
        </button>
      </nav>
    </div>
  );
}