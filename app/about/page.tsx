import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, Zap } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Chemical Corporation's 77+ year history, our mission, values, and our commitment to quality, reliability, and customer support.",
}

const timelineEvents = [
  {
    year: "1945",
    event: "Founded",
    description: "Chemical Corporation is established in Ludhiana to serve local industries.",
  },
  {
    year: "1980",
    event: "Expansion",
    description: "Expanded product range to include specialized laboratory chemicals.",
  },
  {
    year: "2005",
    event: "Partnerships",
    description: "Became authorized distributors for leading brands like Borosil and Whatman.",
  },
  { year: "2025", event: "77+ Years", description: "Celebrating over seven decades of excellence and customer trust." },
]

export default function AboutPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">About Chemical Corporation</h1>
          <p className="mt-3 max-w-3xl mx-auto text-lg text-slate-600">
            For over 77 years, we have been the trusted backbone for laboratories and industries, providing unparalleled
            quality and service.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 w-0.5 h-full bg-slate-200 -translate-x-1/2"></div>
            {timelineEvents.map((item, index) => (
              <div
                key={item.year}
                className={`flex items-center w-full mb-8 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                  <div className="p-4 bg-slate-50 rounded-lg shadow-md">
                    <p className="text-sm font-semibold text-blue-600">{item.year}</p>
                    <h3 className="text-lg font-bold">{item.event}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Commitment</h2>
            <p className="text-slate-600 mb-4">
              We are the authorized distributors for industry-leading brands including{" "}
              <strong>Qualigens, Borosil, Whatman, Rankem, and Avarice</strong>. Our long-standing relationships ensure
              you receive authentic, high-quality products every time.
            </p>
            <p className="text-slate-600">
              Our mission is to empower scientific and industrial progress through unwavering commitment to quality,
              reliability, and exceptional customer support.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Integrity</CardTitle>
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Innovation</CardTitle>
                <Zap className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sustainability</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
