import BulkChemicalList from "@/components/bulk-chemical-list"
import { getProductsByCategory } from "@/lib/data"
import { Suspense } from "react"
import Loading from "./loading"

export default async function BulkChemicalsPage() {
  const bulkChemicals = await getProductsByCategory("Bulk Chemicals")

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Bulk Chemicals</h1>
      <Suspense fallback={<Loading />}>
        <BulkChemicalList products={bulkChemicals} />
      </Suspense>
    </div>
  )
}
