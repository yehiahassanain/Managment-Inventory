"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "./actions";

export default function SidebarNav({ role, email }: { role: string; email: string }) {
  const pathname = usePathname();

  const navLinks = [
    ...(role === "ADMIN"
      ? [
          {
            href: "/dashboard",
            label: "Users Management",
            exact: true,
            icon: (
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
        ]
      : []),
    {
      href: "/dashboard/products",
      label: "Products Catalog",
      exact: false,
      icon: (
        <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    ...(role === "ADMIN"
      ? [
          {
            href: "/dashboard/analytics",
            label: "Analytics",
            exact: false,
            icon: (
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Left Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800/80 p-6 z-10 shrink-0">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25" aria-hidden="true">
            <svg className="w-5 h-5 text-white" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            {role === "ADMIN" ? "EIMS Admin" : "EIMS Inventory"}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav aria-label="Main navigation" className="flex-1 space-y-1.5">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "text-white bg-slate-800/70 border border-slate-700/60"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-800"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="border-t border-slate-800/60 pt-6 mt-auto">
          <div className="mb-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Signed in as</div>
            <div className="text-xs font-semibold text-slate-200 truncate mt-0.5" title={email}>
              {email}
            </div>
            {role === "ADMIN" && (
              <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20">
                ADMIN
              </span>
            )}
          </div>

          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-850 hover:border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md" aria-hidden="true">
            <svg className="w-4 h-4 text-white" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">EIMS</span>
        </div>

        <nav aria-label="Mobile navigation" className="flex items-center gap-3">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
              >
                {link.label}
              </Link>
            );
          })}
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 border border-slate-850 rounded-lg cursor-pointer"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </nav>
      </header>
    </>
  );
}
