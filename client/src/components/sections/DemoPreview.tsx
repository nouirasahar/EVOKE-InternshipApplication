import { Calendar, Users, Activity, TrendingUp, Stethoscope, LayoutDashboard, FileText, Settings } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const stats = [
  { label: "Patients", value: "1,284", icon: Users, change: "+12%" },
  { label: "Appointments", value: "327", icon: Calendar, change: "+5%" },
  { label: "Active Cases", value: "94", icon: Activity, change: "+2%" },
  { label: "Revenue", value: "$48.2k", icon: TrendingUp, change: "+18%" },
];

const appointments = [
  { time: "09:00", patient: "Sarah Johnson", doctor: "Dr. Chen", status: "Confirmed" },
  { time: "10:30", patient: "Michael Lee", doctor: "Dr. Patel", status: "In Progress" },
  { time: "11:15", patient: "Emma Garcia", doctor: "Dr. Chen", status: "Confirmed" },
  { time: "13:00", patient: "James Wilson", doctor: "Dr. Khan", status: "Pending" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Calendar, label: "Appointments" },
  { icon: Users, label: "Patients" },
  { icon: FileText, label: "Records" },
  { icon: Settings, label: "Settings" },
];

export function DemoPreview() {
  return (
    <section id="demo" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle
          eyebrow="DEMO PREVIEW"
          title="A glimpse of what EVOKE generates"
          subtitle="A live, fully-styled application produced from a single voice command."
        />

        <div className="glass overflow-hidden rounded-2xl shadow-brand">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-black/40 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <div className="mx-auto rounded-md border border-border bg-black/30 px-4 py-1 font-mono text-xs text-muted-foreground">
              evoke.app/clinic-dashboard
            </div>
          </div>

          {/* App body */}
          <div className="grid gap-0 md:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="hidden border-r border-border bg-black/20 p-4 md:block">
              <div className="mb-6 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-cyan-glow" />
                <span className="font-display text-sm font-semibold">Clinic OS</span>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      item.active
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main */}
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Overview</h3>
                <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-muted-foreground">
                  Today
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-black/30 p-4">
                    <div className="flex items-center justify-between">
                      <s.icon className="h-4 w-4 text-cyan-glow" />
                      <span className="font-mono text-xs text-cyan-glow">{s.change}</span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-border bg-black/30">
                <div className="border-b border-border px-4 py-3 text-sm font-semibold">
                  Today's Appointments
                </div>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Patient</th>
                      <th className="hidden px-4 py-2 sm:table-cell">Doctor</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.time} className="border-t border-border">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.time}</td>
                        <td className="px-4 py-3">{a.patient}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{a.doctor}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-border bg-white/5 px-2 py-1 text-xs">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
