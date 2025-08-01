"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/context/CartContext"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { state, removeFromCart, updateQuantity } = useCart()
  const { toast } = useToast()

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id)
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      })
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleRemoveItem = (id: string, name: string) => {
    removeFromCart(id)
    toast({
      title: "Item Removed",
      description: `${name} has been removed from your cart`,
    })
  }

  // Calculate shipping
  const subtotal = state.total
  const shippingCharges = subtotal < 10000 ? 500 : 0
  const gst = (subtotal + shippingCharges) * 0.18
  const grandTotal = subtotal + shippingCharges + gst

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{state.itemCount} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{item.brand}</Badge>
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                        {item.packSize && <Badge variant="outline">{item.packSize}</Badge>}
                      </div>
                      {item.casNumber && <p className="text-sm text-gray-600 mb-2">CAS: {item.casNumber}</p>}
                      <p className="text-2xl font-bold text-blue-600">
                        {item.price === 0 ? "Price on Request" : `₹${item.price.toLocaleString()}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-3 ml-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <p className="font-semibold">
                        {item.price === 0 ? "POR" : `₹${(item.price * item.quantity).toLocaleString()}`}
                      </p>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({state.itemCount} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      Shipping
                      {subtotal >= 10000 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          FREE
                        </Badge>
                      )}
                    </span>
                    <span>₹{shippingCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gst.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {subtotal < 10000 && (
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                    <p className="text-yellow-800 font-medium">
                      Add ₹{(10000 - subtotal).toLocaleString()} more for free shipping!
                    </p>
                  </div>
                )}

                <Button asChild className="w-full" size="lg">
                  <Link href="/payments" className="flex items-center justify-center">
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>• Orders subject to confirmation</p>
                  <p>• Free shipping on orders above ₹10,000</p>
                  <p>• GST included in final price</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
