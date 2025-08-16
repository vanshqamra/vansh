import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const { findProductBySlug } = await import("@/app/product/[slug]/page");
    const found = await findProductBySlug(params.slug);
    return NextResponse.json({
      ok: !!found,
      slug: params.slug,
      brand: found?.brand || found?.product?.brand || null,
      sample: found
        ? Object.fromEntries(
            Object.entries(found.product || {}).slice(0, 12)
          )
        : null,
    });
  } catch (e: any) {
    console.error("[api/debug/product]", e);
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
