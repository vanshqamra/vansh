// app/product/[slug]/page.tsx
export const dynamic = "force-dynamic"; // ensure SSR, no prebuilt params

import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductSEO } from "@/lib/seo";

// ----- STATIC CATALOG IMPORTS (ensure bundling) -----
import borosilProducts from "@/lib/borosil_products_absolute_final.json";
import qualigensProductsRaw from "@/lib/qualigens-products.json";
import rankemProducts from "@/lib/rankem_products.json";
import omsonsDataRaw from "@/lib/omsons_products.json";
import avariceProductsRaw from "@/lib/avarice_products.json";
import himediaProductsRaw from "@/lib/himedia_products_grouped";
import whatmanProducts from "@/lib/whatman_products.json";

// ---------- small utils ----------
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => clean(vals.find((x) => clean(x)) || "");
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function packFrom(p: any) {
  return first(
    p.packSize, p.size, p.capacity, p.volume, p.diameter, p.dimensions, p.grade,
    p.Pack, p["Pack Size"], p.packing
  );
}
function codeFrom(p: any) {
  return first(
    p.code, p.product_code, p.productCode,
    p.catalog_no, p.catalogNo,
    p.cat_no, p.catno, p["Cat No"], p["Cat No."],
    p.catalogue_no, p.catalogueNo, p["Catalogue No"], p["Catalogue No."],
    p["Product Code"], p.order_code, p.orderCode,
    p.sku, p.item_code, p.itemCode,
    p.code_no, p["Code"]
  );
}
function brandFrom(p: any, g?: any) {
  return first(
    p.brand, g?.brand, p.vendor, p.mfg,
    /borosil/i.test(JSON.stringify(p)) ? "Borosil" : ""
  );
}
function nameFrom(p: any, g?: any) {
  return first(
    p.productName, p.name, p.title, g?.title, g?.product, p.product, p["Product Name"]
  );
}
function priceFrom(p: any) {
  if (p == null) return undefined;
  if (typeof p === "number") return Number.isFinite(p) ? p : undefined;
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
  const base = [brand, name, pack, code].filter(Boolean).join(" ");
  return slugify(base) || (code ? slugify(code) : "");
}
function looksLikeCodeMatch(target: string, p: any) {
  const c = codeFrom(p);
  return c && slugify(String(c)) === target;
}
function slugContainsCode(target: string, p: any) {
  const c = codeFrom(p);
  if (!c) return false;
  const sc = slugify(String(c));
  return target.includes(sc);
}

type Found = { product: any; group?: any; brand?: string };
const asArray = (x: any) =>
  Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : [];

// ===== Scan catalogs and find by slug or by code (even if code is inside slug) =====
async function findProductBySlug(slug: string): Promise<Found | null> {
  const target = slug.toLowerCase();

  // 1) BOROSIL (grouped with variants)
  if (Array.isArray(borosilProducts)) {
    for (const g of borosilProducts as any[]) {
      const variants = Array.isArray(g.variants) ? g.variants : [];
      for (const v of variants) {
        const prod = { ...v, brand: "Borosil" };
        if (
          candidateSlug(prod, g) === target ||
          looksLikeCodeMatch(target, prod) ||
          slugContainsCode(target, prod)
        ) {
          return { product: { ...prod, productName: nameFrom(prod, g) }, group: g, brand: "Borosil" };
        }
      }
    }
  }

  // 2) QUALIGENS (flat)
  {
    const arr = asArray((qualigensProductsRaw as any).default ?? qualigensProductsRaw);
    for (const p of arr) {
      const prod = { ...p, brand: "Qualigens" };
      if (
        candidateSlug(prod) === target ||
        looksLikeCodeMatch(target, prod) ||
        slugContainsCode(target, prod)
      ) {
        return { product: prod, brand: "Qualigens" };
      }
    }
  }

  // 3) RANKEM (grouped -> variants)
  {
    const groups: any[] = Array.isArray(rankemProducts) ? (rankemProducts as any[]) : [];
    for (const grp of groups) {
      const variants = Array.isArray(grp?.variants) ? grp.variants : [];
      for (const v of variants) {
        const prod = { ...v, brand: "Rankem" };
        if (
          candidateSlug(prod, grp) === target ||
          looksLikeCodeMatch(target, prod) ||
          slugContainsCode(target, prod)
        ) {
          return { product: prod, group: grp, brand: "Rankem" };
        }
      }
    }
  }

  // 4) HIMEDIA (nested → header_sections → sub_sections → products)
  {
    const root: any[] = Array.isArray(himediaProductsRaw) ? (himediaProductsRaw as any[]) : [];
    const flat: any[] = [];
    for (const section of root) {
      for (const header of section.header_sections || []) {
        for (const sub of header.sub_sections || []) {
          for (const item of sub.products || []) {
            flat.push(item);
          }
        }
      }
    }
    for (const p of flat) {
      const prod = { ...p, brand: "HiMedia" };
      if (
        candidateSlug(prod) === target ||
        looksLikeCodeMatch(target, prod) ||
        slugContainsCode(target, prod)
      ) {
        return { product: prod, brand: "HiMedia" };
      }
    }
  }

  // 5) OMSONS (catalog.sections[].variants[])
  {
    const sections: any[] = Array.isArray((omsonsDataRaw as any)?.catalog) ? (omsonsDataRaw as any).catalog : [];
    for (const sec of sections) {
      const variants = Array.isArray(sec?.variants) ? sec.variants : [];
      for (const v of variants) {
        const prod = { ...v, brand: "Omsons" };
        if (
          candidateSlug(prod, sec) === target ||
          looksLikeCodeMatch(target, prod) ||
          slugContainsCode(target, prod)
        ) {
          return { product: prod, group: sec, brand: "Omsons" };
        }
      }
    }
  }

  // 6) AVARICE (products[].variants[])
  {
    const products: any[] = asArray((avariceProductsRaw as any).default ?? avariceProductsRaw);
    for (const parent of products) {
      for (const v of parent.variants || []) {
        const merged = {
          ...v,
          product_name: parent.product_name,
          product_code: parent.product_code,
          cas_no: parent.cas_no,
          brand: "Avarice",
        };
        if (
          candidateSlug(merged) === target ||
          looksLikeCodeMatch(target, merged) ||
          slugContainsCode(target, merged)
        ) {
          return { product: merged, group: parent, brand: "Avarice" };
        }
      }
    }
  }

  // 7) WHATMAN (group with specs_headers + variants)
  {
    const grp: any = whatmanProducts as any;
    const variants = Array.isArray(grp?.variants) ? grp.variants : [];
    for (const v of variants) {
      const prod = { ...v, brand: "Whatman" };
      if (
        candidateSlug(prod, grp) === target ||
        looksLikeCodeMatch(target, prod) ||
        slugContainsCode(target, prod)
      ) {
        return { product: prod, group: grp, brand: "Whatman" };
      }
    }
  }

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
  const name = first(product.productName, product.name, product.title, product["Product Name"]);
  const pack = packFrom(product);
  const code = codeFrom(product);
  const hsn = first(product.hsn, product.hsnCode, product["HSN Code"], product["HSN"]);
  const cas = first(product.cas, product.casNo, product.cas_number, product["CAS No"], product["CAS"]);
  const price = priceFrom(
    (product as any).price ?? (product as any).Price ?? (product as any).rate ?? (product as any).price_inr
  );
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
