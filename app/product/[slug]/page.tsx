// app/product/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/* ---------------- tiny utils ---------------- */
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => clean(vals.find((x) => clean(x)) || "");
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

/* ---------------- tolerant readers ---------------- */
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

/* ---------------- safe dynamic imports ---------------- */
async function loadIndex(): Promise<null | ((slug: string) => any)> {
  try {
    const mod: any = await import("@/lib/product-index");
    return typeof mod?.getBySlug === "function" ? mod.getBySlug : null;
  } catch {
    return null;
  }
}

async function loadSEO(): Promise<{
  getProductSEO: (prod: any, group?: any, canonical?: string) => any;
} | null> {
  try {
    const mod: any = await import("@/lib/seo");
    if (typeof mod?.getProductSEO === "function") return { getProductSEO: mod.getProductSEO };
    return null;
  } catch {
    return null;
  }
}

/* ---------------- fuzzy fallback (guarded) ---------------- */
async function fuzzyFind(slug: string) {
  const target = slugify(slug);
  const want = tokens(target);
  if (want.length === 0) return null;

  type Rec = { brand: string; name: string; pack: string; code: string; raw: any; group?: any };
  const pile: Rec[] = [];

  // Prefer any shared iterator if present
  try {
    const mod: any = await import("@/lib/catalog/sources");
    if (typeof mod?.iterAllProducts === "function") {
      for (const p of mod.iterAllProducts() as any[]) {
        pile.push({ brand: p.brand, name: p.name, pack: p.pack, code: p.code, raw: p.raw, group: p.group });
      }
    }
  } catch {}

  // Fallback guarded brand imports
  if (pile.length === 0) {
    const push = (p: any, g?: any) => pile.push({
      brand: brandFrom(p, g),
      name: nameFrom(p, g),
      pack: packFrom(p),
      code: codeFrom(p),
      raw: p,
      group: g,
    });

    try {
      const mod: any = await import("@/lib/whatman_products.json");
      const data = (mod.default ?? mod);
      const variants = Array.isArray(data?.variants) ? data.variants : Array.isArray(data) ? data : [];
      variants.forEach((v: any) => push(v, data));
    } catch {}
    try {
      const mod: any = await import("@/lib/borosil_products_absolute_final.json");
      const arr = (mod.default ?? mod);
      (Array.isArray(arr) ? arr : []).forEach((g: any) => (g.variants || []).forEach((v: any) => push(v, g)));
    } catch {}
    try {
      const mod: any = await import("@/lib/qualigens-products.json");
      const raw = (mod.default ?? mod);
      const arr = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      arr.forEach((p: any) => push(p));
    } catch {}
    try {
      const mod: any = await import("@/lib/rankem_products.json");
      const arr = (mod.default ?? mod);
      (Array.isArray(arr) ? arr : []).forEach((g: any) => (g.variants || []).forEach((v: any) => push(v, g)));
    } catch {}
    try {
      const mod: any = await import("@/lib/omsons_products.json");
      const raw = (mod.default ?? mod);
      const arr = Array.isArray(raw?.catalog) ? raw.catalog : [];
      arr.forEach((sec: any) => (sec.variants || []).forEach((v: any) => push(v, sec)));
    } catch {}
    try {
      const mod: any = await import("@/lib/avarice_products.json");
      const raw = (mod.default ?? mod);
      const parents = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      parents.forEach((parent: any) =>
        (parent.variants || []).forEach((v: any) => push({ ...v, product_name: parent.product_name, product_code: parent.product_code, cas_no: parent.cas_no }, parent))
      );
    } catch {}
    try {
      const mod: any = await import("@/lib/himedia_products_grouped");
      const arr = (mod.default ?? mod);
      (Array.isArray(arr) ? arr : []).forEach((section: any) =>
        (section.header_sections || []).forEach((h: any) =>
          (h.sub_sections || []).forEach((s: any) =>
            (s.products || []).forEach((item: any) => push(item))
          )
        )
      );
    } catch {}
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

/* ---------------- generic renderer ---------------- */
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

/* ---------------- metadata (no top-level SEO imports) ---------------- */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  let rec: any = null;

  const idx = await loadIndex();
  if (idx) {
    try { rec = idx(params.slug); } catch {}
  }
  if (!rec) {
    try { rec = await fuzzyFind(params.slug); } catch {}
  }
  if (!rec) {
    return { title: "Product Not Found | Chemical Corporation", description: "The requested product could not be found.", robots: { index: false, follow: false } };
  }

  const canonical = `/product/${slugify(params.slug)}`;
  const seoMod = await loadSEO();
  if (seoMod) {
    try {
      const seo = seoMod.getProductSEO(rec.raw ?? rec, rec.group, canonical);
      return {
        title: seo.title,
        description: seo.description,
        alternates: { canonical },
        openGraph: { title: seo.title, description: seo.description, type: "product", url: canonical },
      };
    } catch {}
  }
  return {
    title: `${rec.brand || ""} ${rec.name || "Product"}`.trim(),
    description: "Buy online. Discount auto-applies in cart.",
    alternates: { canonical },
  };
}

/* ---------------- page ---------------- */
export default async function ProductPage({ params }: { params: { slug: string } }) {
  let rec: any = null;

  const idx = await loadIndex();
  if (idx) {
    try { rec = idx(params.slug); } catch {}
  }
  if (!rec) {
    try { rec = await fuzzyFind(params.slug); } catch {}
  }
  if (!rec) return notFound();

  const canonical = `/product/${slugify(params.slug)}`;

  // SEO (guarded)
  let jsonLd: any = {};
  let title = "";
  let description = "";
  const seoMod = await loadSEO();
  if (seoMod) {
    try {
      const seo = seoMod.getProductSEO(rec.raw ?? rec, rec.group, canonical);
      title = seo.title;
      description = seo.description;
      jsonLd = seo.jsonLd ?? {};
    } catch {}
  }
  if (!title) title = `${rec.brand || ""} ${rec.name || "Product"}`.trim();
  if (!description) description = "Buy online. Discount auto-applies in cart.";

  // Price
  const priceNum = priceFromAny(rec) ?? priceFromAny(rec.raw ?? rec);
  const priceTxt = priceNum !== undefined ? `₹${priceNum.toLocaleString("en-IN")}` : "POR";

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <Badge className="mb-3 bg-blue-100 text-blue-900 border-blue-200">PRODUCT</Badge>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
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

      {/* JSON-LD (never throw) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: (() => { try { return JSON.stringify(jsonLd); } catch { return "{}"; } })() }}
      />
    </div>
  );
}
