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
  // new schema (optional)
  company?: string | null
  phone?: string | null
  gstin?: string | null
  status?: string | null
  role?: string | null
  // legacy schema (optional)
  company_name?: string | null
  contact_number?: string | null
  gst_no?: string | null
  created_at?: string | null
  [k: string]: any
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

      // Select all columns to avoid "column does not exist" errors on some deployments
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        // Support both schema styles: status='pending' or role='pending'
        .or("status.eq.pending,role.eq.pending")
        .order("created_at", { ascending: false })

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
        setRows([])
      } else {
        setRows(data || [])
      }
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

            const isPending = (r?: ProfileRow | null) =>
              r?.status === "pending" || r?.role === "pending"

            if (payload.eventType === "INSERT" && isPending(newRow)) {
              setRows((prev) => (prev.find((r) => r.id === newRow!.id) ? prev : [newRow!, ...prev]))
            }

            if (payload.eventType === "UPDATE") {
              if (!isPending(newRow)) {
                // moved out of pending → remove
                setRows((prev) => prev.filter((r) => r.id !== newRow!.id))
              } else {
                // still pending → update in place
                setRows((prev) => prev.map((r) => (r.id === newRow!.id ? { ...r, ...newRow } : r)))
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

    void load()
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

  const fmtIST = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"

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
                const joinedStr = fmtIST(p.created_at)
                const name = p.full_name || p.name || "—"
                const email = p.email || "—"
                const company = p.company ?? p.company_name ?? "—"
                const phone = p.phone ?? p.contact_number ?? "—"

                return (
                  <TableRow key={p.id}>
                    <TableCell>{joinedStr}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{email}</TableCell>
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
