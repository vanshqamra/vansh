"use client"

export const dynamic = "force-dynamic"
const safeArray = (x: any): any[] => (Array.isArray(x) ? x : []);
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"

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
  })
  const [filtered, setFiltered] = useState<ProductEntry[]>([])

  const allProducts: ProductEntry[] = []

  const addGroupedProducts = (source: any, brand: string, extract: (g: any, v: any) => ProductEntry) => {
    if (!Array.isArray(source)) return
    source.forEach((group) => {
      (group.variants || []).forEach((variant: any) => {
        allProducts.push(extract(group, variant))
      })
    })
  }

  const addFlatProducts = (source: any, brand: string, extract: (p: any) => ProductEntry) => {
    if (!Array.isArray(source)) return
    source.forEach((p) => {
      allProducts.push(extract(p))
    })
  }

  addGroupedProducts(safeArray(borosilProducts), "Borosil", (group, v) => ({
  productName: group.product || group.title || group.name || "",
  brand: "Borosil",
  code: v.code || "",
  packSize: v.capacity || v["Pack Size"] || v.size || "",
  price: parseFloat(v.price || "0") || 0,
}))

addGroupedProducts(safeArray(rankemProducts), "Rankem", (group, v) => ({
  productName: group.product || group.title || group.name || "",
  brand: "Rankem",
  code: v["Product Code"] || v.code || "",
  packSize: v["Pack Size"] || v.size || "",
  price: parseFloat(v["Price"] || "0") || 0,
}))

addFlatProducts(safeArray(qualigensProducts), "Qualigens", (p) => ({
  productName: p["Product Name"] || p.product || p.name || "",
  brand: "Qualigens",
  code: p["Product Code"] || p.code || "",
  packSize: p["Pack Size"] || p.size || "",
  price: parseFloat(p["Price"] || "0") || 0,
}))

addFlatProducts(safeArray(whatmanProducts), "Whatman", (p) => ({
  productName: p.name || p.title || "",
  brand: "Whatman",
  code: p.code || p["Product Code"] || "",
  packSize: p.size || p["Pack Size"] || "",
  price: parseFloat(p.price || "0") || 0,
}))

addGroupedProducts(safeArray(himediaProducts), "HiMedia", (group, v) => ({
  productName: group.product || group.title || group.name || "",
  brand: "HiMedia",
  code: v["Product Code"] || v.code || "",
  packSize: v["Pack Size"] || v.size || "",
  price: parseFloat(v["Price"] || "0") || 0,
}))

addFlatProducts(safeArray(commercialChemicals), "Bulk Chemical", (p) => ({
  productName: p.name || p["Product Name"] || "",
  brand: "Bulk Chemical",
  code: p.code || p["Product Code"] || "",
  packSize: p.size || p["Pack Size"] || "",
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
                        price: product.price.toString(),
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
