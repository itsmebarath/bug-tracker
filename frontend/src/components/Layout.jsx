import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onIssueCreated={() => setRefreshKey((prev) => prev + 1)} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet context={{ refreshKey }} />
        </main>
      </div>
    </div>
  );
}

