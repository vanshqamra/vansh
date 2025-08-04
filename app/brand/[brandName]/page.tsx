"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { labSupplyBrands } from "@/lib/data"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import qualigensProducts from "@/lib/qualigens-products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Types

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
  const productsPerPage = 12

  let grouped: GroupedProduct[] = []

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
    "Capacity Tolerance + ml Max. Body Dia x Height": ["capacity_tolerance_max_body_dia_height"]
  }

  if (brandKey === "borosil") {
    grouped = borosilProducts.map((group, idx) => {
      const specs = group.specs_headers || []

      const variants = (group.variants || []).map((variant: Variant) => {
        const mapped: Variant = {}
        Object.entries(variant).forEach(([k, v]) => {
          mapped[k] = String(v)
          mapped[normalizeKey(k)] = String(v)
        })
        return mapped
      })

      const displayVariants = variants.map((v: Variant) => {
        const row: Variant = {}
        specs.forEach(header => {
          const norm = normalizeKey(header)
          const matchKeys = headerKeyMap[header] || [norm]
          row[header] = matchKeys.map(k => v[k]).find(val => val) || ""
        })
        return row
      })

      const title = group.product?.trim() || group.title?.trim() || ""
      const category = group.category?.trim() || ""
      const fallbackTitle = title || category || `Product Group ${idx + 1}`

      return {
        category,
        title: fallbackTitle,
        description: group.description?.trim() || "",
        specs_headers: specs,
        variants: displayVariants,
      }
    }).filter((g) => g.variants.length > 0)
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
          "Price": p.price || "",
        })),
      },
    ]
  }

  const filtered = grouped.filter((group) => {
    const term = searchTerm.toLowerCase()
    return (
      group.title?.toLowerCase().includes(term) ||
      group.variants.some((v) =>
        Object.values(v).some(val => String(val || "").toLowerCase().includes(term))
      )
    )
  })

  const totalPages = Math.ceil(filtered.length / productsPerPage)
  const paginatedGroups = filtered.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

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

    try {
      addItem({
        id: variant["Product Code"] || variant["code"] || "",
        name: `${group.title}\n${group.description || ""}\n${group.specs_headers.map(h => `${h}: ${variant[h] || "—"}`).join(" | ")}`,
        price: numericPrice,
        brand: brand.name,
        category: group.category,
        packSize: variant["Pack Size"] || variant["capacity_ml"] || "",
        material: "",
      })
      toast({ title: "Added to Cart", description: `${group.title} added successfully.` })
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

      {paginatedGroups.map((group, index) => (
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
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
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
