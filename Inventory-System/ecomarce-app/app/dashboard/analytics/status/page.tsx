import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../../../lib/session";
import { getStatusAnalysis } from "./actions";
import StatusAnalysisClient from "../../../../components/analytics/StatusAnalysisClient";

export const metadata: Metadata = {
  title: "Product Status Analysis — Analytics",
  description: "Admin Analysis Section: Filter and inspect Sold, Returned, Damaged, and Restocked products.",
};

export const dynamic = "force-dynamic";

export default async function ProductStatusAnalysisPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard/products");
  }

  const initialData = await getStatusAnalysis();

  return (
    <div className="space-y-6">
      {/* Sub-header info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Product Status Analysis
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Classified inventory transaction tables for Sold, Returned, Damaged, and Restocked items.
          </p>
        </div>
      </div>

      <StatusAnalysisClient initialData={initialData} />
    </div>
  );
}
