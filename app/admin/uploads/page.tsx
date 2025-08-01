import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Download } from "lucide-react"

export default async function AdminUploadsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // In a real application, you'd check if the user has admin role
  // For this example, we'll just fetch all uploads
  const { data: uploads, error } = await supabase
    .from("user_uploads")
    .select("*")
    .order("uploaded_at", { ascending: false })

  if (error) {
    console.error("Error fetching uploads:", error)
    return <div className="container mx-auto p-8">Error loading uploads.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Uploads</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Manage and review all user-uploaded quote requests and documents.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>All User Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <p className="text-center text-gray-500">No uploads found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell className="font-medium">{upload.user_id}</TableCell>
                      <TableCell>{upload.file_name}</TableCell>
                      <TableCell>{upload.description || "N/A"}</TableCell>
                      <TableCell>{new Date(upload.uploaded_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`https://chemical-corp-portal.supabase.co/storage/v1/object/public/quote-uploads/${upload.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
