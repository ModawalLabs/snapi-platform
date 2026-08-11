import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { brandSeed, Workspace } from "@/features/workspace";
import { mockBrands } from "@/lib/mock-data";

type Params = Promise<{ slug: string }>;

function find(slug: string) {
  return mockBrands.find((brand) => brand.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const brand = find(slug);

  return { title: brand ? brand.name : "Maison" };
}

/**
 * `/brands/:slug` — a maison, opened as a workspace.
 *
 * The register at `/brands` comes from `(app)/brands/page.tsx`; route groups do
 * not appear in the URL, so the two coexist as `/brands` and `/brands/:slug`.
 */
export default async function BrandWorkspacePage({ params }: { params: Params }) {
  const { slug } = await params;
  const brand = find(slug);

  if (!brand) notFound();

  return <Workspace {...brandSeed(brand)} />;
}
