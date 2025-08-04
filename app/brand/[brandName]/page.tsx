"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { labSupplyBrands } from "@/lib/data"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import qualigensProductsRaw from "@/lib/qualigens-products.json"
import rankemProducts from "@/lib/rankem_products.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

if (labSupplyBrands.rankem) labSupplyBrands.rankem.name = "Avantor"

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

  let grouped = []

  // 🔐 Robust Qualigens fallback
  let qualigensProducts = []
  try {
    if (Array.isArray(qualigensProductsRaw)) {
      qualigensProducts = qualigensProductsRaw
    } else if (
      typeof qualigensProductsRaw === "object" &&
      Array.isArray(qualigensProductsRaw?.data)
    ) {
      qualigensProducts = qualigensProductsRaw.data
    }
  } catch (e) {
    qualigensProducts = []
  }

  if (brandKey === "borosil") {
    const flat = []
    borosilProducts.forEach((group, idx) => {
      const variants = group.variants || []
      const specs = Array.isArray(group.specs_headers) && group.specs_headers.length > 0
        ? group.specs_headers
        : Object.keys(variants[0] || {})

      const resolvedTitle =
        group.product?.trim() ||
        group.title?.trim() ||
        group.category?.trim() ||
        group.description?.split("\n")[0]?.trim() ||
        `Group ${idx + 1}`

      const resolvedCategory =
        group.category?.trim() || group.product?.trim() || resolvedTitle

      const baseMeta = {
        ...group,
        title: group.title?.toLowerCase().startsWith("untitled group")
          ? resolvedTitle
          : group.title || resolvedTitle,
        category: group.category?.toLowerCase().startsWith("untitled group")
          ? resolvedCategory
          : group.category || resolvedCategory,
        specs_headers: specs,
        description: group.description || ""
      }

      variants.forEach((v) => flat.push({ variant: v, groupMeta: baseMeta }))
    })

    const filtered = flat.filter(({ variant, groupMeta }) => {
      const variantMatch = Object.values(variant).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
      const metaMatch =
        groupMeta.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupMeta.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupMeta.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return variantMatch || metaMatch
    })

    const paginated = filtered.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    )

    const groupedMap = {}
    paginated.forEach(({ variant, groupMeta }) => {
      if (!groupMeta.specs_headers?.length) return

      const key = `${groupMeta.category}-${groupMeta.title}`
      if (!groupedMap[key])
        groupedMap[key] = { ...groupMeta, variants: [] }

      const row = {}
      groupMeta.specs_headers.forEach((header) => {
        const normKey = header.toLowerCase()
        row[header] = variant[header] || variant[normKey] || ""
      })

      groupedMap[key].variants.push(row)
    })

    grouped = Object.values(groupedMap).filter(g => g.variants.length > 0)
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
        specs_headers: group.specs_headers || []
      }
      ;(group.variants || []).forEach(variant =>
        flat.push({ variant, groupMeta })
      )
    })

    const paginated = flat.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    )

    const groupedMap = {}
    paginated.forEach(({ variant, groupMeta }) => {
      const key = `${groupMeta.category}-${groupMeta.title}`
      if (!groupedMap[key])
        groupedMap[key] = { ...groupMeta, variants: [] }

      const row = {}
      groupMeta.specs_headers.forEach(header => {
        const normKey = header.toLowerCase()
        row[header] = variant[header] || variant[normKey] || ""
      })
      groupedMap[key].variants.push(row)
    })

    grouped = Object.values(groupedMap)
  } else if (brandKey === "qualigens") {
    const paginated = Array.isArray(qualigensProducts)
      ? qualigensProducts.slice(
          (currentPage - 1) * productsPerPage,
          currentPage * productsPerPage
        )
      : []

    grouped = [
      {
        category: "Qualigens",
        title: "Qualigens Products",
        description: "",
        specs_headers: [
          "Product Code",
          "CAS No",
          "Product Name",
          "Pack Size",
          "Packing",
          "Price",
          "HSN Code"
        ],
        variants: paginated.map((p, i) => ({
          "Product Code": p["Product Code"] || "",
          "CAS No": p["CAS No"] || "",
          "Product Name": p["Product Name"] || "",
          "Pack Size": p["Pack Size"] || "",
          "Packing": p["Packing"] || "",
          "Price": p["Price"] || "",
          "HSN Code": p["HSN Code"] || "",
          __key: `qualigens-${p["Product Code"] || i}`
        }))
      }
    ]
  }

  // [rest of the file remains the same]
