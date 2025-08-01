import qualigensProducts from "@/lib/qualigens-products"
import { labSupplyBrands } from "@/lib/data"
import { notFound } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

type Props = {
  params: { brandName: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]

  if (!brand) {
    return { title: "Brand Not Found" }
  }

  return {
    title: `${brand.name} Lab Supplies`,
    description: `Explore laboratory supplies from ${brand.name}, including ${brand.categories.join(", ")}.`,
  }
}

export default function BrandPage({ params }: Props) {
  const brandKey = params.brandName as keyof typeof labSupplyBrands
  const brand = labSupplyBrands[brandKey]

  if (!brand) {
    notFound()
  }

  const products = brandKey === "qualigens" ? qualigensProducts : []

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{brand.name}</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          Authorized distributor of {brand.name} products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map(([code, cas, name, packSize, material, price, hsn]) => (
            <Card key={code} className="shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-700">{name}</CardTitle>
                <p className="text-sm text-slate-500">CAS: {cas}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Pack: {packSize} ({material})</p>
                <p className="text-sm">HSN: {hsn}</p>
                <p className="text-sm font-bold mt-2">
                  Price: {price === "POR" ? "Price on Request" : `₹${price}`}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full">Add to Cart</Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-center col-span-full text-slate-500">No products to display for this brand.</p>
        )}
      </div>
    </div>
  )
}
