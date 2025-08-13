"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@/app/context/auth-context"
import AccessDenied from "@/components/access-denied"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function ClientApprovalsPage() {
  const { role, loading } = useAuth()
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    if (role === "admin") load()
  }, [role])

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
    setProfiles(data || [])
  }

  async function approve(id: string) {
    await supabase
      .from("profiles")
      .update({ status: "approved", role: "client" })
      .eq("id", id)
    toast({ title: "Client approved" })
    load()
  }

  async function reject(id: string) {
    await supabase
      .from("profiles")
      .update({ status: "rejected", role: "rejected" })
      .eq("id", id)
    toast({ title: "Client rejected" })
    load()
  }

  if (!loading && role !== "admin") return <AccessDenied />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Client Approvals</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.full_name || "—"}</TableCell>
              <TableCell>{p.email}</TableCell>
              <TableCell>{p.company_name || p.company || "—"}</TableCell>
              <TableCell>{p.phone || p.contact_number || "—"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" onClick={() => approve(p.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => reject(p.id)}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {profiles.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm py-6 text-muted-foreground">
                No pending profiles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
