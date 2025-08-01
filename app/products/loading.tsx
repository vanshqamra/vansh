import { ProductGridSkeleton } from "@/components/product-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Loading our extensive catalog of high-quality chemicals, laboratory supplies, and scientific instruments.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Skeleton className="h-10 w-32" /> {/* Filter button skeleton */}
        <Skeleton className="h-10 flex-grow" /> {/* Search input skeleton */}
      </div>

      <ProductGridSkeleton />
    </div>
  )
}
