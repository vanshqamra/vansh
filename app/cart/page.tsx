"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()

  const shippingThreshold = 10000
  const shippingCost = state.total >= shippingThreshold ? 0 : 500
  const finalTotal = state.total + shippingCost

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-32 w-32 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h1>
          <p className="text-slate-600 mb-8">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link href="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700 bg-transparent">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      ) : (
                        <div className="text-slate-400 text-xs text-center">No Image</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                        {item.category && <Badge variant="secondary">{item.category}</Badge>}
                      </div>
                      {item.packSize && <p className="text-sm text-slate-600 mt-1">Pack Size: {item.packSize}</p>}
                      {item.casNumber && <p className="text-sm text-slate-600">CAS: {item.casNumber}</p>}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = Number.parseInt(e.target.value) || 1
                            updateQuantity(item.id, newQuantity)
                          }}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-slate-600">₹{item.price.toLocaleString()} each</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>₹{state.total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingCost.toLocaleString()}`
                    )}
                  </span>
                </div>

                {state.total < shippingThreshold && (
                  <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                    Add ₹{(shippingThreshold - state.total).toLocaleString()} more to get free shipping!
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="w-full">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/products" className="w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
