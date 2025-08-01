import { promises as fs } from "fs"
import path from "path"

export interface QualigensProduct {
  id: string
  name: string
  brand: string
  packSize: string
  casNumber: string
  price: number
  image: string
}

export async function getQualigensProducts(): Promise<QualigensProduct[]> {
  try {
    const filePath = path.join(process.cwd(), "lib", "qualigens-products.json")
    const jsonData = await fs.readFile(filePath, "utf-8")
    const products: QualigensProduct[] = JSON.parse(jsonData)
    return products
  } catch (error) {
    console.error("Error reading qualigens-products.json:", error)
    return []
  }
}
