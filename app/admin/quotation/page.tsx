"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import jsPDF from "jspdf"

import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import rankemProducts from "@/lib/rankem_products.json"
import { qualigensProducts } from "@/lib/qualigens-products"
import whatmanProducts from "@/lib/whatman_products.json"
import himediaProducts from "@/lib/himedia_products_grouped"
import { commercialChemicals } from "@/lib/data"

interface QuotationItem {
  id: number
  productName: string
  brand: string
  packSize: string
  quantity: number
  price: number
  note: string
  custom: boolean
}

interface ProductEntry {
  productName: string
  brand: string
  code: string
  packSize: string
  price: number
}

export default function QuotationBuilder() {
  const [items, setItems] = useState<QuotationItem[]>([])
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
    note: "",
  })
  const [filtered, setFiltered] = useState<ProductEntry[]>([])
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)

  const allProducts: ProductEntry[] = []

  const addGrouped = (src: any[], brand: string, map: (g: any, v: any) => ProductEntry) => {
    src?.forEach(g => g?.variants?.forEach((v: any) => allProducts.push(map(g, v))))
  }

  const addFlat = (src: any[], brand: string, map: (p: any) => ProductEntry) => {
    src?.forEach(p => allProducts.push(map(p)))
  }

  addGrouped(borosilProducts, "Borosil", (g, v) => ({
    productName: g.product || g.title || g.name || "",
    brand: "Borosil",
    code: v.code || "",
    packSize: v.capacity || v["Pack Size"] || v.size || "",
    price: parseFloat(v.price || "0") || 0,
  }))

  addGrouped(rankemProducts, "Rankem", (g, v) => ({
    productName: g.product || g.title || g.name || "",
    brand: "Rankem",
    code: v["Product Code"] || v.code || "",
    packSize: v["Pack Size"] || v.size || "",
    price: parseFloat(v["Price"] || "0") || 0,
  }))

  addFlat(qualigensProducts, "Qualigens", (p) => ({
    productName: p["Product Name"] || p.name || "",
    brand: "Qualigens",
    code: p["Product Code"] || "",
    packSize: p["Pack Size"] || p.size || "",
    price: parseFloat(p["Price"] || "0") || 0,
  }))

  addFlat(whatmanProducts, "Whatman", (p) => ({
    productName: p.name || p.title || "",
    brand: "Whatman",
    code: p.code || "",
    packSize: p.size || "",
    price: parseFloat(p.price || "0") || 0,
  }))

  addGrouped(himediaProducts, "HiMedia", (g, v) => ({
    productName: g.product || g.title || g.name || "",
    brand: "HiMedia",
    code: v["Product Code"] || v.code || "",
    packSize: v["Pack Size"] || v.size || "",
    price: parseFloat(v["Price"] || "0") || 0,
  }))

  addFlat(commercialChemicals, "Bulk Chemical", (p) => ({
    productName: p.name || "",
    brand: "Bulk Chemical",
    code: p.code || "",
    packSize: p.size || "",
    price: parseFloat(p.price || "0") || 0,
  }))

  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return
    const newItem: QuotationItem = {
      id: Date.now(),
      productName: form.productName,
      brand: form.brand,
      packSize: form.packSize,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      note: form.note || "",
      custom: true,
    }
    setItems([...items, newItem])
    setForm({ productName: "", brand: "", packSize: "", quantity: "", price: "", note: "" })
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discounted = total - discount
  const taxed = discounted + (tax / 100) * discounted

  const generatePDF = () => {
    const doc = new jsPDF()
    doc.text("Chemical Corporation - Quotation", 10, 10)
    let y = 20
    items.forEach((item) => {
      doc.text(
        `${item.productName} (${item.packSize}) x${item.quantity} - ₹${item.price} (${item.brand})`,
        10,
        y
      )
      if (item.note) doc.text(`Note: ${item.note}`, 12, y + 6)
      y += item.note ? 14 : 8
    })
    doc.text(`Subtotal: ₹${total.toFixed(2)}`, 10, y)
    doc.text(`Discount: ₹${discount}`, 10, y + 8)
    doc.text(`Tax (${tax}%): ₹${((tax / 100) * discounted).toFixed(2)}`, 10, y + 16)
    doc.text(`Total: ₹${taxed.toFixed(2)}`, 10, y + 24)
    doc.save("quotation.pdf")
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">Quotation Builder</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-3 relative">
            <Label>Search</Label>
            <Input
              value={form.productName}
              onChange={(e) => {
                const query = e.target.value.toLowerCase()
                setForm({ ...form, productName: query })
                setFiltered(
                  allProducts.filter((p) =>
                    `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(query)
                  )
                )
              }}
            />
            {form.productName && filtered.length > 0 && (
              <div className="absolute z-10 bg-white shadow border mt-1 w-full max-h-64 overflow-y-auto text-sm">
                {filtered.slice(0, 50).map((product, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setForm({
                        productName: `${product.productName} (${product.code})`,
                        brand: product.brand,
                        packSize: product.packSize,
                        quantity: "",
                        price: product.price.toString(),
                        note: "",
                      })
                      setFiltered([])
                    }}
                  >
                    <strong>{product.productName}</strong>{" "}
                    <span className="text-xs text-gray-500">
                      [Code: {product.code}] • [₹{product.price}] • {product.packSize}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div><Label>Brand</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
          <div><Label>Pack Size</Label><Input value={form.packSize} onChange={e => setForm({ ...form, packSize: e.target.value })} /></div>
          <div><Label>Qty</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
          <div><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
          <div><Label>Note</Label><Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          <div className="md:col-span-6 text-right"><Button onClick={handleAdd}>Add</Button></div>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th>Product</th><th>Brand</th><th>Pack</th><th>Qty</th><th>Price</th><th>Total</th><th>Note</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td>{item.productName}</td>
                    <td>{item.brand}</td>
                    <td>{item.packSize}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">₹{item.price.toFixed(2)}</td>
                    <td className="text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div><Label>Discount (₹)</Label><Input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} /></div>
              <div><Label>Tax (%)</Label><Input type="number" value={tax} onChange={e => setTax(parseFloat(e.target.value) || 0)} /></div>
              <div className="flex items-end justify-end"><Button onClick={generatePDF}><Download className="mr-2 h-4 w-4" /> Export PDF</Button></div>
            </div>
            <div className="text-right mt-4 text-lg font-semibold">Total: ₹{taxed.toFixed(2)}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
