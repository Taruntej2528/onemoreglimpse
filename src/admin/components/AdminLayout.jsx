import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#090B0F] text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-[#C9A96E]/30 selection:text-[#E5D2A8]">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sticky Left Sidebar (Fixed on Desktop, Off-Canvas Drawer on Mobile) */}
      <div
        className={`${
          isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 block' : 'hidden'
        } lg:block lg:sticky lg:top-0 lg:h-screen flex-shrink-0`}
      >
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Independently Scrollable Right Area */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header at Top */}
        <AdminHeader toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        {/* Scrollable Right Side Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
