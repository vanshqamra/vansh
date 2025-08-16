// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductSEO } from "@/lib/seo";
import { slugForProduct } from "@/lib/slug";

// ====== STATIC IMPORTS (present in your repo already) ======
import borosilProducts from "@/lib/borosil_products_absolute_final.json";
import qualigensProductsRaw from "@/lib/qualigens-products.json";
import rankemProducts from "@/lib/rankem_products.json";
import omsonsDataRaw from "@/lib/omsons_products.json";
import avariceProductsRaw from "@/lib/avarice_products.json";
import himediaProductsRaw from "@/lib/himedia_products_grouped";
import whatmanProducts from "@/lib/whatman_products.json";

// ====== small utils (kept local; no behavior changes elsewhere) ======
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => clean(vals.find((x) => clean(x)) || "");
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const asArray = (x: any) =>
  Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : [];

function packFrom(p: any) {
  return first(
    p.packSize, p.size, p.capacity, p.volume, p.diameter, p.dimensions, p.grade
  );
}
function codeFrom(p: any) {
  return first(
    p.code, p.catalog_no, p.catalogNo, p.catno, p.sku, p.item_code, p.itemCode, p["Product Code"]
  );
}
function brandFrom(p: any, g?: any) {
  return first(p.brand, g?.brand, p.vendor, p.mfg);
}
function nameFrom(p: any, g?: any) {
  return first(p.productName, p.name, p.title, g?.title, g?.product, p.product, p["Product Name"]);
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

// Build the same slug we used in lists
function candidateSlug(p: any, g?: any) {
  const brand = brandFrom(p, g);
  const name = nameFrom(p, g);
  const pack = packFrom(p);
  const code = codeFrom(p);
  const base = [brand, name, pack, code].filter(Boolean).join(" ");
  return slugify(base) || (code ? slugify(code) : "");
}

// Some users may hit /product/<CODE> directly; allow that too
function looksLikeCodeMatch(slug: string, p: any) {
  const c = codeFrom(p);
  return c && slugify(String(c)) === slug;
}

type Found = { product: any; group?: any; brand?: string };

// ====== Resolve product across all brands ======
async function findProductBySlug(slug: string): Promise<Found | null> {
  const target = slug.toLowerCase();

  // 1) BOROSIL (grouped -> variants)
  if (Array.isArray(borosilProducts)) {
    for (const g of borosilProducts as any[]) {
      const variants = Array.isArray(g.variants) ? g.variants : [];
      for (const v of variants) {
        if (candidateSlug({ ...v, brand: "Borosil" }, g) === target || looksLikeCodeMatch(target, v)) {
          return { product: { ...v, brand: "Borosil" }, group: g, brand: "Borosil" };
        }
      }
    }
  }

  // helper: scan flat arrays
  const scanFlat = (arrRaw: any, assumedBrand?: string) => {
    const arr = asArray(arrRaw);
    for (const p of arr) {
      const slugCand = candidateSlug(assumedBrand ? { ...p, brand: assumedBrand } : p);
      if (slugCand === target || looksLikeCodeMatch(target, p)) {
        return { product: assumedBrand ? { ...p, brand: assumedBrand } : p, group: undefined, brand: assumedBrand };
      }
    }
    return null;
  };

  // 2) QUALIGENS (data or array)
  {
    const raw: any = (qualigensProductsRaw as any).default || qualigensProductsRaw;
    const hit = scanFlat(raw, "Qualigens");
    if (hit) return hit;
  }

  // 3) RANKEM (grouped objects with variants)
  if (Array.isArray(rankemProducts as any[])) {
    for (const grp of rankemProducts as any[]) {
      const variants = Array.isArray(grp?.variants) ? grp.variants : [];
      for (const v of variants) {
        if (candidateSlug({ ...v, brand: "Rankem" }) === target || looksLikeCodeMatch(target, v)) {
          return { product: { ...v, brand: "Rankem" }, group: grp, brand: "Rankem" };
        }
      }
    }
  }

  // 4) HIMEDIA (grouped nested structure)
  {
    const flat: any[] = [];
    const data: any[] = Array.isArray(himediaProductsRaw) ? himediaProductsRaw : [];
    for (const section of data) {
      for (const header of section.header_sections || []) {
        for (const sub of header.sub_sections || []) {
          for (const item of sub.products || []) {
            flat.push(item);
          }
        }
      }
    }
    for (const p of flat) {
      if (candidateSlug({ ...p, brand: "HiMedia" }) === target || looksLikeCodeMatch(target, p)) {
        return { product: { ...p, brand: "HiMedia" }, group: undefined, brand: "HiMedia" };
      }
    }
  }

  // 5) OMSONS
  {
    const raw = (omsonsDataRaw as any);
    const sections: any[] = Array.isArray(raw?.catalog) ? raw.catalog : [];
    for (const sec of sections) {
      const variants = Array.isArray(sec?.variants) ? sec.variants : [];
      for (const p of variants) {
        if (candidateSlug({ ...p, brand: "Omsons" }, sec) === target || looksLikeCodeMatch(target, p)) {
          return { product: { ...p, brand: "Omsons" }, group: sec, brand: "Omsons" };
        }
      }
    }
  }

  // 6) AVARICE (products[].variants[])
  {
    const raw = (avariceProductsRaw as any).default || avariceProductsRaw;
    const products: any[] = asArray(raw);
    for (const prod of products) {
      for (const v of prod.variants || []) {
        const p = { ...v, product_name: prod.product_name, product_code: prod.product_code, cas_no: prod.cas_no };
        if (candidateSlug({ ...p, brand: "Avarice" }) === target || looksLikeCodeMatch(target, p)) {
          return { product: { ...p, brand: "Avarice" }, group: prod, brand: "Avarice" };
        }
      }
    }
  }

  // 7) WHATMAN (group object with specs_headers + variants)
  {
    const grp: any = whatmanProducts as any;
    const variants = Array.isArray(grp?.variants) ? grp.variants : [];
    for (const p of variants) {
      if (candidateSlug({ ...p, brand: "Whatman" }, grp) === target || looksLikeCodeMatch(target, p)) {
        return { product: { ...p, brand: "Whatman" }, group: grp, brand: "Whatman" };
      }
    }
  }

  return null;
}

// ====== Metadata ======
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const found = await findProductBySlug(params.slug);
  if (!found) {
    return {
      title: "Product Not Found | Chemical Corporation",
      description: "The requested product could not be found.",
      robots: { index: false, follow: false },
    };
  }
  const canonical = `/product/${params.slug}`;
  const seo = getProductSEO(found.product, found.group, canonical);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical },
    openGraph: { title: seo.title, description: seo.description, type: "product", url: canonical },
  };
}

// ====== Page ======
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const found = await findProductBySlug(params.slug);
  if (!found) return notFound();

  const { product, group } = found;
  const canonical = `/product/${params.slug}`;
  const seo = getProductSEO(product, group, canonical);

  const brand = brandFrom(product, found.group);
  const name = nameFrom(product, group);
  const pack = packFrom(product);
  const code = codeFrom(product);
  const hsn = first((product as any).hsn, (product as any).hsnCode, (product as any)["HSN Code"]);
  const cas = first((product as any).cas, (product as any).casNo, (product as any)["CAS No"]);
  const price = priceFrom((product as any).price ?? (product as any).Price);
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

      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }}
      />
    </div>
  );
}
