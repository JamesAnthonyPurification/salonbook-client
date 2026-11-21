"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Receipt,
  Scissors,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";
import Avatar from "@/components/ui/Avatar";
import { signOut, useSession } from "@/lib/auth-client";
import { clearAccessToken } from "@/lib/api";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const NAV: Record<"admin" | "customer", NavItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/customer/appointments", label: "My Appointments", icon: CalendarDays },
    { href: "/dashboard/customer/profile", label: "My Profile", icon: UserCircle },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/admin/services", label: "Manage Services", icon: Scissors, exact: true },
    { href: "/dashboard/admin/services/new", label: "Add Service", icon: PlusCircle },
    { href: "/dashboard/admin/appointments", label: "Manage Appointments", icon: CalendarCheck },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/admin/profile", label: "My Profile", icon: UserCircle },
  ],
};

interface ShellUser {
  name: string;
  email: string;
  image?: string | null;
  role: "admin" | "customer";
}

export default function DashboardShell({ user: initialUser, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  // live session (updates instantly after profile edits); server-provided user as fallback
  const user = session?.user ? { ...initialUser, name: session.user.name, image: session.user.image } : initialUser;
  const items = NAV[initialUser.role];

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  async function handleLogout() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          clearAccessToken();
          toast.success("You have been signed out");
          router.push("/signin");
          router.refresh();
        },
        onError: () => {
          toast.error("Could not sign out. Please try again.");
        },
      },
    });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <button className="rounded-lg p-1.5 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="px-5 pt-4 pb-2 text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
        {initialUser.role === "admin" ? "Admin panel" : "My account"}
      </p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-brand-700 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <item.icon className="h-4.5 w-4.5" /> {item.label}
            </Link>
          );
        })}
        <div className="my-3 border-t border-stone-100" />
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100">
          <Home className="h-4.5 w-4.5" /> Back to website
        </Link>
      </nav>
      <div className="border-t border-stone-100 p-4">
        <div className="flex items-center gap-3">
          <Avatar src={user.image} name={user.name} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
            <p className="truncate text-xs text-stone-500">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-outline mt-3 w-full text-red-600 hover:border-red-200 hover:bg-red-50">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 border-r border-stone-200 bg-white lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-68">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-stone-100" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
