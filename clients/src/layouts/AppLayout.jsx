import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Leaf,
  Compass,
  MessageSquareText,
  Info,
  User,
  LogOut,
  Sun,
  Moon,
  Bookmark,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { logout } from "../utils/auth";
import { getTheme, toggleTheme, applyTheme } from "../utils/theme";
import { useEffect, useMemo, useState } from "react";

export default function AppLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    function handleWindowClick() {
      setProfileMenuOpen(false);
    }

    if (!profileMenuOpen) return undefined;
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, [profileMenuOpen]);

  function handleLogout() {
    logout();
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  }

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const isModerator = useMemo(() => {
    const role = (user?.userRole || user?.role || "").toUpperCase();
    return role === "MODERATOR" || role === "ADMIN";
  }, [user]);

  const isAdmin = useMemo(() => {
    const role = (user?.userRole || user?.role || "").toUpperCase();
    return role === "ADMIN";
  }, [user]);

  const initials = useMemo(() => {
    const name = String(user?.fullName || "U").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
  }, [user]);

  const exploreItems = [
    { to: "practices", icon: Leaf, label: "Practices" },
    { to: "discover", icon: Compass, label: "Discover" },
    { to: "discussions", icon: MessageSquareText, label: "Discussions" },
    { to: "bookmarks", icon: Bookmark, label: "Bookmarks" },
  ];

  const workspaceItems = [{ to: "profile", icon: User, label: "Profile" }];

  if (isModerator) {
    workspaceItems.push(
      { to: "moderation", icon: ShieldAlert, label: "Moderation", end: true },
      { to: "moderation/audit", icon: ShieldCheck, label: "Audit" },
    );
  }

  if (isAdmin) {
    workspaceItems.push(
      { to: "admin", icon: LayoutDashboard, label: "Admin" },
      { to: "admin-analytics", icon: BarChart3, label: "Admin Analytics" },
    );
  }

  const dropdownLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
    }`;

  function NavLinks({ items, onClick, mobile = false }) {
    return items.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onClick}
          className={mobile ? ({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`
          : dropdownLinkClass}
        >
          <Icon className={mobile ? "h-4.5 w-4.5" : "h-4 w-4"} />
          {item.label}
        </NavLink>
      );
    });
  }

  function DesktopGroup({ label, items }) {
    if (!items.length) return null;

    return (
      <div className="group relative">
        <button
          type="button"
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          {label}
        </button>
        <div className="pointer-events-none absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#0f1720]">
            {NavLinks({ items })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] text-slate-900 dark:bg-[#0b1117] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f5f6f2]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1117]/90">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-3 py-3 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white md:hidden dark:border-white/10 dark:bg-white/5"
              title="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/app/practices")}
              className="text-left"
            >
              <span className="font-brand text-lg font-semibold tracking-wide">CKVS</span>
            </button>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
            <DesktopGroup label="Explore" items={exploreItems} />
            <DesktopGroup label="Workspace" items={workspaceItems} />
            <div className="group relative">
              <NavLink
                to="about"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`
                }
              >
                About
              </NavLink>
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTheme(toggleTheme())}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen((open) => !open);
                }}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                title="Open profile menu"
              >
                {initials}
              </button>

              {profileMenuOpen ? (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#0f1720]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/app/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />

          <div className="absolute inset-x-3 top-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#0f1720]">
            <div className="flex items-center justify-between">
              <p className="font-brand text-base font-semibold">CKVS</p>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-5 space-y-5">
              <div>
                <p className="px-1 text-xs font-medium text-slate-400 dark:text-slate-500">Explore</p>
                <div className="mt-2 grid gap-1.5">
                  <NavLinks items={exploreItems} onClick={() => setMobileNavOpen(false)} mobile />
                </div>
              </div>

              <div>
                <p className="px-1 text-xs font-medium text-slate-400 dark:text-slate-500">Workspace</p>
                <div className="mt-2 grid gap-1.5">
                  <NavLinks items={workspaceItems} onClick={() => setMobileNavOpen(false)} mobile />
                </div>
              </div>

              <div>
                <p className="px-1 text-xs font-medium text-slate-400 dark:text-slate-500">About</p>
                <div className="mt-2 grid gap-1.5">
                  <NavLink
                    to="about"
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                      }`
                    }
                  >
                    <Info className="h-4 w-4" />
                    About
                  </NavLink>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1440px] px-3 py-4 sm:px-4 md:px-6 md:py-6">
        <Outlet />
      </main>
    </div>
  );
}
