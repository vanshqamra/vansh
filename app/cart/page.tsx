"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const items = state?.items || []
  const itemCount = state?.itemCount || 0
  const total = state?.total || 0

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id)
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      })
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id)
    toast({
      title: "Item removed",
      description: `${name} has been removed from your cart`,
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    })
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to checkout",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate checkout process
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Order placed!",
        description: "Your order has been successfully placed",
      })
      clearCart()
    }, 2000)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Button asChild size="lg">
            <Link href="/products/bulk-chemicals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                      {item.brand && <p className="text-sm text-gray-500">Brand: {item.brand}</p>}
                      {item.category && <p className="text-sm text-gray-500">Category: {item.category}</p>}
                      <p className="text-lg font-bold text-blue-600 mt-1">₹{item.price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={handleClearCart}>
                Clear Cart
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products/bulk-chemicals">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{Math.round(total * 0.18).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{Math.round(total * 1.18).toLocaleString()}</span>
                </div>

                <div className="space-y-3 pt-4">
                  {user ? (
                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                      {isLoading ? "Processing..." : "Proceed to Checkout"}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full" size="lg">
                        <Link href="/login">Login to Checkout</Link>
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        New customer?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline">
                          Create an account
                        </Link>
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 pt-4">
                  <p>• Free shipping on orders above ₹5,000</p>
                  <p>• Secure checkout with SSL encryption</p>
                  <p>• 30-day return policy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
