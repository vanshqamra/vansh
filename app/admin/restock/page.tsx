// ✅ quotation-builder.tsx (complete standalone version with array guards)
"use client"

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

interface RestockItem {
  id: number
  productName: string
  brand: string
  packSize: string
  quantity: number
  price: number
}

export default function RestockPage() {
  const [items, setItems] = useState<RestockItem[]>([])
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    packSize: "",
    quantity: "",
    price: "",
  })
  const [filtered, setFiltered] = useState<any[]>([])

  const allProducts: any[] = [
    ...(Array.isArray(borosilProducts) ? borosilProducts : []).flatMap(group => (group.variants || []).map(variant => ({
      productName: group.product,
      brand: "Borosil",
      code: variant.code,
      packSize: variant.capacity || variant["Pack Size"] || variant.size || "",
      price: parseFloat(variant.price),
    }))),
    ...(Array.isArray(rankemProducts) ? rankemProducts : []).flatMap(group => (group.variants || []).map(variant => ({
      productName: group.product || group.title,
      brand: "Rankem",
      code: variant["Product Code"] || variant.code,
      packSize: variant["Pack Size"],
      price: parseFloat(variant["Price"]),
    }))),
    ...(Array.isArray(qualigensProducts) ? qualigensProducts : []).map(p => ({
      productName: p["Product Name"],
      brand: "Qualigens",
      code: p["Product Code"],
      packSize: p["Pack Size"],
      price: parseFloat(p["Price"]),
    })),
    ...(Array.isArray(whatmanProducts) ? whatmanProducts : []).map(p => ({
      productName: p.name,
      brand: "Whatman",
      code: p.code,
      packSize: p.size,
      price: parseFloat(p.price),
    })),
    ...(Array.isArray(himediaProducts) ? himediaProducts : []).flatMap(group => (group.variants || []).map(v => ({
      productName: group.product || group.title,
      brand: "HiMedia",
      code: v["Product Code"] || v.code,
      packSize: v["Pack Size"] || v.size,
      price: parseFloat(v["Price"]),
    }))),
    ...(Array.isArray(commercialChemicals) ? commercialChemicals : []).map(p => ({
      productName: p.name || p["Product Name"],
      brand: "Bulk Chemical",
      code: p.code || p["Product Code"],
      packSize: p.size || p["Pack Size"],
      price: parseFloat(p.price),
    })),
  ]

  const handleAdd = () => {
    if (!form.productName || !form.quantity || !form.price) return
    const newItem: RestockItem = {
      id: Date.now(),
      productName: form.productName,
      brand: form.brand,
      packSize: form.packSize,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
    }
    setItems([...items, newItem])
    setForm({ productName: "", brand: "", packSize: "", quantity: "", price: "" })
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Restock Request</h1>
        <p className="text-gray-500">Admin-only tool to mark needed items for reorder</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mark Product for Restock</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-3">
            <Label>Search Product</Label>
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
            <CardTitle>Restock Preview</CardTitle>
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
                    <td className="text-center">
                      <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
