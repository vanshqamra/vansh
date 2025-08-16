// app/product/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// export const revalidate = 0; // optional: always fresh

import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductSEO } from "@/lib/seo";
import { getBySlug } from "@/lib/product-index";

/* ----------------- small utils ----------------- */
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const tokens = (s: string) =>
  s.split(/[^a-z0-9]+/i).map(t => t.toLowerCase()).filter(t => t.length >= 2);

function priceFromAny(p: any): number | undefined {
  const raw = p?.price ?? p?.Price ?? p?.rate ?? p?.price_inr;
  if (raw == null) return undefined;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
  const txt = String(raw).trim().toUpperCase();
  if (txt === "POR" || txt === "P.O.R" || txt === "P O R") return undefined;
  const num = parseFloat(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : undefined;
}

/** Never throw; capture error message for on-page debug */
function safe<T>(label: string, fn: () => T): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: fn() };
  } catch (e: any) {
    return { ok: false, error: `${label}: ${e?.message || String(e)}` };
  }
}
async function safeAsync<T>(label: string, fn: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  try {
    return { ok: true, value: await fn() };
  } catch (e: any) {
    return { ok: false, error: `${label}: ${e?.message || String(e)}` };
  }
}

/* ----------------- tolerant field readers ----------------- */
const first = (...vals: any[]) => {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return "";
};
function nameFrom(p: any, g?: any) {
  return first(p.productName, p.name, p.title, p["Product Name"], p.description, g?.title, g?.product, p.product);
}
function packFrom(p: any) {
  return first(p.packSize, p.size, p.capacity, p.volume, p.diameter, p.dimensions, p.grade, p.Pack, p["Pack Size"], p.packing, p["Pack"], p["Qty/Pack"], p["Quantity/Pack"]);
}
function brandFrom(p: any, g?: any) {
  return first(p.brand, g?.brand, p.vendor, p.mfg, /borosil/i.test(JSON.stringify(p || {})) ? "Borosil" : "");
}
function codeFrom(p: any) {
  const direct = first(
    p.code, p.product_code, p.productCode, p["Product Code"],
    p.catalog_no, p.catalogNo, p.catalogue_no, p.catalogueNo, p["Catalog No"], p["Catalogue No"], p["Catalogue No."],
    p.cat_no, p.catno, p["Cat No"], p["Cat No."], p["CAT NO"], p["CAT. NO."],
    p.order_code, p.orderCode, p.sku, p.item_code, p.itemCode, p.code_no, p["Code"]
  );
  if (direct) return direct;

  const nameLike = nameFrom(p);
  if (nameLike) {
    const bad = /^(mm|ml|l|pk|pcs?|um|µm|gm|kg|g|x|mmf)$/i;
    const toks = String(nameLike).split(/[\s,/()_\-]+/).filter(Boolean);
    const cands = toks.filter(t => {
      const T = t.toLowerCase();
      if (bad.test(T)) return false;
      if (!/^[a-z0-9-]+$/i.test(t)) return false;
      if (!/\d/.test(t)) return false;
      if (/(mm|ml|l|µm|um)$/i.test(T)) return false;
      return t.length >= 3 && t.length <= 12;
    });
    const alnum = cands.filter(t => /[a-z]/i.test(t) && /\d/.test(t)).sort((a,b)=>a.length-b.length);
    if (alnum[0]) return alnum[0];
    const numeric = cands.filter(t => /^\d{3,8}$/.test(t)).sort((a,b)=>a.length-b.length);
    if (numeric[0]) return numeric[0];
  }
  return "";
}

/* ----------------- fuzzy fallback (guarded) ----------------- */
async function fuzzyFind(slug: string) {
  const target = slugify(slug);
  const want = tokens(target);
  if (want.length === 0) return null;

  type Rec = { brand: string; name: string; pack: string; code: string; raw: any; group?: any };
  const pile: Rec[] = [];

  // Prefer shared iterator if repo has it
  const iter = await safeAsync("import catalog/sources", async () => await import("@/lib/catalog/sources"));
  if (iter.ok && typeof (iter.value as any).iterAllProducts === "function") {
    // @ts-ignore generator
    for (const p of (iter.value as any).iterAllProducts()) {
      pile.push({ brand: p.brand, name: p.name, pack: p.pack, code: p.code, raw: p.raw, group: p.group });
    }
  } else {
    // Fallback: guarded direct imports per brand. Each one is wrapped so a missing file never throws the page.
    const tryLoad = async <T>(label: string, loader: () => Promise<T>, onData: (data: any) => void) => {
      const res = await safeAsync(label, loader);
      if (res.ok) onData(res.value);
    };

    await tryLoad("whatman", async () => (await import("@/lib/whatman_products.json")) as any, (mod) => {
      const data = (mod as any).default ?? mod;
      const variants = Array.isArray(data?.variants) ? data.variants : Array.isArray(data) ? data : [];
      for (const v of variants) pile.push({ brand: brandFrom(v, data), name: nameFrom(v, data), pack: packFrom(v), code: codeFrom(v), raw: v, group: data });
    });

    await tryLoad("borosil", async () => (await import("@/lib/borosil_products_absolute_final.json")) as any, (mod) => {
      const arr = (mod as any).default ?? mod;
      for (const g of (Array.isArray(arr) ? arr : [])) {
        for (const v of g.variants || []) pile.push({ brand: brandFrom(v, g), name: nameFrom(v, g), pack: packFrom(v), code: codeFrom(v), raw: v, group: g });
      }
    });

    await tryLoad("qualigens", async () => (await import("@/lib/qualigens-products.json")) as any, (mod) => {
      const raw = (mod as any).default ?? mod;
      const arr = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      for (const p of arr) pile.push({ brand: brandFrom(p), name: nameFrom(p), pack: packFrom(p), code: codeFrom(p), raw: p });
    });

    await tryLoad("rankem", async () => (await import("@/lib/rankem_products.json")) as any, (mod) => {
      const arr = (mod as any).default ?? mod;
      for (const g of (Array.isArray(arr) ? arr : [])) {
        for (const v of g.variants || []) pile.push({ brand: brandFrom(v, g), name: nameFrom(v, g), pack: packFrom(v), code: codeFrom(v), raw: v, group: g });
      }
    });

    await tryLoad("omsons", async () => (await import("@/lib/omsons_products.json")) as any, (mod) => {
      const raw = (mod as any).default ?? mod;
      const arr = Array.isArray(raw?.catalog) ? raw.catalog : [];
      for (const sec of arr) for (const v of sec.variants || []) pile.push({ brand: brandFrom(v, sec), name: nameFrom(v, sec), pack: packFrom(v), code: codeFrom(v), raw: v, group: sec });
    });

    await tryLoad("avarice", async () => (await import("@/lib/avarice_products.json")) as any, (mod) => {
      const raw = (mod as any).default ?? mod;
      const parents = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      for (const parent of parents) for (const v of parent.variants || []) {
        const merged = { ...v, product_name: parent.product_name, product_code: parent.product_code, cas_no: parent.cas_no };
        pile.push({ brand: brandFrom(merged, parent), name: nameFrom(merged, parent), pack: packFrom(merged), code: codeFrom(merged), raw: merged, group: parent });
      }
    });

    await tryLoad("himedia", async () => (await import("@/lib/himedia_products_grouped")) as any, (mod) => {
      const arr = (mod as any).default ?? mod;
      for (const section of (Array.isArray(arr) ? arr : [])) {
        for (const header of section.header_sections || []) {
          for (const sub of header.sub_sections || []) {
            for (const item of sub.products || []) pile.push({ brand: brandFrom(item), name: nameFrom(item), pack: packFrom(item), code: codeFrom(item), raw: item });
          }
        }
      }
    });
  }

  let best: { rec: Rec; score: number } | null = null;
  for (const rec of pile) {
    const hay = [
      rec.brand, rec.name, rec.pack, rec.code,
      JSON.stringify(rec.raw || {}).slice(0, 2000),
      rec.group ? JSON.stringify(rec.group || {}).slice(0, 1000) : ""
    ].join(" ").toLowerCase();

    let score = 0;
    for (const t of want) if (hay.includes(t)) score++;
    if (rec.brand && want.includes(rec.brand.toLowerCase())) score += 2;

    if (!best || score > best.score) best = { rec, score };
  }
  if (!best || best.score < 2) return null;
  return best.rec;
}

/* ----------------- generic renderer (never throws) ----------------- */
function RenderValue({ value }: { value: any }) {
  const type = Object.prototype.toString.call(value);
  if (value == null) return <span className="text-slate-400">—</span>;
  if (type === "[object Object]") {
    const entries = Object.entries(value as Record<string, any>);
    if (!entries.length) return <span className="text-slate-400">{`{}`}</span>;
    return (
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-xs">
          <tbody>
            {entries.map(([k, v], i) => (
              <tr key={i} className="border-b last:border-none">
                <td className="px-2 py-1 font-medium whitespace-nowrap align-top bg-slate-50">{String(k)}</td>
                <td className="px-2 py-1 align-top"><RenderValue value={v} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-slate-400">[]</span>;
    return (
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="border rounded p-2"><RenderValue value={item} /></div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
}

/* ----------------- metadata (guarded) ----------------- */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Don’t throw from metadata
  let rec = getBySlug(params.slug) as any;
  if (!rec) {
    const r = await safeAsync("fuzzyFind(metadata)", () => fuzzyFind(params.slug));
    if (r.ok) rec = r.value;
  }
  if (!rec) {
    return { title: "Product Not Found | Chemical Corporation", description: "The requested product could not be found.", robots: { index: false, follow: false } };
  }
  const canonical = `/product/${slugify(params.slug)}`;
  const seoRes = safe("getProductSEO(metadata)", () => getProductSEO(rec.raw ?? rec, rec.group, canonical));
  const seo = seoRes.ok ? seoRes.value : { title: `${rec.brand || ""} ${rec.name || "Product"}`.trim(), description: "Buy online. Discount auto-applies in cart.", jsonLd: {} };
  return { title: (seo as any).title, description: (seo as any).description, alternates: { canonical }, openGraph: { title: (seo as any).title, description: (seo as any).description, type: "product", url: canonical } };
}

/* ----------------- page ----------------- */
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const debug: string[] = [];

  // 1) Index lookup (never throw)
  const idxRes = safe("getBySlug", () => getBySlug(params.slug));
  let rec: any = idxRes.ok ? idxRes.value : null;
  if (!idxRes.ok) debug.push(idxRes.error || "getBySlug failed");

  // 2) Fallback fuzzy
  if (!rec) {
    const fuzz = await safeAsync("fuzzyFind(page)", () => fuzzyFind(params.slug));
    if (fuzz.ok) rec = fuzz.value;
    else debug.push(fuzz.error || "fuzzyFind failed");
  }

  if (!rec) return notFound();

  // 3) SEO (guarded)
  const canonical = `/product/${slugify(params.slug)}`;
  const seoRes = safe("getProductSEO(page)", () => getProductSEO(rec.raw ?? rec, rec.group, canonical));
  if (!seoRes.ok) debug.push(seoRes.error);
  const seo = seoRes.ok ? seoRes.value : { title: `${rec.brand || ""} ${rec.name || "Product"}`.trim(), description: "Buy online. Discount auto-applies in cart.", jsonLd: {} };

  // 4) Price (guarded)
  const priceNum = priceFromAny(rec) ?? priceFromAny(rec.raw ?? rec);
  const priceTxt = priceNum !== undefined ? `₹${priceNum.toLocaleString("en-IN")}` : "POR";

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <Badge className="mb-3 bg-blue-100 text-blue-900 border-blue-200">PRODUCT</Badge>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{(seo as any).h1 || (seo as any).title || "Product Details"}</h1>
        <p className="text-slate-600 mt-2">Discounts auto-apply in cart • Fast delivery across India</p>
      </div>

      {/* Summary */}
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

      {/* Raw data */}
      <Card className="bg-white mt-8">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">All Fields (Raw)</h2>
            <RenderValue value={rec.raw ?? rec} />
          </div>
          {rec.group ? (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-slate-700">Group / Context</h3>
              <RenderValue value={rec.group} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Debug (shows exactly what's failing) */}
      {debug.length > 0 ? (
        <Card className="bg-white mt-8 border-red-300">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-red-700 mb-2">Debug</h3>
            <ul className="list-disc pl-5 text-sm text-red-800 space-y-1">
              {debug.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* JSON-LD (guarded) */}
      <script
        type="application/ld+json"
        // If seo.jsonLd is weird, stringify safely; never throw.
        dangerouslySetInnerHTML={{
          __html: safe("stringify jsonLd", () => JSON.stringify((seo as any).jsonLd ?? {})).ok
            ? JSON.stringify((seo as any).jsonLd ?? {})
            : "{}",
        }}
      />
    </div>
  );
}
