// lib/slug.ts
const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => clean(vals.find((x) => clean(x)) || "");
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function packFrom(p: any) {
  return first(p.packSize, p.size, p.capacity, p.volume, p.diameter, p.dimensions, p.grade);
}
function codeFrom(p: any) {
  return first(p.code, p.catalog_no, p.catalogNo, p.catno, p.sku, p.item_code, p.itemCode);
}
function brandFrom(p: any, g?: any) {
  return first(p.brand, g?.brand, p.vendor, p.mfg, /borosil/i.test(JSON.stringify(p)) ? "Borosil" : "");
}
function nameFrom(p: any, g?: any) {
  return first(p.productName, p.name, p.title, g?.title, g?.product, p.product);
}

export function slugForProduct(p: any, g?: any) {
  const brand = brandFrom(p, g);
  const name = nameFrom(p, g);
  const pack = packFrom(p);
  const code = codeFrom(p);
  const base = [brand, name, pack, code].filter(Boolean).join(" ");
  return slugify(base) || (code ? slugify(code) : "");
}
