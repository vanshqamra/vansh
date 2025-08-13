"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Props {
  order: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApproved: () => void
}

export default function ApproveDialog({ order, open, onOpenChange, onApproved }: Props) {
  const [loading, setLoading] = useState(false)
  if (!order) return null

  const items = Array.isArray(order.items) ? order.items : []

  const approve = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/orders/${order.id}/approve`, { method: "POST" })
    setLoading(false)
    if (res.ok) onApproved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Approve Order {order.id}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {items.length > 0 && (
            <Table className="mb-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.qty}</TableCell>
                    <TableCell>₹{Number(it.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="font-medium text-right">Total: ₹{Number(order.total).toFixed(2)}</div>
        </div>
        <DialogFooter>
          <Button onClick={approve} disabled={loading}>
            {loading ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
