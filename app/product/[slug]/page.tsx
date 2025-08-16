// app/product/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const tokens = (s: string) =>
  s.split(/[^a-z0-9]+/i).map(t => t.toLowerCase()).filter(t => t.length >= 2);

const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: any[]) => {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
};

function nameFrom(p:any,g?:any){return first(p.productName,p.name,p.title,p["Product Name"],p.description,g?.title,g?.product,p.product)}
function packFrom(p:any){return first(p.packSize,p.size,p.capacity,p.volume,p.diameter,p.dimensions,p.grade,p.Pack,p["Pack Size"],p.packing,p["Pack"],p["Qty/Pack"],p["Quantity/Pack"])}
function brandFrom(p:any,g?:any){return first(p.brand,g?.brand,p.vendor,p.mfg, /borosil/i.test(JSON.stringify(p||{}))?"Borosil":"")}
function codeFrom(p:any){return first(p.code,p.product_code,p.productCode,p["Product Code"],p.catalog_no,p.catalogNo,p.cat_no,p.catno,p["Cat No"],p.sku,p.item_code,p.itemCode)}

// try product-index if present (guarded)
async function tryGetBySlug(slug: string) {
  try {
    const mod: any = await import("@/lib/product-index");
    if (typeof mod?.getBySlug === "function") return mod.getBySlug(slug);
  } catch {}
  return null;
}

// fuzzy scan all brand JSONs (guarded)
async function fuzzyFind(slug: string){
  const want = tokens(slugify(slug));
  if(!want.length) return null;

  type Rec = {brand:string;name:string;pack:string;code:string;raw:any;group?:any};
  const pile:Rec[] = [];
  const push = (p:any,g?:any)=>pile.push({
    brand:brandFrom(p,g), name:nameFrom(p,g), pack:packFrom(p), code:codeFrom(p), raw:p, group:g
  });

  try{const m:any=await import("@/lib/whatman_products.json"); const d=m.default??m; const arr=Array.isArray(d?.variants)?d.variants:Array.isArray(d)?d:[]; arr.forEach((v:any)=>push(v,d));}catch{}
  try{const m:any=await import("@/lib/borosil_products_absolute_final.json"); const arr=(m.default??m); (Array.isArray(arr)?arr:[]).forEach((g:any)=> (g.variants||[]).forEach((v:any)=>push(v,g)));}catch{}
  try{const m:any=await import("@/lib/qualigens-products.json"); const raw=m.default??m; const arr=Array.isArray(raw?.data)?raw.data:Array.isArray(raw)?raw:[]; arr.forEach((p:any)=>push(p));}catch{}
  try{const m:any=await import("@/lib/rankem_products.json"); const arr=(m.default??m); (Array.isArray(arr)?arr:[]).forEach((g:any)=> (g.variants||[]).forEach((v:any)=>push(v,g)));}catch{}
  try{const m:any=await import("@/lib/omsons_products.json"); const raw=m.default??m; const arr=Array.isArray(raw?.catalog)?raw.catalog:[]; arr.forEach((sec:any)=> (sec.variants||[]).forEach((v:any)=>push(v,sec)));}catch{}
  try{const m:any=await import("@/lib/avarice_products.json"); const raw=m.default??m; const parents=Array.isArray(raw?.data)?raw.data:Array.isArray(raw)?raw:[]; parents.forEach((parent:any)=> (parent.variants||[]).forEach((v:any)=>push({...v,product_name:parent.product_name,product_code:parent.product_code,cas_no:parent.cas_no},parent)));}catch{}
  try{const m:any=await import("@/lib/himedia_products_grouped"); const arr=(m.default??m); (Array.isArray(arr)?arr:[]).forEach((section:any)=> (section.header_sections||[]).forEach((h:any)=> (h.sub_sections||[]).forEach((s:any)=> (s.products||[]).forEach((item:any)=>push(item)))));}catch{}

  let best:null|{rec:Rec;score:number}=null;
  for(const rec of pile){
    const hay=(rec.brand+" "+rec.name+" "+rec.pack+" "+rec.code+" "+JSON.stringify(rec.raw||"")+" "+JSON.stringify(rec.group||"")).toLowerCase();
    let score=0; for(const t of want) if(hay.includes(t)) score++;
    if(!best||score>best.score) best={rec,score};
  }
  return best?.rec ?? null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  // 1) try central index, then 2) fuzzy scan
  let rec:any = await tryGetBySlug(params.slug);
  if(!rec) rec = await fuzzyFind(params.slug);

  if(!rec){
    return (
      <div style={{ padding: 24, fontFamily: "ui-sans-serif" }}>
        NOT FOUND for /product/{params.slug}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "ui-sans-serif" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        {[rec.brand, rec.name, rec.pack].filter(Boolean).join(" ") || "Product"}
      </h1>
      <div style={{ opacity: .7, marginBottom: 16 }}>
        Code: {rec.code || "—"}
      </div>
      <pre style={{ fontSize: 12, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, overflowX: "auto" }}>
{JSON.stringify(rec.raw ?? rec, null, 2)}
      </pre>
      {rec.group ? (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Group/Context</h2>
          <pre style={{ fontSize: 12, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, overflowX: "auto" }}>
{JSON.stringify(rec.group, null, 2)}
          </pre>
        </>
      ) : null}
    </div>
  );
}
