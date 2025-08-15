"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import brandDiscounts from "@/lib/brandDiscounts"

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart, isLoaded } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const getDiscountedPrice = (item) => {
    const discount = brandDiscounts[item.brand] || 0
    return item.price ? item.price * (1 - discount / 100) : null
  }

  const subtotal = state.items.reduce((sum, item) => {
    const discounted = getDiscountedPrice(item)
    return sum + (discounted ?? 0) * item.quantity
  }, 0)

  useEffect(() => {
    setDiscount(0)
  }, [state.items])

  const applyPromoCode = () => {
    const code = promoCode.toLowerCase()
    if (code === "save10") {
      setDiscount(subtotal * 0.1)
    } else if (code === "welcome") {
      setDiscount(500)
    } else {
      setDiscount(0)
    }
  }

  const totalAfterDiscount = Math.max(0, subtotal - discount)
  const taxAmount = Math.round(totalAfterDiscount * 0.18)
  const finalTotal = totalAfterDiscount + taxAmount

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6" /> Cart
      </h1>

      {state.items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-lg text-gray-500">Your cart is empty.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 font-medium">
            ← Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {state.items.map((item, index) => {
            const rawName = item.name?.trim() || ""
            const name =
              rawName.toLowerCase().startsWith("table") || rawName === ""
                ? item.product || item.title || "Unnamed Product"
                : rawName

            const unitPrice = getDiscountedPrice(item)
            const discountPercent = brandDiscounts[item.brand] || 0

            return (
              <div
                key={item.id || index}
                className="border p-4 rounded shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start"
              >
                <div className="flex gap-4 items-start w-full">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg?height=80&width=80"}
                      alt={name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
                    {item.catNo && <p className="text-sm text-gray-600">Cat No: {item.catNo}</p>}
                    {item.casNo && <p className="text-sm text-gray-600">CAS No: {item.casNo}</p>}
                    {item.grade && <p className="text-sm text-gray-600">Grade: {item.grade}</p>}
                    {item.hsn && <p className="text-sm text-gray-600">HSN Code: {item.hsn}</p>}
                    {item.brand && <p className="text-sm text-gray-500">Brand: {item.brand}</p>}
                    {item.category && <p className="text-sm text-gray-500">Category: {item.category}</p>}
                    {item.packSize && <p className="text-sm text-gray-500">Pack Size: {item.packSize}</p>}
                    {item.price > 0 && (
                      <div className="text-sm text-gray-500">
                        <span className="line-through text-red-400">₹{item.price.toLocaleString()}</span>{" "}
                        <span className="font-semibold text-green-600">₹{unitPrice.toFixed(2)}</span>{" "}
                        <span className="text-xs text-green-700">({discountPercent}% off)</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 lg:pt-0">
                  <Button
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold px-2">{item.quantity}</span>
                  <Button variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}

          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="border px-4 py-2 rounded w-48"
                />
                <Button variant="outline" onClick={applyPromoCode}>
                  Apply
                </Button>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-600">Subtotal: ₹{subtotal.toLocaleString()}</p>
                {discount > 0 && <p className="text-sm text-green-600">Extra Promo: -₹{discount.toLocaleString()}</p>}
                <p className="text-sm text-gray-600">
                  Shipping: <span className="text-green-700">As Applicable</span>
                </p>
                <p className="text-sm text-gray-600">GST (18%): ₹{taxAmount.toLocaleString()}</p>
                <p className="text-lg font-bold mt-1">Total: ₹{finalTotal.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
              <Link href="/checkout">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
