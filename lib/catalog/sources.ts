import borosil from "@/lib/borosil_products_absolute_final.json";
import qualigensRaw from "@/lib/qualigens-products.json";
import rankem from "@/lib/rankem_products.json";
import omsonsRaw from "@/lib/omsons_products.json";
import avariceRaw from "@/lib/avarice_products.json";
import himediaRaw from "@/lib/himedia_products_grouped";
import whatman from "@/lib/whatman_products.json";

import { brandFrom, nameFrom, packFrom, codeFrom, hsnFrom, casFrom } from "./derive";

type Row = { brand: string; name: string; pack: string; code: string; price?: number | string | null; hsn?: string; cas?: string; raw: any; group?: any };

const asArray = (x: any) => Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : [];

export function* iterAllProducts(): Generator<Row> {
  // BOROSIL (grouped)
  if (Array.isArray(borosil)) {
    for (const g of borosil as any[]) {
      const variants = Array.isArray(g.variants) ? g.variants : [];
      for (const v of variants) {
        const row = { ...v };
        yield {
          brand: "Borosil",
          name: nameFrom(row, g),
          pack: packFrom(row),
          code: codeFrom(row),
          price: row.price ?? row.Price ?? row.rate ?? null,
          hsn: hsnFrom(row),
          cas: casFrom(row),
          raw: row,
          group: g,
        };
      }
    }
  }

  // QUALIGENS (flat or {data})
  for (const p of asArray((qualigensRaw as any).default ?? qualigensRaw)) {
    yield {
      brand: "Qualigens",
      name: nameFrom(p),
      pack: packFrom(p),
      code: codeFrom(p),
      price: p.Price ?? p.price ?? p.rate ?? null,
      hsn: hsnFrom(p),
      cas: casFrom(p),
      raw: p,
    };
  }

  // RANKEM (grouped)
  for (const grp of (Array.isArray(rankem) ? (rankem as any[]) : [])) {
    for (const v of grp.variants || []) {
      yield {
        brand: "Rankem",
        name: nameFrom(v, grp),
        pack: packFrom(v),
        code: codeFrom(v),
        price: v.Price ?? v.price ?? v.rate ?? null,
        hsn: hsnFrom(v),
        cas: casFrom(v),
        raw: v,
        group: grp,
      };
    }
  }

  // HIMEDIA (nested)
  for (const section of (Array.isArray(himediaRaw) ? (himediaRaw as any[]) : [])) {
    for (const header of section.header_sections || []) {
      for (const sub of header.sub_sections || []) {
        for (const item of sub.products || []) {
          yield {
            brand: "HiMedia",
            name: nameFrom(item),
            pack: packFrom(item),
            code: codeFrom(item),
            price: item.rate ?? item.price ?? null,
            hsn: hsnFrom(item),
            cas: casFrom(item),
            raw: item,
          };
        }
      }
    }
  }

  // OMSONS (sections[].variants[])
  for (const sec of ((omsonsRaw as any)?.catalog || [])) {
    for (const v of sec.variants || []) {
      yield {
        brand: "Omsons",
        name: nameFrom(v, sec),
        pack: packFrom(v),
        code: codeFrom(v),
        price: v.Price ?? v.price ?? v.rate ?? null,
        hsn: hsnFrom(v),
        cas: casFrom(v),
        raw: v,
        group: sec,
      };
    }
  }

  // AVARICE ({data:[{variants:[]}]})
  for (const parent of asArray((avariceRaw as any).default ?? avariceRaw)) {
    for (const v of parent.variants || []) {
      const merged = { ...v, product_name: parent.product_name, product_code: parent.product_code, cas_no: parent.cas_no };
      yield {
        brand: "Avarice",
        name: nameFrom(merged, parent),
        pack: packFrom(merged),
        code: codeFrom(merged),
        price: merged.price_inr ?? merged.rate ?? null,
        hsn: hsnFrom(merged),
        cas: casFrom(merged),
        raw: merged,
        group: parent,
      };
    }
  }

  // WHATMAN (group with variants)
  {
    const vr = Array.isArray((whatman as any)?.variants) ? (whatman as any).variants : [];
    for (const v of vr) {
      yield {
        brand: "Whatman",
        name: nameFrom(v, whatman),
        pack: packFrom(v),
        code: codeFrom(v),
        price: v.price ?? v.Price ?? v.rate ?? null,
        hsn: hsnFrom(v),
        cas: casFrom(v),
        raw: v,
        group: whatman,
      };
    }
  }
}
