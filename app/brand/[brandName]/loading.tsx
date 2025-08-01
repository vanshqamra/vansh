import { ProductGridSkeleton } from "@/components/product-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <Skeleton className="w-[200px] h-[100px] mb-4" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 max-w-full" />
      </div>
      <ProductGridSkeleton />
    </div>
  )
}
