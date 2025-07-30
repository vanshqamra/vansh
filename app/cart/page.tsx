"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, isLoaded } = useCart()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleQuantityChange = (code: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(code)
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      })
    } else {
      updateQuantity(code, newQuantity)
    }
  }

  const handleRemoveItem = (code: string, name: string) => {
    removeFromCart(code)
    toast({
      title: "Item Removed",
      description: `${name} has been removed from your cart.`,
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      if (item.price === "Price on Request" || item.price.includes("POR")) {
        return total
      }
      const price = Number.parseFloat(item.price.replace(/[₹,]/g, ""))
      return total + price * item.quantity
    }, 0)
  }

  const hasRequestItems = cart.some((item) => item.price === "Price on Request" || item.price.includes("POR"))

  if (!mounted || !isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-slate-300 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-slate-600 mb-8">Add some products to your cart to get started.</p>
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="outline" onClick={handleClearCart} className="text-red-600 hover:text-red-700 bg-transparent">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.code} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Code: {item.code}</p>
                    <p>Pack Size: {item.packSize}</p>
                    <p>Material: {item.material}</p>
                  </div>
                  <p className="font-semibold text-blue-600 mt-2">{item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.code, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.code, Number.parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.code, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.code, item.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Items ({cart.reduce((total, item) => total + item.quantity, 0)})</span>
                  <span>{cart.length} products</span>
                </div>
                {hasRequestItems && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                    <p className="font-medium">Price on Request Items</p>
                    <p>Some items require custom pricing. Contact us for a quote.</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Subtotal:</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  {hasRequestItems && <p className="text-sm text-slate-600 mt-1">+ Price on request items</p>}
                </div>
                <div className="space-y-2 pt-4">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
