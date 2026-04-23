import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import keycloak from "../lib/keycloak";
import {
  LayoutDashboard,
  ShoppingCart,
  FileSignature,
  Settings,
  ChevronDown,
  Tag,
  Layers,
  Package,
  Palette,
  Upload,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { to: "/ventes", label: "Ventes", icon: ShoppingCart },
  { to: "/contrats", label: "Contrats", icon: FileSignature },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const settingsItems = [
  { to: "/parametres/types-ventes", label: "Types de vente", icon: Tag },
  { to: "/parametres/gammes", label: "Gammes", icon: Layers },
  { to: "/parametres/modeles", label: "Modèles", icon: Package },
  { to: "/parametres/couleurs", label: "Couleurs", icon: Palette },
  { to: "/parametres/import", label: "Import Excel", icon: Upload },
  { to: "/parametres/sync", label: "Synchronisation CRM", icon: RefreshCw },
];

export default function Layout() {
  const location = useLocation();
  const isInSettings = location.pathname.startsWith("/parametres");
  const [settingsOpen, setSettingsOpen] = useState(isInSettings);

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

          {/* Menu Paramètres avec sous-menu */}
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className={clsx(
              "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isInSettings
                ? "bg-gray-800 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <span className="flex items-center gap-3">
              <Settings size={20} />
              Paramètres
            </span>
            <ChevronDown
              size={16}
              className={clsx("transition-transform", settingsOpen && "rotate-180")}
            />
          </button>

          {settingsOpen && (
            <div className="pl-4 space-y-1">
              {settingsItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {(keycloak.tokenParsed?.given_name?.[0] ?? keycloak.tokenParsed?.preferred_username?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {keycloak.tokenParsed?.given_name
                  ? `${keycloak.tokenParsed.given_name} ${keycloak.tokenParsed.family_name ?? ""}`
                  : keycloak.tokenParsed?.preferred_username ?? "Utilisateur"}
              </p>
              <button
                onClick={() => keycloak.logout()}
                className="text-xs text-gray-400 hover:text-white"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
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
