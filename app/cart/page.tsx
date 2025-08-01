"use client"

import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Trash2, MinusCircle, PlusCircle, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CartPage() {
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const { items, total: subtotal, itemCount, shippingCost } = state
  const router = useRouter()
  const { toast } = useToast()

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      toast({
        title: "Quantity Error",
        description: "Quantity cannot be less than 1. Item removed if quantity is 0.",
        variant: "destructive",
      })
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      })
      return
    }
    router.push("/checkout")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Your Cart</h1>

      {itemCount === 0 ? (
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent className="space-y-4">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <p className="text-xl font-semibold text-gray-700">Your cart is empty</p>
            <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild>
              <Link href="/products/qualigens">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="flex items-center p-4 shadow-sm">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover mr-4"
                />
                <div className="flex-grow">
                  <h2 className="font-semibold text-lg">{item.name}</h2>
                  <p className="text-sm text-gray-500">Brand: {item.brand || "N/A"}</p>
                  <p className="text-sm text-gray-500">Pack: {item.packSize || "N/A"}</p>
                  <p className="text-sm text-gray-500">CAS: {item.casNumber || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2 mr-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value))}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
            <Button variant="outline" onClick={clearCart} className="w-full mt-4 bg-transparent">
              Clear Cart
            </Button>
          </div>

          <Card className="lg:col-span-1 h-fit sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toLocaleString()}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>₹{(subtotal + shippingCost).toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckout} className="w-full">
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
