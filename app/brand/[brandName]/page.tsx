// Final corrected BrandPage.tsx
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

const normalizeKey = (key) => key?.toLowerCase().replace(/[^a-z0-9]/gi, "").trim()

export default function BrandPage({ params }) {
  const brandKey = params.brandName
  const brand = labSupplyBrands[brandKey]
  if (!brand) notFound()

  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 50

  const headerKeyMap = {
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

  let grouped = []

  if (brandKey === "borosil") {
    const flat = []
    borosilProducts.forEach((group, idx) => {
      const specs = group.specs_headers || []
      
      
      const resolvedTitle = group.product?.trim() || group.title?.trim() || `Unnamed Borosil Product Group ${idx + 1}`;
      const resolvedCategory = group.product?.trim() || group.category?.trim() || resolvedTitle;
      const baseMeta = {
        title: resolvedTitle,
        category: resolvedCategory,
        specs_headers: specs,
        description: group.description || ""
      }
      ;(group.variants || []).forEach(v => flat.push({ variant: v, groupMeta: baseMeta }))
    })
    const filtered = flat.filter(({ variant, groupMeta }) => {
      const variantMatch = Object.values(variant).some(val => val.toLowerCase().includes(searchTerm.toLowerCase()))
      const metaMatch = groupMeta.title?.toLowerCase().includes(searchTerm.toLowerCase()) || groupMeta.category?.toLowerCase().includes(searchTerm.toLowerCase()) || groupMeta.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return variantMatch || metaMatch
    }))
    )
    const paginated = filtered.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
    const groupedMap = {}
    paginated.forEach(({ variant, groupMeta }) => {
      
      
      const key = `${groupMeta.category}-${groupMeta.title}`;
      if (!groupedMap[key]) {
        groupedMap[key] = {
          ...groupMeta,
          variants: [] }
      }
      const mapped = {}
      Object.entries(variant).forEach(([k, v]) => {
        mapped[k] = String(v)
        mapped[normalizeKey(k)] = String(v)
      })
      const row = {}
      groupMeta.specs_headers.forEach(header => {
        const keys = headerKeyMap[header] || [normalizeKey(header)]
        row[header] = keys.map(k => mapped[k]).find(val => val) || ""
      })
      groupedMap[key].variants.push(row)
    })
    grouped = Object.values(groupedMap)
  } else if (brandKey === "rankem") {
    const flat = []
    rankemProducts.forEach(group => {
      (group.variants || []).forEach(variant => flat.push({ variant, groupMeta: group }))
    })
    const paginated = flat.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
    const groupedMap = {}
    paginated.forEach(({ variant, groupMeta }, idx) => {
      const key = groupMeta.title || groupMeta.category || `Group-${idx}`
      if (!groupedMap[key]) {
        groupedMap[key] = {
          category: groupMeta.category || key,
          title: groupMeta.title || key,
          description: groupMeta.description || "",
          specs_headers: groupMeta.specs_headers || [],
          variants: []
        }
      }
      const mapped = {}
      Object.entries(variant).forEach(([k, v]) => {
        mapped[k] = String(v)
        mapped[normalizeKey(k)] = String(v)
      })
      const row = {}
      groupedMap[key].specs_headers.forEach(header => {
        const keys = headerKeyMap[header] || [normalizeKey(header)]
        row[header] = keys.map(k => mapped[k]).find(val => val) || ""
      })
      groupedMap[key].variants.push(row)
    })
    grouped = Object.values(groupedMap)
  } else if (brandKey === "qualigens") {
    grouped = [
      {
        category: "Qualigens",
        title: "Qualigens Products",
        description: "",
        specs_headers: ["Product Code", "Pack Size", "Price"],
        variants: qualigensProducts.map(p => ({
          "Product Code": p.code || "",
          "Pack Size": p.packSize || "",
          "Price": p.price || ""
        }))
      }
    ]
  }

  const totalPages = brandKey === "rankem"
    ? Math.ceil(rankemProducts.reduce((sum, g) => sum + (g.variants?.length || 0), 0) / productsPerPage)
    : brandKey === "borosil"
      ? Math.ceil(borosilProducts.reduce((sum, g) => sum + (g.variants?.length || 0), 0) / productsPerPage)
      : 1

  const handleAdd = (variant, group) => {
    if (!isLoaded) return toast({ title: "Loading...", description: "Please wait", variant: "destructive" })
    const priceKey = group.specs_headers.find(h => h.toLowerCase().includes("price")) || ""
    const price = parseFloat((variant[priceKey] || "").replace(/[^\d.]/g, ""))
    if (isNaN(price) || price <= 0) return toast({ title: "Invalid Price", description: "Cannot add invalid price.", variant: "destructive" })
    const name = [`Cat No: ${variant["Cat No"] || variant["Product Code"] || variant["code"] || ""}`,
      ...group.specs_headers.map(h => `${h}: ${variant[h] || "—"}`)
    ].join("\n")
    addItem({
      id: variant["Product Code"] || variant["code"] || variant["Cat No"] || "",
      name,
      price,
      brand: brand.name,
      category: group.category,
      packSize: variant["Pack Size"] || variant["capacity_ml"] || "",
      material: ""
    })
    toast({ title: "Added to Cart", description: `${variant["Description"] || group.title} added successfully.` })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <Input type="text" placeholder="Search products..." className="mb-8 max-w-md" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      {grouped.map((group, index) => (
        <div key={`${group.category}-${group.title}-${index}`} className="mb-12">
          <h3 className="text-md uppercase tracking-wider text-gray-500 mb-1">{group.category}</h3>
          <h2 className="text-xl font-bold text-blue-700 mb-2">{group.title}</h2>
          {group.description && <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{group.description}</p>}
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
                      <Button onClick={() => handleAdd(variant, group)} disabled={!isLoaded} className="text-xs">Add to Cart</Button>
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
          <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Prev</Button>
          <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}
      {grouped.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  )
}
