import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, FileSignature, ChevronDown, LogOut, Settings } from "lucide-react";
import keycloak from "../lib/keycloak";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const userName = keycloak.tokenParsed?.given_name
    ? `${keycloak.tokenParsed.given_name} ${keycloak.tokenParsed.family_name ?? ""}`
    : keycloak.tokenParsed?.preferred_username ?? "Utilisateur";

  const userInitials = (
    (keycloak.tokenParsed?.given_name?.[0] ?? "") +
    (keycloak.tokenParsed?.family_name?.[0] ?? "")
  ).toUpperCase() || "U";

  return (
    <header
      className="h-[var(--k-topbar-h)] bg-gradient-to-r from-white to-blue-50 border-b border-[var(--k-border)] shadow-sm shadow-black/[0.04] z-30 flex items-center px-3 gap-2"
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5"
      >
        <Menu size={18} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <FileSignature size={16} className="text-indigo-600" />
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] uppercase tracking-wider text-[var(--k-muted)] leading-none">
            KONITYS
          </p>
          <p className="text-[13px] font-bold text-[var(--k-text)] leading-tight">
            Ventes & Contrats
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Separator */}
      <div className="hidden sm:block w-px h-6 bg-[var(--k-border)]" />

      {/* Account */}
      <div ref={accountRef} className="relative">
        <button
          onClick={() => setAccountOpen((o) => !o)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">{userInitials}</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-[var(--k-text)]">
            {keycloak.tokenParsed?.given_name ?? "Utilisateur"}
          </span>
          <ChevronDown size={14} className="text-[var(--k-muted)]" />
        </button>

        {accountOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white/95 backdrop-blur-lg border border-[var(--k-border)] rounded-xl shadow-lg py-1 z-50">
            <div className="px-4 py-3 border-b border-[var(--k-border)]">
              <p className="text-sm font-semibold text-[var(--k-text)]">{userName}</p>
              <p className="text-xs text-[var(--k-muted)] truncate">
                {keycloak.tokenParsed?.email ?? ""}
              </p>
            </div>
            <button
              onClick={() => { navigate("/parametres/sync"); setAccountOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[var(--k-surface-2)] text-[var(--k-text)]"
            >
              <Settings size={15} className="text-[var(--k-muted)]" />
              Paramètres
            </button>
            <div className="border-t border-[var(--k-border)] mt-1 pt-1">
              <button
                onClick={() => keycloak.logout()}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 text-red-600"
              >
                <LogOut size={15} />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
