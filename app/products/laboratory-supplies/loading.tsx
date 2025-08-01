import { ProductGridSkeleton } from "@/components/product-grid"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Laboratory Supplies</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Loading our extensive range of high-quality laboratory supplies...
      </p>
      <ProductGridSkeleton />
    </div>
  )
}
