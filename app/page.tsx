// app/page.tsx (or wherever your homepage lives)
import { ParallaxBackground } from "@/components/parallax-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen relative overflow-hidden">
      {/* --- Global FX (decorative only) --- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Animated gradient mesh */}
        <div className="fx-mesh absolute -inset-40 opacity-60 animate-mesh" />
        {/* Subtle animated grid */}
        <div className="fx-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_85%,transparent)] animate-grid" />
        {/* Floating molecules */}
        <svg className="absolute inset-0 w-full h-full opacity-50 text-slate-800/25 dark:text-slate-200/20">
          <defs>
            <g id="mol">
              <circle r="2" fill="currentColor" />
              <circle cx="10" r="2" fill="currentColor" />
              <circle cx="5" cy="6" r="2" fill="currentColor" />
              <line x1="0" y1="0" x2="10" y2="0" stroke="currentColor" strokeWidth=".75" />
              <line x1="5" y1="6" x2="10" y2="0" stroke="currentColor" strokeWidth=".75" />
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
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 fx-reveal">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight fx-reveal">Laboratory Excellence Redefined</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience unparalleled quality and innovation in every product we deliver
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
  <Card
    className="relative group border-0 shadow-lg hover:shadow-xl transition-all duration-300 fx-reveal"
    style={{ animationDelay: "60ms" }}
  >
    <div className="fx-card-glow" />
    <CardContent className="p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
        <FlaskConical className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-slate-900">Premium Chemicals</h3>
      <p className="text-slate-600 leading-relaxed">
        High-purity laboratory chemicals from trusted global manufacturers, ensuring consistent results in your research.
      </p>
    </CardContent>
  </Card>

  <Card
    className="relative group border-0 shadow-lg hover:shadow-xl transition-all duration-300 fx-reveal"
    style={{ animationDelay: "120ms" }}
  >
    <div className="fx-card-glow" />
    <CardContent className="p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
        <Microscope className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-slate-900">Advanced Instruments</h3>
      <p className="text-slate-600 leading-relaxed">
        State-of-the-art scientific instruments and equipment for precise measurements and analysis.
      </p>
    </CardContent>
  </Card>

  <Card
    className="relative group border-0 shadow-lg hover:shadow-xl transition-all duration-300 fx-reveal"
    style={{ animationDelay: "180ms" }}
  >
    <div className="fx-card-glow" />
    <CardContent className="p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
        <TestTube className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-slate-900">Laboratory Supplies</h3>
      <p className="text-slate-600 leading-relaxed">
        Complete range of laboratory supplies and consumables for all your research needs.
      </p>
    </CardContent>
  </Card>
</div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 fx-reveal">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">FEATURED BRANDS</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Comprehensive Laboratory Solutions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "40ms" }}>
              <CardContent className="p-6">
                <div className="h-48 rounded-lg flex items-center justify-center mb-4 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(59,130,246,.12),transparent_60%)]">
                  <FlaskConical className="h-16 w-16 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Qualigens Chemicals</h3>
                <p className="text-gray-600 text-sm mb-4">High-purity laboratory chemicals</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/brand/qualigens">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "80ms" }}>
              <CardContent className="p-6">
                <div className="h-48 rounded-lg flex items-center justify-center mb-4 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(16,185,129,.12),transparent_60%)]">
                  <TestTube className="h-16 w-16 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Borosil Glassware</h3>
                <p className="text-gray-600 text-sm mb-4">Premium laboratory glassware</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/brand/borosil">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "120ms" }}>
              <CardContent className="p-6">
                <div className="h-48 rounded-lg flex items-center justify-center mb-4 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(124,58,237,.12),transparent_60%)]">
                  <Microscope className="h-16 w-16 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Scientific Instruments</h3>
                <p className="text-gray-600 text-sm mb-4">Advanced analytical equipment</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/products/scientific-instruments">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow fx-reveal" style={{ animationDelay: "160ms" }}>
              <CardContent className="p-6">
                <div className="h-48 rounded-lg flex items-center justify-center mb-4 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(249,115,22,.12),transparent_60%)]">
                  <Shield className="h-16 w-16 text-orange-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Whatman Filter Paper</h3>
                <p className="text-gray-600 text-sm mb-4">Laboratory filteration solutions</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/brand/whatman">Buy Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "40ms" }}>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Quality Assured</h3>
              <p className="text-slate-600 text-sm">ISO certified products with rigorous quality control</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "100ms" }}>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Fast Delivery</h3>
              <p className="text-slate-600 text-sm">Quick and secure shipping worldwide</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "160ms" }}>
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Expert Support</h3>
              <p className="text-slate-600 text-sm">Technical assistance from qualified professionals</p>
            </div>
            <div className="flex flex-col items-center fx-reveal" style={{ animationDelay: "220ms" }}>
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Global Reach</h3>
              <p className="text-slate-600 text-sm">Serving 500+ clients worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
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

      {/* Local CSS for animations (no extra deps) */}
      <style>{`
        @keyframes mesh {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-2%,0) scale(1.02); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes gridSlide {
          from { background-position: 0 0, 0 0; }
          to   { background-position: 80px 80px, 80px 80px; }
        }
        @keyframes reveal {
          0% { opacity: 0; transform: translate3d(0, 12px, 0) scale(.98); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        .fx-mesh {
          background:
            radial-gradient(1000px 400px at 80% -10%, rgba(20,184,166,.12), transparent 60%),
            radial-gradient(800px 300px at -10% 20%, rgba(14,165,233,.12), transparent 60%),
            radial-gradient(700px 280px at 40% 90%, rgba(14,165,233,.08), transparent 60%);
        }
        .fx-grid {
          background:
            linear-gradient(to right, rgba(226,232,240,.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226,232,240,.5) 1px, transparent 1px);
          background-size: 80px 80px, 80px 80px;
        }
        .animate-mesh { animation: mesh 22s linear infinite; }
        .animate-grid { animation: gridSlide 24s linear infinite; }
        .fx-reveal { animation: reveal .7s cubic-bezier(.16,1,.3,1) both; }
        .fx-card-glow {
          position: absolute; inset: -1px; border-radius: 16px;
          background: radial-gradient(120px 60px at 20% 0%, rgba(56,189,248,.15), transparent 70%),
                      radial-gradient(120px 60px at 90% 20%, rgba(16,185,129,.12), transparent 70%);
          opacity: .6; pointer-events: none; filter: blur(14px);
          transition: opacity .3s ease;
        }
        .group:hover .fx-card-glow { opacity: .9; }
        /* Magnetic highlight for CTAs (no JS) */
        .button-magnetic { position: relative; overflow: hidden; }
        .button-magnetic::after{
          content:""; position:absolute; inset:-120% -40%;
          background: radial-gradient(circle at center, rgba(255,255,255,.35), transparent 40%);
          transform: translate3d(0,0,0) scale(0);
          transition: transform .25s ease;
        }
        .button-magnetic:hover::after{ transform: translate3d(0,0,0) scale(1); }
        /* Respect reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-mesh, .animate-grid, svg animateMotion { animation: none !important; display: none !important; }
          .fx-reveal { animation: none !important; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
