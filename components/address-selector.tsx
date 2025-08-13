"use client"

import { useEffect, useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Address = {
  id?: string
  label?: string
  first_name?: string
  last_name?: string
  company?: string
  gst?: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
  notes?: string
  is_default?: boolean
}

export default function AddressSelector({
  value,
  onChange,
}: {
  value: Address | null
  onChange: (a: Address | null) => void
}) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [mode, setMode] = useState<"list" | "new">("list")
  const [form, setForm] = useState<Address>({})

  useEffect(() => {
    fetch("/api/me/addresses")
      .then((r) => r.json())
      .then((j) => setAddresses(j.addresses || []))
      .catch(() => {})
  }, [])

  function handleSelect(id: string) {
    if (id === "__new") {
      setMode("new")
      onChange(form)
      return
    }
    const addr = addresses.find((a) => a.id === id) || null
    onChange(addr)
    setMode("list")
  }

  function confirmNew() {
    onChange(form)
    setMode("list")
  }

  return (
    <div className="space-y-3">
      {mode === "list" && (
        <RadioGroup value={value?.id || ""} onValueChange={handleSelect}>
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start space-x-2 p-2 border rounded">
              <RadioGroupItem value={a.id!} />
              <Label className="cursor-pointer">
                {a.label || `${a.first_name ?? ""} ${a.last_name ?? ""}`}
                <div className="text-xs text-slate-500">
                  {[a.line1, a.city, a.state, a.pincode].filter(Boolean).join(", ")}
                </div>
              </Label>
            </div>
          ))}
          <div className="flex items-center space-x-2 p-2 border rounded">
            <RadioGroupItem value="__new" />
            <Label className="cursor-pointer">Add new address</Label>
          </div>
        </RadioGroup>
      )}

      {mode === "new" && (
        <div className="space-y-2 border p-3 rounded">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="First name"
              value={form.first_name || ""}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
            <Input
              placeholder="Last name"
              value={form.last_name || ""}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
          <Input
            placeholder="Line 1"
            value={form.line1 || ""}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
          />
          <Input
            placeholder="Line 2"
            value={form.line2 || ""}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="City"
              value={form.city || ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              placeholder="State"
              value={form.state || ""}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Pincode"
              value={form.pincode || ""}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button type="button" onClick={confirmNew}>
              Use this address
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("list")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
