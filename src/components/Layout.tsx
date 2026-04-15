import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Receipt } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { to: "/ventes", label: "Ventes", icon: ShoppingCart },
  { to: "/facturations", label: "Facturations", icon: Receipt },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">CRM Selfizee</h1>
          <p className="text-sm text-gray-400 mt-1">Gestion des Ventes</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
