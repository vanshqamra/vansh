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

// Import the JSON data and convert it to the proper format
import qualigensData from "./qualigens-products.json"

export const qualigensProducts: QualigensProduct[] = Array.isArray(qualigensData)
  ? qualigensData.map(([code, cas, name, packSize, material, price, hsn]) => ({
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
    }))
  : []

export default qualigensProducts
