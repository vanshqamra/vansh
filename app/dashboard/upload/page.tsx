"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useQuote } from "@/app/context/quote-context"
import { PlusCircle, MessageCircle } from "lucide-react"

export default function UploadQuotePage() {
  const [productName, setProductName] = useState("")
  const [productBrand, setProductBrand] = useState("")
  const [packSize, setPackSize] = useState("")
  const [casNumber, setCasNumber] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addItemToQuote } = useQuote()
  const { toast } = useToast()
  const router = useRouter()

  const handleAddItemToQuote = () => {
    if (!productName || !packSize || quantity < 1) {
      toast({
        title: "Missing Information",
        description: "Please fill in product name, pack size, and a valid quantity.",
        variant: "destructive",
      })
      return
    }

    const newItem = {
      id: Date.now().toString(), // Simple unique ID
      name: productName,
      brand: productBrand,
      packSize: packSize,
      casNumber: casNumber,
      quantity: quantity,
      image: "/placeholder.svg?height=80&width=80&text=Product", // Placeholder image
    }

    addItemToQuote(newItem)
    toast({
      title: "Item Added to Quote Cart!",
      description: `${productName} has been added to your quote cart.`,
      variant: "default",
    })

    // Clear form fields
    setProductName("")
    setProductBrand("")
    setPackSize("")
    setCasNumber("")
    setQuantity(1)
  }

  const handleRequestQuote = async () => {
    setIsSubmitting(true)
    // This will be handled by the QuoteCartPage when the user proceeds to checkout from there.
    // For now, we just redirect.
    router.push("/dashboard/quote-cart")
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Upload Quote Request</h1>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Add Products for Quote</CardTitle>
          <CardDescription>
            Fill in the details of the products you need a custom quote for. You can add multiple items to your quote
            cart.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Sulfuric Acid"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productBrand">Brand (Optional)</Label>
              <Input
                id="productBrand"
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                placeholder="e.g., Qualigens"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packSize">Pack Size</Label>
              <Input
                id="packSize"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="e.g., 500ml, 25kg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="casNumber">CAS Number (Optional)</Label>
              <Input
                id="casNumber"
                value={casNumber}
                onChange={(e) => setCasNumber(e.target.value)}
                placeholder="e.g., 7664-93-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <Button onClick={handleAddItemToQuote} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" /> Add to Quote Cart
          </Button>

          <div className="flex items-center justify-center space-x-2">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <Button
            onClick={handleRequestQuote}
            className="w-full bg-transparent"
            variant="outline"
            disabled={isSubmitting}
          >
            <MessageCircle className="h-4 w-4 mr-2" /> Go to Quote Cart
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
