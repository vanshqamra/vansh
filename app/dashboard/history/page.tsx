"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye, Calendar } from "lucide-react"

// Mock data for quote history
const mockQuoteHistory = [
  {
    id: "QR-2024-001",
    date: "2024-01-15",
    items: 12,
    status: "Completed",
    total: "₹45,670",
    type: "Manual Request",
  },
  {
    id: "QR-2024-002",
    date: "2024-01-18",
    items: 8,
    status: "Pending",
    total: "₹28,450",
    type: "File Upload",
  },
  {
    id: "QR-2024-003",
    date: "2024-01-22",
    items: 25,
    status: "In Progress",
    total: "₹89,320",
    type: "Manual Request",
  },
  {
    id: "QR-2024-004",
    date: "2024-01-25",
    items: 6,
    status: "Completed",
    total: "₹15,890",
    type: "File Upload",
  },
  {
    id: "QR-2024-005",
    date: "2024-01-28",
    items: 18,
    status: "Rejected",
    total: "₹52,340",
    type: "Manual Request",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800"
    case "Pending":
      return "bg-yellow-100 text-yellow-800"
    case "In Progress":
      return "bg-blue-100 text-blue-800"
    case "Rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHistory, setFilteredHistory] = useState(mockQuoteHistory)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = mockQuoteHistory.filter(
      (quote) =>
        quote.id.toLowerCase().includes(term.toLowerCase()) ||
        quote.status.toLowerCase().includes(term.toLowerCase()) ||
        quote.type.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredHistory(filtered)
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Quote Request History</h1>
        <p className="text-slate-600">View and manage all your previous quote requests and their current status.</p>
      </div>

      <Card className="bg-white/80 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Request History
              </CardTitle>
              <CardDescription>Track the status of your quote requests and download completed quotes.</CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                    <TableCell>{quote.items} items</TableCell>
                    <TableCell>{quote.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{quote.total}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {quote.status === "Completed" && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-600">
                {searchTerm ? "Try adjusting your search terms." : "You haven't made any quote requests yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
