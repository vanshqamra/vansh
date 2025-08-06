"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download } from "lucide-react"

import borosil from "@/lib/borosil_products_absolute_final.json"
import rankem from "@/lib/rankem_products.json"
import { qualigensProducts } from "@/lib/qualigens-products"
import whatman from "@/lib/whatman_products.json"
import himedia from "@/lib/himedia_products_grouped"
import { commercialChemicals } from "@/lib/data"

interface QuotationItem {
  id: number
  productName: string
  brand: string
  packSize: string
  quantity: number
  price: number
  notes?: string
}

export default function QuotationBuilder() {
  const [items, setItems] = useState<QuotationItem[]>([])
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
    notes: "",
  })
  const [filtered, setFiltered] = useState<any[]>([])
  const [discount, setDiscount] = useState(0)
  const [taxRate, setTaxRate] = useState(18)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem("quotationDraft")
    if (saved) setItems(JSON.parse(saved))
  }, [])

  // Save draft
  useEffect(() => {
    localStorage.setItem("quotationDraft", JSON.stringify(items))
  }, [items])

  const allProducts = [
    ...(Array.isArray(borosil) ? borosil : []).flatMap(group =>
      (group.variants || []).map(v => ({
        productName: group.product || group.title || group.name || "",
        brand: "Borosil",
        code: v.code || "",
        packSize: v.capacity || v["Pack Size"] || v.size || "",
        price: parseFloat(v.price || "0") || 0,
      }))
    ),
    ...(Array.isArray(rankem) ? rankem : []).flatMap(group =>
      (group.variants || []).map(v => ({
        productName: group.product || group.title || group.name || "",
        brand: "Rankem",
        code: v["Product Code"] || v.code || "",
        packSize: v["Pack Size"] || v.size || "",
        price: parseFloat(v["Price"] || "0") || 0,
      }))
    ),
    ...(Array.isArray(qualigensProducts) ? qualigensProducts : []).map(p => ({
      productName: p["Product Name"] || p.product || p.name || "",
      brand: "Qualigens",
      code: p["Product Code"] || p.code || "",
      packSize: p["Pack Size"] || p.size || "",
      price: parseFloat(p["Price"] || "0") || 0,
    })),
    ...(Array.isArray(whatman) ? whatman : []).map(p => ({
      productName: p.name || p.title || "",
      brand: "Whatman",
      code: p.code || p["Product Code"] || "",
      packSize: p.size || p["Pack Size"] || "",
      price: parseFloat(p.price || "0") || 0,
    })),
    ...(Array.isArray(himedia) ? himedia : []).flatMap(group =>
      (group.variants || []).map(v => ({
        productName: group.product || group.title || group.name || "",
        brand: "HiMedia",
        code: v["Product Code"] || v.code || "",
        packSize: v["Pack Size"] || v.size || "",
        price: parseFloat(v["Price"] || "0") || 0,
      }))
    ),
    ...(Array.isArray(commercialChemicals) ? commercialChemicals : []).map(p => ({
      productName: p.name || p["Product Name"] || "",
      brand: "Bulk Chemical",
      code: p.code || p["Product Code"] || "",
      packSize: p.size || p["Pack Size"] || "",
      price: parseFloat(p.price || "0") || 0,
    })),
  ]

  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return

    const newItem: QuotationItem = {
      id: Date.now(),
      productName: form.productName,
      brand: form.brand,
      packSize: form.packSize,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      notes: form.notes || "",
    }

    setItems([...items, newItem])
    setForm({ productName: "", brand: "", packSize: "", quantity: "", price: "", notes: "" })
    setSelectedProduct(null)
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discounted = subtotal - discount
  const total = discounted + (discounted * taxRate) / 100

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Quotation Builder</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-3">
            <Label>Search Product</Label>
            <Input
              value={form.productName}
              onChange={(e) => {
                const query = e.target.value.toLowerCase()
                const results = allProducts.filter(p =>
                  `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(query)
                )
                setForm({ ...form, productName: query })
                setFiltered(results)
              }}
            />
            {form.productName && filtered.length > 0 && (
              <div className="absolute z-10 bg-white border mt-1 w-full max-h-64 overflow-y-auto text-sm shadow">
                {filtered.slice(0, 20).map((product, index) => (
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
                        notes: "",
                      })
                      setFiltered([])
                      setSelectedProduct(product)
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
          <div className="md:col-span-5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-5 text-right">
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <div className="mb-6 p-4 border rounded bg-white/80 text-sm text-slate-700">
          <strong>Preview:</strong> {selectedProduct.productName} | Brand: {selectedProduct.brand} | Pack: {selectedProduct.packSize} | Price: ₹{selectedProduct.price}
        </div>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quotation List</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Notes</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td>{item.productName}</td>
                    <td>{item.brand}</td>
                    <td>{item.packSize}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>{item.notes}</td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <Button variant="destructive" size="sm" onClick={() => setItems(items.filter(i => i.id !== item.id))}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Discount ₹</Label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Tax %</Label>
                <Input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="text-right font-semibold text-lg mt-6">
                Total: ₹{total.toFixed(2)}
              </div>
            </div>

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
