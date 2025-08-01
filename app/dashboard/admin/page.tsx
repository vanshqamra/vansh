"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, DollarSign, FileText, User, Users, BarChart2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Import useToast hook
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  role: "user" | "admin" | "vendor"
}

interface QuoteItem {
  product_name: string
  quantity: number
  price_at_request: number
  pack_size?: string
  brand?: string
  cas_number?: string
  category?: string
}

interface Quote {
  id: string
  created_at: string
  customer_notes: string | null
  total_amount: number | null
  status: string
  user_id: string
  users: {
    email: string
  } | null
  quote_items: QuoteItem[]
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast() // Declare useToast hook

  useEffect(() => {
    fetchUsersAndQuotes()
  }, [])

  const fetchUsersAndQuotes = async () => {
    setLoading(true)
    const { data: usersData, error: usersError } = await supabase.from("profiles").select("id, email, role")
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if the user is an admin (e.g., based on a role in public.users table or a specific user ID)
    // For simplicity, let's assume a hardcoded admin email or a 'role' column in 'profiles' table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user?.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      console.error("Access Denied: User is not an admin")
      setLoading(false)
      return
    }

    const { data: quotesData, error: quotesError } = await supabase
      .from("quotes")
      .select(`
        id,
        created_at,
        customer_notes,
        total_amount,
        status,
        user_id,
        users (
          email
        ),
        quote_items (
          product_name,
          quantity,
          price_at_request,
          pack_size,
          brand,
          cas_number,
          category
        )
      `)
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("Error fetching users:", usersError)
      toast({
        title: "Error",
        description: "Failed to fetch user data.",
        variant: "destructive",
      })
    } else {
      setUsers(usersData as UserProfile[])
    }

    if (quotesError) {
      console.error("Error fetching all quotes for admin:", quotesError)
      toast({
        title: "Error",
        description: "Failed to load quotes. Please try again later.",
        variant: "destructive",
      })
    } else {
      setQuotes(quotesData as Quote[])
    }

    setLoading(false)
  }

  const updateUserRole = async (userId: string, newRole: UserProfile["role"]) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: `Failed to update role for user ${userId}.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `User role updated to ${newRole}.`,
        variant: "default",
      })
      fetchUsersAndQuotes() // Re-fetch users and quotes to update the UI
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading Users and Quotes...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we fetch user and quote data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">No Quote Requests</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">There are no pending quote requests at the moment.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Welcome, Admin! Here you can manage users, products, orders, and more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Users className="h-12 w-12 text-blue-600 mb-4" />
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View and manage all registered users.</p>
            <Button asChild>
              <Link href="/admin/users">Go to Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Package className="h-12 w-12 text-green-600 mb-4" />
          <CardHeader>
            <CardTitle>Manage Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Add, edit, or remove products from the catalog.</p>
            <Button asChild>
              <Link href="/admin/products">Go to Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-12 w-12 text-purple-600 mb-4" />
          <CardHeader>
            <CardTitle>Review Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Review and process user-uploaded quote requests.</p>
            <Button asChild>
              <Link href="/admin/uploads">Go to Uploads</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <BarChart2 className="h-12 w-12 text-red-600 mb-4" />
          <CardHeader>
            <CardTitle>View Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Access sales reports and analytics.</p>
            <Button asChild>
              <Link href="/admin/reports">Go to Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {/* Select component is not imported, need to import it */}
                    <div className="px-3 py-1 text-sm bg-gray-500 text-white">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <h1 className="text-4xl font-bold text-center mb-8 mt-12">Admin Dashboard - All Quotes</h1>

      <div className="space-y-8">
        {quotes.map((quote: Quote) => (
          <Card key={quote.id} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Quote #{quote.id.substring(0, 8)}</CardTitle>
              <Badge
                className={`px-3 py-1 text-sm ${
                  quote.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : quote.status === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                }`}
              >
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Date: {format(new Date(quote.created_at), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>
                    Customer: {quote.users?.email || "N/A"} (ID: {quote.user_id.substring(0, 8)}...)
                  </span>
                </div>
                {quote.total_amount && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>Estimated Total: ₹{quote.total_amount.toLocaleString()}</span>
                  </div>
                )}
                {quote.customer_notes && (
                  <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                    <FileText className="h-4 w-4 text-primary mt-1" />
                    <span>Notes: {quote.customer_notes}</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Package className="h-5 w-5" />
                Quoted Items
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Pack Size</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>CAS Number</TableHead>
                    <TableHead className="text-right">Price at Request</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.quote_items.map((item, itemIndex) => (
                    <TableRow key={itemIndex}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.pack_size || "N/A"}</TableCell>
                      <TableCell>{item.brand || "N/A"}</TableCell>
                      <TableCell>{item.cas_number || "N/A"}</TableCell>
                      <TableCell className="text-right">₹{item.price_at_request?.toLocaleString() || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Add actions for admin, e.g., update status, contact customer */}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Update Status</Button>
                <Button>Contact Customer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
