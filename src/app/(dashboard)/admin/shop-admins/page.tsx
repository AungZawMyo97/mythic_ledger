import { redirect } from "next/navigation";

export default async function ShopAdminsPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  void _searchParams;
  redirect("/dashboard");
}
