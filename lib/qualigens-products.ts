export interface QualigensProduct {
  code: string
  cas: string
  name: string
  packSize: string
  material: string
  price: string
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

export const qualigensProducts: QualigensProduct[] = raw.map(
  ([code, cas, name, packSize, material, price, hsn]) => ({
    code,
    cas: cas || "",
    name,
    packSize,
    material,
    price,
    hsn,
    category: "Laboratory Chemical",
    purity: "SQ",
    brand: "Qualigens",
    id: code,
  })
)

export default qualigensProducts
