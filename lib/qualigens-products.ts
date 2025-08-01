import qualigensProductsData from "./qualigens-products.json"

export interface QualigensProduct {
  "Sr. No.": number
  "Product Name": string
  "Pack Size": string
  "HSN Code": string
  "CAS No.": string
  "Cat. No.": string
  "Price (INR)": number
}

export function getQualigensProducts(): QualigensProduct[] {
  return qualigensProductsData as QualigensProduct[]
}

export function getQualigensProductByCatNo(catNo: string): QualigensProduct | undefined {
  return qualigensProductsData.find((product) => product["Cat. No."] === catNo) as QualigensProduct | undefined
}
