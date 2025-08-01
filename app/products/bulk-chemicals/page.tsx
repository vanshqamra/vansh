import { Suspense } from "react"
import { BulkChemicalList } from "@/components/bulk-chemical-list"
import { ProductGridSkeleton } from "@/components/product-grid"
import { getProductsByCategory } from "@/lib/data"

export default function BulkChemicalsPage() {
  const products = getProductsByCategory("bulk-chemicals")

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Bulk Chemicals</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Discover our wide range of high-quality bulk chemicals for industrial, research, and manufacturing needs.
      </p>
      <Suspense fallback={<ProductGridSkeleton />}>
        <BulkChemicalList products={products} />
      </Suspense>
    </div>
  )
}
