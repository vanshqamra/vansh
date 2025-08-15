"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AccessDenied } from "@/components/access-denied"
import ProductSearchInput from "@/components/product-search-input"

// Brand data imports
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import rankemProducts from "@/lib/rankem_products.json"
import qualigensProducts from "@/lib/qualigens-products.json"
import whatmanData from "@/lib/whatman_products.json"
import himediaData from "@/lib/himedia_products_grouped"
import { commercialChemicals as bulkProducts } from "@/lib/data"

// ✅ NEW imports for searchability
import avariceProductsRaw from "@/lib/avarice_products.json"
import omsonsDataRaw from "@/lib/omsons_products.json"

interface QuotationItem {
  id: number
  productCode: string
  productName: string
  brand: string
  packSize: string
  quantity: number
  price: number
  discount: number
  gst: number
  hsnCode?: string
}

interface FlatProduct {
  productName: string
  code: string
  brand: string
  packSize: string
  price: number
  hsnCode?: string
}

function QuotationBuilderInner() {
  // — Auth —
  const [auth, setAuth] = useState<{ role: string; loading: boolean }>({ role: "", loading: true })
  useEffect(() => {
    import("@/app/context/auth-context").then((mod) => {
      const { role, loading } = mod.useAuth()
      setAuth({ role, loading })
    })
  }, [])
  if (!auth.loading && auth.role !== "admin") return <AccessDenied />

  // — State & Refs —
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")

  const [items, setItems] = useState<QuotationItem[]>([])
  const [transport, setTransport] = useState(0)
  const [form, setForm] = useState({
    productName: "",
    productCode: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
    discount: "",
    gst: "",
  })
  const [filtered, setFiltered] = useState<FlatProduct[]>([])

  // (existing code uses this – define it safely)
  const containerRef = useRef<HTMLDivElement>(null)

  // — Load from Past Quotation —
  const sp = useSearchParams()
  const quoteId = sp.get("quoteId")
  useEffect(() => {
    if (!quoteId) return
    ;(async () => {
      const res = await fetch(`/api/quotations/${quoteId}`)
      if (!res.ok) return
      const q = await res.json()
      const saved = q.data_json || {}

      const restoredItems = (saved.items || []).map((i: any, idx: number) => ({
        id: Date.now() + idx,
        productCode: i.productCode || "",
        productName: i.productName || "",
        brand: i.brand || "",
        packSize: i.packSize || "",
        quantity: Number(i.quantity) || 0,
        price: Number(i.price) || 0,
        discount: Number(i.discount) || 0,
        gst: Number(i.gst) || 0,
        hsnCode: i.hsnCode || "",
      }))

      setItems(restoredItems)
      setTransport(Number(saved.transport || 0))
      if (q.client_name) setClientName(q.client_name)
      if (q.client_email) setClientEmail(q.client_email)
    })()
  }, [quoteId])

  const asArray = (x: any) => Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : []
  const toPrice = (v: any): number => {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (v == null) return 0
    const n = Number(String(v).replace(/[^\d.]/g, ""))
    return Number.isFinite(n) ? n : 0
  }
  const clean = (s: any) => typeof s === "string" ? s.replace(/[\u2028\u2029]/g, "").trim() : (s ?? "")

  // — Flatten all catalogs into one array once —
  const allProducts = useMemo<FlatProduct[]>(() => {
    const all: FlatProduct[] = []

    // Borosil
    if (Array.isArray(borosilProducts)) {
      borosilProducts.forEach((g: any) => {
        const category = g.category || g.product || ""
        const base = category ? `${category} – ${g.product || g.title || ""}` : g.product || g.title || ""
        ;(g.variants || []).forEach((v: any) => {
          const size = v.capacity_ml ? `${v.capacity_ml}ml` : v["Pack Size"] || v.size || ""
          const name = size ? `${base} (${size})` : base
          all.push({
            productName: name,
            code: v.code || "",
            brand: "Borosil",
            packSize: size,
            price: toPrice(v.price),
            hsnCode: v["HSN Code"] || "",
          })
        })
      })
    }

    // Rankem
    if (Array.isArray(rankemProducts)) {
      rankemProducts.forEach((g: any) => {
        ;(g.variants || []).forEach((v: any) => {
          const desc =
            typeof v.Description === "string" && v.Description.trim()
              ? v.Description.trim()
              : g.title || g.product || ""
          const size = v["Pack Size"] || v["Pack\nSize"] || v.Packing || v.size || ""
          all.push({
            productName: size ? `${desc} (${size})` : desc,
            code: v["Cat No"] || v["Product Code"] || "",
            brand: "Rankem",
            packSize: size,
            price: toPrice(v["List Price\n2025(INR)"] || v.Price),
            hsnCode: v["HSN Code"] || "",
          })
        })
      })
    }

    // Qualigens
    if (Array.isArray(qualigensProducts)) {
      ;(qualigensProducts as any[]).forEach((p: any) => {
        const desc = p["Product Name"] || p.name || ""
        const size = p["Pack Size"] || p.size || ""
        all.push({
          productName: size ? `${desc} (${size})` : desc,
          code: p["Product Code"] || p.code || "",
          brand: "Qualigens",
          packSize: size,
          price: toPrice(p.Price),
          hsnCode: p["HSN Code"] || "",
        })
      })
    }

    // Whatman
    try {
      const src: any = (whatmanData as any)?.default ?? whatmanData
      const variants: any[] = Array.isArray(src?.variants) ? src.variants : []
      variants.forEach((v) => {
        const desc = (v.name || v.title || src.title || "").toString().trim()
        const size = (v["Pack Size"] || v.size || "").toString().trim()
        const code = v.Code || v.code || ""
        const price = toPrice(v.Price ?? v.price ?? v["List Price"])
        all.push({
          productName: size ? `${desc} (${size})` : desc,
          code,
          brand: "Whatman",
          packSize: size,
          price,
          hsnCode: "",
        })
      })
    } catch (e) {
      console.warn("Whatman parse error:", e)
    }

    // ✅ HiMedia — handle BOTH shapes: nested (header_sections/sub_sections/products) OR flat (products)
    try {
      const src: any = (himediaData as any)?.default ?? himediaData
      if (Array.isArray(src)) {
        src.forEach((grp: any) => {
          // Nested structure
          if (Array.isArray(grp?.header_sections)) {
            grp.header_sections.forEach((header: any) => {
              ;(header?.sub_sections || []).forEach((sub: any) => {
                ;(sub?.products || []).forEach((v: any) => {
                  const code =
                    clean(v.code) ||
                    clean(v["Product Code"]) ||
                    clean(v["Cat No"]) ||
                    clean(v["Catalogue No"]) ||
                    ""
                  const size =
                    clean(v.packing) ||
                    clean(v["Pack Size"]) ||
                    clean(v["Pack\nSize"]) ||
                    clean(v.Packing) ||
                    clean(v.size) ||
                    ""
                  const desc = clean(v.name) || clean(sub?.sub_section) || clean(header?.header_section) || "HiMedia"
                  const price = toPrice(v.rate ?? v.price ?? v.Price)
                  const hsn = clean(v.hsn) || clean(v["HSN Code"]) || ""
                  all.push({
                    productName: size ? `${desc} (${size})` : desc,
                    code,
                    brand: "HiMedia",
                    packSize: size,
                    price,
                    hsnCode: hsn,
                  })
                })
              })
            })
          }
          // Flat grouped structure
          else if (Array.isArray(grp?.products)) {
            const groupName =
              clean(grp?.sub_section) ||
              clean(grp?.section) ||
              clean(grp?.title) ||
              clean(grp?.name) ||
              "HiMedia"
            ;(grp.products as any[]).forEach((v: any) => {
              const code =
                clean(v.code) ||
                clean(v["Product Code"]) ||
                clean(v["Cat No"]) ||
                clean(v["Catalogue No"]) ||
                ""
              const size =
                clean(v.packing) ||
                clean(v["Pack Size"]) ||
                clean(v["Pack\nSize"]) ||
                clean(v.Packing) ||
                clean(v.size) ||
                ""
              const desc = clean(v.name) || groupName
              const price = toPrice(v.rate ?? v.price ?? v.Price)
              const hsn = clean(v.hsn) || clean(v["HSN Code"]) || ""
              all.push({
                productName: size ? `${desc} (${size})` : desc,
                code,
                brand: "HiMedia",
                packSize: size,
                price,
                hsnCode: hsn,
              })
            })
          }
        })
      }
    } catch (e) {
      console.warn("HiMedia parse error:", e)
    }

    // ✅ Avarice — flatten product.variants
    try {
      const arr: any[] = asArray(avariceProductsRaw)
      arr.forEach((p: any) => {
        const base = clean(p?.product_name) || "Avarice Product"
        const code = clean(p?.product_code) || ""
        ;(p?.variants || []).forEach((v: any) => {
          const pack = clean(v?.packing)
          const price = toPrice(v?.price_inr)
          const hsn = clean(v?.hsn_code)
          all.push({
            productName: pack ? `${base} (${pack})` : base,
            code,
            brand: "Avarice",
            packSize: pack,
            price,
            hsnCode: hsn,
          })
        })
      })
    } catch (e) {
      console.warn("Avarice parse error:", e)
    }

    // ✅ Omsons — sections with table_headers + variants
    try {
      const src: any = (omsonsDataRaw as any)?.default ?? omsonsDataRaw
      const sections: any[] = Array.isArray(src?.catalog) ? src.catalog : []
      sections.forEach((sec: any) => {
        const title = clean(sec?.product_name || sec?.title || sec?.category || "Omsons")
        const headers: string[] = Array.isArray(sec?.table_headers) ? sec.table_headers : []
        const priceKey = headers.find((h) => /price|rate/i.test(h)) || "Price"
        ;(sec?.variants || []).forEach((v: any) => {
          const code = clean(v["Cat. No."] || v["Cat No"] || v["Code"] || v["Product Code"] || "")
          const pack = clean(v["Pack"] || v["Pack Size"] || v["Qty/Pack"] || v.Packing || v.size || "")
          const desc = clean(v["Product Name"] || v["Description"] || title)
          const price = toPrice(v[priceKey] ?? v["Price"])
          const hsn = clean(v["HSN Code"] || sec?.hsn)
          all.push({
            productName: pack ? `${desc} (${pack})` : desc,
            code,
            brand: "Omsons",
            packSize: pack,
            price,
            hsnCode: hsn,
          })
        })
      })
    } catch (e) {
      console.warn("Omsons parse error:", e)
    }

    // Bulk Commercial
    if (Array.isArray(bulkProducts)) {
      ;(bulkProducts as any[]).forEach((p: any) => {
        const desc = p.name || p["Product Name"] || ""
        const size = p.size || p["Pack Size"] || ""
        all.push({
          productName: size ? `${desc} (${size})` : desc,
          code: p.code || p["Product Code"] || "",
          brand: "Bulk Chemical",
          packSize: size,
          price: toPrice(p.price),
          hsnCode: p["HSN Code"] || "",
        })
      })
    }

    return all
  }, [])

  // — Close dropdown when clicking outside —
  useEffect(() => {
    console.log(
      "Totals:",
      allProducts.length,
      "HiMedia:", allProducts.filter(p => p.brand === "HiMedia").length,
      "Whatman:", allProducts.filter(p => p.brand === "Whatman").length
    )
  }, [allProducts])

  // Existing effect for closing dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFiltered([])
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // — Search handler —
  const handleSearch = (q: string) => {
    setForm((f) => ({ ...f, productName: q }))
    if (!q) return setFiltered([])
    const lower = q.toLowerCase()
    setFiltered(
      allProducts.filter((p) =>
        `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(lower)
      )
    )
  }

  // — When user selects one result —
  const handleSelect = (p: FlatProduct) => {
    setForm({
      productName: p.productName,
      productCode: p.code,
      brand: p.brand,
      packSize: p.packSize,
      quantity: "",
      price: p.price.toString(),
      discount: "",
      gst: "",
    })
    setFiltered([])
  }

  // — Add item to quotation —
  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return

    const matchByCode = allProducts.find((x) => x.code === form.productCode)
    const matchByName =
      allProducts.find((x) => x.productName === form.productName) ||
      allProducts.find((x) => `${x.productName} [${x.code}]` === form.productName)

    const match = matchByCode || matchByName

    const hsn = match?.hsnCode || ""
    const brand = form.brand || match?.brand || "Unknown"

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        productCode: form.productCode || match?.code || "",
        productName: form.productName || match?.productName || "",
        brand,
        packSize: form.packSize || match?.packSize || "",
        quantity: +form.quantity,
        price: +form.price,
        discount: +form.discount,
        gst: +form.gst,
        hsnCode: hsn,
      },
    ])

    setForm({
      productName: "",
      productCode: "",
      brand: "",
      packSize: "",
      quantity: "",
      price: "",
      discount: "",
      gst: "",
    })
  }

  // — Remove item —
  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id))

  // — Totals —
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity * (1 - i.discount / 100), 0)
  const gstTotal = items.reduce(
    (s, i) => s + i.price * i.quantity * (1 - i.discount / 100) * (i.gst / 100),
    0
  )
  const total = subtotal + gstTotal + transport

  // — Download DOCX (and save JSON to portal) —
  const downloadQuotation = async () => {
    const products = items.map((i, idx) => ({
      sr: idx + 1,
      description: i.productName,
      brand: i.brand,
      hsn: i.hsnCode || "",
      packSize: i.packSize,
      qty: i.quantity,
      price: i.price,
      discount: i.discount,
      gst: i.gst,
      total: i.price * i.quantity * (1 - i.discount / 100) * (1 + i.gst / 100),
    }))

    const grandTotal = total

    const payload = {
      client: clientName || "Client Name",
      clientEmail,
      date: new Date().toLocaleDateString(),
      products,
      transport,
      Transport: transport,
      TransportDisplay: transport > 0 ? `₹${transport.toFixed(2)}` : "",
      subtotal,
      gstTotal,
      grandTotal,
    }

    try {
      const saveRes = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: clientName ? `Quotation - ${clientName}` : `Quotation - ${new Date().toLocaleDateString()}`,
          clientName: clientName || "Client Name",
          clientEmail: clientEmail || null,
          status: "DRAFT",
          currency: "INR",
          totalsJson: { subtotal, gstTotal, transport, total },
          dataJson: { items, transport },
        }),
      })
      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({}))
        console.error("Save quotation failed:", err)
      }
    } catch (e) {
      console.error("Save quotation failed:", e)
    }

    const res = await fetch("/api/generate-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const blob = await res.blob()
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.download = `Quotation-${(clientName || "Client").replace(/\s+/g, "_")}.docx`
    link.click()
  }

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-8">
      {/* Client Details */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Client Name</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Labs" />
          </div>
          <div>
            <Label>Client Email</Label>
            <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="buyer@acme.com" />
          </div>
        </CardContent>
      </Card>

      {/* Add Product */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Add Product to Quotation</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-4 relative">
          {/* Search (reusable component with arrow keys) */}
          <div className="md:col-span-3">
            <Label>Search Product</Label>
            <ProductSearchInput
              products={allProducts as any}
              value={form.productName}
              onChange={(text) => setForm((f) => ({ ...f, productName: text }))}
              onSelect={(p) => {
                setForm({
                  productName: `${p.productName} [${p.code}]`,
                  productCode: p.code,
                  brand: p.brand,
                  packSize: p.packSize,
                  quantity: "",
                  price: p.price ? String(p.price) : "",
                  discount: "",
                  gst: "",
                })
              }}
              placeholder="Search product…"
            />
          </div>

          <div>
            <Label>Brand</Label>
            <Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
          </div>
          <div>
            <Label>Pack Size</Label>
            <Input value={form.packSize} readOnly />
          </div>
          <div>
            <Label>Qty</Label>
            <Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <Label>Discount %</Label>
            <Input type="number" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} />
          </div>
          <div>
            <Label>GST %</Label>
            <Input type="number" value={form.gst} onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))} />
          </div>
          <div className="md:col-span-7 text-right">
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Quotation Preview</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="transport" className="text-sm">Transport</Label>
                <Input
                  id="transport"
                  type="number"
                  value={transport}
                  onChange={(e) => setTransport(+e.target.value || 0)}
                  className="h-8 w-28"
                />
              </div>
              <Button variant="outline" onClick={downloadQuotation}>
                Download DOCX
              </Button>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-4">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b">
                  <th>Product</th><th>Brand</th><th>Pack Size</th><th>Qty</th>
                  <th>Price</th><th>Disc%</th><th>GST%</th><th>HSN</th><th>Total</th><th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b">
                    <td>{i.productName}</td>
                    <td className="text-center">{i.brand || "—"}</td>
                    <td className="text-center">{i.packSize}</td>
                    <td className="text-center">{i.quantity}</td>
                    <td className="text-center">₹{i.price.toFixed(2)}</td>
                    <td className="text-center">{i.discount}%</td>
                    <td className="text-center">{i.gst}%</td>
                    <td className="text-center">{i.hsnCode || "—"}</td>
                    <td className="text-center">₹{(i.price * i.quantity * (1 - i.discount / 100) * (1 + i.gst / 100)).toFixed(2)}</td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeItem(i.id)}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-4 text-sm">
              <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p>GST Total: ₹{gstTotal.toFixed(2)}</p>
              <p>Transport: ₹{transport.toFixed(2)}</p>
              <p className="mt-2 font-semibold">Total: ₹{total.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function QuotationBuilderPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading quotation…</div>}>
      <QuotationBuilderInner />
    </Suspense>
  )
}
