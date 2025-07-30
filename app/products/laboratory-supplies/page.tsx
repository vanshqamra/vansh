import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Beaker, Microscope, TestTube, FlaskConical, Thermometer } from "lucide-react"
import Link from "next/link"

const laboratoryBrands = [
  {
    name: "Qualigens",
    description: "Premium analytical reagents and laboratory chemicals",
    icon: Beaker,
    productCount: "1000+",
    specialties: ["Analytical Reagents", "HPLC Solvents", "Buffer Solutions", "Indicators"],
    href: "/products/qualigens",
  },
  {
    name: "Merck",
    description: "High-quality chemicals and laboratory equipment",
    icon: Microscope,
    productCount: "800+",
    specialties: ["Research Chemicals", "Chromatography", "Cell Culture", "Molecular Biology"],
    href: "/brand/merck",
  },
  {
    name: "Sigma-Aldrich",
    description: "Leading supplier of research chemicals and lab equipment",
    icon: TestTube,
    productCount: "1200+",
    specialties: ["Biochemicals", "Organic Synthesis", "Materials Science", "Analytical Standards"],
    href: "/brand/sigma-aldrich",
  },
  {
    name: "Thermo Fisher",
    description: "Comprehensive laboratory solutions and instruments",
    icon: FlaskConical,
    productCount: "600+",
    specialties: ["Instruments", "Consumables", "Software", "Services"],
    href: "/brand/thermo-fisher",
  },
  {
    name: "Agilent",
    description: "Advanced analytical instruments and consumables",
    icon: Thermometer,
    productCount: "400+",
    specialties: ["Chromatography", "Spectroscopy", "Mass Spectrometry", "Genomics"],
    href: "/brand/agilent",
  },
]

export default function LaboratorySuppliesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Laboratory Supplies</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover premium laboratory equipment, chemicals, and supplies from leading brands. Everything you need for
            research, analysis, and quality control.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {laboratoryBrands.map((brand) => {
            const IconComponent = brand.icon
            return (
              <Card
                key={brand.name}
                className="hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {brand.productCount} Products
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{brand.name}</CardTitle>
                  <CardDescription className="text-slate-600">{brand.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {brand.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={brand.href}>View Products</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Categories Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Product Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Analytical Reagents",
              "Laboratory Glassware",
              "Safety Equipment",
              "Measuring Instruments",
              "Chromatography Supplies",
              "Microscopy Equipment",
              "Sample Preparation",
              "Quality Control",
            ].map((category) => (
              <div
                key={category}
                className="text-center p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <p className="font-medium text-slate-700">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
