// ts-node friendly script to validate resolver for a given slug

import whatman from "@/lib/whatman_products.json";
import borosil from "@/lib/borosil_products_absolute_final.json";
import qualigens from "@/lib/qualigens-products.json";
import rankem from "@/lib/rankem_products.json";
import omsons from "@/lib/omsons_products.json";
import avarice from "@/lib/avarice_products.json";
import himedia from "@/lib/himedia_products_grouped";

const norm = (s: any) => String(s ?? "").toLowerCase();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const first = (...vals: any[]) => {
  for (const v of vals) { const s = typeof v === "string" ? v.trim() : ""; if (s) return s; }
  return "";
};

function packFrom(p: any) {
  return first(p.packSize, p.size, p.capacity, p.volume, p.diameter, p.dimensions, p.grade, p.Pack, p["Pack Size"], p.packing);
}
function codeFrom(p: any) {
  const direct = first(p.code, p.product_code, p.productCode, p.catalog_no, p.catalogNo, p.cat_no, p.catno, p["Product Code"], p["Cat No"], p["Cat No."], p["Catalogue No"], p["Catalog No"], p["Code"], p.sku, p.item_code, p.itemCode);
  if (direct) return direct;
  const nameLike = first(p.name, p.title, p.productName, p["Product Name"], p.description);
  if (!nameLike) return "";
  const tokens = String(nameLike).split(/[\s,/()_-]+/).filter(Boolean);
  const bad = /^(mm|ml|l|pk|pcs?|um|µm|gm|kg|g|x|mmf)$/i;
  const candidates = tokens.filter(t => /\d/.test(t) && /^[a-z0-9-]+$/i.test(t) && !bad.test(t) && !/(mm|ml|l|µm|um)$/i.test(t));
  const alnum = candidates.filter(t => /[a-z]/i.test(t)).sort((a,b)=>a.length-b.length);
  return alnum[0] || candidates.find(t => /^\d{3,8}$/.test(t)) || "";
}
function brandFrom(p: any, g?: any) {
  return first(p.brand, g?.brand, p.vendor, p.mfg, /borosil/i.test(JSON.stringify(p)) ? "Borosil" : "");
}
function nameFrom(p: any, g?: any) {
  return first(p.productName, p.name, p.title, g?.title, g?.product, p.product, p["Product Name"]);
}
const makeSlug = (...parts: any[]) => parts.map((s:any)=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")).filter(Boolean).join("-");

function candidateSlugs(p: any, g?: any) {
  const b = brandFrom(p,g), n = nameFrom(p,g), pk = packFrom(p), c = codeFrom(p);
  return [
    makeSlug(b,n,pk,c), makeSlug(b,n,pk), makeSlug(b,n,c), makeSlug(b,n),
    makeSlug(n,pk), makeSlug(n,pk,c), makeSlug(b,c), makeSlug(c)
  ].filter(Boolean);
}

function scan() {
  const pile: any[] = [];
  // Whatman
  const wv = Array.isArray((whatman as any)?.variants) ? (whatman as any).variants : [];
  wv.forEach((p:any)=>pile.push({ brand:"Whatman", p, g:whatman }));
  // Borosil
  (Array.isArray(borosil) ? (borosil as any[]) : []).forEach((g:any)=>{
    (g.variants||[]).forEach((p:any)=>pile.push({ brand:"Borosil", p, g }));
  });
  // Rankem
  (Array.isArray(rankem) ? (rankem as any[]) : []).forEach((g:any)=>{
    (g.variants||[]).forEach((p:any)=>pile.push({ brand:"Rankem", p, g }));
  });
  // Qualigens (flat)
  const qarr = Array.isArray((qualigens as any).data) ? (qualigens as any).data : (Array.isArray(qualigens)? (qualigens as any[]): []);
  qarr.forEach((p:any)=>pile.push({ brand:"Qualigens", p }));
  // Omsons
  const oc = (omsons as any)?.catalog || [];
  oc.forEach((g:any)=> (g.variants||[]).forEach((p:any)=>pile.push({ brand:"Omsons", p, g })));
  // Avarice
  const av = Array.isArray((avarice as any).data) ? (avarice as any).data : (Array.isArray(avarice)? (avarice as any[]): []);
  av.forEach((parent:any)=> (parent.variants||[]).forEach((v:any)=>pile.push({ brand:"Avarice", p:{...v, product_name:parent.product_name, product_code:parent.product_code}, g:parent })));
  // HiMedia (nested)
  const hm = Array.isArray(himedia) ? (himedia as any[]) : [];
  hm.forEach((sec:any)=> sec?.header_sections?.forEach((h:any)=> h?.sub_sections?.forEach((s:any)=> s?.products?.forEach((p:any)=> pile.push({ brand:"HiMedia", p })))))

  return pile;
}

function main() {
  const slug = process.argv[2] || "";
  if (!slug) { console.error("Usage: ts-node scripts/smoke-product.ts <slug>"); process.exit(1); }
  const target = slugify(slug);
  const pile = scan();
  const hits = pile.filter(({p,g}:any)=> {
    const cands = candidateSlugs(p,g);
    const code = codeFrom(p);
    return cands.includes(target) || (code && slugify(String(code))===target) || (code && target.includes(slugify(String(code))));
  });
  console.log("TARGET:", target, "TOTAL:", pile.length, "HITS:", hits.length);
  console.log(hits.slice(0,5).map(h=>({
    brand:h.brand,
    name: nameFrom(h.p,h.g),
    code: codeFrom(h.p),
    slug: candidateSlugs(h.p,h.g)[0]
  })));
}
main();
