"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter } from "lucide-react"

interface FilterSidebarProps {
  onApplyFilters: (filters: {
    minPrice: number
    maxPrice: number
    brands: string[]
    categories: string[]
  }) => void
  initialFilters?: {
    minPrice?: number
    maxPrice?: number
    brands?: string[]
    categories?: string[]
  }
  availableBrands: string[]
  availableCategories: string[]
}

export default function FilterSidebar({
  onApplyFilters,
  initialFilters,
  availableBrands,
  availableCategories,
}: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || 0)
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || 1000)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters?.brands || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.categories || [])
  const [isOpen, setIsOpen] = useState(false)

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      brands: selectedBrands,
      categories: selectedCategories,
    })
    setIsOpen(false)
  }

  const handleClear = () => {
    setMinPrice(0)
    setMaxPrice(1000)
    setSelectedBrands([])
    setSelectedCategories([])
    onApplyFilters({ minPrice: 0, maxPrice: 1000, brands: [], categories: [] })
    setIsOpen(false)
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) => (checked ? [...prev, brand] : prev.filter((b) => b !== brand)))
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, category] : prev.filter((c) => c !== category)))
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 py-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Price Range</h3>
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-1/2"
              />
              <span>-</span>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-1/2"
              />
            </div>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[minPrice, maxPrice]}
              onValueChange={([newMin, newMax]) => {
                setMinPrice(newMin)
                setMaxPrice(newMax)
              }}
              className="w-full"
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Brands</h3>
            <div className="grid gap-2">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                  />
                  <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Categories</h3>
            <div className="grid gap-2">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClear} className="flex-1 bg-transparent">
              Clear Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
