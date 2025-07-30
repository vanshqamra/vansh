import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, Zap } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Explore the journey of Chemical Corporation — from a humble beginning to becoming a trusted name in lab supplies for over 500 clients across India.",
}

const timelineEvents = [
  {
    year: "1948",
    event: "Company Founded",
    description: "Chemical Corporation was established in Ludhiana to serve regional industry needs with essential chemicals.",
  },
  {
    year: "1962",
    event: "100 Clients Milestone",
    description: "Built strong regional partnerships and crossed 100 loyal industrial and lab clients.",
  },
  {
    year: "1981",
    event: "Expanded Offerings",
    description: "Product range diversified to include specialty laboratory and industrial chemicals.",
  }
  {
    year: "2010",
    event: "250 Clients & Major Industry Entry",
    description: "Grew to over 250 clients and began serving major clients including Hindustan Unilever and Tata Group.",
  },
  {
    year: "2022",
    event: "500 Clients & National Reach",
    description: "Achieved the milestone of 500 active clients including Hindustan Petroleum and government institutions.",
  },
  {
    year: "2025",
    event: "Digital B2B Portal Launch",
    description: "Launched an advanced vendor portal to enable seamless B2B procurement across India.",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">About Chemical Corporation</h1>
          <p className="mt-3 max-w-3xl mx-auto text-lg text-slate-600">
            For over 77 years, Chemical Corporation has been a trusted partner to industries and laboratories, known for
            our integrity, reliability, and consistent quality.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 w-0.5 h-full bg-slate-200 -translate-x-1/2" />
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
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-slate-600 mb-4">
              We are proud distributors of leading chemical and lab supply brands including{" "}
              <strong>Qualigens, Borosil, Whatman, Rankem, and JT Baker</strong>. Our aim is to serve as a one-stop
              partner for industries, research institutions, and educational labs.
            </p>
            <p className="text-slate-600">
              From startups to Fortune 500 clients, we’re committed to providing high-purity chemicals with excellent service
              and reliable delivery.
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
                <CardTitle className="text-sm font-medium">Customer-Centric</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
