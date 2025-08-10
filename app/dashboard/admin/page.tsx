export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getServerSupabase } from "@/lib/supabase/server-client"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { revalidatePath } from "next/cache"

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Get admin profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, email, company_name, gst_no, contact_number, address, approved")
    .order("created_at", { ascending: false })

  async function approveClient(formData: FormData) {
    "use server"
    const supabase = getServerSupabase()
      if (!supabase) {
        // during build/prerender with missing env, render a minimal shell
        return <div />
      }
    
    const clientId = formData.get("clientId") as string
    const status = formData.get("status") === "true"

    await supabase.from("profiles").update({ approved: status }).eq("id", clientId)
    revalidatePath("/dashboard/admin")
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Client Approvals</h1>
      <div className="grid gap-6">
        {clients?.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle>
                {client.company_name} ({client.full_name})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Email:</strong> {client.email}
              </p>
              <p>
                <strong>GST:</strong> {client.gst_no}
              </p>
              <p>
                <strong>Phone:</strong> {client.contact_number}
              </p>
              <p>
                <strong>Address:</strong> {client.address}
              </p>
              <div className="mt-4 flex gap-2">
                {!client.approved ? (
                  <form action={approveClient}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <input type="hidden" name="status" value="true" />
                    <Button type="submit">Approve</Button>
                  </form>
                ) : (
                  <form action={approveClient}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <input type="hidden" name="status" value="false" />
                    <Button type="submit" variant="destructive">
                      Revoke
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
