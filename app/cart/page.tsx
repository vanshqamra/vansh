"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/context/CartContext"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const { state, removeFromCart, updateQuantity } = useCart()

  const subtotal = state.total || 0
  const shippingCharges = subtotal < 10000 ? 500 : 0
  const gst = (subtotal + shippingCharges) * 0.18
  const totalAmount = subtotal + shippingCharges + gst

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  if (!state.items || state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some chemicals to your cart to get started.</p>
              <Button asChild size="lg">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({state.itemCount})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">{item.brand?.charAt(0) || "C"}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.brand}
                          </Badge>
                          {item.packSize && (
                            <Badge variant="secondary" className="text-xs">
                              {item.packSize}
                            </Badge>
                          )}
                        </div>
                        {item.casNumber && <p className="text-sm text-gray-600 mt-1">CAS: {item.casNumber}</p>}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} each</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({state.itemCount} items)</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        Shipping
                      </span>
                      <div className="text-right">
                        {shippingCharges > 0 ? (
                          <>
                            <span>₹{shippingCharges}</span>
                            <p className="text-xs text-gray-600">
                              Add ₹{(10000 - subtotal).toLocaleString()} for free shipping
                            </p>
                          </>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{gst.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>

                  {subtotal < 10000 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Truck className="h-4 w-4 inline mr-1" />
                        Add ₹{(10000 - subtotal).toLocaleString()} more for free shipping!
                      </p>
                    </div>
                  )}

                  <Button asChild size="lg" className="w-full">
                    <Link href="/payments">
                      Proceed to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-800 text-center">
                      🔒 Secure checkout • No upfront payment required
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
