"use client"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuote } from "@/context/quote-context"
import { useToast } from "@/hooks/use-toast"

type Product = {
  code: string
  name: string
  category: string
  pack_size: string
  price: string
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useQuote()
  const { toast } = useToast()

  const handleAddToQuote = (product: Product) => {
    addItem({ ...product, quantity: 1 })
    toast({
      title: "Added to Quote",
      description: `${product.name} has been added to your quote request.`,
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.code} className="flex flex-col justify-between bg-white/80 backdrop-blur-sm glow-on-hover">
          <CardHeader>
            <CardTitle className="text-base font-semibold leading-snug">{product.name}</CardTitle>
            <p className="text-xs text-slate-500 pt-1">
              {product.code} • {product.category}
            </p>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => handleAddToQuote(product)}>
              Request Quote
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
