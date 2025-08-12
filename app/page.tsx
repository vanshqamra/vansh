'use client'

// app/page.tsx (or wherever your homepage lives)
import { useEffect } from "react";
import { ParallaxBackground } from "@/components/parallax-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Shield, Truck, Award, Globe, Zap, ChevronRight } from "lucide-react";


export default function HomePage() {
  useEffect(() => {
    if (!document.getElementById("fx-bg")) {
      document.body.classList.add("fx-fallback")
    } else {
      document.body.classList.remove("fx-fallback")
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* FX BG (single instance, behind all content) */}
      <div id="fx-bg" className="fixed inset-0 -z-10 pointer-events-none">
        <div className="site-bg absolute inset-0" />
        <div className="fx-mesh absolute inset-0 animate-mesh opacity-60" />
        <div className="fx-grid absolute inset-0 animate-grid opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_85%,transparent)]" />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParallaxBackground />

  {/* FX overlay ABOVE Parallax, BELOW text */}
  <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
    <div className="fx-mesh absolute -inset-40 opacity-80 animate-mesh" />
    <div className="fx-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_85%,transparent)] animate-grid" />
    {/* Floating molecules (more visible) */}
    <svg className="absolute inset-0 w-full h-full opacity-60 text-white/30 mix-blend-overlay" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.15))" }}>
      <defs>
        <g id="mol">
          <circle r="2.2" fill="currentColor" />
          <circle cx="11" r="2.2" fill="currentColor" />
          <circle cx="5.5" cy="6" r="2.2" fill="currentColor" />
          <line x1="0" y1="0" x2="11" y2="0" stroke="currentColor" strokeWidth="1.25" />
          <line x1="5.5" y1="6" x2="11" y2="0" stroke="currentColor" strokeWidth="1.25" />
        </g>
      </defs>
      <g>
        <use href="#mol">
          <animateMotion dur="26s" repeatCount="indefinite" path="M 10,80 C 200,30 400,130 580,80 S 900,110 1100,60" />
        </use>
        <use href="#mol">
          <animateMotion dur="32s" repeatCount="indefinite" path="M 0,200 C 260,160 420,260 700,200 S 900,260 1200,220" />
        </use>
        <use href="#mol">
          <animateMotion dur="28s" repeatCount="indefinite" path="M 50,350 C 300,390 520,330 800,370 S 980,330 1150,360" />
        </use>
      </g>
    </svg>
  </div>

  {/* Glow rim for hero card */}
  <div className="absolute inset-x-6 md:inset-x-12 top-[12%] h-56 rounded-[32px] blur-2xl opacity-70 bg-gradient-to-r from-cyan-400/45 via-sky-400/35 to-teal-400/45 pointer-events-none" />

  {/* Hero content ABOVE FX */}
  <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto fx-reveal" style={{ animationDelay: "80ms" }}>
    <Badge className="mb-6 bg-blue-600/20 text-blue-200 border-blue-400/30 hover:bg-blue-600/30 backdrop-blur">
      <Zap className="w-4 h-4 mr-2" />
      Advanced Laboratory Solutions
    </Badge>

    <h1 className="hero-heading text-5xl md:text-7xl font-bold mb-6">
      Chemical Corporation
    </h1>

    <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
      Pioneering the future of laboratory science with premium chemicals, cutting-edge instruments, and innovative
      solutions for research excellence.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button
        asChild
        size="lg"
        className="button-magnetic bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-[0_1px_1px_rgba(2,6,23,.08),0_16px_30px_rgba(2,6,23,.18)]"
      >
        <Link href="/products">
          Explore Products
          <ChevronRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="border-blue-300 text-blue-100 hover:bg-blue-600/20 px-8 py-3 text-lg bg-transparent backdrop-blur"
      >
        <Link href="/contact">Get Quote</Link>
      </Button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
      <div className="text-center fx-reveal" style={{ animationDelay: "120ms" }}>
        <div className="text-3xl font-bold text-blue-200 tracking-tight">10K+</div>
        <div className="text-sm text-blue-300">Products</div>
      </div>
      <div className="text-center fx-reveal" style={{ animationDelay: "180ms" }}>
        <div className="text-3xl font-bold text-blue-200 tracking-tight">500+</div>
        <div className="text-sm text-blue-300">Clients</div>
      </div>
      <div className="text-center fx-reveal" style={{ animationDelay: "240ms" }}>
        <div className="text-3xl font-bold text-blue-200 tracking-tight">77+</div>
        <div className="text-sm text-blue-300">Years</div>
      </div>
    </div>
  </div>

  {/* Scroll Indicator */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center">
      <div className="w-1 h-3 bg-blue-300 rounded-full mt-2 animate-pulse" />
    </div>
  </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 fx-reveal">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight fx-reveal">Laboratory Excellence Redefined</h2>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto">
              Experience unparalleled quality and innovation in every product we deliver
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
  <Card
    className="relative group border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 fx-reveal"
    style={{ animationDelay: "60ms" }}
  >
    <div className="fx-card-glow" />
    <CardContent className="p-8 text-center">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/5 mb-6">
        <Image
          src="/image1.jpeg"
          alt="Premium laboratory chemicals"
          unoptimized
          fill
          className="object-cover select-none"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
          priority
        />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-white">Premium Chemicals</h3>
      <p className="text-slate-200 leading-relaxed">
        High-purity laboratory chemicals from trusted global manufacturers, ensuring consistent results in your research.
      </p>
    </CardContent>
  </Card>

  <Card
    className="relative group border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 fx-reveal"
    style={{ animationDelay: "120ms" }}
  >
    <div className="fx-card-glow" />
    <CardContent className="p-8 text-center">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/5 mb-6">
        <Image
          src="/image2.jpeg"
          alt="Advanced scientific instruments"
          unoptimized
          fill
          className="object-cover select-none"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
          priority={false}
        />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-white">Advanced Instruments</h3>
      <p className="text-slate-200 leading-relaxed">
        State-of-the-art scientific instruments and equipment for precise measurements and analysis.
      </p>
    </CardContent>
  </Card>

  <Card
    className="relative group border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 fx-reveal"
    style={{ animationDelay: "180ms" }}
  >
    <div className="fx-card-glow" />
    <CardContent className="p-8 text-center">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/5 mb-6">
        <Image
          src="/image3.jpeg"
          alt="Laboratory supplies and consumables"
          unoptimized
          fill
          className="object-cover select-none"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
          priority={false}
        />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-white">Laboratory Supplies</h3>
      <p className="text-slate-200 leading-relaxed">
        Complete range of laboratory supplies and consumables for all your research needs.
      </p>
    </CardContent>
  </Card>
</div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 fx-reveal">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">FEATURED BRANDS</Badge>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Comprehensive Laboratory Solutions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative group border border-white/10 bg-white/5 backdrop-blur-md hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "40ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/5 mb-6">
                  <Image
                    src="/image4.jpeg"
                    alt="Qualigens reagents and bottles"
                    unoptimized
                    fill
                    className="object-cover select-none"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                    priority={false}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">Qualigens Chemicals</h3>
                <p className="text-slate-200 text-sm mb-4">High-purity laboratory chemicals</p>
                <Button asChild variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/brand/qualigens">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative group border border-white/10 bg-white/5 backdrop-blur-md hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "80ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/5 mb-6">
                  <Image
                    src="/image5.jpeg"
                    alt="Borosil laboratory glassware"
                    unoptimized
                    fill
                    className="object-cover select-none"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                    priority={false}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">Borosil Glassware</h3>
                <p className="text-slate-200 text-sm mb-4">Premium laboratory glassware</p>
                <Button asChild variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/brand/borosil">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative group border border-white/10 bg-white/5 backdrop-blur-md hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "120ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/5 mb-6">
                  <Image
                    src="/image6.jpeg"
                    alt="Scientific instruments and microscopes"
                    unoptimized
                    fill
                    className="object-cover select-none"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                    priority={false}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">Scientific Instruments</h3>
                <p className="text-slate-200 text-sm mb-4">Advanced analytical equipment</p>
                <Button asChild variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/products/scientific-instruments">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative group border border-white/10 bg-white/5 backdrop-blur-md hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "160ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/5 mb-6">
                  <Image
                    src="/image7.jpeg"
                    alt="Whatman filter paper products"
                    unoptimized
                    fill
                    className="object-cover select-none"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                    priority={false}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">Whatman Filter Paper</h3>
                <p className="text-slate-200 text-sm mb-4">Laboratory filteration solutions</p>
                <Button asChild variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/brand/whatman">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "40ms" }}>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Quality Assured</h3>
              <p className="text-slate-200 text-sm">ISO certified products with rigorous quality control</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "100ms" }}>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Fast Delivery</h3>
              <p className="text-slate-200 text-sm">Quick and secure shipping worldwide</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "160ms" }}>
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Expert Support</h3>
              <p className="text-slate-200 text-sm">Technical assistance from qualified professionals</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "220ms" }}>
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Global Reach</h3>
              <p className="text-slate-200 text-sm">Serving 500+ clients worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-transparent text-white">
        <div className="container mx-auto px-4 text-center fx-reveal">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to Advance Your Research?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of researchers who trust Chemical Corporation for their laboratory needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="button-magnetic bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
              <Link href="/products">Browse Catalog</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-3 bg-transparent"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
