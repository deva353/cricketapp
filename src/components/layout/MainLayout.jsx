
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import PWAStatus from "./PWAStatus";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f4f7f5]">
      <Sidebar />

      <div className="lg:ml-64 min-h-screen">
        <Navbar />

        <main className="min-w-0 p-4 pb-28 md:p-8 lg:pb-8 max-w-[1600px] mx-auto">
          <PWAStatus />

          <div className="mt-4">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
