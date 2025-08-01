"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Trash2, Eye, Search, Filter } from "lucide-react"

interface QuoteUpload {
  id: string
  fileName: string
  uploadDate: string
  status: "pending" | "reviewed" | "quoted" | "completed"
  customerName: string
  customerEmail: string
  fileSize: string
  notes?: string
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<QuoteUpload[]>([])
  const [filteredUploads, setFilteredUploads] = useState<QuoteUpload[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUpload, setSelectedUpload] = useState<QuoteUpload | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockUploads: QuoteUpload[] = [
      {
        id: "1",
        fileName: "chemical_requirements_jan2024.pdf",
        uploadDate: "2024-01-15T10:30:00Z",
        status: "pending",
        customerName: "John Smith",
        customerEmail: "john.smith@example.com",
        fileSize: "2.4 MB",
        notes: "Urgent requirement for laboratory setup",
      },
      {
        id: "2",
        fileName: "bulk_order_request.xlsx",
        uploadDate: "2024-01-14T14:20:00Z",
        status: "reviewed",
        customerName: "Sarah Johnson",
        customerEmail: "sarah.j@company.com",
        fileSize: "1.8 MB",
        notes: "Large quantity order for industrial use",
      },
      {
        id: "3",
        fileName: "lab_supplies_quote.pdf",
        uploadDate: "2024-01-13T09:15:00Z",
        status: "quoted",
        customerName: "Dr. Michael Brown",
        customerEmail: "m.brown@university.edu",
        fileSize: "3.1 MB",
        notes: "University research project requirements",
      },
    ]

    setTimeout(() => {
      setUploads(mockUploads)
      setFilteredUploads(mockUploads)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter uploads based on search and status
  useEffect(() => {
    let filtered = uploads

    if (searchTerm) {
      filtered = filtered.filter(
        (upload) =>
          upload.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          upload.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          upload.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((upload) => upload.status === statusFilter)
    }

    setFilteredUploads(filtered)
  }, [uploads, searchTerm, statusFilter])

  const handleStatusUpdate = (uploadId: string, newStatus: QuoteUpload["status"]) => {
    setUploads((prev) => prev.map((upload) => (upload.id === uploadId ? { ...upload, status: newStatus } : upload)))
    toast({
      title: "Status Updated",
      description: `Upload status changed to ${newStatus}`,
    })
  }

  const handleNotesUpdate = (uploadId: string, newNotes: string) => {
    setUploads((prev) => prev.map((upload) => (upload.id === uploadId ? { ...upload, notes: newNotes } : upload)))
    toast({
      title: "Notes Updated",
      description: "Upload notes have been saved",
    })
  }

  const handleDelete = (uploadId: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== uploadId))
    toast({
      title: "Upload Deleted",
      description: "The upload has been removed",
    })
  }

  const getStatusColor = (status: QuoteUpload["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "quoted":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Uploads Management</h1>
        <p className="text-gray-600">Manage and review customer quote requests</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by filename, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUploads.map((upload) => (
          <Card key={upload.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg truncate">{upload.fileName}</CardTitle>
                </div>
                <Badge className={getStatusColor(upload.status)}>{upload.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Customer:</span> {upload.customerName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {upload.customerEmail}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {formatDate(upload.uploadDate)}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {upload.fileSize}
                </div>
              </div>

              {upload.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-sm">Notes:</span>
                  <p className="text-sm text-gray-600 mt-1">{upload.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Select
                  value={upload.status}
                  onValueChange={(value) => handleStatusUpdate(upload.id, value as QuoteUpload["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Add notes..."
                  value={selectedUpload?.id === upload.id ? notes : upload.notes || ""}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    setSelectedUpload(upload)
                  }}
                  onBlur={() => {
                    if (selectedUpload?.id === upload.id && notes !== upload.notes) {
                      handleNotesUpdate(upload.id, notes)
                    }
                  }}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(upload.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUploads.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No uploads found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "No uploads match your current filters."
              : "No quote uploads have been submitted yet."}
          </p>
        </div>
      )}
    </div>
  )
}
