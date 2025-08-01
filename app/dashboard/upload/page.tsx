"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function UploadQuotePage() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    } else {
      setFile(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileName", file.name)
    formData.append("description", description)

    try {
      const response = await fetch("/api/upload-quote", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Upload Successful",
          description: data.message,
        })
        setFile(null)
        setDescription("")
        // Optionally, clear the file input
        const fileInput = document.getElementById("quote-file") as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "An unknown error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Upload Quote Request</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Upload your detailed quote requests or any relevant documents here. Our team will review them and get back to
        you shortly.
      </p>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Submit Your Document</CardTitle>
          <CardDescription>Accepted formats: PDF, DOCX, XLSX, CSV, TXT. Max file size: 5MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="quote-file">Choose File</Label>
              <Input
                id="quote-file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                disabled={loading}
              />
              {file && <p className="text-sm text-gray-500 mt-1">Selected file: {file.name}</p>}
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any specific details or requirements for your quote..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
