"use client"

import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"

export default function CartPage() {
  const { cartItems, updateCartQuantity, removeFromCart, getCartTotal } = useCart()

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartQuantity(id, newQuantity)
    } else {
      removeFromCart(id)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Your Shopping Cart</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Review your selected products before proceeding to checkout.
      </p>

      {cartItems.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-8">
          <CardTitle className="mb-4">Your Cart is Empty</CardTitle>
          <CardDescription className="mb-6">
            Looks like you haven&apos;t added anything to your cart yet.
          </CardDescription>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <Card key={item.id} className="flex items-center p-4 shadow-sm">
                <div className="relative w-24 h-24 shrink-0">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="ml-4 flex-grow">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{item.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">₹{item.price.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="h-8 w-8"
                    >
                      <MinusCircle className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value))}
                      className="w-16 text-center mx-2"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
                <div className="ml-auto text-lg font-bold text-gray-900 dark:text-gray-50">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Shipping:</span>
                  <span>Free</span> {/* Assuming free shipping for simplicity */}
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Taxes:</span>
                  <span>₹0.00</span> {/* Assuming taxes are handled later or included */}
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-xl text-gray-900 dark:text-gray-50">
                  <span>Total:</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="p-0 mt-6">
                <Button asChild className="w-full text-lg py-3">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
