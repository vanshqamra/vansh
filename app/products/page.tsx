
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Beaker, Microscope, TestTube } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge" // Make sure Badge component exists

export const metadata: Metadata = {
  title: "Our Products",
  description: "Explore our main product categories: Bulk Chemicals, Laboratory Chemicals, Glassware and Filter Paper, and Scientific Instruments.",
}

const productCategories = [
  {
    title: "Bulk Chemicals",
    description: "High-volume, industrial-grade chemicals for your production needs.",
    href: "/products/bulk-chemicals",
    icon: <Beaker className="w-10 h-10 text-teal-500" />,
  },
  {
    title: "Laboratory Chemicals, Glassware and Filter Paper",
    description: "A complete range of chemicals, lab glassware, and filtration products from trusted brands.",
    href: "/products/laboratory-supplies",
    icon: <TestTube className="w-10 h-10 text-teal-500" />,
  },
  {
    title: "Scientific Instruments",
    description: "Precision instruments and equipment to power your research and analysis.",
    href: "/products/scientific-instruments",
    icon: <Microscope className="w-10 h-10 text-teal-500" />,
  },
]

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Our Product Categories</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          We provide a comprehensive range of products to meet all your industrial and laboratory requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {productCategories.map((category) => (
          <Link key={category.title} href={category.href} className="group block">
            <Card className="h-full glow-on-hover bg-white/70 backdrop-blur-sm border-slate-200/80 flex flex-col">
              <CardHeader className="flex-row items-center gap-4">
                {category.icon}
                <div>
                  <CardTitle>{category.title}</CardTitle>
                  <Badge className="mt-1 text-xs bg-green-600 text-white">Buy Now</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-slate-600 mb-4">{category.description}</p>
                <span className="font-semibold text-blue-600 flex items-center gap-2">
                  Explore Category <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
