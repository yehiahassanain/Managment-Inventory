import { getProducts, getFormData, getStockAlerts } from "./actions";
import { getSession } from "../../../lib/session";
import { ensureDefaultCategoriesAndSuppliers } from "../../../lib/seed";
import ProductsClientPage from "../../../components/products/ProductsClientPage";

export const metadata = {
  title: "Power Fitness",
  description: "View and manage catalog items and stock thresholds.",
};

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    supplier?: string;
    status?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    return null; // Layout will handle redirect
  }

  const userId = session.userId;
  const role = session.role;

  // Auto-seed default categories/suppliers if database is empty
  await ensureDefaultCategoriesAndSuppliers(userId);

  const { categories, suppliers } = await getFormData();
  const stockAlerts = await getStockAlerts();
  const resolvedSearchParams = await searchParams;

  const search = resolvedSearchParams.q || "";
  const category = resolvedSearchParams.category || "";
  const supplier = resolvedSearchParams.supplier || "";
  const status = resolvedSearchParams.status || "";
  const sortBy = resolvedSearchParams.sortBy || "name_asc";
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const limit = 8; // items per page

  const { products, totalPages, totalItems } = await getProducts({
    search,
    category,
    supplier,
    status,
    sortBy,
    page,
    limit,
  });

  return (
    <ProductsClientPage
      initialProducts={products}
      categories={categories}
      suppliers={suppliers}
      totalPages={totalPages}
      totalItems={totalItems}
      currentPage={page}
      itemsPerPage={limit}
      isAdmin={role === "ADMIN"}
      stockAlerts={stockAlerts}
    />
  );
}
