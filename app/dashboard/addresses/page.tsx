"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Address {
  id?: string
  label?: string
  first_name?: string
  last_name?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  is_default?: boolean
}

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState<Address>({})

  useEffect(() => {
    fetch("/api/me/addresses")
      .then((r) => r.json())
      .then((j) => setAddresses(j.addresses || []))
      .catch(() => {})
  }, [])

  async function save() {
    const res = await fetch("/api/me/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const j = await res.json()
      setAddresses((a) => [j.address, ...a])
      setForm({})
    }
  }

  async function remove(id: string) {
    await fetch(`/api/me/addresses/${id}`, { method: "DELETE" })
    setAddresses((a) => a.filter((x) => x.id !== id))
  }

  return (
    <div className="container mx-auto py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>First name</Label>
              <Input
                value={form.first_name || ""}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Last name</Label>
              <Input
                value={form.last_name || ""}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>
          <Label>Address line 1</Label>
          <Input
            value={form.line1 || ""}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
          />
          <Label>Address line 2</Label>
          <Input
            value={form.line2 || ""}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>City</Label>
              <Input
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={form.state || ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input
                value={form.pincode || ""}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
          </div>
          <Label>Phone</Label>
          <Input
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Button className="mt-2" type="button" onClick={save}>
            Save
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {addresses.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {a.first_name} {a.last_name}
                </div>
                <div className="text-sm text-slate-600">
                  {[a.line1, a.city, a.state, a.pincode].filter(Boolean).join(", ")}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => remove(a.id!)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
        {addresses.length === 0 && <div>No addresses saved.</div>}
      </div>
    </div>
  )
}
