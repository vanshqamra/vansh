"use client"

import { useQuote } from "@/app/context/quote-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function QuoteCartPage() {
  const { quoteItems, removeItemFromQuote, clearQuote } = useQuote()
  const { toast } = useToast()
  const router = useRouter()

  const handleRequestQuote = async () => {
    if (quoteItems.length === 0) {
      toast({
        title: "Quote Cart Empty",
        description: "Please add items to your quote cart before requesting a quote.",
        variant: "destructive",
      })
      return
    }

    // Simulate API call to submit quote
    const response = await fetch("/api/upload-quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: quoteItems }),
    })

    if (response.ok) {
      toast({
        title: "Quote Request Sent!",
        description: "Your quote request has been successfully submitted. We will contact you shortly.",
        variant: "default",
      })
      clearQuote()
      router.push("/order-success") // Redirect to a success page
    } else {
      toast({
        title: "Quote Request Failed",
        description: "There was an error submitting your quote. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Your Quote Cart</h1>

      {quoteItems.length === 0 ? (
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardTitle className="mb-4">Your quote cart is empty.</CardTitle>
          <CardDescription>Add products to your quote cart to request a custom price.</CardDescription>
          <Link href="/products">
            <Button className="mt-6">Browse Products</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items for Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.image && (
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={64}
                              height={64}
                              objectFit="cover"
                              className="rounded-md"
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                          <p className="text-sm text-gray-500">Brand: {item.brand || "N/A"}</p>
                          <p className="text-sm text-gray-500">Pack: {item.packSize || "N/A"}</p>
                          <p className="text-sm text-gray-500">CAS: {item.casNumber || "N/A"}</p>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeItemFromQuote(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quote Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Submit your selected items to receive a custom quote from our sales team.
                </p>
                <Button className="w-full" onClick={handleRequestQuote}>
                  Request Quote
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={clearQuote}>
                  Clear Quote Cart
                </Button>
                <Link href="/products">
                  <Button variant="link" className="w-full">
                    Continue Browsing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
