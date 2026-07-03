import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="EVOKE logo" className="h-8 w-8 object-contain" />
          <span className="font-display text-base font-semibold tracking-[0.25em]">EVOKE</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Voice-driven multi-agent platform. Built for serious AI software delivery.
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          © {new Date().getFullYear()} EVOKE
        </p>
      </div>
    </footer>
  );
}
