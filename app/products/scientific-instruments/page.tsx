import ProductGrid from "@/components/product-grid"
import { getProductsByCategory } from "@/lib/data"
import { Suspense } from "react"
import Loading from "./loading"

export default async function ScientificInstrumentsPage() {
  const scientificInstruments = await getProductsByCategory("Scientific Instruments")

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Scientific Instruments</h1>
      <Suspense fallback={<Loading />}>
        <ProductGrid products={scientificInstruments} />
      </Suspense>
    </div>
  )
}
