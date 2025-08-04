import type { Metadata } from "next"
import { notFound } from "next/navigation"
import qualigensProducts from "@/lib/qualigens-products"
import { QualiProductGrid } from "@/components/quali-product-grid"

export const metadata: Metadata = {
  title: "Qualigens Lab Chemicals & Reagents",
  description:
    "Browse our extensive Qualigens product catalog with over 1000+ laboratory chemicals and reagents.",
}

export default function QualigensPage() {
  const raw = qualigensProducts as any
  const products: any[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : []

  if (!Array.isArray(products) || products.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Qualigens Fine Chemicals
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          Comprehensive catalog of high-quality laboratory chemicals and reagents
          from Qualigens.
        </p>
      </div>

      <QualiProductGrid products={products} />
    </div>
  )
}
