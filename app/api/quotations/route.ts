// app/api/quotations/route.ts
export const dynamic = "force-dynamic";      // ← never prerender
export const revalidate = 0;                 // ← never cache

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

function assertEnv() {
  const missing: string[] = []
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY")
  return missing
}

export async function GET(req: Request) {
  const missing = assertEnv()
  if (missing.length) {
    return NextResponse.json({ error: `Missing env vars: ${missing.join(", ")}` }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()

  try {
    const supabase = supabaseAdmin()
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const filtered = q
      ? (data || []).filter(r =>
          (r.client_name || "").toLowerCase().includes(q) ||
          (r.title || "").toLowerCase().includes(q) ||
          (r.status || "").toLowerCase().includes(q)
        )
      : data

    return NextResponse.json(filtered || [])
  } catch (e: any) {
    console.error("GET /api/quotations error:", e)
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const missing = assertEnv()
  if (missing.length) {
    return NextResponse.json({ error: `Missing env vars: ${missing.join(", ")}` }, { status: 500 })
  }

  try {
    const body = await req.json()
    const {
      title, clientName, clientEmail, status = "DRAFT", currency = "INR",
      totalsJson, dataJson, docxUrl, tags = []
    } = body

    if (!clientName || !totalsJson || !dataJson) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    const { data, error } = await supabase
      .from("quotations")
      .insert([{
        title: title || `${clientName} - ${new Date().toLocaleDateString()}`,
        client_name: clientName,
        client_email: clientEmail || null,
        status,
        currency,
        totals_json: totalsJson,
        data_json: dataJson,
        docx_url: docxUrl || null,
        tags,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    console.error("POST /api/quotations error:", e)
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
