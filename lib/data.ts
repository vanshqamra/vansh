export const labSupplyBrands = {
  qualigens: {
    name: "Qualigens",
    description: "High-quality laboratory chemicals and reagents",
    logo: "/images/logo-qualigens.png",
    categories: ["Analytical Reagents", "Solvents", "Acids & Bases", "Salts"],
  },
  borosil: {
    name: "Borosil",
    description: "Premium laboratory glassware and equipment",
    logo: "/images/logo-borosil.png",
    categories: ["Glassware", "Laboratory Equipment", "Measuring Instruments"],
  },
  whatman: {
    name: "Whatman",
    description: "Filtration and separation products",
    logo: "/images/logo-whatman.png",
    categories: ["Filter Papers", "Membranes", "Syringe Filters", "Separation Media"],
  },
  rankem: {
    name: "Rankem",
    description: "Analytical and laboratory chemicals",
    logo: "/images/logo-rankem.png",
    categories: ["Analytical Reagents", "HPLC Solvents", "Buffer Solutions"],
  },
  jtbaker: {
    name: "J.T. Baker",
    description: "High-purity chemicals and solvents",
    logo: "/images/logo-jtbaker.png",
    categories: ["HPLC Grade Solvents", "Analytical Reagents", "Acids", "Bases"],
  },
}

export const bulkChemicals = [
  {
    id: "1",
    name: "Sulfuric Acid 98%",
    brand: "Qualigens",
    category: "Acids",
    price: 2500,
    unit: "25L",
    cas: "7664-93-9",
    purity: "98%",
    image: "/images/product-acid.png",
  },
  {
    id: "2",
    name: "Sodium Hydroxide Pellets",
    brand: "Rankem",
    category: "Bases",
    price: 1800,
    unit: "25kg",
    cas: "1310-73-2",
    purity: "99%",
    image: "/images/product-salt.png",
  },
  {
    id: "3",
    name: "Ethanol Absolute",
    brand: "J.T. Baker",
    category: "Solvents",
    price: 3200,
    unit: "20L",
    cas: "64-17-5",
    purity: "99.9%",
    image: "/images/product-solvent.png",
  },
]

export const laboratorySupplies = [
  {
    id: "4",
    name: "Borosilicate Glass Beakers Set",
    brand: "Borosil",
    category: "Glassware",
    price: 1200,
    unit: "Set of 6",
    description: "High-quality borosilicate glass beakers",
    image: "/images/product-glassware.png",
  },
  {
    id: "5",
    name: "Whatman Filter Paper Grade 1",
    brand: "Whatman",
    category: "Filtration",
    price: 450,
    unit: "100 sheets",
    description: "Standard grade qualitative filter paper",
    image: "/images/product-filter.png",
  },
]

export const scientificInstruments = [
  {
    id: "6",
    name: "Digital pH Meter",
    brand: "Borosil",
    category: "Measuring Instruments",
    price: 8500,
    unit: "1 piece",
    description: "High-precision digital pH meter with calibration solutions",
    image: "/images/product-instrument.png",
  },
]
