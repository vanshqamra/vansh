"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Chemical {
  code: string
  name: string
  category: string
}

interface Props {
  products: Chemical[]
  categories?: string[]
}

const getPackSize = (category: string) => {
  const lower = category.toLowerCase()
  if (lower.includes("acid") || lower.includes("solvent") || lower.includes("reagent")) {
    return "25 / 50 / 200 L"
  } else if (lower.includes("salt") || lower.includes("base")) {
    return "25 / 50 / 200 KG"
  }
  return "25 / 50 / 200"
}

export function BulkChemicalList({ products }: Props) {
  const [quantities, setQuantities] = useState<{ [code: string]: string }>({})

  const handleQuantityChange = (code: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [code]: value }))
  }

  const handleRequestQuote = (name: string, code: string) => {
    const qty = quantities[code] || "1"
    const message = `Hello, I would like to request a quotation for:\n\nProduct: ${name}\nCode: ${code}\nQuantity: ${qty}`
    const whatsappUrl = `https://wa.me/919915533998?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((chemical) => (
        <Card key={chemical.code} className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-blue-700 text-sm flex justify-between items-start">
              <span>{chemical.name}</span>
              <Badge className="text-xs">{getPackSize(chemical.category)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-slate-600"><strong>Code:</strong> {chemical.code}</p>
            <p className="text-slate-600"><strong>Category:</strong> {chemical.category}</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Qty"
                className="w-24"
                value={quantities[chemical.code] || ""}
                onChange={(e) => handleQuantityChange(chemical.code, e.target.value)}
              />
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleRequestQuote(chemical.name, chemical.code)}
              >
                Request Quotation
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
