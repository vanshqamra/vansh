import { Suspense } from "react"
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid"
import { getProductsByBrand, getBrandByName } from "@/lib/data"
import Image from "next/image"
import { notFound } from "next/navigation"

export default function BrandPage({ params }: { params: { brandName: string } }) {
  const brandSlug = params.brandName
  const brand = getBrandByName(brandSlug)

  if (!brand) {
    notFound()
  }

  const products = getProductsByBrand(brand.name)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        {brand.logoUrl && (
          <Image
            src={brand.logoUrl || "/placeholder.svg"}
            alt={`${brand.name} Logo`}
            width={200}
            height={100}
            objectFit="contain"
            className="mb-4"
          />
        )}
        <h1 className="text-4xl font-bold mb-4">{brand.name} Products</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Explore our selection of high-quality products from {brand.name}.
        </p>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  )
}
