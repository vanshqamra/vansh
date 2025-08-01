"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

interface QuoteItem {
  id: string
  name: string
  brand?: string
  packSize?: string
  casNumber?: string
  quantity: number
}

interface Quote {
  id: string
  user_id: string
  items: QuoteItem[]
  status: "pending" | "approved" | "rejected" | "completed"
  requested_at: string
  user_email?: string
}

export default function AdminUploadsPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    setLoading(true)
    const { data: quotesData, error } = await supabase
      .from("quotes")
      .select("*")
      .order("requested_at", { ascending: false })

    if (error) {
      console.error("Error fetching quotes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch quote requests.",
        variant: "destructive",
      })
    } else {
      // Fetch user emails for each quote
      const quotesWithEmails = await Promise.all(
        quotesData.map(async (quote) => {
          const { data: userData, error: userError } = await supabase
            .from("profiles") // Assuming 'profiles' table stores user data including email
            .select("email")
            .eq("id", quote.user_id)
            .single()

          return {
            ...quote,
            user_email: userData ? userData.email : "N/A",
          }
        }),
      )
      setQuotes(quotesWithEmails as Quote[])
    }
    setLoading(false)
  }

  const updateQuoteStatus = async (quoteId: string, newStatus: Quote["status"]) => {
    const { error } = await supabase.from("quotes").update({ status: newStatus }).eq("id", quoteId)

    if (error) {
      console.error("Error updating quote status:", error)
      toast({
        title: "Error",
        description: `Failed to update quote status to ${newStatus}.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Quote status updated to ${newStatus}.`,
        variant: "default",
      })
      fetchQuotes() // Re-fetch quotes to update the UI
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Manage Quote Uploads</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading Quote Requests...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we fetch the latest quote requests.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Manage Quote Uploads</h1>

      {quotes.length === 0 ? (
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardTitle className="mb-4">No Quote Requests Found</CardTitle>
          <CardContent>
            <p className="text-gray-600">There are no pending or past quote requests at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Quote Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id.substring(0, 8)}...</TableCell>
                    <TableCell>{quote.user_email || "N/A"}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="p-0 h-auto">
                            View {quote.items.length} Items
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Items for Quote ID: {quote.id.substring(0, 8)}</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            <ul className="space-y-2">
                              {quote.items.map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover"
                                  />
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                      Qty: {item.quantity} | Pack: {item.packSize || "N/A"} | CAS:{" "}
                                      {item.casNumber || "N/A"}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          quote.status === "pending"
                            ? "secondary"
                            : quote.status === "approved"
                              ? "default"
                              : quote.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(quote.requested_at), "PPP p")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {quote.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => updateQuoteStatus(quote.id, "approved")}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateQuoteStatus(quote.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {quote.status === "approved" && (
                          <Button size="sm" onClick={() => updateQuoteStatus(quote.id, "completed")}>
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
