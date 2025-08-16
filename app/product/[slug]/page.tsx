// app/product/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ---------- tiny utils ----------
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
};
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// tolerant readers
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
  return first(
    p.code, p.product_code, p.productCode, p["Product Code"],
    p.catalog_no, p.catalogNo, p.catalogue_no, p.catalogueNo, p["Catalog No"], p["Catalogue No"], p["Catalogue No."],
    p.cat_no, p.catno, p["Cat No"], p["Cat No."], p["CAT NO"], p["CAT. NO."],
    p.order_code, p.orderCode, p.sku, p.item_code, p.itemCode, p.code_no, p["Code"]
  );
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

// ---------- safe dynamic imports ----------
async function tryGetBySlug(slug: string) {
  try {
    const mod: any = await import("@/lib/product-index");
    if (typeof mod?.getBySlug === "function") return mod.getBySlug(slug);
  } catch {}
  return null;
}
const tokens = (s: string) =>
  s.split(/[^a-z0-9]+/i).map((t) => t.toLowerCase()).filter((t) => t.length >= 2);

async function fuzzyFind(slug: string) {
  const target = slugify(slug);
  const want = tokens(target);
  if (!want.length) return null;

  type Rec = { brand: string; name: string; pack: string; code: string; raw: any; group?: any };
  const pile: Rec[] = [];
  const push = (p: any, g?: any) =>
    pile.push({
      brand: brandFrom(p, g),
      name: nameFrom(p, g),
      pack: packFrom(p),
      code: codeFrom(p),
      raw: p,
      group: g,
    });

  // Guarded imports per brand
  try {
    const mod: any = await import("@/lib/whatman_products.json");
    const data = mod.default ?? mod;
    const arr = Array.isArray(data?.variants) ? data.variants : Array.isArray(data) ? data : [];
    arr.forEach((v: any) => push(v, data));
  } catch {}
  try {
    const mod: any = await import("@/lib/borosil_products_absolute_final.json");
    const arr = mod.default ?? mod;
    (Array.isArray(arr) ? arr : []).forEach((g: any) =>
      (g.variants || []).forEach((v: any) => push(v, g))
    );
  } catch {}
  try {
    const mod: any = await import("@/lib/qualigens-products.json");
    const raw = mod.default ?? mod;
    const arr = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    arr.forEach((p: any) => push(p));
  } catch {}
  try {
    const mod: any = await import("@/lib/rankem_products.json");
    const arr = mod.default ?? mod;
    (Array.isArray(arr) ? arr : []).forEach((g: any) =>
      (g.variants || []).forEach((v: any) => push(v, g))
    );
  } catch {}
  try {
    const mod: any = await import("@/lib/omsons_products.json");
    const raw = mod.default ?? mod;
    const arr = Array.isArray(raw?.catalog) ? raw.catalog : [];
    arr.forEach((sec: any) => (sec.variants || []).forEach((v: any) => push(v, sec)));
  } catch {}
  try {
    const mod: any = await import("@/lib/avarice_products.json");
    const raw = mod.default ?? mod;
    const parents = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    parents.forEach((parent: any) =>
      (parent.variants || []).forEach((v: any) =>
        push({ ...v, product_name: parent.product_name, product_code: parent.product_code, cas_no: parent.cas_no }, parent)
      )
    );
  } catch {}
  try {
    const mod: any = await import("@/lib/himedia_products_grouped");
    const arr = mod.default ?? mod;
    (Array.isArray(arr) ? arr : []).forEach((section: any) =>
      (section.header_sections || []).forEach((h: any) =>
        (h.sub_sections || []).forEach((s: any) =>
          (s.products || []).forEach((item: any) => push(item))
        )
      )
    );
  } catch {}

  let best: { rec: Rec; score: number } | null = null;
  for (const rec of pile) {
    const hay = (
      rec.brand +
      " " +
      rec.name +
      " " +
      rec.pack +
      " " +
      rec.code +
      " " +
      JSON.stringify(rec.raw || "") +
      " " +
      JSON.stringify(rec.group || "")
    ).toLowerCase();
    let score = 0;
    for (const t of want) if (hay.includes(t)) score++;
    if (!best || score > best.score) best = { rec, score };
  }
  return best?.rec ?? null;
}

// ---------- derive specs nicely (Rankem/Whatman safe) ----------
function pickKeySpecs(rec: any): Array<{ key: string; value: string | number }> {
  const raw = rec?.raw ?? rec;
  if (!raw || typeof raw !== "object") return [];

  const blacklist = new Set([
    "price", "Price", "rate", "price_inr",
    "brand", "name", "title", "productName", "product_name", "Product Name",
    "pack", "packSize", "Pack", "Pack Size", "Qty/Pack", "Quantity/Pack", "packing",
    "code", "product_code", "Product Code", "catalog_no", "catno", "cat_no", "sku", "item_code",
    "hsn", "HSN", "HSN Code", "cas", "CAS", "cas_no", "CAS No"
  ]);

  const fromGroupHeaders = Array.isArray(rec?.group?.specs_headers) ? rec.group.specs_headers : null;

  const entries: Array<[string, any]> = Object.entries(raw)
    .filter(([k, v]) => !blacklist.has(k) && (typeof v === "string" || typeof v === "number"))
    .filter(([_, v]) => String(v).trim() !== "");

  // If Whatman-like headers exist, keep that order first
  const ordered: Array<{ key: string; value: any }> = [];
  if (fromGroupHeaders) {
    for (const h of fromGroupHeaders) {
      const hit = entries.find(([k]) => k === h);
      if (hit) ordered.push({ key: hit[0], value: hit[1] });
    }
  }

  // Add remaining entries (avoid duplicates), cap total to 12
  for (const [k, v] of entries) {
    if (!ordered.some((e) => e.key === k)) ordered.push({ key: k, value: v });
    if (ordered.length >= 12) break;
  }

  return ordered.slice(0, 12);
}

// ---------- page ----------
export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Resolve record (central index first, then fuzzy as fallback)
  let rec: any = await tryGetBySlug(params.slug);
  if (!rec) rec = await fuzzyFind(params.slug);
  if (!rec) return notFound();

  const raw = rec.raw ?? rec;
  const brand = rec.brand || brandFrom(raw, rec.group);
  const name = rec.name || nameFrom(raw, rec.group) || "Product";
  const pack = rec.pack || packFrom(raw);
  const code = rec.code || codeFrom(raw);
  const hsn = raw.hsn ?? raw["HSN Code"] ?? raw.hsn_code;
  const cas = raw.cas ?? raw["CAS No"] ?? raw.cas_no ?? raw.cas_number;

  const priceNum = priceFromAny(rec) ?? priceFromAny(raw);
  const priceTxt = priceNum !== undefined ? `₹${priceNum.toLocaleString("en-IN")}` : "POR";

  const specs = pickKeySpecs(rec);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <Badge className="mb-3 bg-blue-100 text-blue-900 border-blue-200">PRODUCT</Badge>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {[brand, name, pack].filter(Boolean).join(" ")}
          {code ? <span className="ml-2 text-base font-normal text-slate-500">({code})</span> : null}
        </h1>
        <p className="text-slate-600 mt-2">Discounts auto-apply in cart • Fast delivery across India</p>
      </div>

      {/* Summary */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {brand ? <Badge variant="outline">{brand}</Badge> : null}
            {pack ? <Badge variant="outline">{pack}</Badge> : null}
            {code ? <Badge variant="outline">Code: {code}</Badge> : null}
            {hsn ? <Badge variant="outline">HSN: {hsn}</Badge> : null}
            {cas ? <Badge variant="outline">CAS: {cas}</Badge> : null}
          </div>

          <div className="text-2xl font-semibold text-slate-900 mb-2">{priceTxt}</div>
          <div className="text-sm text-emerald-700 mb-6">Discount applies in cart — final price shown at checkout</div>

          <div className="flex gap-3">
            <Button asChild><Link href="/products">Continue Shopping</Link></Button>
            <Button asChild variant="outline"><Link href="/cart">View Cart</Link></Button>
          </div>
        </CardContent>
      </Card>

      {/* Key specs for noisy brands (Rankem/Whatman-safe) */}
      {specs.length > 0 && (
        <Card className="bg-white mt-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3">Key Specifications</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody>
                  {specs.map((s) => (
                    <tr key={s.key} className="border-b last:border-none">
                      <td className="px-3 py-2 font-medium bg-slate-50 whitespace-nowrap">{s.key}</td>
                      <td className="px-3 py-2">{String(s.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON collapsed (so it doesn't flood Rankem/Whatman pages) */}
      <Card className="bg-white mt-8">
        <CardContent className="p-6">
          <details>
            <summary className="cursor-pointer text-sm text-slate-600">Developer debug: view full record JSON</summary>
            <pre className="mt-3 text-xs bg-slate-50 border rounded p-3 overflow-x-auto">
{JSON.stringify(raw, null, 2)}
            </pre>
            {rec.group ? (
              <>
                <h3 className="mt-4 text-xs font-semibold text-slate-700">Group/Context</h3>
                <pre className="mt-2 text-xs bg-slate-50 border rounded p-3 overflow-x-auto">
{JSON.stringify(rec.group, null, 2)}
                </pre>
              </>
            ) : null}
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
