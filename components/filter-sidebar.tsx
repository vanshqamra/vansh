"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Filter } from "lucide-react"

interface FilterSidebarProps {
  categories: string[]
  brands: string[]
  onFilterChange: (filters: {
    minPrice: number
    maxPrice: number
    selectedCategories: string[]
    selectedBrands: string[]
  }) => void
  initialMinPrice?: number
  initialMaxPrice?: number
  maxPossiblePrice: number
}

export function FilterSidebar({
  categories,
  brands,
  onFilterChange,
  initialMinPrice = 0,
  initialMaxPrice,
  maxPossiblePrice,
}: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || maxPossiblePrice)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, category] : prev.filter((c) => c !== category)))
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) => (checked ? [...prev, brand] : prev.filter((b) => b !== brand)))
  }

  const applyFilters = () => {
    onFilterChange({ minPrice, maxPrice, selectedCategories, selectedBrands })
  }

  const resetFilters = () => {
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice || maxPossiblePrice)
    setSelectedCategories([])
    setSelectedBrands([])
    onFilterChange({
      minPrice: initialMinPrice,
      maxPrice: initialMaxPrice || maxPossiblePrice,
      selectedCategories: [],
      selectedBrands: [],
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-xs flex flex-col">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto py-4 space-y-6">
          {/* Price Range Filter */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Price Range</h3>
            <Slider
              min={initialMinPrice}
              max={maxPossiblePrice}
              step={10}
              value={[minPrice, maxPrice]}
              onValueChange={([newMin, newMax]) => {
                setMinPrice(newMin)
                setMaxPrice(newMax)
              }}
              className="w-[90%] mx-auto"
            />
            <div className="flex justify-between text-sm mt-2">
              <span>₹{minPrice}</span>
              <span>₹{maxPrice}</span>
            </div>
          </div>

          <Separator />

          {/* Categories Filter */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked === true)}
                  />
                  <Label htmlFor={`category-${category}`} className="capitalize">
                    {category.replace(/-/g, " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Brands Filter */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Brands</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={(checked) => handleBrandChange(brand, checked === true)}
                  />
                  <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={resetFilters} variant="outline" className="flex-1 bg-transparent">
            Reset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
