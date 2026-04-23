import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
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
  X,
} from "lucide-react";
import { clsx } from "clsx";
import Topbar from "./Topbar";

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

export default function Layout() {
  const location = useLocation();
  const isInSettings = location.pathname.startsWith("/parametres");
  const [settingsOpen, setSettingsOpen] = useState(isInSettings);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("k_sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("k_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {/* Section label */}
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
                collapsed && !isMobile ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "px-3 py-2 my-0.5",
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
                {(!collapsed || isMobile) && <span className="font-medium">{label}</span>}
                {collapsed && !isMobile && (
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Section Paramètres */}
        {!collapsed && (
          <p className="px-3 pt-5 pb-1 text-[10px] uppercase tracking-widest text-[var(--k-sidebar-section)]">
            Configuration
          </p>
        )}

        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className={clsx(
            "w-full group flex items-center gap-3 rounded-lg text-sm transition-colors",
            collapsed && !isMobile ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "px-3 py-2 my-0.5",
            isInSettings
              ? "bg-white/10 text-[var(--k-sidebar-text-active)]"
              : "text-[var(--k-sidebar-text)] hover:bg-white/[0.06] hover:text-[var(--k-sidebar-text-active)]"
          )}
        >
          <Settings size={18} className="flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <>
              <span className="flex-1 text-left font-medium">Paramètres</span>
              <ChevronDown
                size={14}
                className={clsx("transition-transform", settingsOpen && "rotate-180")}
              />
            </>
          )}
          {collapsed && !isMobile && (
            <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Paramètres
            </span>
          )}
        </button>

        {settingsOpen && (!collapsed || isMobile) && (
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

      {/* Bottom: collapse toggle (desktop only) */}
      {!isMobile && (
        <div className="border-t border-[var(--k-sidebar-border)] p-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[var(--k-sidebar-text)] hover:bg-white/[0.06] hover:text-[var(--k-sidebar-text-active)] transition-colors text-sm"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            {!collapsed && <span>Réduire</span>}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Topbar */}
      <Topbar onMobileMenuToggle={() => setMobileOpen((o) => !o)} />

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col sticky top-[var(--k-topbar-h)] bg-[var(--k-sidebar-bg)] transition-all duration-200"
          style={{
            width: collapsed ? "var(--k-sidebar-rail)" : "var(--k-sidebar-w)",
            height: "calc(100vh - var(--k-topbar-h))",
          }}
        >
          {sidebarContent(false)}
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 top-[var(--k-topbar-h)] bg-black/30 z-30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="fixed left-0 top-[var(--k-topbar-h)] bottom-0 w-[var(--k-sidebar-w)] bg-[var(--k-sidebar-bg)] z-40 md:hidden flex flex-col"
            >
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--k-sidebar-text)] hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
              {sidebarContent(true)}
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
