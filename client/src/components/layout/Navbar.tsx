import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";
import { getUser, isAuthenticated, logout } from "@/utils/token";

const links = [
  { href: "/#vision", label: "Vision" },
  { href: "/#workflow", label: "Your-Workspace" },
  { href: "/#agents", label: "Agents" },
  { href: "/#features", label: "Features" },
  { href: "/#studio", label: "Voice Studio" },
];

const navbarColor = "#fffbf7";
const borderColor = "#E9DED3";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 w-full px-4 sm:px-6 xl:px-8">
        <nav
          className="mx-auto flex w-full max-w-[1750px] items-center justify-between rounded-[28px] border px-5 py-3 sm:px-7 lg:px-9"
          style={{
            backgroundColor: navbarColor,
            borderColor,
          }}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5"
            onClick={() => {
              setOpen(false);
              setProfileOpen(false);
            }}
          >
            <img
              src={logo}
              alt="EVOKE logo"
              className="h-9 w-9 object-contain"
            />

            <span className="font-display text-lg font-semibold tracking-[0.25em] text-foreground">
              EVOKE
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex lg:gap-10 xl:gap-12">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div ref={profileMenuRef} className="relative flex items-center gap-2">
            {authenticated ? (
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="avatar-brand h-10 w-10 text-sm transition-transform hover:scale-105"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                {initial}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm font-medium text-muted-foreground hover:text-primary sm:inline-flex"
                >
                  Login
                </Link>

                <Link to="/signup" className="hidden sm:inline-flex">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}

            <button
              type="button"
              className="rounded-lg p-2 text-foreground hover:bg-white/40 md:hidden"
              onClick={() => {
                setOpen((current) => !current);
                setProfileOpen(false);
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={open}
            >
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {authenticated && profileOpen && (
              <div
                className="absolute right-0 top-14 w-72 overflow-hidden rounded-2xl border p-2"
                style={{
                  backgroundColor: navbarColor,
                  borderColor,
                }}
              >
                <div className="border-b px-3 py-3" style={{ borderColor }}>
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
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/40 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>

                  <Link
                    to="/projects"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/40 hover:text-foreground"
                  >
                    <FolderKanban className="h-4 w-4" />
                    My Projects
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/40 hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                <div className="border-t pt-2" style={{ borderColor }}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-error hover:bg-white/40"
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
          <div
            className="mx-auto mt-2 flex w-full max-w-[1750px] flex-col gap-2 rounded-2xl border p-4 md:hidden"
            style={{
              backgroundColor: navbarColor,
              borderColor,
            }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/40 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}

            {authenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/40 hover:text-foreground"
                >
                  Profile
                </Link>

                <Link
                  to="/projects"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/40 hover:text-foreground"
                >
                  My Projects
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/40 hover:text-foreground"
                >
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-error hover:bg-white/40"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/40 hover:text-foreground"
                >
                  Login
                </Link>

                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}