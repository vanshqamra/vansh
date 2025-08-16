// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductSEO } from "@/lib/seo";

// ---------- small utils ----------
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => clean(vals.find((x) => clean(x)) || "");
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function packFrom(p: any) {
  return first(
    p.packSize, p.size, p.capacity, p.volume, p.diameter, p.dimensions, p.grade
  );
}
function codeFrom(p: any) {
  return first(
    p.code, p.catalog_no, p.catalogNo, p.catno, p.sku, p.item_code, p.itemCode
  );
}
function brandFrom(p: any, g?: any) {
  return first(
    p.brand, g?.brand, p.vendor, p.mfg,
    /borosil/i.test(JSON.stringify(p)) ? "Borosil" : ""
  );
}
function nameFrom(p: any, g?: any) {
  return first(p.productName, p.name, p.title, g?.title, g?.product, p.product);
}
function priceFrom(p: any) {
  if (p == null) return undefined;
  if (typeof p === "number") return p;
  const txt = String(p).trim().toUpperCase();
  if (txt === "POR" || txt === "P.O.R" || txt === "P O R") return undefined;
  const num = parseFloat(String(p).replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : undefined;
}
function primaryImageFrom(p: any, g?: any) {
  return (
    p.image || p.img || g?.image || g?.img ||
    (Array.isArray(p.images) && p.images[0]) ||
    (Array.isArray(g?.images) && g.images[0]) ||
    null
  );
}
function candidateSlug(p: any, g?: any) {
  const brand = brandFrom(p, g);
  const name = nameFrom(p, g);
  const pack = packFrom(p);
  const code = codeFrom(p);
  const base = [brand, name, pack].filter(Boolean).join(" ");
  const withCode = code ? `${base} ${code}` : base;
  return slugify(withCode);
}
async function safeImport<T = any>(path: string): Promise<T | undefined> {
  try {
    const mod: any = await import(/* @vite-ignore */ path);
    return (mod?.default ?? mod) as T;
  } catch {
    return undefined;
  }
}

type Found = { product: any; group?: any; brand?: string };

// Scan your catalogs and find by slug or by code
async function findProductBySlug(slug: string): Promise<Found | null> {
  const target = slug.toLowerCase();

  // 1) BOROSIL (grouped with variants)
  const borosil = await safeImport<any[]>("@/lib/borosil_products_absolute_final.json");
  if (Array.isArray(borosil)) {
    for (const g of borosil) {
      const brand = "Borosil";
      const groupName = g.product || g.title || "";
      const variants = Array.isArray(g.variants) ? g.variants : [];
      for (const v of variants) {
        const name = nameFrom(v, g) || groupName;
        const pack = packFrom(v) || packFrom(g);
        const code = codeFrom(v);
        const cand = slugify([brand, name, pack, code].filter(Boolean).join(" "));
        if (cand === target || (code && slugify(code) === target)) {
          return { product: { ...v, brand, productName: name }, group: g, brand };
        }
      }
    }
  }

  // helper to scan flat arrays
  const scanFlat = async (path: string, assumedBrand?: string) => {
    const data = await safeImport<any>(path);
    const arr =
      Array.isArray(data?.products) ? data.products :
      Array.isArray(data?.data) ? data.data :
      Array.isArray(data) ? data : [];

    for (const p of arr) {
      const brand = assumedBrand || brandFrom(p);
      const cand = candidateSlug(p);
      if (cand === target) return { product: p, group: undefined, brand };
      const code = codeFrom(p);
      if (code && slugify(code) === target) return { product: p, group: undefined, brand };
    }
    return null;
  };

  // 2) QUALIGENS
  const q = await scanFlat("@/lib/qualigens-products.json", "Qualigens");
  if (q) return q;

  // 3) RANKEM
  const r = await scanFlat("@/lib/rankem_products.json", "Rankem");
  if (r) return r;

  // 4) HIMEDIA (grouped TS export)
  const himedia = await safeImport<any>("@/lib/himedia_products_grouped");
  if (himedia) {
    const groups = Array.isArray(himedia) ? himedia : Array.isArray(himedia.groups) ? himedia.groups : [];
    for (const g of groups) {
      const variants = Array.isArray(g.variants) ? g.variants : [];
      for (const v of variants) {
        const cand = candidateSlug(v, g);
        if (cand === target) return { product: v, group: g, brand: "HiMedia" };
        const code = codeFrom(v);
        if (code && slugify(code) === target) return { product: v, group: g, brand: "HiMedia" };
      }
    }
    // possible flat fallback
    if (!Array.isArray(himedia.groups) && Array.isArray(himedia)) {
      for (const p of himedia) {
        const cand = candidateSlug(p);
        if (cand === target) return { product: p, group: undefined, brand: "HiMedia" };
      }
    }
  }

  // 5) OMSONS
  const o = await scanFlat("@/lib/omsons_products.json", "Omsons");
  if (o) return o;

  // 6) AVARICE
  const a = await scanFlat("@/lib/avarice_products.json", "Avarice");
  if (a) return a;

  // 7) WHATMAN
  const w = await scanFlat("@/lib/whatman_products.json", "Whatman");
  if (w) return w;

  return null;
}

// --------- Metadata ----------
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const found = await findProductBySlug(params.slug);
  if (!found) {
    return {
      title: "Product Not Found | Chemical Corporation",
      description: "The requested product could not be found.",
      robots: { index: false, follow: false },
    };
  }
  const seo = getProductSEO(found.product, found.group);
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "product",
    },
  };
}

// --------- Page ----------
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const found = await findProductBySlug(params.slug);
  if (!found) return notFound();

  const { product, group, brand: forcedBrand } = found;
  const seo = getProductSEO(product, group);

  const brand = first(product.brand, forcedBrand);
  const name = first(product.productName, product.name, product.title);
  const pack = packFrom(product);
  const code = codeFrom(product);
  const hsn = first(product.hsn, product.hsnCode);
  const cas = first(product.cas, product.casNo, product.cas_number);
  const price = priceFrom(product);
  const image = primaryImageFrom(product, group);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Badge className="mb-3 bg-blue-100 text-blue-900 border-blue-200">PRODUCT</Badge>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{seo.h1}</h1>
        <p className="text-slate-600 mt-2">Discounts auto-apply in cart • Fast delivery across India</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Image */}
        <div className="md:col-span-2">
          <Card className="bg-white">
            <CardContent className="p-4 flex items-center justify-center">
              {image ? (
                <Image
                  src={image}
                  alt={`${brand ? brand + " " : ""}${name || "Product"}`}
                  width={640}
                  height={640}
                  className="object-contain w-full h-auto"
                  unoptimized
                />
              ) : (
                <div className="aspect-square w-full grid place-items-center text-slate-400">No Image</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="md:col-span-3">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {brand ? <Badge variant="outline">{brand}</Badge> : null}
                {pack ? <Badge variant="outline">{pack}</Badge> : null}
                {code ? <Badge variant="outline">Code: {code}</Badge> : null}
                {hsn ? <Badge variant="outline">HSN: {hsn}</Badge> : null}
                {cas ? <Badge variant="outline">CAS: {cas}</Badge> : null}
              </div>

              <div className="text-2xl font-semibold text-slate-900 mb-2">
                {price !== undefined ? `₹${price.toLocaleString("en-IN")}` : "POR"}
              </div>
              <div className="text-sm text-emerald-700 mb-6">
                Discount applies in cart — final price shown at checkout
              </div>

              <div className="flex gap-3">
                <Button asChild><Link href="/products">Continue Shopping</Link></Button>
                <Button asChild variant="outline"><Link href="/cart">View Cart</Link></Button>
              </div>

              <p className="text-slate-700 mt-6">
                Buy {brand ? `${brand} ` : ""}{name}{pack ? ` ${pack}` : ""} online.
                10,000+ lab products from top brands with nationwide delivery.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product JSON-LD for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }}
      />
    </div>
  );
}
