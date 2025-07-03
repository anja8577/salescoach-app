"use client";

import { useState } from 'react';
import LayoutApp from '@/components/LayoutApp';

export default function Profile() {
  const [message, setMessage] = useState("Profile page is working!");

  return (
    <LayoutApp>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p>{message}</p>
        
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Test Section</h2>
          <p>If you can see this, the basic layout is working.</p>
        </div>
      </div>
    </LayoutApp>
  );
}