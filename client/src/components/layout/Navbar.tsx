import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sparkles,
  User,
  FolderKanban,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";
import { getUser, isAuthenticated, logout } from "@/utils/token";

const links = [
  { href: "/#vision", label: "Vision" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#agents", label: "Agents" },
  { href: "/#features", label: "Features" },
  { href: "/#studio", label: "voice-studio" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EVOKE logo" className="h-9 w-9 object-contain" />
            <span className="font-display text-lg font-semibold tracking-[0.25em]">
              EVOKE
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="relative flex items-center gap-2">
            {authenticated ? (
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:scale-105"
                aria-label="Open profile menu"
              >
                {initial}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex"
                >
                  Login
                </Link>
                <Link to="/signup" className="hidden sm:inline-flex">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}

            <button
              className="rounded-lg p-2 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {authenticated && profileOpen && (
              <div className="absolute right-0 top-14 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#081226]/95 p-2 shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
                <div className="border-b border-white/10 px-3 py-3">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.fullName || "EVOKE User"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {user?.email || "user@evoke.ai"}
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>

                  <Link
                    to="/projects"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    <FolderKanban className="h-4 w-4" />
                    My Projects
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-white/10 pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {open && (
          <div className="glass mt-2 flex flex-col gap-3 rounded-2xl p-4 md:hidden">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </a>
            ))}

            {authenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Profile
                </Link>
                <Link
                  to="/projects"
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  My Projects
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-sm text-red-300 hover:text-red-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Login
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full">
                    <Sparkles className="h-4 w-4" />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}