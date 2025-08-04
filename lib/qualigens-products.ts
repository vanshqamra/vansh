export interface QualigensProduct {
  code: string
  cas: string
  name: string
  packSize: string
  material: string
  price: number
  hsn: string
  category?: string
  purity?: string
  brand?: string
  id?: string
}

import qualigensDataRaw from "./qualigens-products.json"

const raw = Array.isArray(qualigensDataRaw?.data)
  ? qualigensDataRaw.data
  : Array.isArray(qualigensDataRaw)
    ? qualigensDataRaw
    : []

export const qualigensProducts: QualigensProduct[] = raw.map((item) => {
  const code = item["Product Code"] || ""
  const cas = item["CAS No"] || ""
  const name = item["Product Name"] || ""
  const packSize = item["Pack Size"] || ""
  const material = item["Packing"] || ""
  const price = Number(item["Price"] || 0)
  const hsn = item["HSN Code"] || ""

  return {
    code,
    cas,
    name,
    packSize,
    material,
    price,
    hsn,
    category: "Laboratory Chemical",
    purity: "SQ",
    brand: "Qualigens",
    id: code,
  }
})

export default qualigensProducts
