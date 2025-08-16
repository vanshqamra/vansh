import { iterAllProducts } from "./catalog/sources";
import { makeSlug } from "./catalog/fields";

export type ProductRecord = {
  brand: string; name: string; pack: string; code: string;
  price?: number|string|null; hsn?: string; cas?: string;
  raw: any; group?: any;
};

let CACHE: {
  bySlug: Map<string, ProductRecord>;
  byCode: Map<string, ProductRecord>;
} | null = null;

function candidateSlugs(r: ProductRecord): string[] {
  const { brand, name, pack, code } = r;
  const set = new Set<string>([
    makeSlug(brand, name, pack, code),
    makeSlug(brand, name, pack),
    makeSlug(brand, name, code),
    makeSlug(brand, name),
    makeSlug(name, pack),
    makeSlug(name, pack, code),
    makeSlug(brand, code),
    makeSlug(code),
  ]);
  return Array.from(set).filter(Boolean);
}

export function ensureIndex() {
  if (CACHE) return CACHE;
  const bySlug = new Map<string, ProductRecord>();
  const byCode = new Map<string, ProductRecord>();

  for (const row of iterAllProducts()) {
    const rec: ProductRecord = row;
    const cands = candidateSlugs(rec);
    for (const s of cands) if (!bySlug.has(s)) bySlug.set(s, rec);
    if (rec.code) {
      const c = makeSlug(String(rec.code));
      if (!byCode.has(c)) byCode.set(c, rec);
    }
  }
  CACHE = { bySlug, byCode };
  return CACHE;
}

export function getBySlug(slug: string): ProductRecord | null {
  const key = makeSlug(slug);
  const { bySlug, byCode } = ensureIndex();
  return bySlug.get(key) || byCode.get(key) || null;
}
