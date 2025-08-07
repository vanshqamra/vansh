export interface ProductEntry {
  productName: string
  brand: string
  code: string
  packSize: string
  price: number
}

const normalizePrice = (value: any): number => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "")
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }
  return 0
}

function extractPrice(obj: any): number {
  const key = Object.keys(obj).find((k) => k.toLowerCase().includes("price"))
  return key ? normalizePrice(obj[key]) : 0
}

export function getAllProducts(): ProductEntry[] {
  const all: ProductEntry[] = []

  const addGrouped = (source: any, brand: string, extract: (g: any, v: any) => ProductEntry) => {
    (Array.isArray(source) ? source : []).forEach((group) => {
      (Array.isArray(group.variants) ? group.variants : []).forEach((variant: any) => {
        all.push(extract(group, variant))
      })
    })
  }

  const addFlat = (source: any, brand: string, extract: (p: any) => ProductEntry) => {
    (Array.isArray(source) ? source : []).forEach((p) => {
      all.push(extract(p))
    })
  }

  // Borosil
  const borosil = require("@/lib/borosil_products_absolute_final.json")
  addGrouped(borosil, "Borosil", (group, v) => ({
    productName: group.product || group.title || group.name || "",
    brand: "Borosil",
    code: v.code || "",
    packSize: v.capacity || v["Pack Size"] || v.size || "",
    price: normalizePrice(v.price)
  }))

  // Rankem
  const rankem = require("@/lib/rankem_products.json")
  addGrouped(rankem, "Rankem", (group, v) => ({
    productName: group.product || group.title || group.name || "",
    brand: "Rankem",
    code: v["Product Code"] || v.code || "",
    packSize: v["Pack Size"] || v.size || "",
    price: extractPrice(v)
  }))

  // Qualigens
  const qualigens = require("@/lib/qualigens-products").qualigensProducts
  addFlat(qualigens, "Qualigens", (p) => ({
    productName: p["Product Name"] || p.product || p.name || "",
    brand: "Qualigens",
    code: p["Product Code"] || p.code || "",
    packSize: p["Pack Size"] || p.size || "",
    price: extractPrice(p)
  }))

  // Whatman
  const whatman = require("@/lib/whatman_products.json")
  addFlat(whatman, "Whatman", (p) => ({
    productName: p.name || p.title || "",
    brand: "Whatman",
    code: p.code || p["Product Code"] || "",
    packSize: p.size || p["Pack Size"] || "",
    price: extractPrice(p)
  }))

  // HiMedia
  const himedia = require("@/lib/himedia_products_grouped").default
  addGrouped(himedia, "HiMedia", (group, v) => ({
    productName: group.product || group.title || group.name || "",
    brand: "HiMedia",
    code: v["Product Code"] || v.code || "",
    packSize: v["Pack Size"] || v.size || v.packing || "",
    price: extractPrice(v)
  }))

  // Bulk Chemical
  const bulk = require("@/lib/data").commercialChemicals
  addFlat(bulk, "Bulk Chemical", (p) => ({
    productName: p.name || p["Product Name"] || "",
    brand: "Bulk Chemical",
    code: p.code || p["Product Code"] || "",
    packSize: p.size || p["Pack Size"] || "",
    price: extractPrice(p)
  }))

  return all
}
