"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Eye, Upload, Search, Filter } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"
import { createClient } from "@/lib/supabase/client"

interface QuoteUpload {
  id: string
  user_id: string
  file_name: string
  file_url: string
  status: "pending" | "processing" | "completed" | "rejected"
  notes?: string
  created_at: string
  updated_at: string
  user_email?: string
}

export default function AdminUploadsPage() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<QuoteUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUpload, setSelectedUpload] = useState<QuoteUpload | null>(null)
  const [notes, setNotes] = useState("")
  const [updating, setUpdating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("quote_uploads")
        .select(`
          *,
          profiles:user_id (
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const uploadsWithEmail =
        data?.map((upload) => ({
          ...upload,
          user_email: (upload.profiles as any)?.email || "Unknown",
        })) || []

      setUploads(uploadsWithEmail)
    } catch (error) {
      console.error("Error fetching uploads:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUploadStatus = async (uploadId: string, status: string, adminNotes?: string) => {
    try {
      setUpdating(true)
      const { error } = await supabase
        .from("quote_uploads")
        .update({
          status,
          notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", uploadId)

      if (error) throw error

      await fetchUploads()
      setSelectedUpload(null)
      setNotes("")
    } catch (error) {
      console.error("Error updating upload:", error)
    } finally {
      setUpdating(false)
    }
  }

  const deleteUpload = async (uploadId: string) => {
    if (!confirm("Are you sure you want to delete this upload?")) return

    try {
      const { error } = await supabase.from("quote_uploads").delete().eq("id", uploadId)

      if (error) throw error

      await fetchUploads()
    } catch (error) {
      console.error("Error deleting upload:", error)
    }
  }

  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch =
      upload.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || upload.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You must be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Upload Management</h1>
        <p className="text-gray-600">Manage and review customer quote uploads</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by filename or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {uploads.filter((u) => u.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {uploads.filter((u) => u.status === "processing").length}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {uploads.filter((u) => u.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {uploads.filter((u) => u.status === "rejected").length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Uploads List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading uploads...</p>
        </div>
      ) : filteredUploads.length === 0 ? (
        <div className="text-center py-8">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads found</h3>
          <p className="text-gray-600">No quote uploads match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUploads.map((upload) => (
            <Card key={upload.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{upload.file_name}</h3>
                      <Badge className={getStatusColor(upload.status)}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Customer: {upload.user_email}</p>
                      <p>Uploaded: {new Date(upload.created_at).toLocaleDateString()}</p>
                      {upload.notes && <p>Notes: {upload.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(upload.file_url, "_blank")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUpload(upload)
                        setNotes(upload.notes || "")
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUpload(upload.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Modal */}
      {selectedUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Upload Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <p className="text-sm text-gray-600">{selectedUpload.file_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  defaultValue={selectedUpload.status}
                  onValueChange={(value) => {
                    setSelectedUpload({ ...selectedUpload, status: value as any })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for the customer..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => updateUploadStatus(selectedUpload.id, selectedUpload.status, notes)}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? "Updating..." : "Update"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUpload(null)
                    setNotes("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
