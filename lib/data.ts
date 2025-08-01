export interface Product {
  id: string
  name: string
  description: string
  price: number
  unit?: string
  imageUrl: string
  category: string
  brand: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl: string
}

const products: Product[] = [
  {
    id: "chem-101",
    name: "Sulfuric Acid (H2SO4)",
    description: "High purity concentrated sulfuric acid for industrial and laboratory use.",
    price: 1250.0,
    unit: "5L",
    imageUrl: "/images/sulfuric-acid.png",
    category: "bulk-chemicals",
    brand: "Fisher Chemical",
  },
  {
    id: "chem-102",
    name: "Sodium Hydroxide (NaOH) Pellets",
    description: "Laboratory grade sodium hydroxide pellets, 99% purity.",
    price: 450.0,
    unit: "500g",
    imageUrl: "/images/sodium-hydroxide.png",
    category: "bulk-chemicals",
    brand: "Rankem",
  },
  {
    id: "chem-103",
    name: "Hydrochloric Acid (HCl)",
    description: "Analytical reagent grade hydrochloric acid, 37% concentration.",
    price: 780.0,
    unit: "2.5L",
    imageUrl: "/images/hydrochloric-acid.png",
    category: "bulk-chemicals",
    brand: "Thermo Scientific",
  },
  {
    id: "chem-104",
    name: "Acetone (C3H6O)",
    description: "Pure acetone solvent for various laboratory applications.",
    price: 320.0,
    unit: "1L",
    imageUrl: "/images/acetone.png",
    category: "bulk-chemicals",
    brand: "Qualigens",
  },
  {
    id: "chem-105",
    name: "Methanol (CH3OH)",
    description: "HPLC grade methanol, ideal for chromatography.",
    price: 650.0,
    unit: "2.5L",
    imageUrl: "/images/methanol.png",
    category: "bulk-chemicals",
    brand: "Acros Organics",
  },
  {
    id: "chem-106",
    name: "Potassium Permanganate (KMnO4)",
    description: "Crystalline potassium permanganate, ACS grade.",
    price: 280.0,
    unit: "100g",
    imageUrl: "/images/potassium-permanganate.png",
    category: "bulk-chemicals",
    brand: "Fisher Chemical",
  },
  {
    id: "lab-201",
    name: "Borosilicate Glass Beaker Set",
    description: "Set of 5 heat-resistant borosilicate glass beakers (50ml, 100ml, 250ml, 500ml, 1000ml).",
    price: 1500.0,
    unit: "set",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "laboratory-supplies",
    brand: "Borosil",
  },
  {
    id: "lab-202",
    name: "Petri Dish (Sterile)",
    description: "Sterile polystyrene petri dishes for microbiology, 90mm diameter.",
    price: 800.0,
    unit: "pack of 10",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "laboratory-supplies",
    brand: "Corning",
  },
  {
    id: "lab-203",
    name: "Filter Paper (Qualitative)",
    description: "Qualitative filter paper, Grade 1, 110mm diameter.",
    price: 300.0,
    unit: "pack of 100",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "laboratory-supplies",
    brand: "Whatman",
  },
  {
    id: "lab-204",
    name: "Microscope Slides (Plain)",
    description: "Plain microscope slides, pre-cleaned, 76x26mm.",
    price: 250.0,
    unit: "box of 50",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "laboratory-supplies",
    brand: "Duran Group",
  },
  {
    id: "inst-301",
    name: "Digital pH Meter",
    description: "Portable digital pH meter with automatic temperature compensation.",
    price: 4500.0,
    unit: "unit",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "scientific-instruments",
    brand: "IKA",
  },
  {
    id: "inst-302",
    name: "Magnetic Stirrer with Hot Plate",
    description: "Laboratory magnetic stirrer with integrated heating plate.",
    price: 8500.0,
    unit: "unit",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "scientific-instruments",
    brand: "Superlab",
  },
  {
    id: "inst-303",
    name: "Analytical Balance (0.1mg precision)",
    description: "High precision analytical balance for accurate weighing in laboratories.",
    price: 35000.0,
    unit: "unit",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "scientific-instruments",
    brand: "Troemner",
  },
  {
    id: "inst-304",
    name: "Laboratory Centrifuge",
    description: "Benchtop centrifuge for sample separation, max 4000 RPM.",
    price: 12000.0,
    unit: "unit",
    imageUrl: "/placeholder.svg?height=200&width=200",
    category: "scientific-instruments",
    brand: "Biotek",
  },
]

const brands: Brand[] = [
  {
    id: "fisher-chemical",
    name: "Fisher Chemical",
    slug: "fisher-chemical",
    logoUrl: "/images/logo-fisher-chemical.png",
  },
  { id: "reagecon", name: "Reagecon", slug: "reagecon", logoUrl: "/images/logo-reagecon.png" },
  {
    id: "thermo-scientific",
    name: "Thermo Scientific",
    slug: "thermo-scientific",
    logoUrl: "/images/logo-thermo-scientific.png",
  },
  { id: "rankem", name: "Rankem", slug: "rankem", logoUrl: "/images/logo-rankem.png" },
  { id: "acros-organics", name: "Acros Organics", slug: "acros-organics", logoUrl: "/images/logo-acros-organics.png" },
  { id: "remel", name: "Remel", slug: "remel", logoUrl: "/images/logo-remel.png" },
  {
    id: "fisher-bioreagents",
    name: "Fisher BioReagents",
    slug: "fisher-bioreagents",
    logoUrl: "/images/logo-fisher-bioreagents.png",
  },
  { id: "jtbaker", name: "J.T.Baker", slug: "jtbaker", logoUrl: "/images/logo-jtbaker.png" },
  { id: "decon", name: "Decon", slug: "decon", logoUrl: "/images/logo-decon.png" },
  { id: "qualigens", name: "Qualigens", slug: "qualigens", logoUrl: "/images/logo-qualigens.png" },
  { id: "microbiologics", name: "Microbiologics", slug: "microbiologics", logoUrl: "/images/logo-microbiologics.png" },
  { id: "kimberly-clark", name: "Kimberly-Clark", slug: "kimberly-clark", logoUrl: "/images/logo-kimberly-clark.png" },
  { id: "riviera", name: "Riviera", slug: "riviera", logoUrl: "/images/logo-riviera.png" },
  { id: "em-techcolor", name: "EM Techcolor", slug: "em-techcolor", logoUrl: "/images/logo-em-techcolor.png" },
  { id: "duran-group", name: "Duran Group", slug: "duran-group", logoUrl: "/images/logo-duran-group.png" },
  { id: "troemner", name: "Troemner", slug: "troemner", logoUrl: "/images/logo-troemner.png" },
  {
    id: "johnsondiversey",
    name: "JohnsonDiversey",
    slug: "johnsondiversey",
    logoUrl: "/images/logo-johnsondiversey.png",
  },
  { id: "oxoid", name: "Oxoid", slug: "oxoid", logoUrl: "/images/logo-oxoid.png" },
  { id: "biotek", name: "Biotek", slug: "biotek", logoUrl: "/images/logo-biotek.png" },
  { id: "corning", name: "Corning", slug: "corning", logoUrl: "/images/logo-corning.png" },
  { id: "plas-labs", name: "Plas-Labs", slug: "plas-labs", logoUrl: "/images/logo-plas-labs.png" },
  { id: "lonza", name: "Lonza", slug: "lonza", logoUrl: "/images/logo-lonza.png" },
  { id: "dupont", name: "DuPont", slug: "dupont", logoUrl: "/images/logo-dupont.png" },
  { id: "maybridge", name: "Maybridge", slug: "maybridge", logoUrl: "/images/logo-maybridge.png" },
  { id: "labconco", name: "Labconco", slug: "labconco", logoUrl: "/images/logo-labconco.png" },
  { id: "superlab", name: "Superlab", slug: "superlab", logoUrl: "/images/logo-superlab.png" },
  { id: "ika", name: "IKA", slug: "ika", logoUrl: "/images/logo-ika.png" },
  { id: "borosil", name: "Borosil", slug: "borosil", logoUrl: "/images/logo-borosil.png" },
  { id: "whatman", name: "Whatman", slug: "whatman", logoUrl: "/images/logo-whatman.png" },
  { id: "avarice", name: "Avarice", slug: "avarice", logoUrl: "/images/logo-avarice.png" },
]

const clientLogos: string[] = [
  "/images/client-logo-1.png",
  "/images/client-logo-2.png",
  "/images/client-logo-3.png",
  "/images/logo-fisher-chemical.png",
  "/images/logo-thermo-scientific.png",
  "/images/logo-borosil.png",
  "/images/logo-whatman.png",
]

export function getProducts(): Product[] {
  return products
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category)
}

export function getProductsByBrand(brandName: string): Product[] {
  return products.filter((product) => product.brand === brandName)
}

export function getFeaturedProducts(): Product[] {
  // Return a subset of products as featured
  return products.slice(0, 4)
}

export function getBrands(): Brand[] {
  return brands
}

export function getBrandByName(slug: string): Brand | undefined {
  return brands.find((brand) => brand.slug === slug)
}

export function getClientLogos(): string[] {
  return clientLogos
}

export function searchProducts(query: string): Product[] {
  const lowerCaseQuery = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.description.toLowerCase().includes(lowerCaseQuery) ||
      product.brand.toLowerCase().includes(lowerCaseQuery) ||
      product.category.toLowerCase().includes(lowerCaseQuery),
  )
}
