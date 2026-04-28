import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/data";

export default async function HomePage() {
  const categories = await getCategories();
  return (
    <main className="flex-1">
      {/* カテゴリ一覧 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-accent mb-6">カテゴリから探す</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group block"
            >
              {category.image_url ? (
                <div className="bg-surface border border-border rounded-lg overflow-hidden group-hover:border-border-strong transition-colors">
                  <div className="relative aspect-[4/3] bg-surface-muted">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      priority={index === 0}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-accent px-3 py-2 group-hover:underline">
                    {category.name}
                  </h3>
                </div>
              ) : (
                <div className="aspect-[16/3] bg-surface border border-border rounded-lg flex items-center justify-center px-3 group-hover:border-border-strong group-hover:bg-surface-muted transition-colors">
                  <span className="text-sm font-medium text-accent text-center leading-tight break-words">
                    {category.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
