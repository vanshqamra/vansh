import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Scientific Instruments",
  description: "Explore scientific instruments from top brands.",
}

export default function ScientificInstrumentsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
        Scientific Instruments
      </h1>
      <p className="text-xl text-slate-600">Coming Soon</p>
    </div>
  )
}
