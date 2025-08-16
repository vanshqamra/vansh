export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductSEO } from "@/lib/seo";
import { getBySlug } from "@/lib/product-index";

const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => clean(vals.find((x) => clean(x)) || "");
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const slugPart = (s: any) => (typeof s === "string" && s.trim() ? slugify(s) : "");
const makeSlug = (...parts: any[]) =>
  parts.map(slugPart).filter(Boolean).join("-");

function tokens(s: string) {
  return s
    .split(/[^a-z0-9]+/i)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length >= 2);
}

function nameFrom(p: any, g?: any) {
  return first(
    p.productName,
    p.name,
    p.title,
    p["Product Name"],
    p.description,
    g?.title,
    g?.product,
    p.product
  );
}
function packFrom(p: any) {
  return first(
    p.packSize,
    p.size,
    p.capacity,
    p.volume,
    p.diameter,
    p.dimensions,
    p.grade,
    p.Pack,
    p["Pack Size"],
    p.packing,
    p["Pack"],
    p["Qty/Pack"],
    p["Quantity/Pack"]
  );
}
function brandFrom(p: any, g?: any) {
  return first(
    p.brand,
    g?.brand,
    p.vendor,
    p.mfg,
    /borosil/i.test(JSON.stringify(p || {})) ? "Borosil" : ""
  );
}
function codeFrom(p: any) {
  const direct = first(
    p.code,
    p.product_code,
    p.productCode,
    p["Product Code"],
    p.catalog_no,
    p.catalogNo,
    p.catalogue_no,
    p.catalogueNo,
    p["Catalog No"],
    p["Catalogue No"],
    p["Catalogue No."],
    p.cat_no,
    p.catno,
    p["Cat No"],
    p["Cat No."],
    p["CAT NO"],
    p["CAT. NO."],
    p.order_code,
    p.orderCode,
    p.sku,
    p.item_code,
    p.itemCode,
    p.code_no,
    p["Code"]
  );
  if (direct) return direct;

  const nameLike = nameFrom(p);
  if (nameLike) {
    const bad = /^(mm|ml|l|pk|pcs?|um|µm|gm|kg|g|x|mmf)$/i;
    const tokens = String(nameLike)
      .split(/[\s,/()_\-]+/)
      .filter(Boolean);
    const cands = tokens.filter((t) => {
      const T = t.toLowerCase();
      if (bad.test(T)) return false;
      if (!/^[a-z0-9-]+$/i.test(t)) return false;
      if (!/\d/.test(t)) return false;
      if (/(mm|ml|l|µm|um)$/i.test(T)) return false;
      return t.length >= 3 && t.length <= 12;
    });
    const alnum = cands
      .filter((t) => /[a-z]/i.test(t) && /\d/.test(t))
      .sort((a, b) => a.length - b.length);
    if (alnum[0]) return alnum[0];
    const numeric = cands
      .filter((t) => /^\d{3,8}$/.test(t))
      .sort((a, b) => a.length - b.length);
    if (numeric[0]) return numeric[0];
  }
  return "";
}

function priceFromAny(p: any): number | undefined {
  const raw = p?.price ?? p?.Price ?? p?.rate ?? p?.price_inr;
  if (raw == null) return undefined;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
  const txt = String(raw).trim().toUpperCase();
  if (txt === "POR" || txt === "P.O.R" || txt === "P O R") return undefined;
  const num = parseFloat(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : undefined;
}

async function fuzzyFind(slug: string) {
  const target = slugify(slug);
  const want = tokens(target);
  if (want.length === 0) return null;

  const pile: Array<{
    brand: string;
    name: string;
    pack: string;
    code: string;
    raw: any;
    group?: any;
  }> = [];

  try {
    const mod = await import("@/lib/catalog/sources");
    for (const p of mod.iterAllProducts()) {
      pile.push({
        brand: p.brand,
        name: p.name,
        pack: p.pack,
        code: p.code,
        raw: p.raw,
        group: p.group,
      });
    }
  } catch {}

  if (pile.length === 0) {
    try {
      const mod: any = await import("@/lib/whatman_products.json");
      const data = (mod.default ?? mod) as any;
      const variants = Array.isArray(data?.variants)
        ? data.variants
        : Array.isArray(data)
        ? data
        : [];
      for (const v of variants) {
        pile.push({
          brand: brandFrom(v, data),
          name: nameFrom(v, data),
          pack: packFrom(v),
          code: codeFrom(v),
          raw: v,
          group: data,
        });
      }
    } catch {}
    try {
      const mod: any = await import("@/lib/borosil_products_absolute_final.json");
      const arr = (mod.default ?? mod) as any[];
      for (const g of Array.isArray(arr) ? arr : []) {
        for (const v of g.variants || []) {
          pile.push({
            brand: brandFrom(v, g),
            name: nameFrom(v, g),
            pack: packFrom(v),
            code: codeFrom(v),
            raw: v,
            group: g,
          });
        }
      }
    } catch {}
    try {
      const mod: any = await import("@/lib/qualigens-products.json");
      const arr = Array.isArray(mod.default) ? mod.default : Array.isArray(mod) ? mod : [];
      for (const p of arr) {
        pile.push({
          brand: brandFrom(p),
          name: nameFrom(p),
          pack: packFrom(p),
          code: codeFrom(p),
          raw: p,
        });
      }
    } catch {}
    try {
      const mod: any = await import("@/lib/rankem_products.json");
      const arr = Array.isArray(mod.default) ? mod.default : Array.isArray(mod) ? mod : [];
      for (const g of arr) {
        for (const v of g.variants || []) {
          pile.push({
            brand: brandFrom(v, g),
            name: nameFrom(v, g),
            pack: packFrom(v),
            code: codeFrom(v),
            raw: v,
            group: g,
          });
        }
      }
    } catch {}
    try {
      const mod: any = await import("@/lib/omsons_products.json");
      const arr = Array.isArray(mod.default?.catalog)
        ? mod.default.catalog
        : Array.isArray(mod.catalog)
        ? mod.catalog
        : [];
      for (const sec of arr) {
        for (const v of sec.variants || []) {
          pile.push({
            brand: brandFrom(v, sec),
            name: nameFrom(v, sec),
            pack: packFrom(v),
            code: codeFrom(v),
            raw: v,
            group: sec,
          });
        }
      }
    } catch {}
    try {
      const mod: any = await import("@/lib/avarice_products.json");
      const arr = Array.isArray(mod.default) ? mod.default : Array.isArray(mod) ? mod : [];
      for (const parent of arr) {
        for (const v of parent.variants || []) {
          const merged = {
            ...v,
            product_name: parent.product_name,
            product_code: parent.product_code,
            cas_no: parent.cas_no,
          };
          pile.push({
            brand: brandFrom(merged, parent),
            name: nameFrom(merged, parent),
            pack: packFrom(merged),
            code: codeFrom(merged),
            raw: merged,
            group: parent,
          });
        }
      }
    } catch {}
    try {
      const mod: any = await import("@/lib/himedia_products_grouped");
      const arr = Array.isArray(mod.default) ? mod.default : Array.isArray(mod) ? mod : [];
      for (const section of arr) {
        for (const header of section.header_sections || []) {
          for (const sub of header.sub_sections || []) {
            for (const item of sub.products || []) {
              pile.push({
                brand: brandFrom(item),
                name: nameFrom(item),
                pack: packFrom(item),
                code: codeFrom(item),
                raw: item,
              });
            }
          }
        }
      }
    } catch {}
  }

  let best: any = null;
  for (const rec of pile) {
    const hay = [
      rec.brand,
      rec.name,
      rec.pack,
      rec.code,
      JSON.stringify(rec.raw || {}).slice(0, 2000),
      rec.group ? JSON.stringify(rec.group || {}).slice(0, 1000) : "",
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const t of want) if (hay.includes(t)) score++;
    if (rec.brand && want.includes(rec.brand.toLowerCase())) score += 2;

    if (!best || score > best.score) best = { rec, score };
  }
  if (!best || best.score < 2) return null;
  return best.rec;
}

function RenderValue({ value }: { value: any }) {
  const type = Object.prototype.toString.call(value);

  if (value == null)
    return <span className="text-slate-400">—</span>;

  if (type === "[object Object]") {
    const entries = Object.entries(value as Record<string, any>);
    if (entries.length === 0)
      return <span className="text-slate-400">{"{}"}</span>;
    return (
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-xs">
          <tbody>
            {entries.map(([k, val], i) => (
              <tr key={i} className="border-b last:border-none">
                <td className="px-2 py-1 font-medium whitespace-nowrap align-top bg-slate-50">{String(k)}</td>
                <td className="px-2 py-1 align-top">
                  <RenderValue value={val} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="text-slate-400">[]</span>;
    return (
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="border rounded p-2">
            <RenderValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  let rec = getBySlug(params.slug);
  if (!rec) {
    rec = await fuzzyFind(params.slug);
  }
  if (!rec) {
    return {
      title: "Product Not Found | Chemical Corporation",
      description: "The requested product could not be found.",
      robots: { index: false, follow: false },
    };
  }
  const canonical = `/product/${slugify(params.slug)}`;
  const seo = getProductSEO(rec.raw, rec.group, canonical);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical },
    openGraph: { title: seo.title, description: seo.description, type: "product", url: canonical },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let rec = getBySlug(params.slug);
  if (!rec) {
    rec = await fuzzyFind(params.slug);
  }
  if (!rec) return notFound();

  const canonical = `/product/${slugify(params.slug)}`;
  const seo = getProductSEO(rec.raw, rec.group, canonical);

  const priceNum = priceFromAny(rec);
  const priceTxt =
    priceNum !== undefined
      ? `₹${priceNum.toLocaleString("en-IN")}`
      : "POR";

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

      <Card className="bg-white mt-8">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">All Fields (Raw)</h2>
            <RenderValue value={rec.raw ?? rec} />
          </div>
          {rec.group ? (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-700">Group/Context</h3>
              <RenderValue value={rec.group} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd ?? {}) }} />
    </div>
  );
}
