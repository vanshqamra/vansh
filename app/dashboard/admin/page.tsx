import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { revalidatePath } from "next/cache"

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Get admin profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: vendors } = await supabase
    .from("profiles")
    .select("id, full_name, email, company_name, gst_no, contact_number, address, approved")
    .order("created_at", { ascending: false })

  async function approveVendor(formData: FormData) {
    "use server"
    const supabase = createClient()
    const vendorId = formData.get("vendorId") as string
    const status = formData.get("status") === "true"

    await supabase.from("profiles").update({ approved: status }).eq("id", vendorId)
    revalidatePath("/dashboard/admin")
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Vendor Approvals</h1>
      <div className="grid gap-6">
        {vendors?.map((vendor) => (
          <Card key={vendor.id}>
            <CardHeader>
              <CardTitle>
                {vendor.company_name} ({vendor.full_name})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Email:</strong> {vendor.email}
              </p>
              <p>
                <strong>GST:</strong> {vendor.gst_no}
              </p>
              <p>
                <strong>Phone:</strong> {vendor.contact_number}
              </p>
              <p>
                <strong>Address:</strong> {vendor.address}
              </p>
              <div className="mt-4 flex gap-2">
                {!vendor.approved ? (
                  <form action={approveVendor}>
                    <input type="hidden" name="vendorId" value={vendor.id} />
                    <input type="hidden" name="status" value="true" />
                    <Button type="submit">Approve</Button>
                  </form>
                ) : (
                  <form action={approveVendor}>
                    <input type="hidden" name="vendorId" value={vendor.id} />
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
