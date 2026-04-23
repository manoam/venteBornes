import React, { Component, Suspense, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  FileSignature,
  Settings,
  Tag,
  Layers,
  Package,
  Palette,
  Upload,
  RefreshCw,
} from "lucide-react";
import keycloak from "../lib/keycloak";
import { loadRemoteComponent } from "../remoteLoader";
import Topbar from "./Topbar";
import LocalSidebar from "./LocalSidebar";

// Lazy-load remote components from the hub
const RemoteHeaderBar = React.lazy(() => loadRemoteComponent("./HeaderBar"));
const RemoteSidebar = React.lazy(() => loadRemoteComponent("./Sidebar"));

// Sidebar sections for this app
const SIDEBAR_SECTIONS = [
  {
    label: "Navigation",
    items: [
      { icon: ShoppingCart, label: "Ventes", path: "/ventes" },
      { icon: FileSignature, label: "Contrats", path: "/contrats" },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { icon: Tag, label: "Types de vente", path: "/parametres/types-ventes" },
      { icon: Layers, label: "Gammes", path: "/parametres/gammes" },
      { icon: Package, label: "Modèles", path: "/parametres/modeles" },
      { icon: Palette, label: "Couleurs", path: "/parametres/couleurs" },
      { icon: Upload, label: "Import Excel", path: "/parametres/import" },
      { icon: RefreshCw, label: "Synchronisation", path: "/parametres/sync" },
      { icon: Settings, label: "Paramètres", path: "/parametres" },
    ],
  },
];

// Placeholder matching header height
function HeaderFallback() {
  return (
    <div className="h-12 shrink-0 border-b border-[--k-border] bg-gradient-to-r from-white to-blue-50" />
  );
}

// Placeholder matching sidebar width
function SidebarFallback() {
  return <div className="w-[210px] shrink-0 bg-[--k-sidebar-bg] h-full" />;
}

// Error boundary for remote components
interface RemoteErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface RemoteErrorBoundaryState {
  hasError: boolean;
}

class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  constructor(props: RemoteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RemoteErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("k_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        "k_sidebar_collapsed",
        sidebarCollapsed ? "1" : "0"
      );
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Map keycloak user to remote header user shape
  const headerUser = keycloak.tokenParsed
    ? {
        firstName:
          keycloak.tokenParsed.given_name ??
          keycloak.tokenParsed.preferred_username ??
          "",
        lastName: keycloak.tokenParsed.family_name ?? "",
        email: keycloak.tokenParsed.email ?? "",
        username: keycloak.tokenParsed.preferred_username ?? "",
      }
    : null;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  // Local fallback components
  const localTopbar = (
    <Topbar onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)} />
  );

  const localSidebar = (
    <LocalSidebar
      collapsed={sidebarCollapsed}
      onToggle={() => setSidebarCollapsed((v) => !v)}
    />
  );

  const localMobileSidebar = (
    <LocalSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
  );

  return (
    <div className="h-screen flex flex-col bg-[--k-bg]">
      {/* Header — remote with local fallback */}
      <RemoteErrorBoundary fallback={localTopbar}>
        <Suspense fallback={<HeaderFallback />}>
          <RemoteHeaderBar
            user={headerUser}
            onLogout={handleLogout}
            currentAppName="Ventes & Contrats"
            onNavigate={handleNavigate}
          />
        </Suspense>
      </RemoteErrorBoundary>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar — remote with local fallback */}
        <div className="hidden md:block">
          <RemoteErrorBoundary fallback={localSidebar}>
            <Suspense fallback={<SidebarFallback />}>
              <RemoteSidebar
                sections={SIDEBAR_SECTIONS}
                activePath={location.pathname}
                onNavigate={handleNavigate}
                collapsed={sidebarCollapsed}
                onCollapse={() => setSidebarCollapsed((v) => !v)}
                onHelpClick={() => {}}
              />
            </Suspense>
          </RemoteErrorBoundary>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-12 z-40 h-[calc(100vh-48px)] md:hidden">
              <RemoteErrorBoundary fallback={localMobileSidebar}>
                <Suspense fallback={<SidebarFallback />}>
                  <RemoteSidebar
                    sections={SIDEBAR_SECTIONS}
                    activePath={location.pathname}
                    onNavigate={handleNavigate}
                    collapsed={false}
                    onCollapse={() => setMobileMenuOpen(false)}
                    onHelpClick={() => {}}
                  />
                </Suspense>
              </RemoteErrorBoundary>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-3 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
