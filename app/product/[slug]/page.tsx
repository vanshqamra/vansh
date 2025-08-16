export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductSEO } from "@/lib/seo";
import { getBySlug } from "@/lib/product-index";
import { makeSlug } from "@/lib/catalog/fields";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const rec = getBySlug(params.slug);
  if (!rec) {
    return { title: "Product Not Found | Chemical Corporation", description: "The requested product could not be found.", robots: { index: false, follow: false } };
  }
  const canonical = `/product/${makeSlug(params.slug)}`;
  const seo = getProductSEO(rec.raw, rec.group, canonical);
  return { title: seo.title, description: seo.description, alternates: { canonical }, openGraph: { title: seo.title, description: seo.description, type: "product", url: canonical } };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const rec = getBySlug(params.slug);
  if (!rec) return notFound();

  const canonical = `/product/${makeSlug(params.slug)}`;
  const seo = getProductSEO(rec.raw, rec.group, canonical);

  const priceNum = typeof rec.price === "number" ? rec.price : null;
  const priceTxt = priceNum != null ? `₹${priceNum.toLocaleString("en-IN")}` : "POR";

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Badge className="mb-3 bg-blue-100 text-blue-900 border-blue-200">PRODUCT</Badge>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{seo.h1}</h1>
        <p className="text-slate-600 mt-2">Discounts auto-apply in cart • Fast delivery across India</p>
      </div>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {rec.brand ? <Badge variant="outline">{rec.brand}</Badge> : null}
            {rec.pack ? <Badge variant="outline">{rec.pack}</Badge> : null}
            {rec.code ? <Badge variant="outline">Code: {rec.code}</Badge> : null}
            {rec.hsn ? <Badge variant="outline">HSN: {rec.hsn}</Badge> : null}
            {rec.cas ? <Badge variant="outline">CAS: {rec.cas}</Badge> : null}
          </div>

          <div className="text-2xl font-semibold text-slate-900 mb-2">{priceTxt}</div>
          <div className="text-sm text-emerald-700 mb-6">Discount applies in cart — final price shown at checkout</div>

          <div className="flex gap-3">
            <Button asChild><Link href="/products">Continue Shopping</Link></Button>
            <Button asChild variant="outline"><Link href="/cart">View Cart</Link></Button>
          </div>

          <p className="text-slate-700 mt-6">
            Buy {rec.brand ? `${rec.brand} ` : ""}{rec.name}{rec.pack ? ` ${rec.pack}` : ""} online.
            10,000+ lab products from top brands with nationwide delivery.
          </p>
        </CardContent>
      </Card>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd ?? {}) }} />
    </div>
  );
}
