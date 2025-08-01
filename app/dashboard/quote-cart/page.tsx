"use client"

import { useQuote } from "@/app/context/quote-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MinusCircle, PlusCircle, Trash2, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function QuoteCartPage() {
  const { quoteItems, updateQuoteQuantity, removeFromQuote, clearQuote, getQuoteTotalItems } = useQuote()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuoteQuantity(id, newQuantity)
    } else {
      removeFromQuote(id)
    }
  }

  const handleSendQuote = async () => {
    if (quoteItems.length === 0) {
      toast({
        title: "Quote Cart Empty",
        description: "Please add items to your quote cart before sending a request.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    // Simulate API call to send quote request
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Sending quote request:", quoteItems)

    // In a real application, you would send quoteItems to your backend
    // and handle the response.
    const success = Math.random() > 0.1 // 90% success rate for demo

    if (success) {
      toast({
        title: "Quote Request Sent!",
        description: "Your quote request has been successfully submitted. We will get back to you shortly.",
      })
      clearQuote() // Clear quote cart after successful submission
    } else {
      toast({
        title: "Quote Request Failed",
        description: "There was an issue sending your quote request. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Your Quote Cart</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Review the items you wish to get a custom quote for. Adjust quantities or remove items as needed.
      </p>

      {quoteItems.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-8">
          <CardTitle className="mb-4">Your Quote Cart is Empty</CardTitle>
          <CardDescription className="mb-6">Add products to your quote cart from the product pages.</CardDescription>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {quoteItems.map((item) => (
              <Card key={item.id} className="flex items-center p-4 shadow-sm">
                <div className="ml-4 flex-grow">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{item.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Unit: {item.unit}</p>
                  {item.price && (
                    <p className="text-gray-600 dark:text-gray-400">Est. Price: ₹{item.price.toFixed(2)}</p>
                  )}
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
                      onClick={() => removeFromQuote(item.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
                <div className="ml-auto text-lg font-bold text-gray-900 dark:text-gray-50">Qty: {item.quantity}</div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold">Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Total Items:</span>
                  <span>{getQuoteTotalItems()}</span>
                </div>
                <CardDescription className="text-sm text-gray-500 mt-2">
                  Prices shown are estimates. A final quote will be provided by our sales team.
                </CardDescription>
              </CardContent>
              <CardFooter className="p-0 mt-6 flex flex-col gap-2">
                <Button onClick={handleSendQuote} className="w-full text-lg py-3" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Quote...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" /> Send Quote Request
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearQuote} className="w-full bg-transparent" disabled={loading}>
                  Clear Quote Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
