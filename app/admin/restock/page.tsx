"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/clients" // ✅ Updated import
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

type ReorderItem = {
  id: number
  productName: string
  brand: string
  packSize?: string
  quantity: number
  priority: string
  notes?: string
  status: "Not Ordered" | "Ordered"
}

export default function RestockPage() {
  const [items, setItems] = useState<ReorderItem[]>([])
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    packSize: "",
    quantity: "",
    priority: "Medium",
    notes: "",
  })
  const [userRole, setUserRole] = useState<null | string>(null)
  const [loading, setLoading] = useState(true)

  // 🔐 Check for admin user
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setUserRole(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("users") // or "profiles", depending on your schema
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (error || !data) {
        setUserRole(null)
      } else {
        setUserRole(data.role)
      }

      setLoading(false)
    }

    checkAdmin()
  }, [])

  const handleAdd = () => {
    if (!form.productName || !form.brand || !form.quantity) {
      alert("Product name, brand, and quantity are required.")
      return
    }

    const newItem: ReorderItem = {
      id: Date.now(),
      productName: form.productName,
      brand: form.brand,
      packSize: form.packSize || "",
      quantity: parseInt(form.quantity),
      priority: form.priority,
      notes: form.notes,
      status: "Not Ordered",
    }

    setItems([newItem, ...items])
    setForm({
      productName: "",
      brand: "",
      packSize: "",
      quantity: "",
      priority: "Medium",
      notes: "",
    })
  }

  const markAsOrdered = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, status: "Ordered" } : item))
  }

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id))
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (userRole !== "admin") return <div className="p-10 text-center text-red-600 text-lg">403 – Forbidden</div>

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">🧾 Reorder Dashboard</h1>

      {/* Add Product Form */}
      <Card className="mb-10 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Add Missing Product</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Product Name</Label>
            <Input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} />
          </div>
          <div>
            <Label>Brand / Supplier</Label>
            <Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div>
            <Label>Pack Size</Label>
            <Input value={form.packSize} onChange={e => setForm({ ...form, packSize: e.target.value })} />
          </div>
          <div>
            <Label>Quantity Needed</Label>
            <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div>
            <Label>Priority</Label>
            <select
              className="w-full rounded-md border border-gray-300 h-10 px-2"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={handleAdd}>Add to Reorder List</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reorder Table */}
      {items.length === 0 ? (
        <div className="text-center text-slate-500">No items added yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.id} className="bg-white/70 backdrop-blur">
              <CardHeader className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle>{item.productName}</CardTitle>
                  <p className="text-sm text-slate-600">
                    {item.brand} {item.packSize ? `• ${item.packSize}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-600 text-white">Qty: {item.quantity}</Badge>
                  <Badge className={`text-white ${
                    item.priority === "High" ? "bg-red-600" :
                    item.priority === "Medium" ? "bg-yellow-500" : "bg-gray-500"
                  }`}>
                    {item.priority}
                  </Badge>
                  <Badge className={item.status === "Ordered" ? "bg-green-600 text-white" : "bg-orange-600 text-white"}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center flex-wrap gap-4">
                <p className="text-sm text-slate-700">{item.notes}</p>
                <div className="flex gap-2">
                  {item.status === "Not Ordered" && (
                    <Button size="sm" onClick={() => markAsOrdered(item.id)}>Mark Ordered</Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Remove</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
