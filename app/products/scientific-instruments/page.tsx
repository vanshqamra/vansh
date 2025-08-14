import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { labSupplyBrands } from "@/lib/data"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Scientific Instruments",
  description: "Explore scientific instruments from top brands.",
}

function toArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function isInstrumentBrand(brand: any): boolean {
  const family = String(brand?.family ?? "").toLowerCase()
  if (family.includes("scientific-instruments")) return true

  const cats = toArray<string>(brand?.categories).map((c) => String(c).toLowerCase())
  return cats.some((c) => c.includes("instrument")) // matches "Instruments", "Measuring Instruments", etc.
}

export default function ScientificInstrumentsPage() {
  const instrumentBrands = Object.entries(labSupplyBrands)
    .filter(([, brand]) => isInstrumentBrand(brand))
    .sort((a, b) => String(a[1]?.name ?? "").localeCompare(String(b[1]?.name ?? "")))

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Scientific Instruments</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          High-quality, precision instruments for your laboratory needs. Full catalog coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {instrumentBrands.map(([key, brand]) => {
          const categories = toArray<string>(brand?.categories)
          const href = brand?.href ?? (brand?.slug ? `/brands/${brand.slug}` : `/brands/${key}`)
          return (
            <Card key={key} className="flex flex-col justify-between shadow-sm bg-slate-50 glow-on-hover">
              <CardHeader>
                <div className="h-16 w-32 mb-4 flex items-center justify-center bg-white rounded border">
                  <span className="text-sm font-semibold text-slate-600">{brand?.name ?? key}</span>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-800">{brand?.name ?? key}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-slate-600">
                  Categories: {categories.length ? categories.join(", ") : "—"}
                </p>
              </CardContent>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={href}>View Brand Page</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {instrumentBrands.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-8">
          No instrument brands configured yet.
        </div>
      )}
    </div>
  )
}
