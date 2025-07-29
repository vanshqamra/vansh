import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Beaker, Microscope, TestTube } from "lucide-react"
import Link from "next/link"
import { OffersCarousel } from "@/components/offers-carousel"
import Image from "next/image"
import { labSupplyBrands } from "@/lib/data"

export default function HomePage() {
  const brands = Object.entries(labSupplyBrands)

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-background.png"
            alt="Hero Background"
            layout="fill"
            objectFit="cover"
            quality={90}
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="absolute inset-0 z-10 animate-subtle-float">
          <Image
            src="/images/hero-overlay.png"
            alt="Holographic lab equipment"
            layout="fill"
            objectFit="contain"
            className="opacity-20"
          />
        </div>
        <div className="container relative z-20 mx-auto px-4 md:px-6 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-glow">
            The Future of Laboratory Supply
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-200">
            An ultra-modern B2B portal designed for precision, speed, and reliability.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-slate-200">
              <Link href="/products">Explore Products</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/register">Become a Vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Offers Carousel Section */}
      <section className="py-16 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Exclusive Vendor Offers</h2>
          <OffersCarousel />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">One-Stop Solution for Your Needs</h2>
            <p className="mt-2 text-slate-600">From bulk chemicals to precision instruments, we have you covered.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/products/bulk-chemicals" className="group block">
              <Card className="h-full glow-on-hover bg-white/70 backdrop-blur-sm border-slate-200/80">
                <CardHeader className="flex-row items-center gap-4">
                  <Beaker className="w-10 h-10 text-teal-500" />
                  <CardTitle>Bulk Chemicals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">High-volume, industrial-grade chemicals.</p>
                  <span className="font-semibold text-blue-600 flex items-center gap-2">
                    Browse <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products/laboratory-supplies" className="group block">
              <Card className="h-full glow-on-hover bg-white/70 backdrop-blur-sm border-slate-200/80">
                <CardHeader className="flex-row items-center gap-4">
                  <TestTube className="w-10 h-10 text-teal-500" />
                  <CardTitle>Laboratory Supplies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">Glassware, reagents, and consumables.</p>
                  <span className="font-semibold text-blue-600 flex items-center gap-2">
                    Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products/scientific-instruments" className="group block">
              <Card className="h-full glow-on-hover bg-white/70 backdrop-blur-sm border-slate-200/80">
                <CardHeader className="flex-row items-center gap-4">
                  <Microscope className="w-10 h-10 text-teal-500" />
                  <CardTitle>Scientific Instruments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">Precision instruments and equipment.</p>
                  <span className="font-semibold text-blue-600 flex items-center gap-2">
                    Discover <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Brands Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Our Associated Brands</h2>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {brands.map(([key, brand]) => (
              <Link href={`/brand/${key}`} key={key} className="block">
                <div className="relative h-12 w-36 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                  <Image src={`/images/logo-${key}.png`} alt={`${brand.name} Logo`} layout="fill" objectFit="contain" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
