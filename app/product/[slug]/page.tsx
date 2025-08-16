// app/product/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductSEO } from "@/lib/seo";

// Static imports of catalogs
import borosilProducts from "@/lib/borosil_products_absolute_final.json";
import qualigensProductsRaw from "@/lib/qualigens-products.json";
import rankemProducts from "@/lib/rankem_products.json";
import omsonsDataRaw from "@/lib/omsons_products.json";
import avariceProductsRaw from "@/lib/avarice_products.json";
import himediaProductsRaw from "@/lib/himedia_products_grouped";
import whatmanProducts from "@/lib/whatman_products.json";

// --- utils ---
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => clean(vals.find((x) => clean(x)) || "");
const slugPart = (s: any) =>
  typeof s === "string" && s.trim()
    ? s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : "";
const makeSlug = (...parts: any[]) => parts.map(slugPart).filter(Boolean).join("-");

function packFrom(p: any) {
  return first(
    p.packSize, p.size, p.capacity, p.volume, p.diameter, p.dimensions, p.grade,
    p.Pack, p["Pack Size"], p.packing, p["Pack"], p["Qty/Pack"], p["Quantity/Pack"]
  );
}
function codeFrom(p: any) {
  const direct = first(
    p.code, p.product_code, p.productCode,
    p.catalog_no, p.catalogNo,
    p.cat_no, p.catno, p["Cat No"], p["Cat No."], p["CAT NO"], p["CAT. NO."],
    p.catalogue_no, p.catalogueNo, p["Catalogue No"], p["Catalogue No."], p["Catalog No"],
    p["Product Code"], p.productcode,
    p.order_code, p.orderCode,
    p.sku, p.item_code, p.itemCode, p.code_no, p["Code"]
  );
  if (direct) return direct;

  // fallback: extract a code-like token from name/title
  const nameLike = first(p.name, p.title, p.productName, p["Product Name"], p.description);
  if (nameLike) {
    const bad = /^(mm|ml|l|pk|pcs?|um|µm|gm|kg|g|x|mmf)$/i;
    const tokens = String(nameLike).split(/[\s,/()_-]+/).filter(Boolean);
    const candidates = tokens.filter(t => {
      const T = t.toLowerCase();
      if (bad.test(T)) return false;
      if (!/^[a-z0-9-]+$/i.test(t)) return false;
      if (!/\d/.test(t)) return false;
      if (/(mm|ml|l|µm|um)$/i.test(T)) return false;
      return t.length >= 3 && t.length <= 12;
    });
    const alnum = candidates.filter(t => /[a-z]/i.test(t) && /\d/.test(t)).sort((a,b)=>a.length-b.length);
    if (alnum[0]) return alnum[0];
    const numeric = candidates.filter(t => /^\d{3,8}$/.test(t)).sort((a,b)=>a.length-b.length);
    if (numeric[0]) return numeric[0];
  }
  return "";
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

// old single candidate kept for compatibility
const candidateSlugLegacy = (p: any, g?: any) => {
  const brand = brandFrom(p, g);
  const name  = nameFrom(p, g);
  const pack  = packFrom(p);
  const code  = codeFrom(p);
  const base = [brand, name, pack, code].filter(Boolean);
  return makeSlug(...base);
};

// NEW: allow multiple slug variants (with or without code)
function candidateSlugs(p: any, g?: any): string[] {
  const brand = brandFrom(p, g);
  const name  = nameFrom(p, g);
  const pack  = packFrom(p);
  const code  = codeFrom(p);

  const cands = new Set<string>([
    makeSlug(brand, name, pack, code), // full
    makeSlug(brand, name, pack),       // no code
    makeSlug(brand, name, code),
    makeSlug(brand, name),
    makeSlug(name, pack),
    makeSlug(name, pack, code),
    makeSlug(brand, code),
    makeSlug(code),
    candidateSlugLegacy(p, g),
  ]);
  return Array.from(cands).filter(Boolean);
}

function looksLikeCodeMatch(target: string, p: any) {
  const c = codeFrom(p);
  return c && makeSlug(String(c)) === target;
}
function slugContainsCode(target: string, p: any) {
  const c = codeFrom(p);
  if (!c) return false;
  return target.includes(makeSlug(String(c)));
}

type Found = { product: any; group?: any; brand?: string };
const asArray = (x: any) =>
  Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : [];

// finder
async function findProductBySlug(slug: string): Promise<Found | null> {
  const target = slug.toLowerCase();
  console.log("[product-detail] resolving slug:", slug);

  // Borosil (grouped -> variants)
  if (Array.isArray(borosilProducts)) {
    for (const g of borosilProducts as any[]) {
      const variants = Array.isArray(g.variants) ? g.variants : [];
      for (const v of variants) {
        const prod = { ...v, brand: "Borosil" };
        const cands = candidateSlugs(prod, g);
        if (cands.includes(target) || looksLikeCodeMatch(target, prod) || slugContainsCode(target, prod)) {
        console.log("[product-detail] MATCH", { brand: "Borosil", via: "candidateSlugs|code|contains" });
          return { product: { ...prod, productName: nameFrom(prod, g) }, group: g, brand: "Borosil" };
        }
      }
    }
  }

  // Qualigens (flat)
  {
    const arr = asArray((qualigensProductsRaw as any).default ?? qualigensProductsRaw);
    for (const p of arr) {
      const prod = { ...p, brand: "Qualigens" };
      const cands = candidateSlugs(prod);
      if (cands.includes(target) || looksLikeCodeMatch(target, prod) || slugContainsCode(target, prod)) {
        console.log("[product-detail] MATCH", { brand: "Qualigens", via: "candidateSlugs|code|contains" });
        return { product: prod, brand: "Qualigens" };
      }
    }
  }

  // Rankem (grouped -> variants)
  {
    const groups: any[] = Array.isArray(rankemProducts) ? (rankemProducts as any[]) : [];
    for (const grp of groups) {
      const variants = Array.isArray(grp?.variants) ? grp.variants : [];
      for (const v of variants) {
        const prod = { ...v, brand: "Rankem" };
        const cands = candidateSlugs(prod, grp);
        if (cands.includes(target) || looksLikeCodeMatch(target, prod) || slugContainsCode(target, prod)) {
        console.log("[product-detail] MATCH", { brand: "Rankem", via: "candidateSlugs|code|contains" });
          return { product: prod, group: grp, brand: "Rankem" };
        }
      }
    }
  }

  // HiMedia (nested)
  {
    const root: any[] = Array.isArray(himediaProductsRaw) ? (himediaProductsRaw as any[]) : [];
    const flat: any[] = [];
    for (const section of root) {
      for (const header of section.header_sections || []) {
        for (const sub of header.sub_sections || []) {
          for (const item of sub.products || []) flat.push(item);
        }
      }
    }
    for (const p of flat) {
      const prod = { ...p, brand: "HiMedia" };
      const cands = candidateSlugs(prod);
      if (cands.includes(target) || looksLikeCodeMatch(target, prod) || slugContainsCode(target, prod)) {
        console.log("[product-detail] MATCH", { brand: "HiMedia", via: "candidateSlugs|code|contains" });
        return { product: prod, brand: "HiMedia" };
      }
    }
  }

  // Omsons (sections[].variants[])
  {
    const sections: any[] = Array.isArray((omsonsDataRaw as any)?.catalog) ? (omsonsDataRaw as any).catalog : [];
    for (const sec of sections) {
      const variants = Array.isArray(sec?.variants) ? sec.variants : [];
      for (const v of variants) {
        const prod = { ...v, brand: "Omsons" };
        const cands = candidateSlugs(prod, sec);
        if (cands.includes(target) || looksLikeCodeMatch(target, prod) || slugContainsCode(target, prod)) {
        console.log("[product-detail] MATCH", { brand: "Omsons", via: "candidateSlugs|code|contains" });
        return { product: prod, group: sec, brand: "Omsons" };
        }
      }
    }
  }

  // Avarice (products[].variants[])
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
        const cands = candidateSlugs(merged, parent);
        if (cands.includes(target) || looksLikeCodeMatch(target, merged) || slugContainsCode(target, merged)) {
        console.log("[product-detail] MATCH", { brand: "Avarice", via: "candidateSlugs|code|contains" });
        return { product: merged, group: parent, brand: "Avarice" };
        }
      }
    }
  }

  // Whatman (group object with variants)
  {
    const grp: any = whatmanProducts as any;
    const variants = Array.isArray(grp?.variants) ? grp.variants : [];
    for (const v of variants) {
      const prod = { ...v, brand: "Whatman" };
      const cands = candidateSlugs(prod, grp);
      if (cands.includes(target) || looksLikeCodeMatch(target, prod) || slugContainsCode(target, prod)) {
        console.log("[product-detail] MATCH", { brand: "Whatman", via: "candidateSlugs|code|contains" });
        return { product: prod, group: grp, brand: "Whatman" };
      }
    }
  }

  console.warn("[product-detail] NOT FOUND", { slug });
  return null;
}

// metadata
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

// page (no images)
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const found = await findProductBySlug(params.slug);
  console.log("[product-detail] render", {
    slug: params.slug,
    brand: found?.brand || found?.product?.brand,
    name: found?.product?.name || found?.product?.productName || found?.product?.title,
    code: found ? codeFrom(found.product) : undefined,
  });
  if (!found) return notFound();

  const { product, group, brand: forcedBrand } = found;
  const canonical = `/product/${params.slug}`;
  const seo = getProductSEO(product, group, canonical);

  const brand = first(product.brand, forcedBrand);
  const name = first(product.productName, product.name, product.title, product["Product Name"]);
  const pack = packFrom(product);
  const code = codeFrom(product);
  const hsn = first(product.hsn, product.hsnCode, product["HSN Code"], product["HSN"]);
  const cas = first(product.cas, product.casNo, product.cas_number, product["CAS No"], product["CAS"]);
  const price = priceFrom((product as any).price ?? (product as any).Price ?? (product as any).rate ?? (product as any).price_inr);

  const jsonLd = JSON.stringify(seo.jsonLd ?? {});

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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </div>
  );
}
