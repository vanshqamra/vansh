export const normalizeKey = (str: string) =>
  String(str ?? "").toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");

export const clean = (v: any) => (typeof v === "string" ? v.trim() : "");
export const firstNonEmpty = (obj: Record<string, any>, keys: string[]) => {
  for (const k of keys) {
    const nk = normalizeKey(k);
    if (obj?.[k] !== undefined && obj?.[k] !== "") return obj[k];
    if (obj?.[nk] !== undefined && obj?.[nk] !== "") return obj[nk];
  }
  return "";
};

export const codeKeys = () => [
  "code","product_code","Product Code","productCode",
  "cat_no","cat no","cat_no.","catno","Cat No","Cat No.",
  "catalog_no","catalog number","catalogue_no","catalogue_number","Catalog No","Catalogue No","Catalogue No.",
  "order_code","sku","item_code","itemCode","code_no","Code"
];

export const priceKeys = () => [
  "price","Price","price_piece","price_/piece","Price /Piece","Price/ Piece","Price/ Each",
  "list_price","offer_price","price_each","price_rs","price_(rs.)","Price (₹)","rate","Rate","Amount"
];

export const nameKeys = () => [
  "Product Name","product_name","name","item","title","description","Description","item_description",
  "material_name","chemical_name","product","product_title","material","material description","product_description"
];

export const packKeys = () => ["Pack Size","pack_size","Packsize","Packing","Pack","pack","package","Qty/Pack","Quantity/Pack"];
export const casKeys  = () => ["CAS No","cas_no","cas","cas_number","CAS"];
export const hsnKeys  = () => ["HSN Code","hsn_code","hsn","HSN"];

export function getField(variant: any, keys: string[]) {
  for (const k of keys) {
    if (variant?.[k] !== undefined && variant?.[k] !== "") return variant[k];
    const nk = normalizeKey(k);
    if (variant?.[nk] !== undefined && variant?.[nk] !== "") return variant[nk];
  }
  return "";
}

export const isPOR = (v: any) => /^por$/i.test(String(v ?? "").trim());

export function parsePriceToNumber(v: any): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v == null) return null;
  const s = String(v).trim();
  if (isPOR(s)) return null;
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// Basic slug helpers
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const slugPart = (s: any) =>
  typeof s === "string" && s.trim() ? slugify(s) : "";

export const makeSlug = (...parts: any[]) =>
  parts.map(slugPart).filter(Boolean).join("-");
