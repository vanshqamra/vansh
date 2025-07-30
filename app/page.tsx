import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Award, Clock, Shield, Truck } from "lucide-react"
import ParallaxBackground from "@/components/parallax-background"
import OffersCarousel from "@/components/offers-carousel"

const brands = [
  { name: "Qualigens", logo: "/images/logo-qualigens.png", href: "/brand/qualigens" },
  { name: "Borosil", logo: "/images/logo-borosil.png", href: "/brand/borosil" },
  { name: "Whatman", logo: "/images/logo-whatman.png", href: "/brand/whatman" },
  { name: "Rankem", logo: "/images/logo-rankem.png", href: "/brand/rankem" },
  { name: "J.T. Baker", logo: "/images/logo-jtbaker.png", href: "/brand/jtbaker" },
]

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "ISO certified products from trusted global manufacturers",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable shipping across India",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Proper handling and storage of all chemical products",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Expert technical support whenever you need it",
  },
]

const productCategories = [
  {
    title: "Bulk Chemicals",
    description: "High-purity chemicals for industrial and research applications",
    image: "/images/product-acid.png",
    href: "/products/bulk-chemicals",
  },
  {
    title: "Laboratory Supplies",
    description: "Complete range of lab equipment and consumables",
    image: "/images/product-solvent.png",
    href: "/products/laboratory-supplies",
  },
  {
    title: "Scientific Instruments",
    description: "Precision instruments for accurate measurements",
    image: "/images/product-salt.png",
    href: "/products/scientific-instruments",
  },
]

function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <ParallaxBackground />
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
          Trusted Chemical Supplier Since 1995
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Premium Chemicals for
          <span className="text-blue-400 block">Scientific Excellence</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
          Your trusted partner for high-quality laboratory chemicals, equipment, and scientific instruments
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/products" className="flex items-center">
              Browse Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
          >
            <Link href="/contact">Get Quote</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide exceptional service and quality products to support your scientific endeavors
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCategoriesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Product Categories</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of scientific products and equipment
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {productCategories.map((category, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors bg-transparent"
                >
                  <Link href={category.href} className="flex items-center justify-center">
                    Explore Category
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted Brands</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We partner with leading global manufacturers to bring you the best products
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {brands.map((brand, index) => (
            <Link key={index} href={brand.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative h-16 mb-4">
                  <Image
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-center font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ProductCategoriesSection />
      <BrandsSection />
      <Suspense
        fallback={
          <div className="py-20">
            <div className="container mx-auto px-4 text-center">Loading offers...</div>
          </div>
        }
      >
        <OffersCarousel />
      </Suspense>
    </div>
  )
}
