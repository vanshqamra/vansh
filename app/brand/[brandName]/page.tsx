"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { labSupplyBrands } from "@/lib/data"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import qualigensProducts from "@/lib/qualigens-products"
import rankemProducts from "@/lib/rankem_products.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

if (labSupplyBrands.rankem) {
  labSupplyBrands.rankem.name = "Avantor"
}

type Props = { params: { brandName: string } }

type Variant = {
  [key: string]: string
}

type GroupedProduct = {
  category: string
  title: string
  description?: string
  specs_headers: string[]
  variants: Variant[]
}

export default function BrandPage({ params }: Props) {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]
  if (!brand) notFound()

  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 50

  const normalizeKey = (key: string) => key?.toLowerCase().replace(/[^a-z0-9]/gi, "").trim()

  const headerKeyMap: Record<string, string[]> = {
    "Product Code": ["code", "product_code"],
    "Diameter mm": ["diameter_mm"],
    "Quantity Per Case": ["quantity_per_case"],
    "Price /Piece": ["price"],
    "Capacity ml": ["capacity_ml", "capacity"],
    "Graduation Interval ml": ["interval_ml", "graduation_interval_ml"],
    "Tolerance + ml": ["tolerance_ml", "tolerance"],
    "Approx O.D. x Length": ["od_x_length"],
    "Tolerance ± ml": ["tolerance_ml", "tolerance"],
    "Graduation Interval": ["interval_ml", "graduation_interval_ml"],
    "Tolerance": ["tolerance_ml", "tolerance"],
    "Approx Height": ["approx_height", "height"],
    "Stopper Size": ["stopper_size"],
    "Thread Specification": ["thread_specification"],
    "Max. Body Dia x Height": ["max_dia_height"],
    "Size of I/C Stopper": ["ic_stopper_size"],
    "Capacity Tolerance + ml": ["capacity_tolerance_ml"],
    "Approx O.D. x Height": ["od_x_height"],
    "Dia of Disc mm": ["dia_of_disc_mm", "dia_disc"],
    "Neck Stopper Size": ["neck_stopper_size"],
    "Approx Height Neck Stopper Size": ["approx_height_neck_stopper_size"],
    "Capacity Tolerance + ml Max. Body Dia x Height": ["capacity_tolerance_max_body_dia_height"],
    "Cat No": ["catno", "cat_no"],
    "List Price 2025(INR)": ["listprice", "price"]
  }

  let grouped: GroupedProduct[] = []

  const parseGroups = (source: any[]) => {
    return source.map((group: any, idx: number) => {
      const specs = group.specs_headers || []
      const variants = (group.variants || []).map((variant: Variant) => {
        const mapped: Variant = {}
        Object.entries(variant).forEach(([k, v]) => {
          mapped[k] = String(v)
          mapped[normalizeKey(k)] = String(v)
        })
        const row: Variant = {}
        specs.forEach(header => {
          const norm = normalizeKey(header)
          const matchKeys = headerKeyMap[header] || [norm]
          row[header] = matchKeys.map(k => mapped[k]).find(val => val) || ""
        })
        return row
      })
      return {
        category: group.category?.trim() || `Group ${idx + 1}`,
        title: group.title?.trim() || `Group ${idx + 1}`,
        description: group.description || "",
        specs_headers: specs,
        variants: variants
      }
    }).filter(g => g.variants.length > 0)
  }

  if (brandKey === "borosil") {
    grouped = parseGroups(borosilProducts)
  } else if (brandKey === "qualigens") {
    grouped = [
      {
        category: "Qualigens",
        title: "Qualigens Products",
        description: "",
        specs_headers: ["Product Code", "Pack Size", "Price"],
        variants: qualigensProducts.map((p: any) => ({
          "Product Code": p.code || "",
          "Pack Size": p.packSize || "",
          "Price": p.price || ""
        }))
      }
    ]
  } else if (brandKey === "rankem") {
    const allVariants = rankemProducts[0]?.variants || []
    const specs = rankemProducts[0]?.specs_headers || []
    const paginatedVariants = allVariants.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    ).map((variant: Variant) => {
      const mapped: Variant = {}
      Object.entries(variant).forEach(([k, v]) => {
        mapped[k] = String(v)
        mapped[normalizeKey(k)] = String(v)
      })
      const row: Variant = {}
      specs.forEach(header => {
        const norm = normalizeKey(header)
        const matchKeys = headerKeyMap[header] || [norm]
        row[header] = matchKeys.map(k => mapped[k]).find(val => val) || ""
      })
      return row
    })

    grouped = [{
      category: "Avantor",
      title: "Avantor Products",
      description: "",
      specs_headers: specs,
      variants: paginatedVariants
    }]
  }

  // ✅ FIXED SEARCH LOGIC
  const filtered = grouped.map(group => {
    const filteredVariants = group.variants.filter(variant =>
      Object.values(variant).some(val =>
        String(val || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    return {
      ...group,
      variants: filteredVariants
    }
  }).filter(group =>
    group.variants.length > 0 ||
    group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = brandKey === "rankem"
    ? Math.ceil((rankemProducts[0]?.variants?.length || 0) / productsPerPage)
    : Math.ceil(filtered.length / productsPerPage)

  const handleAdd = (variant: Variant, group: GroupedProduct) => {
    if (!isLoaded) {
      toast({ title: "Loading...", description: "Please wait", variant: "destructive" })
      return
    }

    const priceKey = group.specs_headers.find(h => h.toLowerCase().includes("price")) || ""
    const priceString = String(variant[priceKey] || "")
    const numericPrice = parseFloat(priceString.replace(/[^\d.]/g, ""))

    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast({ title: "Invalid Price", description: "Cannot add invalid price.", variant: "destructive" })
      return
    }

    const nameParts = [
      `Cat No: ${variant["Cat No"] || variant["Product Code"] || variant["code"] || ""}`,
      ...group.specs_headers.map(h => `${h}: ${variant[h] || "—"}`)
    ]

    try {
      addItem({
        id: variant["Product Code"] || variant["code"] || variant["Cat No"] || "",
        name: nameParts.join("\n"),
        price: numericPrice,
        brand: brand.name,
        category: group.category,
        packSize: variant["Pack Size"] || variant["capacity_ml"] || "",
        material: ""
      })
      toast({ title: "Added to Cart", description: `${variant["Description"] || group.title} added successfully.` })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to add item.", variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <Input
        type="text"
        placeholder="Search products..."
        className="mb-8 max-w-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filtered.map((group, index) => (
        <div key={`${group.title}-${index}`} className="mb-12">
          <h3 className="text-md uppercase tracking-wider text-gray-500 mb-1">{group.category}</h3>
          <h2 className="text-xl font-bold text-blue-700 mb-2">{group.title}</h2>
          {group.description && (
            <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{group.description}</p>
          )}

          <div className="overflow-auto border rounded mb-4">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-xs uppercase font-semibold">
                <tr>
                  {group.specs_headers.map((header, i) => (
                    <th key={i} className="px-3 py-2 whitespace-nowrap">{header}</th>
                  ))}
                  <th className="px-3 py-2 whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                {group.variants.map((variant, i) => (
                  <tr key={i} className="border-t">
                    {group.specs_headers.map((key, j) => (
                      <td key={j} className="px-3 py-2 whitespace-nowrap">{variant[key] || "—"}</td>
                    ))}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Button
                        onClick={() => handleAdd(variant, group)}
                        disabled={!isLoaded}
                        className="text-xs"
                      >
                        Add to Cart
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8 overflow-x-auto max-w-full">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  )
}
