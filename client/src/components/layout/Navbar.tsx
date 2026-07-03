import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/#vision", label: "Vision" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#agents", label: "Agents" },
  { href: "/#features", label: "Features" },
  { href: "/#studio", label: "Studio" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EVOKE logo" className="h-9 w-9 object-contain" />
            <span className="font-display text-lg font-semibold tracking-[0.25em]">EVOKE</span>
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

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              Login
            </Link>
            <Link to="/signup" className="hidden sm:inline-flex">
              <Button>
                <Sparkles className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
            <button
              className="rounded-lg p-2 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
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
          </div>
        )}
      </div>
    </header>
  );
}
