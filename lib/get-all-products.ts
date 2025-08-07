// /lib/get-all-products.ts

import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import rankemProducts from "@/lib/rankem_products.json"
import { qualigensProducts as qualigens } from "@/lib/qualigens-products"
import whatman from "@/lib/whatman_products.json"
import himedia from "@/lib/himedia_products_grouped"
import { commercialChemicals as bulk } from "@/lib/data"

export interface ProductEntry {
  productName: string
  brand: string
  code: string
  packSize: string
  price: number
  hsnCode?: string
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

function extractHSN(obj: any): string {
  return (
    obj.hsnCode ||
    obj.HSN ||
    obj["HSN Code"] ||
    (obj.specs ? obj.specs.HSN || obj.specs["HSN Code"] : "") ||
    ""
  )
}

// Simple cache to avoid recomputation
let cached: ProductEntry[] | null = null

export function getAllProducts(): ProductEntry[] {
  if (cached) return cached

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
  addGrouped(borosilProducts, "Borosil", (group, v) => ({
    productName: group.product || group.title || group.name || "Borosil Product",
    brand: "Borosil",
    code: v.code || "",
    packSize:
      v.capacity ||
      v["Pack Size"] ||
      v["pack size"] ||
      v.size ||
      v.volume ||
      "",
    price: normalizePrice(v.price),
    hsnCode: extractHSN(v),
  }))

  // Rankem
  addGrouped(rankemProducts, "Rankem", (group, v) => ({
    productName: group.product || group.title || group.name || "Rankem Product",
    brand: "Rankem",
    code: v["Product Code"] || v.code || v["Cat No"] || "",
    packSize: v["Pack Size"] || v.size || v["Pack\nSize"] || "",
    price: extractPrice(v),
    hsnCode: extractHSN(v),
  }))

  // Qualigens
  addFlat(qualigens, "Qualigens", (p) => ({
    productName: p["Product Name"] || p.product || p.name || "Qualigens Product",
    brand: "Qualigens",
    code: p["Product Code"] || p.code || "",
    packSize: p["Pack Size"] || p.size || "",
    price: extractPrice(p),
    hsnCode: extractHSN(p),
  }))

  // Whatman
  addFlat(whatman?.variants || [], "Whatman", (p) => ({
    productName: p.name || p.title || "Whatman Product",
    brand: "Whatman",
    code: p.code || p["Code"] || "",
    packSize: p.size || p["Pack Size"] || "",
    price: extractPrice(p),
    hsnCode: extractHSN(p),
  }))

  // HiMedia
  addGrouped(himedia, "HiMedia", (group, v) => ({
    productName: group.product || group.title || group.name || "HiMedia Product",
    brand: "HiMedia",
    code: v["Product Code"] || v.code || "",
    packSize: v["Pack Size"] || v.size || v.packing || "",
    price: extractPrice(v),
    hsnCode: extractHSN(v),
  }))

  // Bulk / Commercial
  addFlat(bulk, "Bulk Chemical", (p) => ({
    productName: p.name || p["Product Name"] || "Bulk Chemical",
    brand: "Bulk Chemical",
    code: p.code || p["Product Code"] || "",
    packSize: p.size || p["Pack Size"] || "",
    price: extractPrice(p),
    hsnCode: extractHSN(p),
  }))

  cached = all
  return all
}
