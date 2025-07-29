import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This is the protected route logic.
    // If the user is not logged in, redirect them to the login page.
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || user.email}</h1>
        <SignOutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glow-on-hover">
          <CardHeader>
            <CardTitle>Browse Products</CardTitle>
            <CardDescription>Explore our full catalog and request new quotes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/products/commercial">Start Browsing</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="glow-on-hover">
          <CardHeader>
            <CardTitle>My Quote Requests</CardTitle>
            <CardDescription>View the status of your past and current quote requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">View History</Button>
          </CardContent>
        </Card>
        <Card className="glow-on-hover">
          <CardHeader>
            <CardTitle>Upload Order List</CardTitle>
            <CardDescription>Quickly request a quote by uploading a CSV or Excel file.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Upload File</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
