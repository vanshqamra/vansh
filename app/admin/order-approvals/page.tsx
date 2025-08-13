"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@/app/context/auth-context"
import AccessDenied from "@/components/access-denied"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import ApproveDialog from "./ApproveDialog"
import RejectDialog from "./RejectDialog"
import { useToast } from "@/hooks/use-toast"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function OrderApprovalsPage() {
  const { role, loading } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [approveOrder, setApproveOrder] = useState<any | null>(null)
  const [rejectOrder, setRejectOrder] = useState<any | null>(null)

  useEffect(() => {
    if (role === "admin") load()
  }, [role])

  async function load() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "awaiting_approval")
      .order("created_at", { ascending: false })
    setOrders(data || [])
  }

  if (!loading && role !== "admin") return <AccessDenied />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Order Approvals</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{o.id}</TableCell>
              <TableCell>{o.company_name || o.email}</TableCell>
              <TableCell>₹{Number(o.total).toFixed(2)}</TableCell>
              <TableCell>{Array.isArray(o.items) ? o.items.length : 0}</TableCell>
              <TableCell>{o.status}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" onClick={() => setApproveOrder(o)}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectOrder(o)}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm py-6 text-muted-foreground">
                No orders awaiting approval
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ApproveDialog
        order={approveOrder}
        open={Boolean(approveOrder)}
        onOpenChange={(open) => !open && setApproveOrder(null)}
        onApproved={() => {
          toast({ title: "Order approved" })
          setApproveOrder(null)
          load()
        }}
      />
      <RejectDialog
        order={rejectOrder}
        open={Boolean(rejectOrder)}
        onOpenChange={(open) => !open && setRejectOrder(null)}
        onRejected={() => {
          toast({ title: "Order rejected" })
          setRejectOrder(null)
          load()
        }}
      />
    </div>
  )
}
