"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import rankemProducts from "@/lib/rankem_products.json"
import { qualigensProducts } from "@/lib/qualigens-products"
import whatmanProducts from "@/lib/whatman_products.json"
import jsPDF from "jspdf"

interface QuotationItem {
  id: number
  productName: string
  brand: string
  packSize: string
  quantity: number
  price: number
  custom: boolean
}

const allProducts: any[] = [
  ...(borosilProducts as any[]).flatMap(group =>
    (group.variants || []).map((v: any) => ({
      name: v.name || group.product || "",
      brand: "Borosil",
      packSize: v.packSize || v["Pack Size"] || (v.capacity_ml ? `${v.capacity_ml} ml` : ""),
      price: typeof v.price === "number" ? v.price : Number(v.price) || 0,
    }))
  ),
  ...(rankemProducts as any[]).flatMap(group =>
    (group.variants || []).map((v: any) => ({
      name: v["Description"] || v["Unnamed: 1"] || "",
      brand: "Rankem",
      packSize:
        v["Pack\nSize"] || v["Pack Size"] || v["Pack size"] || v["Unnamed: 3"] || "",
      price:
        typeof v["List Price\n2025(INR)"] === "number"
          ? v["List Price\n2025(INR)"]
          : typeof v.Price === "number"
            ? v.Price
            : typeof v["Unnamed: 5"] === "number"
              ? v["Unnamed: 5"]
              : 0,
    }))
  ),
  ...qualigensProducts.map(p => ({
    name: p.name,
    brand: "Qualigens",
    packSize: p.packSize,
    price: p.price,
  })),
  ...(((whatmanProducts as any)?.variants) || []).map((v: any) => ({
    name: v.name || v["name"],
    brand: "Whatman",
    packSize: "",
    price: typeof v.price === "number" ? v.price : Number(v.price) || 0,
  })),
]

export default function QuotationBuilder() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<QuotationItem[]>([])
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
  })
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login")
      else if (role !== "admin") router.replace("/dashboard")
    }
  }, [user, role, loading, router])

  useEffect(() => {
    const search = form.productName
    if (search.trim().length > 1) {
      const query = search.toLowerCase().replace(/[^a-z0-9]/g, "")
      const filtered = allProducts.filter(p => {
        const key = (p.name + p.brand + (p.packSize || ""))
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
        return key.includes(query)
      })
      setMatches(filtered.slice(0, 10))
    } else {
      setMatches([])
    }
  }, [form.productName])

  const handleSelect = (product: any) => {
    setForm({
      productName: product.name,
      brand: product.brand,
      packSize: product.packSize || "",
      quantity: "",
      price: product.price ? String(product.price) : "",
    })
    setMatches([])
  }

  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return

    const newItem: QuotationItem = {
      id: Date.now(),
      productName: form.productName,
      brand: form.brand,
      packSize: form.packSize,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      custom: true,
    }

    setItems([...items, newItem])
    setForm({ productName: "", brand: "", packSize: "", quantity: "", price: "" })
  }

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id))
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Chemical Corporation, Ludhiana", 14, 20)

    doc.setFontSize(12)
    let y = 30
    doc.text("Product", 14, y)
    doc.text("Brand", 60, y)
    doc.text("Pack Size", 90, y)
    doc.text("Qty", 120, y)
    doc.text("Price", 140, y)
    doc.text("Total", 170, y)
    y += 6

    items.forEach(item => {
      doc.text(item.productName, 14, y)
      doc.text(item.brand, 60, y)
      doc.text(item.packSize, 90, y)
      doc.text(String(item.quantity), 120, y)
      doc.text(item.price.toFixed(2), 140, y)
      doc.text((item.price * item.quantity).toFixed(2), 170, y)
      y += 6
    })

    y += 4
    doc.text(`Total: ₹${totalAmount.toFixed(2)}`, 14, y)
    doc.save("quotation.pdf")
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading || role !== "admin") return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Chemical Corporation, Ludhiana</h1>
        <p className="text-gray-500">Quotation Builder</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Product to Quotation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Label>Product Name</Label>
            <div className="relative">
              <Input
                value={form.productName}
                onChange={e => setForm({ ...form, productName: e.target.value })}
                placeholder="Type to search..."
              />
              {matches.length > 0 && (
                <div className="absolute bg-white border w-full shadow-md max-h-60 overflow-y-auto z-10">
                  {matches.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect(item)}
                    >
                      {item.name} <span className="text-xs text-gray-500">({item.brand})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Brand</Label>
            <Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div>
            <Label>Pack Size</Label>
            <Input value={form.packSize} onChange={e => setForm({ ...form, packSize: e.target.value })} />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="md:col-span-5 text-right">
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quotation Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th>Brand</th>
                  <th>Pack Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.productName}</td>
                    <td className="text-center">{item.brand}</td>
                    <td className="text-center">{item.packSize}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-center">₹{item.price.toFixed(2)}</td>
                    <td className="text-center">₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td className="text-center">
                      <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-semibold mt-4 text-lg">Total: ₹{totalAmount.toFixed(2)}</div>
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={exportPDF}>
                <Download className="mr-2 h-4 w-4" /> Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

