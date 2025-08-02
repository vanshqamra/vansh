"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Download, Eye, Trash2, Calendar, User, Building, Phone, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"

interface QuoteUpload {
  id: string
  user_id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  file_url: string
  file_name: string
  status: "pending" | "reviewed" | "quoted" | "completed"
  notes?: string
  created_at: string
  updated_at: string
  user_profiles?: {
    full_name: string
    email: string
  }
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<QuoteUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUpload, setSelectedUpload] = useState<QuoteUpload | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchUploads()
  }, [user, router])

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from("quote_uploads")
        .select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setUploads(data || [])
    } catch (error) {
      console.error("Error fetching uploads:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from("quote_uploads")
        .update({
          status,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Refresh the uploads list
      fetchUploads()
      setSelectedUpload(null)
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const deleteUpload = async (id: string) => {
    if (!confirm("Are you sure you want to delete this upload?")) return

    try {
      const { error } = await supabase.from("quote_uploads").delete().eq("id", id)

      if (error) throw error
      fetchUploads()
    } catch (error) {
      console.error("Error deleting upload:", error)
    }
  }

  const filteredUploads = uploads.filter((upload) => {
    const matchesStatus = statusFilter === "all" || upload.status === statusFilter
    const matchesSearch =
      upload.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.email.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quote Upload Management</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{uploads.length} Total Uploads</Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by company, contact person, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
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
            </div>
          </CardContent>
        </Card>

        {/* Uploads List */}
        <div className="grid gap-4">
          {filteredUploads.map((upload) => (
            <Card key={upload.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">{upload.file_name}</h3>
                      <Badge className={getStatusColor(upload.status)}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>{upload.company_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{upload.contact_person}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{upload.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{upload.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Uploaded: {new Date(upload.created_at).toLocaleDateString()}</span>
                    </div>

                    {upload.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{upload.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => window.open(upload.file_url, "_blank")}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
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
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUpload(upload)}>
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Update Upload Status</DialogTitle>
                        </DialogHeader>
                        <UpdateStatusForm
                          upload={upload}
                          onUpdate={updateStatus}
                          onClose={() => setSelectedUpload(null)}
                        />
                      </DialogContent>
                    </Dialog>
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

        {filteredUploads.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No uploads found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No quote uploads have been submitted yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function UpdateStatusForm({
  upload,
  onUpdate,
  onClose,
}: {
  upload: QuoteUpload
  onUpdate: (id: string, status: string, notes?: string) => void
  onClose: () => void
}) {
  const [status, setStatus] = useState(upload.status)
  const [notes, setNotes] = useState(upload.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(upload.id, status, notes)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
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
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes or comments..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update Status</Button>
      </div>
    </form>
  )
}
