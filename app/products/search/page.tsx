"use client"

import ProductGrid from "@/components/product-grid"
import FilterSidebar from "@/components/filter-sidebar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getProducts } from "@/lib/data"
import { Suspense } from "react"
import Loading from "./loading"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = searchParams.query as string | undefined
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined
  const brands = typeof searchParams.brands === "string" ? [searchParams.brands] : searchParams.brands
  const categories = typeof searchParams.categories === "string" ? [searchParams.categories] : searchParams.categories

  const allProducts = await getProducts()

  const availableBrands = Array.from(new Set(allProducts.map((p) => p.brand))).filter(Boolean) as string[]
  const availableCategories = Array.from(new Set(allProducts.map((p) => p.category))).filter(Boolean) as string[]

  const filteredProducts = allProducts.filter((product) => {
    const matchesQuery = query
      ? product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.casNumber?.toLowerCase().includes(query.toLowerCase())
      : true

    const matchesPrice =
      (minPrice === undefined || product.price >= minPrice) && (maxPrice === undefined || product.price <= maxPrice)

    const matchesBrand = brands && brands.length > 0 ? brands.includes(product.brand) : true
    const matchesCategory = categories && categories.length > 0 ? categories.includes(product.category) : true

    return matchesQuery && matchesPrice && matchesBrand && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Search Results</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            defaultValue={query}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const newSearchParams = new URLSearchParams(window.location.search)
                newSearchParams.set("query", e.currentTarget.value)
                window.history.pushState(null, "", `?${newSearchParams.toString()}`)
              }
            }}
          />
        </div>
        <FilterSidebar
          onApplyFilters={(filters) => {
            const newSearchParams = new URLSearchParams()
            if (query) newSearchParams.set("query", query)
            if (filters.minPrice !== undefined) newSearchParams.set("minPrice", filters.minPrice.toString())
            if (filters.maxPrice !== undefined) newSearchParams.set("maxPrice", filters.maxPrice.toString())
            filters.brands.forEach((brand) => newSearchParams.append("brands", brand))
            filters.categories.forEach((category) => newSearchParams.append("categories", category))
            window.history.pushState(null, "", `?${newSearchParams.toString()}`)
          }}
          initialFilters={{ minPrice, maxPrice, brands, categories }}
          availableBrands={availableBrands}
          availableCategories={availableCategories}
        />
      </div>
      <Suspense fallback={<Loading />}>
        <ProductGrid products={filteredProducts} />
      </Suspense>
    </div>
  )
}
