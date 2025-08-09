import { NextResponse } from "next/server"
import { supabaseServer } from "@/supabase/server-client"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()

  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const filtered = q
    ? (data || []).filter((r) =>
        r.client_name?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q)
      )
    : data

  return NextResponse.json(filtered || [])
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title, clientName, clientEmail, status = "DRAFT",
      currency = "INR", totalsJson, dataJson, docxUrl, tags = []
    } = body

    if (!clientName || !totalsJson || !dataJson) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // TODO: replace with your own auth method to get user id on the server
    const createdBy = body.createdBy || "00000000-0000-0000-0000-000000000000"

    const supabase = supabaseServer()
    const { data, error } = await supabase.from("quotations").insert([
      {
        created_by: createdBy,
        title: title || `${clientName} - ${new Date().toLocaleDateString()}`,
        client_name: clientName,
        client_email: clientEmail || null,
        status,
        currency,
        totals_json: totalsJson,
        data_json: dataJson,
        docx_url: docxUrl || null,
        tags,
      },
    ]).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
