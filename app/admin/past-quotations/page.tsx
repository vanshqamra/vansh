"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type QuotationRow = {
  id: string
  created_at: string
  title: string
  client_name: string
  status: string
  currency: string
  totals_json: { total?: number } | null
  docx_url?: string | null
}

export default function PastQuotationsPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<QuotationRow[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/quotations${q ? `?q=${encodeURIComponent(q)}` : ""}`)
    const json = await res.json()
    setRows(json || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search client/title/status"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-6 gap-2 px-4 py-3 font-medium border-b">
            <div>Date</div>
            <div>Client</div>
            <div>Title</div>
            <div>Status</div>
            <div>Total</div>
            <div>Actions</div>
          </div>

          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-6 gap-2 px-4 py-3 border-b items-center">
              <div>{new Date(row.created_at).toLocaleDateString()}</div>
              <div>{row.client_name}</div>
              <div className="truncate">{row.title}</div>
              <div>{row.status}</div>
              <div>{row.totals_json?.total ?? "-"} {row.currency}</div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push(`/admin/quotations?quoteId=${row.id}`)}
                >
                  Open in Builder
                </Button>
                {row.docx_url ? (
                  <a href={row.docx_url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary">Download DOCX</Button>
                  </a>
                ) : null}
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">No quotations yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
