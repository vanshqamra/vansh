"use client"

export const dynamic = "force-dynamic"

import { useState, useMemo } from "react"
import { useAuth } from "@/app/context/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AccessDenied } from "@/components/access-denied"
import { Download, Send } from "lucide-react"
import jsPDF from "jspdf"

import { getAllProducts, ProductEntry } from "@/lib/get-all-products"

interface QuotationItem {
  id: number
  productName: string
  brand: string
  packSize: string
  quantity: number
  price: number
  custom: boolean
}


export default function QuotationBuilder() {
  const { role, loading } = useAuth()
  if (!loading && role !== "admin") {
    return <AccessDenied />
  }

  const [items, setItems] = useState<QuotationItem[]>([])
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
  })
  const [filtered, setFiltered] = useState<ProductEntry[]>([])
  const allProducts = useMemo(() => getAllProducts(), [])

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
    setItems(items.filter((item) => item.id !== id))
  }

  const handleSendEmail = () => {
    const doc = new jsPDF()
    doc.text("Quotation", 10, 10)
    let y = 20
    items.forEach((item) => {
      doc.text(`${item.productName} - Qty: ${item.quantity} - ₹${item.price}`, 10, y)
      y += 10
    })
    doc.save("quotation.pdf")
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
          <div className="relative md:col-span-3">
            <Label>Search Product</Label>
            <Input
              value={form.productName}
              onChange={(e) => {
                const query = e.target.value.toLowerCase()
                const results = allProducts.filter((p) =>
                  `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(query)
                )
                setForm({ ...form, productName: query })
                setFiltered(results)
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
                        price: product.price ? product.price.toString() : "",
                      })
                      setFiltered([])
                    }}
                  >
                    <span className="font-medium">{product.productName}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      [Code: {product.code}] • [Size: {product.packSize}]
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Brand</Label>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div>
            <Label>Pack Size</Label>
            <Input value={form.packSize} onChange={(e) => setForm({ ...form, packSize: e.target.value })} />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
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
                {items.map((item) => (
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
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleSendEmail}>
                <Send className="mr-2 h-4 w-4" /> Send by Email
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
