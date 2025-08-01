"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FilterSidebarProps {
  categories: string[]
  brands: string[]
}

export function FilterSidebar({ categories, brands }: FilterSidebarProps) {
  return (
    <Card className="sticky top-24 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Category</h3>
          <div className="space-y-2">
            {categories.slice(1).map(
              (
                category, // Exclude "All"
              ) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox id={`cat-${category}`} />
                  <Label htmlFor={`cat-${category}`} className="font-normal">
                    {category}
                  </Label>
                </div>
              ),
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Brand</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand}`} />
                <Label htmlFor={`brand-${brand}`} className="font-normal">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
