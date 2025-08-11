"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { labSupplyBrands } from "@/lib/data"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import qualigensProductsRaw from "@/lib/qualigens-products.json"
import rankemProducts from "@/lib/rankem_products.json"
import { useSearch } from "@/app/context/search-context"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

// ---------------- Helpers ----------------
function normalizeKey(str: string) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")
}

function codeKeys() {
  return ["code", "product_code", "Product Code"]
}

function priceKeys() {
  return [
    "price",
    "Price",
    "price_piece",
    "price_/piece",
    "Price /Piece",
    "Price/ Piece",
    "Price/ Each",
  ]
}

function getField(variant: any, keys: string[]) {
  for (const k of keys) {
    if (variant[k] !== undefined && variant[k] !== "") return variant[k]
    const nk = normalizeKey(k)
    if (variant[nk] !== undefined && variant[nk] !== "") return variant[nk]
  }
  return ""
}

// ---------------- Preprocess Borosil ----------------
const normalizedBorosil: any[] = (Array.isArray(borosilProducts) ? borosilProducts : [])?.map(
  (group: any) => {
    const specs_headers =
      Array.isArray(group.specs_headers) && group.specs_headers.length > 0
        ? group.specs_headers.map((h: string) => String(h).trim())
        : Object.keys(group.variants?.[0] || {})

    const variants = (group.variants || []).map((rawV: any) => {
      const v: any = { ...rawV }
      // normalize keys mirror
      for (const [k, val] of Object.entries(rawV)) {
        v[normalizeKey(k)] = val
      }
      // robust price extraction
      const rawPrice = getField(rawV, priceKeys())
      v.price =
        rawPrice === "" || rawPrice === null || rawPrice === undefined
          ? 0
          : Number(String(rawPrice).replace(/[^\d.]/g, "")) || 0
      // code mirror
      v.code = getField(rawV, codeKeys())
      return v
    })

    return { ...group, specs_headers, variants }
  }
)

// ---------------- Page ----------------
export default function BrandPage({ params }: { params: { brandName: string } }) {
  const brandKey = params.brandName
  const brand = (labSupplyBrands as any)[brandKey]
  if (!brand) notFound()

  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()
  const { searchQuery } = useSearch()

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialPage = Number(searchParams.get("page") || "1")
  const [page, setPage] = useState<number>(isFinite(initialPage) ? initialPage : 1)
  const productsPerPage = 50

  // keep ?page in URL
  useEffect(() => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [page, router, pathname])

  // reset to page 1 on new search
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  let grouped: any[] = []
  let pageCount = 1 // will set per brand below

  // ---------------- Borosil ----------------
  if (brandKey === "borosil") {
    // flatten groups → variants with resolved titles/categories
    const flat: Array<{ variant: any; groupMeta: any }> = []
    normalizedBorosil.forEach((group: any, idx: number) => {
      const { specs_headers, variants } = group
      const resolvedTitle =
        group.product?.trim() ||
        group.title?.trim() ||
        group.category?.trim() ||
        group.description?.split("\n")[0]?.trim() ||
        `Group ${idx + 1}`

      const resolvedCategory = group.category?.trim() || group.product?.trim() || resolvedTitle

      const baseMeta = {
        ...group,
        title: group.title?.toLowerCase?.().startsWith?.("untitled group")
          ? resolvedTitle
          : group.title || resolvedTitle,
        category: group.category?.toLowerCase?.().startsWith?.("untitled group")
          ? resolvedCategory
          : group.category || resolvedCategory,
        specs_headers,
        description: group.description || "",
      }

      ;(variants || []).forEach((variant: any) => {
        flat.push({ variant, groupMeta: baseMeta })
      })
    })

    const safeStr = (v: unknown) =>
      typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : ""
    const hasText = (v: unknown) => typeof v === "string" && v.trim().length > 0
    const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v)

    const getCode = (v: any) => getField(v, codeKeys())
    const getPriceNum = (v: any) => {
      const raw = getField(v, priceKeys())
      if (raw === null || raw === undefined || raw === "") return null
      const n = Number(String(raw).replace(/[^\d.]/g, ""))
      return Number.isFinite(n) ? n : null
    }

    // filter by search
    const q = (searchQuery || "").toLowerCase()
    const filtered = flat.filter(({ variant, groupMeta }) => {
      if (!q) return true
      const hay =
        Object.values(variant).map((v) => String(v).toLowerCase()).join(" ") +
        " " +
        String(groupMeta.title).toLowerCase() +
        " " +
        String(groupMeta.category).toLowerCase() +
        " " +
        String(groupMeta.description || "").toLowerCase()
      return hay.includes(q)
    })

    // pagination
    pageCount = Math.max(1, Math.ceil(filtered.length / productsPerPage))
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage)

    // which spec columns have real data (exclude code/price)
    const displaySpecs = new Set<string>()
    paginated.forEach(({ variant, groupMeta }) => {
      groupMeta.specs_headers.forEach((header: string) => {
        const nk = normalizeKey(header)
        if (
          codeKeys().some((k) => nk === normalizeKey(k)) ||
          priceKeys().some((k) => nk === normalizeKey(k))
        )
          return
        const val = variant[header] ?? variant[nk] ?? (header in variant ? variant[header] : undefined)
        if (isNum(val) || hasText(val)) displaySpecs.add(header)
      })
    })

    // decide fixed columns
    const showCode = paginated.some(({ variant }) => hasText(getCode(variant)))
    // show Price column if any parseable numeric price exists (incl. 0)
    const showPrice = paginated.some(({ variant }) => getPriceNum(variant) !== null)

    // build grouped rows
    const map: Record<string, any> = {}
    paginated.forEach(({ variant, groupMeta }) => {
      const key = `${groupMeta.category}-${groupMeta.title}`
      if (!map[key]) map[key] = { ...groupMeta, variants: [] }

      const row: Record<string, any> = {}

      if (showCode) {
        const codeVal = getCode(variant)
        row["Product Code"] = hasText(codeVal) ? codeVal : "—"
      }

      ;[...displaySpecs].forEach((header) => {
        const nk = normalizeKey(header)
        const v = variant[header] ?? variant[nk] ?? (header in variant ? variant[header] : undefined)
        row[header] = isNum(v) ? v : hasText(v) ? safeStr(v) : "—"
      })

      if (showPrice) {
        const priceVal = getPriceNum(variant)
        // render only when > 0, else show "—"
        row["Price"] = priceVal !== null && priceVal > 0 ? priceVal : "—"
      }

      map[key].variants.push(row)
    })

    // drop empty rows/sections; prune all-empty headers
    grouped = Object.values(map)
      .map((group: any) => {
        const initialHeaders: string[] = []
        if (showCode) initialHeaders.push("Product Code")
        initialHeaders.push(...[...displaySpecs])
        if (showPrice) initialHeaders.push("Price")

        // keep a row if ANY header has a real value
        const rows = (group.variants || []).filter((r: Record<string, any>) =>
          initialHeaders.some((h) => {
            const v = r[h]
            if (v === null || v === undefined) return false
            if (typeof v === "number") return Number.isFinite(v) && (h === "Price" ? v > 0 : true)
            const s = String(v).trim()
            return s.length > 0 && s !== "—"
          })
        )

        if (rows.length === 0) return null

        // prune headers that are empty across remaining rows
        const prunedHeaders = initialHeaders.filter((h) =>
          rows.some((r) => {
            const v = r[h]
            if (v === null || v === undefined) return false
            if (typeof v === "number") return Number.isFinite(v) && (h === "Price" ? v > 0 : true)
            const s = String(v).trim()
            return s.length > 0 && s !== "—"
          })
        )

        if (prunedHeaders.length === 0) return null

        return { ...group, variants: rows, _tableHeaders: prunedHeaders }
      })
      .filter(Boolean) as any[]
  }
  // ---------------- Qualigens ----------------
  else if (brandKey === "qualigens") {
    let qualigensProducts: any[] = []
    try {
      const raw: any = (qualigensProductsRaw as any).default || qualigensProductsRaw
      qualigensProducts = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
    } catch {
      notFound()
    }

    const filtered = qualigensProducts.filter((p) =>
      Object.values(p).some((v) => String(v).toLowerCase().includes(String(searchQuery).toLowerCase()))
    )
    pageCount = Math.max(1, Math.ceil(filtered.length / productsPerPage))
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage)

    grouped = [
      {
        category: "Qualigens",
        title: "Qualigens Products",
        description: "",
        _tableHeaders: ["Product Code", "CAS No", "Product Name", "Pack Size", "Packing", "Price", "HSN Code"],
        variants: paginated.map((p) => ({
          "Product Code": p["Product Code"] || "",
          "CAS No": p["CAS No"] || "",
          "Product Name": p["Product Name"] || "",
          "Pack Size": p["Pack Size"] || "",
          Packing: p["Packing"] || "",
          Price: p["Price"] || "",
          "HSN Code": p["HSN Code"] || "",
        })),
      },
    ]
  }
  // ---------------- Rankem ----------------
  else if (brandKey === "rankem") {
    const flat: any[] = []
    ;(rankemProducts as any[]).forEach((group: any) => {
      const variants = group.variants || []
      variants.forEach((v: any) => flat.push({ variant: v, groupMeta: group }))
    })
    const filtered = flat.filter(
      ({ variant, groupMeta }) =>
        Object.values(variant).some((v) => String(v).toLowerCase().includes(String(searchQuery).toLowerCase())) ||
        String(groupMeta.title).toLowerCase().includes(String(searchQuery).toLowerCase())
    )
    pageCount = Math.max(1, Math.ceil(filtered.length / productsPerPage))
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage)
    const map: Record<string, any> = {}
    paginated.forEach(({ variant, groupMeta }) => {
      const key = `${groupMeta.category}-${groupMeta.title}`
      if (!map[key]) map[key] = { ...groupMeta, variants: [] }
      map[key].variants.push(variant)
    })
    grouped = Object.values(map)
    grouped.forEach((group: any) => {
      if (group.variants.length) {
        group._tableHeaders = Object.keys(group.variants[0])
      }
    })
  }

  // ---------------- Add-to-cart helper ----------------
  const handleAdd = (row: any, group: any) => {
    if (!isLoaded) {
      toast({ title: "Loading...", description: "Please wait", variant: "destructive" })
      return
    }
    // robust numeric parse for any brand
    const priceRaw = row["Price"]
    const priceNum =
      typeof priceRaw === "number" ? priceRaw : Number(String(priceRaw).replace(/[^\d.]/g, ""))
    if (!(priceNum > 0)) {
      toast({ title: "Invalid Price", description: "Cannot add invalid price.", variant: "destructive" })
      return
    }

    const name = row["Product Name"] || group.title
    const catNo = row["Product Code"] || row.Code || ""
    addItem({
      id: `${brandKey}-${catNo}`,
      name,
      productName: name,
      catNo,
      productCode: catNo,
      casNo: row["CAS No"] || "",
      packSize: row["Pack Size"] || "",
      packing: row.Packing || "",
      hsn: row["HSN Code"] || "",
      price: priceNum,
      quantity: 1,
      brand: brand.name,
      category: group.category,
      image: null,
    })
    toast({ title: "Added to Cart", description: `${name} added.`, variant: "default" })
  }

  // ---------------- Render ----------------
  const groups = Array.isArray(grouped) ? (grouped as any[]) : []

  return (
    <div className="container mx-auto py-8">
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No products found matching your search.</p>
        </div>
      ) : (
        groups.map((group: any, gi: number) => (
          <section key={`${group.category ?? ""}-${group.title}-${gi}`} className="mb-10">
            <h2 className="text-lg font-semibold mb-3">{group.title}</h2>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    {group._tableHeaders.map((h: string) => (
                      <th key={h} className="py-2 px-3">
                        {h}
                      </th>
                    ))}
                    <th className="py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {group.variants.map((row: any, ri: number) => {
                    const priceRaw = row["Price"]
                    const priceNum =
                      typeof priceRaw === "number"
                        ? priceRaw
                        : Number(String(priceRaw).replace(/[^\d.]/g, ""))
                    const canAdd = priceNum > 0

                    return (
                      <tr key={ri} className="border-b last:border-none">
                        {group._tableHeaders.map((h: string) => (
                          <td key={`${ri}-${h}`} className="py-2 px-3">
                            {typeof row[h] === "number"
                              ? h === "Price"
                                ? (row[h] as number).toLocaleString("en-IN", { style: "currency", currency: "INR" })
                                : (row[h] as number)
                              : (row[h] ?? "—")}
                          </td>
                        ))}
                        <td className="py-2 px-3">
                          <Button
                            size="sm"
                            disabled={!canAdd}
                            onClick={() => handleAdd(row, group)}
                          >
                            Add
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <span className="text-sm">Page {page} of {pageCount}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
