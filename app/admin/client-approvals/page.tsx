"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/app/context/auth-context"
import AccessDenied from "@/components/access-denied"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"
import { Loader2 } from "lucide-react"

type ProfileRow = {
  id: string
  email?: string | null
  full_name?: string | null
  name?: string | null
  company_name?: string | null
  company?: string | null
  phone?: string | null
  contact_number?: string | null
  role?: string | null
  status?: string | null
  created_at?: string | null
}

export default function ClientApprovalsPage() {
  const { role, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [rows, setRows] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (role !== "admin") return

    let unsub: (() => void) | undefined

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, name, company_name, company, phone, contact_number, role, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
      setRows(data || [])
      setLoading(false)
    }

    const subscribe = () => {
      const channel = supabase
        .channel("profiles-pending")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles" },
          (payload) => {
            const newRow = payload.new as ProfileRow | undefined
            const oldRow = payload.old as ProfileRow | undefined

            // Only react to rows that are pending or became non-pending
            if (payload.eventType === "INSERT" && newRow?.status === "pending") {
              setRows((prev) => {
                // avoid dupes
                if (prev.find((r) => r.id === newRow.id)) return prev
                return [newRow, ...prev]
              })
            }

            if (payload.eventType === "UPDATE") {
              // If status changed away from pending, remove; if still pending, update fields
              if (newRow?.status !== "pending") {
                setRows((prev) => prev.filter((r) => r.id !== newRow.id))
              } else {
                setRows((prev) => prev.map((r) => (r.id === newRow.id ? { ...r, ...newRow } : r)))
              }
            }

            if (payload.eventType === "DELETE" && oldRow?.id) {
              setRows((prev) => prev.filter((r) => r.id !== oldRow.id))
            }
          }
        )
        .subscribe()

      unsub = () => {
        supabase.removeChannel(channel)
      }
    }

    load()
    subscribe()

    return () => {
      if (unsub) unsub()
    }
  }, [authLoading, role, supabase, toast])

  async function approve(id: string) {
    if (busyId) return
    setBusyId(id)
    const prev = rows
    // optimistic remove
    setRows((r) => r.filter((x) => x.id !== id))
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved", role: "client" })
      .eq("id", id)
    if (error) {
      setRows(prev) // rollback
      toast({ title: "Approve failed", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Client approved" })
    }
    setBusyId(null)
  }

  async function reject(id: string) {
    if (busyId) return
    setBusyId(id)
    const prev = rows
    setRows((r) => r.filter((x) => x.id !== id))
    const { error } = await supabase
      .from("profiles")
      .update({ status: "rejected", role: "rejected" })
      .eq("id", id)
    if (error) {
      setRows(prev)
      toast({ title: "Reject failed", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Client rejected" })
    }
    setBusyId(null)
  }

  if (!authLoading && role !== "admin") {
    return <AccessDenied />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Client Approvals (Pending)</h1>
        <Button variant="outline" onClick={() => location.reload()}>
          Refresh
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Newest pending signups. Manage full details in Review.
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Joined</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Loading pending profiles…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm py-8 text-muted-foreground">
                  No pending accounts 🎉
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => {
                const name = p.full_name || p.name || "—"
                const company = p.company_name || p.company || "—"
                const phone = p.phone || p.contact_number || "—"
                const joined = p.created_at ? new Date(p.created_at) : null
                const joinedStr = joined ? joined.toLocaleString() : "—"

                return (
                  <TableRow key={p.id}>
                    <TableCell>{joinedStr}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{p.email || "—"}</TableCell>
                    <TableCell>{company}</TableCell>
                    <TableCell>{phone}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => approve(p.id)} disabled={busyId === p.id}>
                        {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(p.id)} disabled={busyId === p.id}>
                        {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
