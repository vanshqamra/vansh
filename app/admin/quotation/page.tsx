"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"

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
  const [items, setItems] = useState<QuotationItem[]>([])
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
  })

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
          <div>
            <Label>Product Name</Label>
            <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
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
            <div className="mt-4 text-right">
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
