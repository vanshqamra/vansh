import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- Category registry (add/remove as you like) ---
const CATEGORY_META: Record<
  string,
  { title: string; description: string; h1: string; blurb: string; searchQ: string }
> = {
  glassware: {
    title: "Buy Laboratory Glassware Online | Borosil, Omsons",
    description:
      "Beakers, flasks, volumetric ware, pipettes & more. Genuine Borosil, Omsons. Discount auto-applies in cart.",
    h1: "Laboratory Glassware",
    blurb: "Beakers, flasks, volumetric ware, pipettes, burettes, cylinders & more.",
    searchQ: "glassware",
  },
  filtration: {
    title: "Whatman Filter Papers & Lab Filtration | Buy Online",
    description:
      "Filter papers, membranes, funnels, syringe filters. Whatman & Borosil. Discount in cart.",
    h1: "Laboratory Filtration",
    blurb: "Filter papers, membranes, funnels, syringe filters and complete filtration lines.",
    searchQ: "filtration",
  },
  solvents: {
    title: "Analytical Solvents for Labs | Rankem, Qualigens",
    description:
      "AR/ACS grade solvents and reagents. Rankem & Qualigens. Fast delivery across India.",
    h1: "Analytical Solvents & Reagents",
    blurb: "AR/ACS grade solvents for chromatography, titration and general lab use.",
    searchQ: "solvent",
  },
  instruments: {
    title: "Scientific Instruments Online | Microscopes & Analytics",
    description:
      "Microscopes, balances, spectrophotometers & more. Support included. Discount in cart.",
    h1: "Scientific Instruments",
    blurb: "Microscopes, balances, centrifuges, spectrophotometers and more.",
    searchQ: "instruments",
  },
  consumables: {
    title: "Lab Consumables & Supplies | Buy Online",
    description:
      "Tubes, tips, vials, gloves, wipes & daily-use lab supplies. Discount auto-applies in cart.",
    h1: "Lab Consumables & Supplies",
    blurb: "Everything your lab needs day-to-day: tubes, tips, vials, wipes & more.",
    searchQ: "consumables",
  },
  microbiology: {
    title: "Microbiology & Culture Media | HiMedia",
    description:
      "HiMedia culture media, plates, broths, reagents & diagnostics. Discount in cart.",
    h1: "Microbiology & Culture Media",
    blurb: "HiMedia media, plates, broths, test kits and related microbiology supplies.",
    searchQ: "microbiology",
  },
  buffers: {
    title: "Buffers & Standards | Rankem, Qualigens",
    description:
      "pH buffers, standards and calibration solutions. Genuine supplies with quick shipping.",
    h1: "Buffers & Standards",
    blurb: "pH buffers, reference standards and calibration solutions.",
    searchQ: "buffer",
  },
  plasticware: {
    title: "Laboratory Plasticware | Tubes, Tips, Bottles",
    description:
      "Tubes, tips, bottles, carboys, racks & more. Discount auto-applies in cart.",
    h1: "Laboratory Plasticware",
    blurb: "Durable, high-quality plasticware for storage, handling and workflow.",
    searchQ: "plasticware",
  },
};

// Optional: support a few alias slugs → canonical categories
const CATEGORY_ALIASES: Record<string, keyof typeof CATEGORY_META> = {
  "filter-paper": "filtration",
  "filter-papers": "filtration",
  "lab-glassware": "glassware",
  "scientific-instruments": "instruments",
};

// --- SSG paths so these build statically ---
export function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((category) => ({ category }));
}

// --- Per-category SEO metadata ---
export function generateMetadata({ params }: { params: { category: string } }) {
  const key =
    (CATEGORY_ALIASES[params.category] as keyof typeof CATEGORY_META) ||
    (params.category as keyof typeof CATEGORY_META);

  const meta = CATEGORY_META[key] || {
    title: "Lab Products | Chemical Corporation",
    description: "Explore 10,000+ laboratory products. Discount auto-applies in cart.",
  };

  const canonical = `/products/${params.category}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

// --- Page ---
export default function CategoryPage({ params }: { params: { category: string } }) {
  const key =
    (CATEGORY_ALIASES[params.category] as keyof typeof CATEGORY_META) ||
    (params.category as keyof typeof CATEGORY_META);

  const meta = CATEGORY_META[key];

  // Fallback if unknown category
  if (!meta) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Badge className="mb-4 bg-blue-100 text-blue-900 border-blue-200">Category</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Product Categories</h1>
        <p className="text-slate-600 mb-8">Browse all products across brands and categories.</p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  // Reuse your existing /products flow with a prefilled query (no new functions)
  const searchHref = `/products?q=${encodeURIComponent(meta.searchQ)}`;

  return (
    <div className="container mx-auto px-4 py-16">
      <Badge className="mb-4 bg-blue-100 text-blue-900 border-blue-200">CATEGORY</Badge>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{meta.h1}</h1>
      <p className="text-slate-600 mb-8">{meta.blurb}</p>

      <div className="flex gap-3">
        <Button asChild>
          <Link href={searchHref}>Shop {meta.h1}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>

      <div className="mt-8 text-sm text-slate-500">
        Discounts auto-apply in cart • 10,000+ products • Nationwide delivery
      </div>
    </div>
  );
}
