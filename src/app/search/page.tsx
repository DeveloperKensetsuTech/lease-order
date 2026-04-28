import Link from "next/link";
import { getAllMaterials, getCategories } from "@/lib/data";
import SearchView from "./search-view";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";

  const [allMaterials, categories] = await Promise.all([
    getAllMaterials(),
    getCategories(),
  ]);

  const results = query.trim()
    ? allMaterials.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-subtle hover:text-accent transition-colors mb-6"
      >
        <span aria-hidden>←</span> トップに戻る
      </Link>
      <SearchView query={query} results={results} categories={categories} />
    </main>
  );
}
