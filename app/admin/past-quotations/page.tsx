"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"

type QuotationRow = {
  id: string
  created_at: string
  title?: string | null
  client_name: string | null
  client_email: string | null
  status: string | null
  currency: string | null
  totals_json: { total?: number } | null
  docx_url?: string | null
}

export default function PastQuotationsPage() {
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<QuotationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string>("")
  const [raw, setRaw] = useState<any>(null)
  const router = useRouter()

  async function load() {
    setLoading(true)
    setStatusMsg("Loading…")
    try {
      const res = await fetch(`/api/quotations${q ? `?q=${encodeURIComponent(q)}` : ""}`, {
        cache: "no-store",
      })
      const json = await res.json()
      setRaw(json)
      if (!res.ok) {
        setStatusMsg(`API error: ${json?.error || res.status}`)
        setRows([])
      } else {
        const list = Array.isArray(json) ? json : []
        setStatusMsg(`Found ${list.length} quotation${list.length === 1 ? "" : "s"}`)
        setRows(list)
      }
    } catch (e: any) {
      setStatusMsg(`Network error: ${e?.message || e}`)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createTestQuotation() {
    setStatusMsg("Creating test quotation…")
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Test Quote ${new Date().toLocaleString()}`,
          clientName: "Test Client",
          clientEmail: "buyer@test.com",
          status: "DRAFT",
          currency: "INR",
          totalsJson: { subtotal: 100, gstTotal: 18, transport: 0, total: 118 },
          dataJson: {
            items: [
              { productCode: "TST-001", productName: "Test Product", brand: "Demo", packSize: "1 pc", quantity: 1, price: 100, discount: 0, gst: 18, hsnCode: "0000" },
            ],
            transport: 0,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setStatusMsg(`Create failed: ${json?.error || res.status}`)
      } else {
        setStatusMsg("Created test quotation ✓")
        await load()
      }
    } catch (e: any) {
      setStatusMsg(`Create failed (network): ${e?.message || e}`)
    }
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search client/email/status"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <Button onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Search"}
          </Button>
          <Button variant="secondary" onClick={createTestQuotation}>
            Create test quotation
          </Button>
          <span className="text-sm text-muted-foreground">{statusMsg}</span>
        </div>

        {raw && (
          <details className="text-xs text-muted-foreground">
            <summary>Show raw API response</summary>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(raw, null, 2)}</pre>
          </details>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-6 gap-2 px-4 py-3 font-medium border-b">
              <div>Date</div>
              <div>Client</div>
              <div>Email</div>
              <div>Status</div>
              <div>Total</div>
              <div>Actions</div>
            </div>

            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-6 gap-2 px-4 py-3 border-b items-center">
                <div>{row.created_at ? new Date(row.created_at).toLocaleDateString() : ""}</div>
                <div>{row.client_name || ""}</div>
                <div className="truncate">{row.client_email || ""}</div>
                <div>{row.status || ""}</div>
                <div>{row.totals_json?.total ?? ""} {row.currency || ""}</div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => router.push(`/admin/quotation?quoteId=${row.id}`)}>
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
    </>
  )
}
