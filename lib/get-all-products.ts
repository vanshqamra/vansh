// /lib/get-all-products.ts

import borosilProducts from "@/lib/borosil_products_absolute_final.json";
import rankemProducts from "@/lib/rankem_products.json";
import qualigensProducts from "@/lib/qualigens-products.json";
import whatmanRaw from "@/lib/whatman_products.json";
import himediaRaw from "@/lib/himedia_products_grouped";
import { commercialChemicals as bulkProducts } from "@/lib/data";

export interface ProductEntry {
  productName: string;
  brand: string;
  code: string;
  packSize: string;
  price: number;
  hsnCode?: string;
}

const normalizePrice = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

function extractPrice(obj: any): number {
  const key = Object.keys(obj).find((k) => k.toLowerCase().includes("price"));
  return key ? normalizePrice(obj[key]) : 0;
}

function extractHSN(obj: any): string {
  return (
    obj.hsnCode ||
    obj.HSN ||
    obj["HSN Code"] ||
    (obj.specs ? obj.specs.HSN || obj.specs["HSN Code"] : "") ||
    ""
  );
}

// Resolve raw imports to consistent arrays
const himediaProducts: any[] = Array.isArray(himediaRaw)
  ? himediaRaw
  : Array.isArray((himediaRaw as any).default)
  ? (himediaRaw as any).default
  : [];

const whatmanVariants: any[] = Array.isArray(whatmanRaw)
  ? whatmanRaw
  : Array.isArray((whatmanRaw as any).variants)
  ? (whatmanRaw as any).variants
  : [];

let cache: ProductEntry[] | null = null;

export function getAllProducts(): ProductEntry[] {
  if (cache) return cache;
  const all: ProductEntry[] = [];

  const addGrouped = (source: any[], brand: string, fn: (g: any, v: any) => ProductEntry) => {
    source.forEach((group) => {
      if (!Array.isArray(group.variants)) return;
      group.variants.forEach((variant: any) => all.push(fn(group, variant)));
    });
  };

  const addFlat = (source: any[], brand: string, fn: (p: any) => ProductEntry) => {
    source.forEach((p) => all.push(fn(p)));
  };

  // Borosil
  addGrouped(borosilProducts, "Borosil", (g, v) => ({
    productName: g.product || g.title || g.name || "",
    brand: "Borosil",
    code: v.code || "",
    packSize: v.capacity || v["Pack Size"] || v.size || "",
    price: normalizePrice(v.price),
    hsnCode: extractHSN(v),
  }));

  // Rankem
  addGrouped(rankemProducts, "Rankem", (g, v) => ({
    productName: g.product || g.title || g.name || "",
    brand: "Rankem",
    code: v["Product Code"] || v.code || v["Cat No"] || "",
    packSize: v["Pack Size"] || v.size || "",
    price: extractPrice(v),
    hsnCode: extractHSN(v),
  }));

  // Qualigens
  addFlat(qualigensProducts, "Qualigens", (p) => ({
    productName: p["Product Name"] || p.product || p.name || "",
    brand: "Qualigens",
    code: p["Product Code"] || p.code || "",
    packSize: p["Pack Size"] || p.size || "",
    price: extractPrice(p),
    hsnCode: extractHSN(p),
  }));

  // Whatman
  addFlat(whatmanVariants, "Whatman", (v) => ({
    productName: v.name || v.title || "",
    brand: "Whatman",
    code: v.code || v["Code"] || "",
    packSize: v.size || v["Pack Size"] || "",
    price: extractPrice(v),
    hsnCode: extractHSN(v),
  }));

  // HiMedia
  addGrouped(himediaProducts, "HiMedia", (g, v) => ({
    productName: g.product || g.title || g.name || "",
    brand: "HiMedia",
    code: v["Product Code"] || v.code || "",
    packSize: v["Pack Size"] || v.size || v.packing || "",
    price: extractPrice(v),
    hsnCode: extractHSN(v),
  }));

  // Bulk / Commercial
  addFlat(bulkProducts, "Bulk Chemical", (p) => ({
    productName: p.name || p["Product Name"] || "",
    brand: "Bulk Chemical",
    code: p.code || p["Product Code"] || "",
    packSize: p.size || p["Pack Size"] || "",
    price: extractPrice(p),
    hsnCode: extractHSN(p),
  }));

  cache = all;
  return all;
}
