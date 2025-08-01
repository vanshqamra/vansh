import type { Product } from "@/components/product-grid"
import { promises as fs } from "fs"
import path from "path"

// Define a type for brands if not already defined
export interface Brand {
  id: string
  name: string
  logo: string
  link: string
}

// Dummy data for brands (replace with actual database fetching)
export const brands: Brand[] = [
  { id: "qualigens", name: "Qualigens", logo: "/images/logo-qualigens.png", link: "/brand/qualigens" },
  {
    id: "fisher-chemical",
    name: "Fisher Chemical",
    logo: "/images/logo-fisher-chemical.png",
    link: "/brand/fisher-chemical",
  },
  { id: "reagecon", name: "Reagecon", logo: "/images/logo-reagecon.png", link: "/brand/reagecon" },
  {
    id: "thermo-scientific",
    name: "Thermo Scientific",
    logo: "/images/logo-thermo-scientific.png",
    link: "/brand/thermo-scientific",
  },
  { id: "rankem", name: "Rankem", logo: "/images/logo-rankem.png", link: "/brand/rankem" },
  {
    id: "acros-organics",
    name: "Acros Organics",
    logo: "/images/logo-acros-organics.png",
    link: "/brand/acros-organics",
  },
  { id: "remel", name: "Remel", logo: "/images/logo-remel.png", link: "/brand/remel" },
  {
    id: "fisher-bioreagents",
    name: "Fisher Bioreagents",
    logo: "/images/logo-fisher-bioreagents.png",
    link: "/brand/fisher-bioreagents",
  },
  { id: "jtbaker", name: "J.T.Baker", logo: "/images/logo-jtbaker.png", link: "/brand/jtbaker" },
  { id: "decon", name: "Decon", logo: "/images/logo-decon.png", link: "/brand/decon" },
  {
    id: "microbiologics",
    name: "Microbiologics",
    logo: "/images/logo-microbiologics.png",
    link: "/brand/microbiologics",
  },
  {
    id: "kimberly-clark",
    name: "Kimberly-Clark",
    logo: "/images/logo-kimberly-clark.png",
    link: "/brand/kimberly-clark",
  },
  { id: "riviera", name: "Riviera", logo: "/images/logo-riviera.png", link: "/brand/riviera" },
  { id: "em-techcolor", name: "EM Techcolor", logo: "/images/logo-em-techcolor.png", link: "/brand/em-techcolor" },
  { id: "duran-group", name: "Duran Group", logo: "/images/logo-duran-group.png", link: "/brand/duran-group" },
  { id: "troemner", name: "Troemner", logo: "/images/logo-troemner.png", link: "/brand/troemner" },
  {
    id: "johnsondiversey",
    name: "JohnsonDiversey",
    logo: "/images/logo-johnsondiversey.png",
    link: "/brand/johnsondiversey",
  },
  { id: "oxoid", name: "Oxoid", logo: "/images/logo-oxoid.png", link: "/brand/oxoid" },
  { id: "biotek", name: "Biotek", logo: "/images/logo-biotek.png", link: "/brand/biotek" },
  { id: "corning", name: "Corning", logo: "/images/logo-corning.png", link: "/brand/corning" },
  { id: "plas-labs", name: "Plas-Labs", logo: "/images/logo-plas-labs.png", link: "/brand/plas-labs" },
  { id: "lonza", name: "Lonza", logo: "/images/logo-lonza.png", link: "/brand/lonza" },
  { id: "dupont", name: "DuPont", logo: "/images/logo-dupont.png", link: "/brand/dupont" },
  { id: "maybridge", name: "Maybridge", logo: "/images/logo-maybridge.png", link: "/brand/maybridge" },
  { id: "labconco", name: "Labconco", logo: "/images/logo-labconco.png", link: "/brand/labconco" },
  { id: "superlab", name: "Superlab", logo: "/images/logo-superlab.png", link: "/brand/superlab" },
  { id: "ika", name: "IKA", logo: "/images/logo-ika.png", link: "/brand/ika" },
  { id: "borosil", name: "Borosil", logo: "/images/logo-borosil.png", link: "/brand/borosil" },
  { id: "whatman", name: "Whatman", logo: "/images/logo-whatman.png", link: "/brand/whatman" },
  { id: "avarice", name: "Avarice", logo: "/images/logo-avarice.png", link: "/brand/avarice" },
]

// Dummy data for offers (replace with actual database fetching)
const offersData = [
  {
    title: "Free Shipping on Orders Over ₹5000",
    description: "Get your chemicals delivered right to your doorstep without any shipping charges.",
    image: "/images/offer-shipping.png",
    alt: "Shipping box",
    ctaText: "Shop Now",
    ctaLink: "/products",
  },
  {
    title: "20% Off on Selected Solvents",
    description: "Limited time offer on high-purity solvents. Stock up and save!",
    image: "/images/offer-solvents.png",
    alt: "Solvent bottles",
    ctaText: "View Solvents",
    ctaLink: "/products/bulk-chemicals?category=solvents",
  },
  {
    title: "Buy 2 Get 1 Free on Lab Glassware",
    description: "Expand your lab with our durable and precise glassware. Offer applies to selected items.",
    image: "/images/offer-glassware.png",
    alt: "Lab glassware",
    ctaText: "Explore Glassware",
    ctaLink: "/products/laboratory-supplies?category=labware",
  },
  {
    title: "Special Discount on Borosil Glassware",
    description: "Exclusive prices on the entire range of Borosil laboratory glassware.",
    image: "/images/offer-borosil-glassware.png",
    alt: "Borosil glassware",
    ctaText: "Shop Borosil",
    ctaLink: "/brand/borosil",
  },
  {
    title: "Whatman Filters - Flat 15% Off",
    description: "Premium filtration solutions at an unbeatable price. Perfect for all your lab needs.",
    image: "/images/offer-whatman-filters.png",
    alt: "Whatman filters",
    ctaText: "Get Filters",
    ctaLink: "/brand/whatman",
  },
  {
    title: "Safety Aprons - 10% Off",
    description: "Ensure safety in your lab with our high-quality chemical-resistant aprons.",
    image: "/images/offer-apron.png",
    alt: "Safety apron",
    ctaText: "Buy Aprons",
    ctaLink: "/products/laboratory-supplies?category=safety",
  },
]

export async function getProducts(): Promise<Product[]> {
  try {
    const filePath = path.join(process.cwd(), "lib", "products.json")
    const jsonData = await fs.readFile(filePath, "utf-8")
    const products: Product[] = JSON.parse(jsonData)
    return products
  } catch (error) {
    console.error("Error reading products.json:", error)
    return []
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  // In a real application, you would fetch this from a database
  // For now, return a subset of allProducts
  const allProducts = await getProducts()
  return allProducts.slice(0, 4)
}

export async function getBulkChemicals(): Promise<Product[]> {
  const allProducts = await getProducts()
  return allProducts.filter(
    (product) => product.category === "Acids" || product.category === "Salts" || product.category === "Solvents",
  )
}

export async function getLaboratorySupplies(): Promise<Product[]> {
  const allProducts = await getProducts()
  return allProducts.filter(
    (product) => product.category === "Labware" || product.category === "Filtration" || product.category === "Safety",
  )
}

export async function getScientificInstruments(): Promise<Product[]> {
  const allProducts = await getProducts()
  return allProducts.filter((product) => product.category === "Equipment")
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const allProducts = await getProducts()
  return allProducts.filter((product) => product.category === category)
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const allProducts = await getProducts()
  return allProducts.filter((product) => product.brand === brand)
}

export async function getProductsBySearch(query: string): Promise<Product[]> {
  const allProducts = await getProducts()
  const lowerCaseQuery = query.toLowerCase()
  return allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.casNumber?.toLowerCase().includes(lowerCaseQuery) ||
      product.brand.toLowerCase().includes(lowerCaseQuery) ||
      product.category.toLowerCase().includes(lowerCaseQuery),
  )
}

export async function getOffers() {
  return offersData
}
