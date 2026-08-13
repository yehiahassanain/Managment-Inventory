import SidebarNav from "./SidebarNav";
import { getSession } from "../../lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-slate-100 font-sans">
      {/* Skip to main content — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[350px] rounded-full bg-indigo-600/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[350px] rounded-full bg-violet-650/5 blur-[150px]" />
      </div>

      <SidebarNav role={session.role} email={session.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Content body */}
        <main id="main-content" tabIndex={-1} className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
