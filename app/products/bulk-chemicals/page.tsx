import { commercialChemicals, chemicalCategories } from "@/lib/data"
import { BulkChemicalList } from "@/components/bulk-chemical-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bulk Commercial Chemicals",
  description:
    "Browse our extensive catalog of bulk and commercial chemicals. Filter by category to find what you need.",
}

export default function BulkChemicalsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Bulk Chemicals</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          High-purity, industrial-grade chemicals available in bulk quantities.
        </p>
      </div>
      <BulkChemicalList products={commercialChemicals} categories={chemicalCategories} />
    </div>
  )
}
