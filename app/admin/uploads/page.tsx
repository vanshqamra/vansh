"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download, Eye, Calendar, User, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface QuoteUpload {
  id: string
  user_id: string
  file_name: string
  file_url: string
  status: "pending" | "reviewed" | "quoted" | "rejected"
  created_at: string
  user_email?: string
  notes?: string
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<QuoteUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
          profiles(email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const uploadsWithEmail =
        data?.map((upload) => ({
          ...upload,
          user_email: upload.profiles?.email || "Unknown",
        })) || []

      setUploads(uploadsWithEmail)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch uploads")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: QuoteUpload["status"]) => {
    try {
      const { error } = await supabase.from("quote_uploads").update({ status }).eq("id", id)

      if (error) throw error

      setUploads((prev) => prev.map((upload) => (upload.id === id ? { ...upload, status } : upload)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  const deleteUpload = async (id: string) => {
    if (!confirm("Are you sure you want to delete this upload?")) return

    try {
      const { error } = await supabase.from("quote_uploads").delete().eq("id", id)

      if (error) throw error

      setUploads((prev) => prev.filter((upload) => upload.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete upload")
    }
  }

  const getStatusColor = (status: QuoteUpload["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "quoted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading uploads...</p>
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {uploads.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads found</h3>
              <p className="text-gray-600">No quote requests have been submitted yet.</p>
            </CardContent>
          </Card>
        ) : (
          uploads.map((upload) => (
            <Card key={upload.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{upload.file_name}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {upload.user_email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(upload.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(upload.status)}>
                    {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(upload.file_url, "_blank")}>
                    <Eye className="h-4 w-4 mr-2" />
                    View File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = upload.file_url
                      link.download = upload.file_name
                      link.click()
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>

                  {upload.status === "pending" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(upload.id, "reviewed")}>
                        Mark as Reviewed
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(upload.id, "quoted")}>
                        Mark as Quoted
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(upload.id, "rejected")}>
                        Reject
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteUpload(upload.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {upload.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{upload.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
