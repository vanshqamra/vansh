"use client"

import { useState } from "react"
import part1 from "@/lib/himedia_products_part1.json"
import part2 from "@/lib/himedia_products_part2.json"
import part3 from "@/lib/himedia_products_part3.json"
import part4 from "@/lib/himedia_products_part4.json"
import part5 from "@/lib/himedia_products_part5.json"

import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"

// Merge all parts into one object
const himediaProductsRaw = {
  ...part1,
  ...part2,
  ...part3,
  ...part4,
  ...part5,
}

// Flatten grouped JSON
const flattenProducts = (data) => {
  const result = []
  for (const main in data) {
    for (const header in data[main]) {
      for (const sub in data[main][header]) {
        for (const item of data[main][header][sub]) {
          result.push({
            ...item,
            main_section: main,
            header_section: header,
            sub_section: sub,
          })
        }
      }
    }
  }
  return result
}

const allProducts = flattenProducts(himediaProductsRaw)
const PRODUCTS_PER_PAGE = 50

export default function HiMediaBrandPage() {
  const [page, setPage] = useState(0)
  const { addItem } = useCart()
  const paginated = allProducts.slice(
    page * PRODUCTS_PER_PAGE,
    (page + 1) * PRODUCTS_PER_PAGE
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">HiMedia Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((product, idx) => (
          <Card key={`${product.code}-${idx}`} className="bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-700 text-sm flex justify-between items-start">
                <div className="max-w-[90%] truncate">
                  <Dialog>
                    <DialogTrigger asChild>
                      <span className="cursor-pointer underline hover:text-blue-900">
                        {product.name.length > 40
                          ? `${product.name.slice(0, 40)}...`
                          : product.name}
                      </span>
                    </DialogTrigger>
                    <DialogContent aria-describedby={`dialog-desc-${idx}`}>
                      <h2 className="font-semibold text-lg mb-2">{product.name}</h2>
                      <p id={`dialog-desc-${idx}`} className="sr-only">
                        Full product details for HiMedia item: {product.name}
                      </p>
                      <p><strong>Code:</strong> {product.code}</p>
                      <p><strong>Packing:</strong> {product.packing}</p>
                      <p><strong>HSN:</strong> {product.hsn}</p>
                      <p><strong>GST:</strong> {product.gst}%</p>
                      <p><strong>Section:</strong> {product.sub_section}</p>
                    </DialogContent>
                  </Dialog>
                </div>
                <Badge className="text-xs ml-2">{product.packing}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-slate-600"><strong>Code:</strong> {product.code}</p>
              <p className="text-slate-600">
                <strong>Price:</strong>{" "}
                {product.price
                  ? `₹${product.price}`
                  : <span className="italic">On Request</span>}
              </p>
              {product.price && (
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => addItem({ ...product, brand: "HiMedia" })}
                >
                  Add to Cart
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-700">Page {page + 1}</span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={(page + 1) * PRODUCTS_PER_PAGE >= allProducts.length}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
