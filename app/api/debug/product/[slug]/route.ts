import { NextResponse } from "next/server";
import { getBySlug } from "@/lib/product-index";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const rec = getBySlug(params.slug);
  return NextResponse.json({
    ok: !!rec,
    slug: params.slug,
    foundBrand: rec?.brand ?? null,
    name: rec?.name ?? null,
    code: rec?.code ?? null
  });
}
