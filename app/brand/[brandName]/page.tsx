import ProductGrid from "@/components/product-grid"
import { getProductsByBrand } from "@/lib/data"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

export default async function BrandPage({ params }: { params: { brandName: string } }) {
  const brandName = decodeURIComponent(params.brandName)
  const products = await getProductsByBrand(brandName)

  if (products.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">{brandName} Products</h1>
      <Suspense fallback={<Loading />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  )
}
