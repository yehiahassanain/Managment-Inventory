"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "./actions";
import { useState, useEffect } from "react";

interface SidebarNavProps {
  role: string;
  email: string;
  name?: string;
  pic?: string | null;
}

export default function SidebarNav({ role, email, name, pic }: SidebarNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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
      {/* ═══════════════════════════════════
          DESKTOP SIDEBAR (md and above)
      ═══════════════════════════════════ */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800/80 p-6 z-10 shrink-0">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 px-2.5 rounded-xl bg-white/95 border border-slate-700/50 flex items-center justify-center shadow-lg shrink-0">
            <img
              src="/uploads/Logo.png"
              alt="Power Fitness"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-tight">
              Power Fitness
            </span>
          </div>
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
        <div className="border-t border-slate-800/60 pt-5 mt-auto">
          <div className="flex items-center gap-3 mb-4 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/70">
            {/* User Avatar */}
            <div className="relative shrink-0">
              {pic ? (
                <img
                  src={pic}
                  alt={name || email}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/40 shadow-md ring-2 ring-indigo-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-indigo-500/20">
                  {(name || email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" title="Online" />
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100 truncate leading-tight" title={name || email}>
                {name || email.split("@")[0]}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5" title={email}>
                {email}
              </div>
              {role === "ADMIN" && (
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  ADMIN
                </span>
              )}
            </div>
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

      {/* ═══════════════════════════════════
          MOBILE TOP BAR (below md)
      ═══════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 px-2 rounded-lg bg-white/95 border border-slate-700/50 flex items-center justify-center shadow-md shrink-0">
            <img
              src="/uploads/Logo.png"
              alt="Power Fitness"
              className="h-5 w-auto object-contain"
            />
          </div>
          <span className="text-sm font-bold text-white">Power Fitness</span>
        </div>

        {/* Hamburger Button */}
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* ═══════════════════════════════════
          MOBILE DRAWER OVERLAY
      ═══════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 px-2.5 rounded-xl bg-white/95 border border-slate-700/50 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/uploads/Logo.png"
                alt="Power Fitness"
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-sm font-bold text-white">Power Fitness</span>
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto p-4 space-y-1.5">
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

        {/* Drawer Footer — User Info + Logout */}
        <div className="border-t border-slate-800/60 p-4 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800/70">
            <div className="relative shrink-0">
              {pic ? (
                <img
                  src={pic}
                  alt={name || email}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/40 shadow-md ring-2 ring-indigo-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-indigo-500/20">
                  {(name || email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" title="Online" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100 truncate">
                {name || email.split("@")[0]}
              </div>
              <div className="text-[11px] text-slate-400 truncate" title={email}>
                {email}
              </div>
              {role === "ADMIN" && (
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
