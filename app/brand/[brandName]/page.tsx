"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { labSupplyBrands } from "@/lib/data"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import qualigensProductsRaw from "@/lib/qualigens-products.json"
import rankemProducts from "@/lib/rankem_products.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/app/context/search-context"

if (labSupplyBrands.rankem) labSupplyBrands.rankem.name = "Avantor"

const normalizeKey = (key) =>
  key
    ?.toLowerCase()
    .replace(/[^a-z0-9]/gi, "")
    .trim()

export default function BrandPage({ params }) {
  const brandKey = params.brandName
  const brand = labSupplyBrands[brandKey]
  if (!brand) notFound()

  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()
  const { searchQuery, setSearchQuery } = useSearch()
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 50

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  let grouped = []

  const qualigensProducts = (() => {
    try {
      // ✅ FIXED: Handle JSON module import correctly for build environments
      const rawQualigensData = qualigensProductsRaw.default || qualigensProductsRaw
      const qualigensProducts = Array.isArray(rawQualigensData?.data)
        ? rawQualigensData.data
        : Array.isArray(rawQualigensData)
          ? rawQualigensData
          : []
      return qualigensProducts
    } catch (error) {
      console.error("Error processing Qualigens products:", error)
      return []
    }
  })()

  if (brandKey === "borosil") {
    const flat = []
    borosilProducts.forEach((group, idx) => {
      const variants = group.variants || []
      const specs =
        Array.isArray(group.specs_headers) && group.specs_headers.length > 0
          ? group.specs_headers
          : Object.keys(variants[0] || {})

      const resolvedTitle =
        group.product?.trim() ||
        group.title?.trim() ||
        group.category?.trim() ||
        group.description?.split("\n")[0]?.trim() ||
        `Group ${idx + 1}`

      const resolvedCategory = group.category?.trim() || group.product?.trim() || resolvedTitle

      const baseMeta = {
        ...group,
        title: group.title?.toLowerCase().startsWith("untitled group") ? resolvedTitle : group.title || resolvedTitle,
        category: group.category?.toLowerCase().startsWith("untitled group")
          ? resolvedCategory
          : group.category || resolvedCategory,
        specs_headers: specs,
        description: group.description || "",
      }

      variants.forEach((v) => flat.push({ variant: v, groupMeta: baseMeta }))
    })

    const filtered = flat.filter(({ variant, groupMeta }) => {
      const query = searchQuery.toLowerCase()
      const variantMatch = Object.values(variant).some((val) =>
        String(val).toLowerCase().includes(query),
      )
      const metaMatch =
        groupMeta.title?.toLowerCase().includes(query) ||
        groupMeta.category?.toLowerCase().includes(query) ||
        groupMeta.description?.toLowerCase().includes(query)
      return variantMatch || metaMatch
    })

    const paginated = filtered.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

    const groupedMap = {}
    paginated.forEach(({ variant, groupMeta }) => {
      if (!groupMeta.specs_headers?.length) return

      const key = `${groupMeta.category}-${groupMeta.title}`
      if (!groupedMap[key]) groupedMap[key] = { ...groupMeta, variants: [] }

      const row = {}
      groupMeta.specs_headers.forEach((header) => {
        const normKey = header.toLowerCase()
        row[header] = variant[header] || variant[normKey] || ""
      })

      groupedMap[key].variants.push(row)
    })

    grouped = Object.values(groupedMap).filter((g) => g.variants.length > 0)
  } else if (brandKey === "rankem") {
    const flat = []
    rankemProducts.forEach((group, idx) => {
      const cleanTitle = group.title?.startsWith("Table")
        ? group.category || `Group-${idx}`
        : group.title || group.category || `Group-${idx}`
      const groupMeta = {
        title: cleanTitle,
        category: group.category || cleanTitle,
        description: group.description || "",
        specs_headers: group.specs_headers || [],
      }
      ;(group.variants || []).forEach((variant) => flat.push({ variant, groupMeta }))
    })

    const filtered = flat.filter(({ variant, groupMeta }) => {
      const query = searchQuery.toLowerCase()
      const variantMatch = Object.values(variant).some((val) =>
        String(val).toLowerCase().includes(query),
      )
      const metaMatch =
        groupMeta.title?.toLowerCase().includes(query) ||
        groupMeta.category?.toLowerCase().includes(query) ||
        groupMeta.description?.toLowerCase().includes(query)
      return variantMatch || metaMatch
    })

    const paginated = filtered.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

    const groupedMap = {}
    paginated.forEach(({ variant, groupMeta }) => {
      const key = `${groupMeta.category}-${groupMeta.title}`
      if (!groupedMap[key]) groupedMap[key] = { ...groupMeta, variants: [] }

      const row = {}
      groupMeta.specs_headers.forEach((header) => {
        const normKey = header.toLowerCase()
        row[header] = variant[header] || variant[normKey] || ""
      })
      groupedMap[key].variants.push(row)
    })

    grouped = Object.values(groupedMap)
  } else if (brandKey === "qualigens") {
    if (!Array.isArray(qualigensProducts)) {
      console.error("Qualigens data is not iterable")
      notFound()
    }

    const filtered = qualigensProducts.filter((p) =>
      Object.values(p).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    )

    const paginated = filtered.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

    grouped = [
      {
        category: "Qualigens",
        title: "Qualigens Products",
        description: "",
        specs_headers: ["Product Code", "CAS No", "Product Name", "Pack Size", "Packing", "Price", "HSN Code"],
        variants: paginated.map((p, i) => ({
          "Product Code": p["Product Code"] || "",
          "CAS No": p["CAS No"] || "",
          "Product Name": p["Product Name"] || "",
          "Pack Size": p["Pack Size"] || "",
          Packing: p["Packing"] || "",
          Price: p["Price"] || "",
          "HSN Code": p["HSN Code"] || "",
          __key: `qualigens-${p["Product Code"] || i}`,
        })),
      },
    ]
  }

  const handleAdd = (variant, group) => {
    if (!isLoaded)
      return toast({
        title: "Loading...",
        description: "Please wait",
        variant: "destructive",
      })

    const priceKey = group.specs_headers.find((h) => h.toLowerCase().includes("price")) || ""
    const rawPrice = variant[priceKey] || ""
    const price = typeof rawPrice === "number" ? rawPrice : Number.parseFloat(rawPrice.replace(/[^\d.]/g, ""))

    if (isNaN(price) || price <= 0)
      return toast({
        title: "Invalid Price",
        description: "Cannot add invalid price.",
        variant: "destructive",
      })

    const productName =
      variant["Product Name"] ||
      variant["Description"] ||
      variant["Unnamed: 1"] ||
      group.title ||
      group.product ||
      group.description?.split("\n")[0]?.trim() ||
      "Unnamed Product"

    const catNo = variant["Cat No"] || variant["Product Code"] || variant["code"] || ""

    addItem({
      id: catNo,
      name: productName,
      productName,
      catNo,
      productCode: variant["Product Code"] || "",
      casNo: variant["CAS No"] || "",
      grade: variant["Grade"] || variant["grade"] || "",
      packSize: variant["Pack Size"] || variant["capacity_ml"] || "",
      packing: variant["Packing"] || "",
      hsn: variant["HSN Code"] || "",
      price,
      quantity: 1,
      brand: brand.name,
      category: group.category,
      image: null,
    })

    toast({
      title: "Added to Cart",
      description: `${productName} added successfully.`,
      variant: "default",
    })
  }

  const totalPages =
    brandKey === "rankem"
      ? Math.ceil(rankemProducts.reduce((sum, g) => sum + (g.variants?.length || 0), 0) / productsPerPage)
      : brandKey === "borosil"
        ? Math.ceil(borosilProducts.reduce((sum, g) => sum + (g.variants?.length || 0), 0) / productsPerPage)
        : brandKey === "qualigens"
          ? Math.ceil(qualigensProducts.length / productsPerPage)
          : 1

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <Input
        type="text"
        placeholder="Search products..."
        className="mb-8 max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {grouped.map((group, index) => (
        <div key={`group-${index}-${group.title || "untitled"}`} className="mb-12">
          <h3 className="text-md uppercase tracking-wider text-gray-500 mb-1">
            {group.category || `Group ${index + 1}`}
          </h3>
          <h2 className="text-xl font-bold text-blue-700 mb-2">
            {group.title || group.product || `Group ${index + 1}`}
          </h2>
          {group.description && <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{group.description}</p>}
          {group.specs_headers.length > 0 && (
            <div className="overflow-auto border rounded mb-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase font-semibold">
                  <tr>
                    {group.specs_headers.map((header, i) => (
                      <th key={i} className="px-3 py-2 whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                    <th className="px-3 py-2 whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.variants.map((variant, i) => {
                    const rowKey = `${brandKey}-${variant["Product Code"] || variant["Cat No"] || i}-${i}`
                    return (
                      <tr key={rowKey} className="border-t">
                        {group.specs_headers.map((key, j) => (
                          <td key={j} className="px-3 py-2 whitespace-nowrap">
                            {variant[key] || "—"}
                          </td>
                        ))}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Button onClick={() => handleAdd(variant, group)} disabled={!isLoaded} className="text-xs">
                            Add to Cart
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
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
          <span className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
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
