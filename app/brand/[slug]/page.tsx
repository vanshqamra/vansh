import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// --- Brand registry (extend anytime) ---
const BRAND_META: Record<string, {
  title: string
  description: string
  h1: string
  blurb: string
}> = {
  borosil: {
    title: "Buy Borosil Glassware Online | Chemical Corporation",
    description:
      "Genuine Borosil glassware: beakers, flasks, volumetrics. 10,000+ products. Discount auto-applies in cart.",
    h1: "Borosil Laboratory Glassware",
    blurb: "Beakers, flasks, volumetric ware & more — 100% genuine supply.",
  },
  rankem: {
    title: "Rankem Chemicals & Reagents Online | Chemical Corporation",
    description:
      "Rankem analytical reagents & solvents (AR/ACS). Discount auto-applies in cart, fast delivery.",
    h1: "Rankem Chemicals & Reagents",
    blurb: "AR/ACS grade solvents and reagents for analytical accuracy.",
  },
  himedia: {
    title: "HiMedia Culture Media & Diagnostics | Buy Online",
    description:
      "HiMedia culture media, microbiology kits & diagnostics. Discount auto-applies in cart.",
    h1: "HiMedia Culture Media",
    blurb: "Trusted media and diagnostics for microbiology workflows.",
  },
  qualigens: {
    title: "Qualigens Laboratory Chemicals | Buy Online",
    description:
      "High-purity Qualigens reagents. 10,000+ products. Discount in cart.",
    h1: "Qualigens Laboratory Chemicals",
    blurb: "Consistent quality reagents for research and QA/QC labs.",
  },
  whatman: {
    title: "Whatman Filter Papers & Filtration | Buy Online",
    description:
      "Whatman filter papers, membranes & filtration products. Discount in cart.",
    h1: "Whatman Filtration",
    blurb: "Filter papers, membranes, syringes & lab filtration solutions.",
  },
  omsons: {
    title: "Omsons Laboratory Glassware & Supplies | Online",
    description:
      "Omsons glassware & consumables. Discount auto-applies in cart.",
    h1: "Omsons Lab Glassware & Supplies",
    blurb: "Reliable glassware and consumables for daily lab use.",
  },
  avarice: {
    title: "Avarice Lab Essentials & Chemicals | Buy Online",
    description:
      "Avarice laboratory essentials & chemicals. Discount in cart.",
    h1: "Avarice Lab Essentials",
    blurb: "Cost-effective lab chemicals and everyday essentials.",
  },
}

// --- Build-time static paths (SSG) ---
export function generateStaticParams() {
  return Object.keys(BRAND_META).map((slug) => ({ slug }))
}

// --- Per-brand SEO metadata ---
export function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = BRAND_META[params.slug] || {
    title: "Lab Brands | Chemical Corporation",
    description: "Explore top laboratory brands. Discount auto-applies in cart.",
  }
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/brand/${params.slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/brand/${params.slug}`,
      type: "website",
    },
    robots: { index: true, follow: true },
  }
}

// --- Page ---
export default function BrandPage({ params }: { params: { slug: string } }) {
  const key = params.slug as keyof typeof BRAND_META
  const meta = BRAND_META[key]

  // If unknown brand, show a simple fallback (still SEO-safe)
  if (!meta) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Badge className="mb-4 bg-blue-100 text-blue-900 border-blue-200">Brand</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Brand Catalog</h1>
        <p className="text-slate-600 mb-8">Browse all products across top lab brands.</p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    )
  }

  // Send users into your existing /products flow with a prefilled brand query (no new functions)
  const searchHref = `/products?q=${encodeURIComponent(params.slug)}`

  return (
    <div className="container mx-auto px-4 py-16">
      <Badge className="mb-4 bg-green-100 text-green-900 border-green-200">FEATURED BRAND</Badge>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{meta.h1}</h1>
      <p className="text-slate-600 mb-8">{meta.blurb}</p>

      <div className="flex gap-3">
        <Button asChild>
          <Link href={searchHref}>Shop {meta.h1.split(" ")[0]}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>

      {/* Optional: small note reinforcing your USP */}
      <div className="mt-8 text-sm text-slate-500">
        Discounts auto-apply in cart • 10,000+ products • Nationwide delivery
      </div>
    </div>
  )
}
