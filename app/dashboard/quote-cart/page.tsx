"use client"

import { useQuote } from "@/context/quote-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function QuoteCartPage() {
  const { items, updateQuantity, removeItem, clearQuote } = useQuote()
  const { toast } = useToast()

  const handleSubmitQuote = () => {
    // Server action would go here
    console.log("Submitting quote:", items)
    clearQuote()
    toast({
      title: "Quote Request Sent!",
      description: "Thank you! We have received your request and will contact you shortly.",
    })
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Quote Cart is Empty</h1>
        <p className="text-slate-600 mb-6">Browse our products to add items to your quote request.</p>
        <Button asChild>
          <Link href="/products/commercial">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="bg-white/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Your Quote Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="w-[120px]">Quantity</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.code}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.code, Number.parseInt(e.target.value, 10))}
                      className="w-20"
                      min="1"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.code)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSubmitQuote}>
              Submit Quote Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
