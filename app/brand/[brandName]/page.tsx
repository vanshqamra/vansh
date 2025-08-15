"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { labSupplyBrands } from "@/lib/data"

import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import avariceProductsRaw from "@/lib/avarice_products.json"
import qualigensProductsRaw from "@/lib/qualigens-products.json"
import rankemProducts from "@/lib/rankem_products.json"
import omsonsDataRaw from "@/lib/omsons_products.json"

import { useSearch } from "@/app/context/search-context"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

/* ---------------- Helpers ---------------- */
function normalizeKey(str: string) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")
}
function stripTablePrefix(s?: string | null) {
  if (!s) return ""
  return String(s).replace(/^\s*table[\s-_]*\d+\s*[:–-]?\s*/i, "").trim()
}
function codeKeys() {
  return [
    "code", "product_code", "Product Code",
    "cat_no", "cat no", "cat_no.", "cat_no_", "cat_no__", "catno",
    "catalog_no", "catalog number", "catalogue_no", "catalogue_number", "cat_no_."
  ]
}
function priceKeys() {
  return [
    "price", "Price",
    "price_piece", "price_/piece", "Price /Piece", "Price/ Piece", "Price/ Each",
    "list_price", "offer_price", "price_each", "price_rs", "price_(rs.)"
  ]
}
function nameKeys() {
  return [
    "Product Name", "product_name", "name", "item", "title",
    "description", "Description", "item_description",
    "material_name", "chemical_name", "product", "product_title",
    "material", "material description", "product_description"
  ]
}
function packKeys() { return ["Pack Size", "pack_size", "pack", "packing", "package", "Packsize", "Packing"] }
function casKeys() { return ["CAS No", "cas_no", "cas", "cas_number"] }
function hsnKeys() { return ["HSN Code", "hsn_code", "hsn"] }

function getField(variant: any, keys: string[]) {
  for (const k of keys) {
    if (variant?.[k] !== undefined && variant?.[k] !== "") return variant[k]
    const nk = normalizeKey(k)
    if (variant?.[nk] !== undefined && variant?.[nk] !== "") return variant[nk]
  }
  return ""
}
function firstNonEmpty(obj: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    const nk = normalizeKey(k)
    if (obj?.[k] !== undefined && obj?.[k] !== "") return obj[k]
    if (obj?.[nk] !== undefined && obj?.[nk] !== "") return obj[nk]
  }
  return ""
}
function parsePriceToNumber(v: any): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (v == null) return 0
  // keep POR as 0 (quote-first)
  const s = String(v).trim()
  if (/^por$/i.test(s)) return 0
  const n = Number(s.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}
function inr(n: number) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR" })
}
function makeFriendlyName(row: any, group: any, code: string) {
  const fromRow = String(firstNonEmpty(row, nameKeys())).trim()
  if (fromRow) return fromRow
  const fallback = stripTablePrefix(group?.title) || stripTablePrefix(group?.category)
  if (fallback) return code ? `${fallback} (${code})` : fallback
  return code || "Product"
}
/** Guess a dynamic price column like “Price List 2025”, “PRICE 2025 (Rs.)”, etc. */
function guessDynamicPriceKey(headers: string[]): string | null {
  const cands = headers.filter((h) => /price|rate/i.test(h))
  const withYear = cands.find((h) => /2025|24-25|2024-25|fy\s*2025/i.test(h.toLowerCase()))
  if (withYear) return withYear
  const withList = cands.find((h) => /list/i.test(h))
  if (withList) return withList
  const withRs = cands.find((h) => /(rs|₹|inr|\(rs\))/i.test(h))
  if (withRs) return withRs
  return cands[0] ?? null
}
const asArray = (x: any) => Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : []

/* ---------------- Preprocess Borosil ---------------- */
const normalizedBorosil: any[] = (Array.isArray(borosilProducts) ? borosilProducts : [])?.map(
  (group: any) => {
    const specs_headers =
      Array.isArray(group.specs_headers) && group.specs_headers.length > 0
        ? group.specs_headers.map((h: string) => String(h).trim())
        : Object.keys(group.variants?.[0] || {})

    const variants = (group.variants || []).map((rawV: any) => {
      const v: any = { ...rawV }
      for (const [k, val] of Object.entries(rawV)) v[normalizeKey(k)] = val
      const rawPrice = getField(rawV, priceKeys())
      v.price = rawPrice == null || rawPrice === "" ? 0 : Number(String(rawPrice).replace(/[^\d.]/g, "")) || 0
      v.code = getField(rawV, codeKeys())
      return v
    })

    return { ...group, specs_headers, variants }
  }
)

/* ---------------- Page ---------------- */
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
  useEffect(() => { setPage(1) }, [searchQuery])

  let grouped: any[] = []
  let pageCount = 1

  /* ---------------- Borosil ---------------- */
  if (brandKey === "borosil") {
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
        title: group.title?.toLowerCase?.().startsWith?.("untitled group") ? resolvedTitle : group.title || resolvedTitle,
        category: group.category?.toLowerCase?.().startsWith?.("untitled group") ? resolvedCategory : group.category || resolvedCategory,
        specs_headers,
        description: group.description || "",
      }

      ;(variants || []).forEach((variant: any) => flat.push({ variant, groupMeta: baseMeta }))
    })

    const safeStr = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "")
    const hasText = (v: unknown) => typeof v === "string" && v.trim().length > 0
    const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v)

    const getCode = (v: any) => getField(v, codeKeys())
    const getPriceNum = (v: any) => {
      const raw = getField(v, priceKeys())
      if (raw == null || raw === "") return null
      const n = Number(String(raw).replace(/[^\d.]/g, ""))
      return Number.isFinite(n) ? n : null
    }

    const q = (searchQuery || "").toLowerCase()
    const filtered = flat.filter(({ variant, groupMeta }) => {
      if (!q) return true
      const hay =
        Object.values(variant).map((v) => String(v).toLowerCase()).join(" ") +
        " " + String(groupMeta.title).toLowerCase() +
        " " + String(groupMeta.category).toLowerCase() +
        " " + String(groupMeta.description || "").toLowerCase()
      return hay.includes(q)
    })

    pageCount = Math.max(1, Math.ceil(filtered.length / productsPerPage))
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage)

    const displaySpecs = new Set<string>()
    paginated.forEach(({ variant, groupMeta }) => {
      groupMeta.specs_headers.forEach((header: string) => {
        const nk = normalizeKey(header)
        if (codeKeys().some((k) => nk === normalizeKey(k)) || priceKeys().some((k) => nk === normalizeKey(k))) return
        const val = (variant as any)[header] ?? (variant as any)[nk] ?? ((header in (variant as any)) ? (variant as any)[header] : undefined)
        if (isNum(val) || hasText(val)) displaySpecs.add(header)
      })
    })

    const showCode = paginated.some(({ variant }) => hasText(getCode(variant)))
    const showPrice = paginated.some(({ variant }) => getPriceNum(variant) !== null)

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
        const v = (variant as any)[header] ?? (variant as any)[nk] ?? ((header in (variant as any)) ? (variant as any)[header] : undefined)
        row[header] = isNum(v) ? v : hasText(v) ? safeStr(v) : "—"
      })
      if (showPrice) {
        const priceVal = getPriceNum(variant)
        row["Price"] = priceVal !== null && priceVal > 0 ? priceVal : "—"
      }

      map[key].variants.push(row)
    })

    grouped = Object.values(map)
      .map((group: any) => {
        const initialHeaders: string[] = []
        if (showCode) initialHeaders.push("Product Code")
        initialHeaders.push(...[...displaySpecs])
        if (showPrice) initialHeaders.push("Price")

        const rows = (group.variants || []).filter((r: Record<string, any>) =>
          initialHeaders.some((h) => {
            const v = r[h]
            if (v == null) return false
            if (typeof v === "number") return Number.isFinite(v) && (h === "Price" ? v > 0 : true)
            const s = String(v).trim()
            return s.length > 0 && s !== "—"
          })
        )
        if (rows.length === 0) return null

        const prunedHeaders = initialHeaders.filter((h) =>
          rows.some((r) => {
            const v = r[h]
            if (v == null) return false
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

  /* ---------------- Avarice ---------------- */
  else if (brandKey === "avarice") {
    // Expected shape: [{ product_code, cas_no, product_name, variants: [{ packing, hsn_code, price_inr }] }]
    const raw = (avariceProductsRaw as any).default || avariceProductsRaw
    const products: any[] = asArray(raw)

    // Flatten products → rows
    const allRows = products.flatMap((p: any) =>
      (p?.variants || []).map((v: any) => ({
        "Product Code": p?.product_code || "",
        "CAS No": p?.cas_no || "",
        "Product Name": p?.product_name || "",
        "Packing": v?.packing || "",
        "HSN Code": v?.hsn_code || "",
        "Price": v?.price_inr ?? ""
      }))
    )

    // Search
    const q = String(searchQuery ?? "").trim().toLowerCase()
    const filtered = q
      ? allRows.filter((row) =>
          Object.values(row).some((val) => String(val ?? "").toLowerCase().includes(q))
        )
      : allRows

    // Pagination
    const pageCountCalc = Math.max(1, Math.ceil(filtered.length / productsPerPage))
    pageCount = pageCountCalc
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage)

    grouped = [
      {
        category: "Avarice",
        title: "Avarice Products",
        description: "",
        _tableHeaders: ["Product Code", "CAS No", "Product Name", "Packing", "HSN Code", "Price"],
        variants: paginated
      }
    ]
  }

  /* ---------------- Qualigens ---------------- */
else if (brandKey === "qualigens") {
  let qualigensProducts: any[] = []
  try {
    const raw: any = (qualigensProductsRaw as any).default || qualigensProductsRaw
    qualigensProducts = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
  } catch {
    notFound()
  }

  const toPORIfZero = (v: any): number | string => {
    if (v == null) return "POR"
    const s = String(v).trim()
    if (!s) return "POR"
    // treat any numeric <= 0 as POR (handles "0", "0.00", 0, etc.)
    const n = Number(s.replace(/[^\d.]/g, ""))
    if (Number.isFinite(n) && n > 0) return n
    return "POR"
  }

  const filtered = qualigensProducts.filter((p) =>
    Object.values(p).some((v) =>
      String(v).toLowerCase().includes(String(searchQuery).toLowerCase())
    )
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
        // ⬇️ convert 0-ish to "POR", keep positive numbers as numbers
        Price: toPORIfZero(p["Price"]),
        "HSN Code": p["HSN Code"] || "",
      })),
    },
  ]
}


  /* ---------------- Omsons ---------------- */
  else if (brandKey === "omsons") {
    const raw = omsonsDataRaw as any
    const sections: any[] = Array.isArray(raw?.catalog) ? raw.catalog : []

    const q = String(searchQuery ?? "").trim().toLowerCase()
    const normKey = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()
    const hasVal = (row: any, k: string) => {
      const v = row?.[k]
      return v !== undefined && v !== null && String(v).trim() !== ""
    }
    const parseNum = (v: any) => {
      if (typeof v === "number" && Number.isFinite(v)) return v
      if (v == null) return null
      const n = Number(String(v).replace(/[^\d.]/g, ""))
      return Number.isFinite(n) ? n : null
    }
    const pickCI = (obj: any, candidates: string[]) => {
      for (const key of Object.keys(obj || {})) {
        const k = normKey(key)
        for (const c of candidates) {
          if (k === normKey(c)) {
            const v = obj[key]
            if (v !== undefined && v !== null && String(v).trim() !== "") return v
          }
        }
      }
      return ""
    }
    const findHeader = (headers: string[] = [], candidates: string[]) => {
      for (const h of headers) for (const c of candidates) {
        if (normKey(h) === normKey(c)) return h
      }
      return null
    }

    const codeLikeLabels = ["Cat. No.","Cat No","Cat No.","Catalogue No","Catalog No","Order Code","Code"]
    const nameKeyList = ["Product Name","Item","Description","Name","Product"]
    const packKeyList = ["Pack","Pack of","Pack Size","Qty/Pack","Quantity/Pack","Pkg","Packing"]
    const hsnKeyList  = ["HSN Code","HSN"]
    const priceFromHeaders = (headers: string[]) => headers.filter((h) => /price|rate/i.test(h))

    const groupedAll = sections.map((sec: any, idx: number) => {
      const sectionTitle = sec?.product_name || sec?.title || sec?.category || `Section ${idx + 1}`
      const origHeaders: string[] = Array.isArray(sec?.table_headers) ? sec.table_headers : []
      const variants = Array.isArray(sec?.variants) ? sec.variants : []
      const preferredCodeHeader = findHeader(origHeaders, codeLikeLabels)

      const pool = q
        ? variants.filter((v: any) =>
            Object.values(v || {}).some((val) => String(val ?? "").toLowerCase().includes(q))
          )
        : variants

      const pKeys = priceFromHeaders(origHeaders)
      const normalized = pool.map((row: any) => {
        const rawPrice = pickCI(row, pKeys.length ? pKeys : ["Price","Price / Piece","Rate","Amount","Price (₹)"])
        const priceNum = parseNum(rawPrice)

        const out: Record<string, any> = { ...row }
        out["Product Name"] = pickCI(row, nameKeyList) || sectionTitle
        if (!hasVal(out, "Pack")) out["Pack"] = pickCI(row, packKeyList)
        if (!hasVal(out, "HSN Code")) out["HSN Code"] = pickCI(row, hsnKeyList) || sec?.hsn || ""
        out["Price"] = priceNum != null ? priceNum : (rawPrice || "On request")
        return out
      })

      const core: string[] = []
      if (preferredCodeHeader && normalized.some(r => hasVal(r, preferredCodeHeader))) core.push(preferredCodeHeader)
      core.push("Product Name")

      const extrasCandidates = [
        "Size/Dia (mm)","Dia (mm)","Size (mm)","Diameter (mm)",
        "Capacity (mL)","Capacity ml","Capacity",
        "Length (mm)","Length",
        "Micro Rating (µm)","Pore Size (µm)","Pore Size (um)",
        "Membrane","Pack","HSN Code"
      ]
      const extras = extrasCandidates
        .filter((h) => normalized.some((r) => hasVal(r, h)))
        .filter((h, i, arr) => arr.findIndex(x => normKey(x) === normKey(h)) === i)

      const others = (Array.isArray(sec?.table_headers) ? sec.table_headers : [])
        .filter((h) => !["product code","spec","price"].includes(normKey(h)))
        .filter((h) => !core.some(c => normKey(c) === normKey(h)))
        .filter((h) => !extras.some(e => normKey(e) === normKey(h)))
        .filter((h) => normalized.some((r) => hasVal(r, h)))

      const headers = [...core, ...extras, ...others, "Price"]
      const rows = normalized.map((r) => {
        const o: Record<string, any> = {}
        for (const h of headers) o[h] = r[h] ?? ""
        return o
      })

      return {
        category: sectionTitle,
        title: sectionTitle,
        description: sec?.spec_header || "",
        _tableHeaders: headers,
        variants: rows,
      }
    }).filter((g: any) => Array.isArray(g.variants) && g.variants.length > 0)

    const sectionsPerPage = 8
    pageCount = Math.max(1, Math.ceil(groupedAll.length / sectionsPerPage))
    grouped = groupedAll.slice((page - 1) * sectionsPerPage, page * sectionsPerPage)
  }

  /* ---------------- Rankem ---------------- */
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
      if (!map[key]) {
        const headers = Object.keys(variant || {})
        map[key] = {
          ...groupMeta,
          variants: [],
          _tableHeaders: headers,
          _priceKey: guessDynamicPriceKey(headers),
        }
      }
      map[key].variants.push(variant)
    })

    grouped = Object.values(map)
  }

  /* ---------------- Add-to-cart helper ---------------- */
  const handleAdd = (row: any, group: any) => {
    if (!isLoaded) {
      toast({ title: "Loading…", description: "Please wait a moment.", variant: "destructive" })
      return
    }

    const codeVal = String(firstNonEmpty(row, codeKeys())).trim()
    const friendlyName = makeFriendlyName(row, group, codeVal)
    const packVal = String(firstNonEmpty(row, packKeys()) || "").trim()
    const casVal = String(firstNonEmpty(row, casKeys()) || "").trim()
    const hsnVal = String(firstNonEmpty(row, hsnKeys()) || "").trim()

    const dynPrice =
      (group?._priceKey ? row[group._priceKey] : undefined)
      ?? firstNonEmpty(row, priceKeys())
    const priceNum = parsePriceToNumber(dynPrice)

    const safeNameKey = normalizeKey(friendlyName).slice(0, 32)
    const id = `${brandKey}-${codeVal || safeNameKey || "item"}`

    addItem({
      id,
      name: friendlyName,
      productName: friendlyName,
      code: codeVal,
      productCode: codeVal,
      catNo: codeVal,
      casNo: casVal,
      packSize: packVal,
      packing: (row.Packing ?? row["Pack"] ?? ""),
      hsn: hsnVal,
      price: priceNum,
      quantity: 1,
      brand: (labSupplyBrands as any)[brandKey]?.name ?? "Product",
      category: stripTablePrefix(group?.category || group?.title),
      image: null,
    })

    const priceMsg = priceNum > 0 ? inr(priceNum) : "Price on request"
    toast({ title: "Added to Cart", description: `${friendlyName}${codeVal ? ` (${codeVal})` : ""} • ${priceMsg}` })
  }

  /* ---------------- Render ---------------- */
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
            <h2 className="text-lg font-semibold mb-3">{stripTablePrefix(group.title)}</h2>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    {group._tableHeaders.map((h: string) => (
                      <th key={h} className="py-2 px-3">{h}</th>
                    ))}
                    <th className="py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {group.variants.map((row: any, ri: number) => {
                    const rawForPrice = (group._priceKey ? row[group._priceKey] : undefined) ?? firstNonEmpty(row, priceKeys())
                    const priceNum = parsePriceToNumber(rawForPrice)
                    const displayPrice = priceNum > 0 ? inr(priceNum) : "Price on request"

                    return (
                      <tr key={ri} className="border-b last:border-none">
                        {group._tableHeaders.map((h: string) => {
                          const cell = row[h]
                          if (/price|rate/i.test(h)) {
                            const n = parsePriceToNumber(cell)
                            return (
                              <td key={`${ri}-${h}`} className="py-2 px-3">
                                {n > 0 ? inr(n) : (String(cell ?? "").trim() || "—")}
                              </td>
                            )
                          }
                          return (
                            <td key={`${ri}-${h}`} className="py-2 px-3">
                              {typeof cell === "number" ? cell : (cell ?? "—")}
                            </td>
                          )
                        })}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{displayPrice}</span>
                            <Button size="sm" onClick={() => handleAdd(row, group)}>
                              Add
                            </Button>
                          </div>
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
