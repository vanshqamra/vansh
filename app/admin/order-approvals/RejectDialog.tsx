"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface Props {
  order: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRejected: () => void
}

export default function RejectDialog({ order, open, onOpenChange, onRejected }: Props) {
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  if (!order) return null

  const reject = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/orders/${order.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    })
    setLoading(false)
    if (res.ok) onRejected()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Order {order.id}</DialogTitle>
        </DialogHeader>
        <Textarea
          className="mb-4"
          placeholder="Reason (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <DialogFooter>
          <Button variant="destructive" onClick={reject} disabled={loading}>
            {loading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
