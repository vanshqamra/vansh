"use client"

import type React from "react"
import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { useSearch } from "@/app/context/search-context"
import { useToast } from "@/hooks/use-toast"

import qualigensProducts from "@/lib/qualigens-products.json"
import { commercialChemicals } from "@/lib/data"
import rankemProducts from "@/lib/rankem_products.json"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import whatmanProducts from "@/lib/whatman_products.json"
import himediaData from "@/lib/himedia_products_grouped"

import avariceProductsRaw from "@/lib/avarice_products.json"
import omsonsDataRaw from "@/lib/omsons_products.json"

/* ---------------- Helpers ---------------- */
const asArray = (x: any) => Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : []
const norm = (s: any) => (s == null ? "" : String(s)).toLowerCase()
const stripNonAlnum = (s: any) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
const inr = (n: number) => n.toLocaleString("en-IN", { style: "currency", currency: "INR" })
const isNum = (v: any) => typeof v === "number" && Number.isFinite(v)
const toNum = (v: any): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null
  if (v == null) return null
  const s = String(v).trim()
  if (/^por$/i.test(s)) return null
  const n = Number(s.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : null
}
const normalizeKey = (str: string) =>
  String(str).toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")

const dedupe = (rows: any[]) => {
  const seen = new Set<string>()
  const out: any[] = []
  for (const r of rows) {
    const key = [
      r.source || "",
      stripNonAlnum(r.code || ""),
      stripNonAlnum(r.packSize || r.packing || ""),
      stripNonAlnum(r.name || r.product || r.title || "")
    ].join("|")
    if (!seen.has(key)) {
      seen.add(key)
      out.push(r)
    }
  }
  return out
}

// Borosil helpers
const getBorosilCode = (v: any) => v?.code ?? v?.Code ?? v?.["Product Code"] ?? v?.["Cat No"] ?? ""
const getBorosilName = (v: any, g: any) =>
  v?.["Product Name"] || v?.Description || v?.Name || g?.product || g?.title || "Borosil Product"

// Map human headers to row keys (normalized)
const BOROSIL_HEADER_ALIASES: Record<string, string[]> = {
  product_code: ["code", "product_code", "cat_no", "cat_no_", "cat_no__", "catalog_no", "catalogue_no", "product code"],
  "capacity_ml": ["capacity ml", "capacity", "capacity_mL", "capacity_ml"],
  "graduation_interval_ml": ["graduation interval ml", "interval ml", "graduation_interval_ml", "interval_ml"],
  "tolerance___ml": ["tolerance + ml", "tolerance ml", "tolerance", "tolerance_ml", "tolerance__ml", "tolerance___ml"],
  "quantity_per_case": ["quantity per case", "qty/case", "qty_per_case", "quantity_per_case"],
  "price__piece": ["price /piece", "price", "price_piece", "list price", "price_(rs.)", "rate"],
}
const resolveBorosilValue = (v: any, header: string) => {
  // try as-is
  if (v?.[header] != null && String(v[header]).trim() !== "") return v[header]
  // try normalized header
  const nk = normalizeKey(header)
  if (v?.[nk] != null && String(v[nk]).trim() !== "") return v[nk]
  // try alias list
  const aliasList = BOROSIL_HEADER_ALIASES[nk] || []
  for (const alias of aliasList) {
    const cand1 = v?.[alias]
    const cand2 = v?.[normalizeKey(alias)]
    if (cand1 != null && String(cand1).trim() !== "") return cand1
    if (cand2 != null && String(cand2).trim() !== "") return cand2
  }
  // final: if header looks like Product Code, return code
  if (/product\s*code|cat\s*no/i.test(header) && v?.code) return v.code
  return undefined
}

/* ---------------- Page ---------------- */
function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const { searchQuery, setSearchQuery } = useSearch()
  const [displayQuery, setDisplayQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 50

  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const matchesSearchQuery = (product: any, query: string): boolean => {
    const normalizedQuery = stripNonAlnum(query)
    if (!normalizedQuery) return false
    const searchFields: string[] = []
    const collect = (obj: any) => {
      if (typeof obj === "string") searchFields.push(stripNonAlnum(obj))
      else if (typeof obj === "number") searchFields.push(String(obj))
      else if (Array.isArray(obj)) obj.forEach(collect)
      else if (obj && typeof obj === "object") Object.values(obj).forEach(collect)
    }
    collect(product)
    return searchFields.some((field) => field.includes(normalizedQuery))
  }

  const triggerSearch = (rawQuery: string) => {
    const query = rawQuery || ""
    router.replace(`/products/search?q=${encodeURIComponent(query)}`)
    setDisplayQuery(query)
    setSearchQuery("")           // auto-clear input after submit
    inputRef.current?.blur()

    /* -------- Build brand results -------- */

    // Qualigens
    const qualigensArr: any[] = Array.isArray(qualigensProducts) ? qualigensProducts : (qualigensProducts as any)?.data || []
    const qualigensResults = qualigensArr
      .filter((p) => matchesSearchQuery(p, query))
      .map((p) => ({
        ...p,
        source: "qualigens",
        category: "Qualigens",
        title: "Qualigens",
        name: p["Product Name"],
        code: p["Product Code"],
        price: p["Price"],
      }))

    // Commercial
    const commercialResults = commercialChemicals
      .filter((p) => matchesSearchQuery(p, query))
      .map((p) => ({ ...p, source: "commercial", title: p.category, name: p.name, code: p.code }))

    // Rankem
    const rankemResults = rankemProducts.flatMap((group: any) =>
      (group.variants || [])
        .map((variant: any) => {
          const isStandard = variant["Cat No"] && variant["Description"]
          const isAlt = variant["Unnamed: 1"] && variant["Unnamed: 5"]
          if (isStandard) {
            return {
              ...variant,
              source: "rankem",
              category: "Rankem",
              title: group.title || "Rankem",
              description: group.description || "",
              specs_headers: group.specs_headers,
              name: variant["Description"] || group.title || "—",
              code: variant["Cat No"] || "—",
              price: variant["List Price\n2025(INR)"] || variant["Price"] || "—",
              packSize: variant["Pack\nSize"] || variant["Packing"] || "—",
            }
          } else if (isAlt) {
            const code = variant["Baker Analyzed ACS\nReagent\n(PVC"]?.trim()
            const name = variant["Unnamed: 1"]?.trim()
            const packSize = variant["Unnamed: 3"]?.trim()
            const price = variant["Unnamed: 5"]
            if (!name || !code) return null
            return {
              ...variant,
              source: "rankem",
              category: "Rankem",
              title: group.title || "Rankem",
              description: group.description || "",
              specs_headers: group.specs_headers,
              name, code,
              packSize: packSize || "—",
              price: price || "—",
            }
          }
          return null
        })
        .filter(Boolean)
        .filter((row: any) => matchesSearchQuery(row, query))
    )

    // Borosil — USE ALIASES to resolve spec values and show group description
    const borosilResults = borosilProducts.flatMap((group: any) => {
      const title = group.product || group.title || group.category || "Borosil"
      const description = group.description || ""
      const headers: string[] = Array.isArray(group.specs_headers) ? group.specs_headers : []
      const variants: any[] = Array.isArray(group.variants) ? group.variants : []

      const mapped = variants.map((v: any) => {
        // compute specs via alias mapping; skip empties
        const specs = headers
          .filter((h) => !/price/i.test(h))
          .map((h) => {
            const val = resolveBorosilValue(v, h)
            return { label: h, value: val }
          })
          .filter((x) => x.value != null && String(x.value).trim() !== "")

        // price: look through alias too
        const priceCandidates = ["Price", "Price /Piece", "Rate", "List Price", "Price_(Rs.)"]
        let priceVal: any = undefined
        for (const h of [ ...priceCandidates, ...headers ]) {
          const vResolved = resolveBorosilValue(v, h)
          if (vResolved != null && String(vResolved).trim() !== "") { priceVal = vResolved; break }
        }

        return {
          ...v,
          source: "borosil",
          category: "Borosil",
          title,
          description,               // ← renderable now
          name: getBorosilName(v, group),
          code: getBorosilCode(v),
          price: priceVal ?? "—",
          specs,
        }
      })

      return mapped.filter((row) => matchesSearchQuery(row, query))
    })

    // Whatman
    const whatmanResults = (whatmanProducts?.variants || [])
      .map((variant: any) => {
        const specs = (whatmanProducts.specs_headers || [])
          .filter((h: string) => !/price/i.test(h))
          .map((h: string) => ({ label: h, value: variant[h] }))
          .filter((x) => x.value != null && String(x.value).trim() !== "")
        return {
          ...variant,
          source: "whatman",
          category: "Whatman",
          title: whatmanProducts.title || "Whatman",
          description: whatmanProducts.description || "",
          name: variant["name"] || variant["Name"] || variant["Code"] || "Whatman Product",
          code: variant["Code"] || variant["code"] || "",
          price: variant["Price"] || variant["price"] || "—",
          specs,
        }
      })
      .filter((row: any) => matchesSearchQuery(row, query))

    // HiMedia
    const himediaResults = (himediaData || []).flatMap((section: any) =>
      (section.header_sections || []).flatMap((header: any) =>
        (header.sub_sections || []).flatMap((sub: any) =>
          (sub.products || []).map((product: any) => ({
            ...product,
            source: "himedia",
            category: section.main_section,
            title: header.header_section,
            description: sub.sub_section,
            name: product.name || "HiMedia Product",
            code: product.code || "—",
            price: product.rate || "—",
            specs: [
              { label: "Packing", value: product.packing || "" },
              { label: "HSN", value: product.hsn || "" },
              { label: "GST", value: product.gst != null ? `${product.gst}%` : "" },
            ].filter((x) => x.value !== ""),
          }))
        )
      )
    ).filter((row: any) => matchesSearchQuery(row, query))

    // Avarice
    const avariceArr: any[] = asArray(avariceProductsRaw)
    const avariceRows = avariceArr.flatMap((p: any) =>
      (p?.variants || []).map((v: any) => ({
        source: "avarice",
        category: "Avarice",
        title: "Avarice Products",
        name: p?.product_name || "Avarice Product",
        code: p?.product_code || "",
        price: v?.price_inr ?? "—",
        description: "", // (no group description in this dataset)
        specs: [
          { label: "Packing", value: v?.packing ?? "" },
          { label: "HSN", value: v?.hsn_code ?? "" },
          ...(p?.cas_no ? [{ label: "CAS", value: p.cas_no }] : []),
        ].filter((x) => x.value !== ""),
      }))
    )
    const avariceResults = avariceRows.filter((row) => matchesSearchQuery(row, query))

    // Omsons — attach section meta BEFORE filtering (enables spec_header/product_name queries)
    const omsonsSections: any[] = Array.isArray((omsonsDataRaw as any)?.catalog) ? (omsonsDataRaw as any).catalog : []
    const omsonsRows = omsonsSections.flatMap((sec: any) => {
      const title = sec?.product_name || sec?.title || sec?.category || "Omsons"
      const sectionSpec = sec?.spec_header || ""
      const headers: string[] = Array.isArray(sec?.table_headers) ? sec.table_headers : []
      const priceKey = headers.find((h) => /price|rate/i.test(h)) || "Price"
      const variants: any[] = Array.isArray(sec?.variants) ? sec.variants : []

      return variants.map((v: any) => {
        const specsList = headers
          .filter((h) => !/price/i.test(h))
          .map((h) => ({ label: h, value: v[h] }))
          .filter((x) => x.value != null && String(x.value).trim() !== "")

        return {
          ...v,
          source: "omsons",
          category: "Omsons",
          title,                     // ← product_name searchable
          description: sectionSpec,  // ← spec_header searchable
          name: v["Product Name"] || v["Description"] || title || "Omsons Product",
          code: v["Cat. No."] || v["Cat No"] || v["Code"] || v["Product Code"] || "—",
          price: v[priceKey] || v["Price"] || "—",
          specs: specsList,
        }
      })
    })
    const omsonsResults = omsonsRows.filter((row) => matchesSearchQuery(row, query))

    // Combine + DEDUPE
    const combined = dedupe([
      ...qualigensResults,
      ...commercialResults,
      ...rankemResults,
      ...borosilResults,
      ...whatmanResults,
      ...himediaResults,
      ...avariceResults,
      ...omsonsResults,
    ])

    setSearchResults(combined)
    setCurrentPage(1)
  }

  // bootstrap from ?q
  useEffect(() => {
    if (initialQuery) {
      setDisplayQuery(initialQuery)
      // keep input filled with initial for first render; clear on next submit
      triggerSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    triggerSearch(searchQuery)
  }

  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    if (!isLoaded) {
      toast({ title: "Loading...", description: "Please wait while the cart loads", variant: "destructive" })
      return
    }
    try {
      const priceNum = toNum(product.price)
      if (priceNum == null || priceNum <= 0) {
        toast({ title: "Price on request", description: "This item does not have a numeric price.", variant: "default" })
      }
      addItem({
        id: product.id || product.code || `${product.source}-${Math.random().toString(36).slice(2, 10)}`,
        name: product.name || product.product || product.title,
        price: priceNum || 0,
        brand: product.source,
        category: product.category,
      })
      toast({ title: "Added to Cart", description: `${product.name || product.title} has been added to your cart` })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({ title: "Error", description: "Failed to add item to cart. Please try again.", variant: "destructive" })
    }
  }

  const paginatedResults = searchResults.slice(
    (currentPage - 1) * 50,
    currentPage * 50
  )
  const totalPages = Math.max(1, Math.ceil(searchResults.length / 50))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Search Results</h1>
          <form onSubmit={handleSearch} className="flex gap-4 max-w-md mb-6">
            <Input
              ref={inputRef}
              placeholder="Search products..."
              value={/* input reflects current entry, clears on submit */ (searchQuery)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {displayQuery && (
            <p className="text-slate-600 mb-6">
              Showing {searchResults.length} results for "<span className="font-medium">{displayQuery}</span>"
            </p>
          )}
        </div>

        {paginatedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResults.map((product) => {
                const priceNum = toNum(product.price)
                const priceDisplay = priceNum != null && priceNum > 0 ? inr(priceNum) : "Price on request"

                const specs: {label: string, value: any}[] = Array.isArray(product.specs)
                  ? product.specs.map((s: any) =>
                      typeof s === "string"
                        ? { label: "", value: s }
                        : { label: s.label ?? "", value: s.value }
                    ).filter(x => x.value != null && String(x.value).trim() !== "")
                  : []

                return (
                  <Card
                    key={`${product.source}-${product.id || product.code || Math.random().toString(36).substring(2, 10)}`}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">
                        {product.name || product.product || product.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{product.source}</Badge>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {product.code && <p className="text-sm text-slate-600">Code: {product.code}</p>}
                        {product.description && <p className="text-sm text-slate-600">{product.description}</p>}
                        {specs.slice(0, 6).map((s, idx) => (
                          <p key={idx} className="text-sm text-slate-600">
                            {s.label ? <><span className="font-medium">{s.label}:</span> {s.value}</> : String(s.value)}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">{priceDisplay}</span>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!isLoaded}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {isLoaded ? "Add to Cart" : "Loading..."}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </>
        ) : displayQuery ? (
          <div className="text-center py-12">
            <Search className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No products found</h2>
            <p className="text-slate-600">Try different search terms or browse our categories.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-24 w-24 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Search Products</h2>
            <p className="text-slate-600">Enter a search term to find products from our catalog.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
