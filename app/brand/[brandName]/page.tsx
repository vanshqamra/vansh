import { CardFooter } from "@/components/ui/card"
import { labSupplyBrands } from "@/lib/data"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

type Props = {
  params: { brandName: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]

  if (!brand) {
    return {
      title: "Brand Not Found",
    }
  }

  return {
    title: `${brand.name} Lab Supplies`,
    description: `Explore laboratory supplies from ${brand.name}, including ${brand.categories.join(", ")}. Price lists coming soon.`,
  }
}

export default function BrandPage({ params }: Props) {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]

  if (!brand) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{brand.name}</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          Authorized distributor of {brand.name} products. Full catalog coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="flex flex-col justify-between shadow-sm bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-500">{brand.name} Product Name</CardTitle>
              <p className="text-sm text-slate-400">{brand.categories[index % brand.categories.length]} – TBD</p>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Price List Coming Soon</Badge>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-transparent">
                Notify Me
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
