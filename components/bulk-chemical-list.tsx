// components/BulkChemicalList.tsx
"use client"

import { useState } from "react"
import { commercialChemicals } from "@/lib/data"

export function BulkChemicalList() {
  const [quantities, setQuantities] = useState<Record<string, string>>({})

  const handleQuantityChange = (code: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [code]: value }))
  }

  const getDefaultUnit = (category: string) => {
    return category === "Solvents" ? "L" : "kg"
  }

  const openWhatsApp = (product: { code: string; name: string; category: string }) => {
    const qty = quantities[product.code] || ""
    const unit = getDefaultUnit(product.category)
    const message = `I would like to request a quotation for ${product.name} - ${qty} ${unit}.`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank")
  }

  return (
    <div className="grid gap-4">
      {commercialChemicals.map((product) => (
        <div key={product.code} className="border p-4 rounded-xl shadow-md">
          <div className="font-semibold text-lg">{product.name}</div>
          <div className="text-sm text-gray-500 mb-2">Category: {product.category}</div>
          <input
            type="number"
            placeholder={`Qty (${getDefaultUnit(product.category)})`}
            value={quantities[product.code] || ""}
            onChange={(e) => handleQuantityChange(product.code, e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={() => openWhatsApp(product)}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Request Quotation
          </button>
        </div>
      ))}
    </div>
  )
}
