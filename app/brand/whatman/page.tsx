"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { labSupplyBrands } from "@/lib/data"
import whatmanProducts from "@/lib/whatman_products.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/app/context/search-context"
import Link from "next/link"
import { slugForProduct } from "@/lib/slug"

const normalizeKey = (key: string) =>
  key?.toLowerCase().replace(/[^a-z0-9]/gi, "").trim()

/** Stable details URL for a Whatman row */
function detailsHrefForWhatman(variant: any, group: any) {
  const productLike = {
    brand: "Whatman",
    productName: variant.name ?? variant["Product Name"] ?? "",
    packSize: variant.packing ?? variant["Pack"] ?? variant["Pack Size"] ?? "",
    code:
      variant.code ??
      variant.catalog_no ??
      variant.catalogNo ??
      variant.cat_no ??
      "",
    hsn: variant.hsn ?? variant["HSN"] ?? variant["HSN Code"] ?? "",
    cas: variant.cas ?? variant["CAS"] ?? variant["CAS No"] ?? "",
  }
  const slug = slugForProduct(productLike)
  return slug ? `/product/${slug}` : "/products"
}

export default function BrandPage({ params }: { params: { brandName: string } }) {
  const brandKey = "whatman"
  const brand = labSupplyBrands[brandKey]
  if (!brand) notFound()

  const { addItem, isLoaded } = useCart()
  const { toast } = useToast()
  const { searchQuery, setSearchQuery } = useSearch()
  const [page, setPage] = useState(1)
  const itemsPerPage = 50

  const group = whatmanProducts

  const filteredVariants = group.variants.filter((variant) =>
    Object.values(variant).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredVariants.length / itemsPerPage)
  const paginatedVariants = filteredVariants.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const handleAddToCart = (variant: any) => {
    addItem({
      brand: "Whatman",
      name: variant.name,
      code: variant.code,
      price: variant.price,
      quantity: 1,
    })
    toast({ title: "Added", description: `${variant.name} added to cart` })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">{group.title}</h1>
      <p className="mb-6 text-muted-foreground">{group.description}</p>

      <Input
        placeholder="Search by name, code, price, etc."
        className="mb-6"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr>
              {group.specs_headers.map((header) => (
                <th key={header} className="border px-3 py-2 bg-gray-100 text-left">
                  {header.toUpperCase()}
                </th>
              ))}
              <th className="border px-3 py-2 bg-gray-100">Add</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVariants.map((variant) => (
              <tr key={variant.code}>
                {group.specs_headers.map((header) => (
                  <td key={header} className="border px-3 py-2">
                    {variant[header] ?? ""}
                  </td>
                ))}
                <td className="border px-3 py-2">
                  <div className="flex items-center gap-2">
                    {/* NEW: View Details */}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={detailsHrefForWhatman(variant, group)}>View Details</Link>
                    </Button>

                    {/* Existing Add to Cart */}
                    <Button
                      onClick={() => handleAddToCart(variant)}
                      disabled={!isLoaded}
                      size="sm"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
