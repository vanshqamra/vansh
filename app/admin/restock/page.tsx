// ✅ quotation-builder.tsx and restock-page.tsx in one document

// --- Start of RestockPage.tsx ---
"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

import borosilProducts from "@/lib/borosil_products_absolute_final.json"
import rankemProducts from "@/lib/rankem_products.json"
import { qualigensProducts } from "@/lib/qualigens-products"
import whatmanProducts from "@/lib/whatman_products.json"
import himediaProducts from "@/lib/himedia_products_grouped"
import { commercialChemicals } from "@/lib/data"

const allProducts = [
  ...borosilProducts.flatMap(group => group.variants?.map(variant => ({
    name: group.product,
    brand: "Borosil",
    code: variant.code,
    packSize: variant.capacity || variant["Pack Size"] || variant.size || "",
  })) || []),
  ...rankemProducts.flatMap(group => group.variants?.map(variant => ({
    name: group.product || group.title,
    brand: "Rankem",
    code: variant["Product Code"] || variant.code,
    packSize: variant["Pack Size"],
  })) || []),
  ...qualigensProducts.map(p => ({
    name: p["Product Name"],
    brand: "Qualigens",
    code: p["Product Code"],
    packSize: p["Pack Size"],
  })),
  ...whatmanProducts.map(p => ({
    name: p.name,
    brand: "Whatman",
    code: p.code,
    packSize: p.size,
  })),
  ...himediaProducts.flatMap(group => group.variants?.map(v => ({
    name: group.product || group.title,
    brand: "HiMedia",
    code: v["Product Code"] || v.code,
    packSize: v["Pack Size"] || v.size,
  })) || []),
  ...commercialChemicals.map(p => ({
    name: p.name || p["Product Name"],
    brand: "Bulk Chemical",
    code: p.code || p["Product Code"],
    packSize: p.size || p["Pack Size"],
  })),
]

export default function RestockPage() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState("")
  const [matches, setMatches] = useState([])
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) return router.replace("/login")

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (error || data?.role !== "admin") return router.replace("/dashboard")

      setUserRole("admin")
      setLoading(false)
    }

    checkAdmin()
  }, [router, supabase])

  useEffect(() => {
    if (search.trim().length > 1) {
      const query = search.toLowerCase().replace(/[^a-z0-9]/gi, "")
      const filtered = allProducts.filter(p => {
        const key = `${p.name}${p.code}${p.packSize}${p.brand}`.toLowerCase().replace(/[^a-z0-9]/gi, "")
        return key.includes(query)
      })
      setMatches(filtered.slice(0, 15))
    } else {
      setMatches([])
    }
  }, [search])

  const handleAdd = () => {
    if (!selected || !quantity) return alert("Select product and quantity")
    const newItem = {
      id: Date.now(),
      productName: selected.name,
      brand: selected.brand,
      packSize: selected.packSize,
      quantity: parseInt(quantity),
      priority,
      notes,
      status: "Not Ordered",
    }
    setItems([newItem, ...items])
    setSearch("")
    setSelected(null)
    setQuantity("")
    setPriority("Medium")
    setNotes("")
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (userRole !== "admin") return null

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">🧾 Reorder Dashboard</h1>
      <Card className="mb-10 bg-white/80 backdrop-blur-sm">
        <CardHeader><CardTitle>Search and Add Product</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Search Product</Label>
            <div className="relative">
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Type to search..." />
              {matches.length > 0 && (
                <div className="absolute bg-white border w-full shadow-md max-h-60 overflow-y-auto z-10 text-sm">
                  {matches.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelected(item)
                        setSearch(`${item.name} (${item.code})`)
                        setMatches([])
                      }}
                    >
                      <span className="font-medium">{item.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">[Code: {item.code}] • [Size: {item.packSize}] • [Brand: {item.brand}]</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Quantity</Label><Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} /></div>
              <div>
                <Label>Priority</Label>
                <select
                  className="w-full rounded-md border border-gray-300 h-10 px-2"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button onClick={handleAdd}>Add to Reorder List</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <div className="text-center text-slate-500">No items added yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
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
                    <Button size="sm" onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, status: "Ordered" } : i))}>Mark Ordered</Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => setItems(items.filter(i => i.id !== item.id))}>Remove</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
