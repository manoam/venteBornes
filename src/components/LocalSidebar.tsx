import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  ChevronsLeft,
  ChevronsRight,
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
  { to: "/parametres/sync", label: "Synchronisation", icon: RefreshCw },
];

interface LocalSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function LocalSidebar({ collapsed, onToggle }: LocalSidebarProps) {
  const location = useLocation();
  const isInSettings = location.pathname.startsWith("/parametres");
  const [settingsOpen, setSettingsOpen] = useState(isInSettings);

  return (
    <div
      className="flex flex-col bg-[var(--k-sidebar-bg)] transition-all duration-200 h-full"
      style={{ width: collapsed ? "var(--k-sidebar-rail)" : "var(--k-sidebar-w)" }}
    >
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {!collapsed && (
          <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[var(--k-sidebar-section)]">
            Navigation
          </p>
        )}

        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 rounded-lg text-sm transition-colors relative",
                collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "px-3 py-2 my-0.5",
                isActive
                  ? "bg-white/10 text-[var(--k-sidebar-text-active)]"
                  : "text-[var(--k-sidebar-text)] hover:bg-white/[0.06] hover:text-[var(--k-sidebar-text-active)]"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r" />
                )}
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="font-medium">{label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {!collapsed && (
          <p className="px-3 pt-5 pb-1 text-[10px] uppercase tracking-widest text-[var(--k-sidebar-section)]">
            Configuration
          </p>
        )}

        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className={clsx(
            "w-full group flex items-center gap-3 rounded-lg text-sm transition-colors",
            collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "px-3 py-2 my-0.5",
            isInSettings
              ? "bg-white/10 text-[var(--k-sidebar-text-active)]"
              : "text-[var(--k-sidebar-text)] hover:bg-white/[0.06] hover:text-[var(--k-sidebar-text-active)]"
          )}
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left font-medium">Paramètres</span>
              <ChevronDown
                size={14}
                className={clsx("transition-transform", settingsOpen && "rotate-180")}
              />
            </>
          )}
        </button>

        {settingsOpen && !collapsed && (
          <div className="ml-2 space-y-0.5">
            {settingsItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] transition-colors",
                    isActive
                      ? "bg-white/10 text-[var(--k-sidebar-text-active)]"
                      : "text-[var(--k-sidebar-text)] hover:bg-white/[0.06] hover:text-[var(--k-sidebar-text-active)]"
                  )
                }
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-[var(--k-sidebar-border)] p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[var(--k-sidebar-text)] hover:bg-white/[0.06] hover:text-[var(--k-sidebar-text-active)] transition-colors text-sm"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && <span>Réduire</span>}
        </button>
      </div>
    </div>
  );
}
