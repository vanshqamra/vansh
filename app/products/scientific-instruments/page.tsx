import { Suspense } from "react"
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid"
import { getProductsByCategory } from "@/lib/data"

export default function ScientificInstrumentsPage() {
  const products = getProductsByCategory("scientific-instruments")

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Scientific Instruments</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Browse our selection of advanced scientific instruments for precise measurements and experiments.
      </p>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  )
}
