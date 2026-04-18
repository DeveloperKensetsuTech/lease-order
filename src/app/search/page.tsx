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
      <nav className="flex items-center gap-1.5 text-sm text-subtle mb-6">
        <Link href="/" className="hover:text-accent transition-colors">
          トップ
        </Link>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-accent font-medium">検索結果</span>
      </nav>
      <SearchView query={query} results={results} categories={categories} />
    </main>
  );
}
