// app/page.tsx
import { ParallaxBackground } from "@/components/parallax-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import {
  FlaskConical,
  Microscope,
  TestTube,
  Shield,
  Truck,
  Award,
  Globe,
  Zap,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* ===== HERO ===== */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParallaxBackground />

        {/* Hero Stamp: 10,000+ Products */}
        <div
          className="absolute top-8 left-8 z-30 hidden md:flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 shadow-lg w-36 h-36"
          aria-label="Ten thousand plus products available to buy online"
        >
          <div className="text-center leading-tight">
            <div className="text-2xl font-bold text-blue-100">10,000+</div>
            <div className="text-[11px] uppercase tracking-wider text-blue-200">
              Products
            </div>
            <div className="text-[10px] text-blue-300 mt-1">Buy Online</div>
          </div>
        </div>

        <div
          className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto fx-reveal"
          style={{ animationDelay: "80ms" }}
        >
          <Badge className="mb-6 bg-blue-600/20 text-blue-200 border-blue-400/30 hover:bg-blue-600/30 backdrop-blur">
            <Zap className="w-4 h-4 mr-2" />
            Advanced Laboratory Solutions
          </Badge>

          <h1 className="hero-heading text-5xl md:text-7xl font-bold mb-6">
            Chemical Corporation
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Pioneering the future of laboratory science with premium chemicals,
            cutting-edge instruments, and innovative solutions for research
            excellence.
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

            {/* Discount Chip beside CTAs */}
            <Badge className="bg-white/10 text-blue-100 border-white/20 hover:bg-white/20">
              Discount applies in cart
            </Badge>
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

        {/* Mobile-only sticky discount note (no JS, no links) */}
        <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center md:hidden">
          <div className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm shadow-lg border border-white/20">
            Discounts apply in cart
          </div>
        </div>
      </section>

      {/* ===== USP BAR (under hero) ===== */}
      <section className="py-6 bg-white/80 backdrop-blur border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow">
                <FlaskConical className="h-5 w-5 text-slate-50" />
              </div>
              <div className="text-slate-900 font-semibold">10,000+ Products</div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shadow">
                <Award className="h-5 w-5 text-slate-50" />
              </div>
              <div className="text-slate-900 font-semibold">Top Lab Brands</div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow">
                <Zap className="h-5 w-5 text-slate-50" />
              </div>
              <div className="text-slate-900 font-semibold">Discount auto-applies in cart</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES (3) ===== */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-900 border-blue-200 fx-reveal">Why Choose Us</Badge>
            <h2 className="fx-reveal text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Laboratory Excellence Redefined
            </h2>
            <p className="fx-reveal text-xl text-slate-600 max-w-3xl mx-auto">
              Experience unparalleled quality and innovation in every product we deliver
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Premium Chemicals — /public/image1.jpeg */}
            <Card className="relative group border-0 shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "60ms" }}>
              <div className="fx-card-glow" />
              <CardContent className="p-8 text-center">
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-6">
                  <Image
                    src="/image1.jpeg"
                    alt="Premium laboratory chemicals"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 33vw, 90vw"
                    priority
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Chemicals</h3>
                <p className="text-slate-600">
                  High-purity laboratory chemicals from trusted global manufacturers, ensuring consistent results in your research.
                </p>
              </CardContent>
            </Card>

            {/* Advanced Instruments — /public/image2.jpeg */}
            <Card className="relative group border-0 shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "120ms" }}>
              <div className="fx-card-glow" />
              <CardContent className="p-8 text-center">
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-6">
                  <Image
                    src="/image2.jpeg"
                    alt="Advanced scientific instruments"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 33vw, 90vw"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Instruments</h3>
                <p className="text-slate-600">
                  State-of-the-art scientific instruments and equipment for precise measurements and analysis.
                </p>
              </CardContent>
            </Card>

            {/* Laboratory Supplies — /public/image3.jpeg */}
            <Card className="relative group border-0 shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "180ms" }}>
              <div className="fx-card-glow" />
              <CardContent className="p-8 text-center">
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-6">
                  <Image
                    src="/image3.jpeg"
                    alt="Laboratory supplies and consumables"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 33vw, 90vw"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Laboratory Supplies</h3>
                <p className="text-slate-600">
                  Complete range of laboratory supplies and consumables for all your research needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

            {/* ===== FEATURED BRANDS (8) ===== */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 fx-reveal">
            <Badge className="mb-4 bg-green-100 text-green-900 border-green-200">FEATURED BRANDS</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Comprehensive Laboratory Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Qualigens */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "40ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image4.jpeg"
                    alt="Qualigens reagents and bottles"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Qualigens Chemicals</h3>
                <p className="text-slate-600 text-sm mb-4">High-purity laboratory chemicals</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/brand/qualigens">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Borosil */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "80ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image5.jpeg"
                    alt="Borosil laboratory glassware"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Borosil Glassware</h3>
                <p className="text-slate-600 text-sm mb-4">Premium laboratory glassware</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/brand/borosil">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Scientific Instruments */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "120ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image6.jpeg"
                    alt="Scientific instruments and microscopes"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Scientific Instruments</h3>
                <p className="text-slate-600 text-sm mb-4">Advanced analytical equipment</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/products/scientific-instruments">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Whatman */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "160ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image7.jpeg"
                    alt="Whatman filter paper products"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Whatman Filter Paper</h3>
                <p className="text-slate-600 text-sm mb-4">Laboratory filtration solutions</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/brand/whatman">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* HiMedia */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "200ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image8.jpeg"
                    alt="HiMedia laboratory products"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">HiMedia</h3>
                <p className="text-slate-600 text-sm mb-4">Culture media & diagnostics</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/brand/HiMedia">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Omsons */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "240ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image9.jpeg"
                    alt="Omsons laboratory glassware"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Omsons</h3>
                <p className="text-slate-600 text-sm mb-4">Laboratory glassware & supplies</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/brand/omsons">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Avarice */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "280ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image10.jpeg"
                    alt="Avarice laboratory products"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Avarice</h3>
                <p className="text-slate-600 text-sm mb-4">Laboratory essentials & reagents</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/brand/avarice">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Rankem */}
            <Card className="group hover:shadow-xl bg-white text-slate-900 fx-reveal" style={{ animationDelay: "320ms" }}>
              <CardContent className="p-6">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-200 mb-4">
                  <Image
                    src="/image11.jpeg"
                    alt="Rankem laboratory chemicals"
                    fill unoptimized
                    className="object-cover"
                    sizes="(min-width:1024px) 25vw, 90vw"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">Rankem</h3>
                <p className="text-slate-600 text-sm mb-4">Analytical reagents & solvents</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/brand/rankem">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* ===== TRUST ===== */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "40ms" }}>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-slate-50" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Quality Assured</h3>
              <p className="text-slate-600 text-sm">ISO certified products with rigorous quality control</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "100ms" }}>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Truck className="h-8 w-8 text-slate-50" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Fast Delivery</h3>
              <p className="text-slate-600 text-sm">Quick and secure shipping worldwide</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "160ms" }}>
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Award className="h-8 w-8 text-slate-50" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Expert Support</h3>
              <p className="text-slate-600 text-sm">Technical assistance from qualified professionals</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "220ms" }}>
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Globe className="h-8 w-8 text-slate-50" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Global Reach</h3>
              <p className="text-slate-600 text-sm">Serving 500+ clients worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="fx-reveal text-4xl font-bold text-slate-900 mb-6 tracking-tight">Ready to Advance Your Research?</h2>
          <p className="fx-reveal text-xl mb-8 text-slate-700 max-w-2xl mx-auto">
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
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 bg-transparent"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
