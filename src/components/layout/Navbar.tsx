"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";
import Avatar from "@/components/ui/Avatar";
import { signOut, useSession } from "@/lib/auth-client";
import { clearAccessToken } from "@/lib/api";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const dashboardHref = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/customer";

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Browse Services" },
    ...(user ? [{ href: dashboardHref, label: "Dashboard" }] : []),
  ];

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  async function handleLogout() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          clearAccessToken();
          toast.success("You have been signed out");
          router.push("/");
          router.refresh();
        },
        onError: () => {
          toast.error("Could not sign out. Please try again.");
        },
      },
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream/90 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            <div className="h-9 w-32 animate-pulse rounded-full bg-stone-200" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pr-3 pl-1 hover:border-brand-200"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar src={user.image} name={user.name} size={30} />
                <span className="max-w-32 truncate text-sm font-medium">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-stone-400" />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
                    <p className="truncate text-xs text-stone-500">{user.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-stone-50" role="menuitem">
                    <LayoutDashboard className="h-4 w-4 text-stone-500" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" role="menuitem">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost">Sign In</Link>
              <Link href="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <div className="container-x space-y-1 py-4">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-stone-50 p-3">
                <Avatar src={user.image} name={user.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-stone-500">{user.email}</p>
                </div>
              </div>
            )}
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-stone-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3">
              {isPending ? null : user ? (
                <button onClick={handleLogout} className="btn-outline w-full text-red-600">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/signin" className="btn-outline">Sign In</Link>
                  <Link href="/signup" className="btn-primary">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
