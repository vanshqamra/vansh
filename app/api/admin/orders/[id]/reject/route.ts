import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { sendOrderRejectedEmail } from "@/lib/mail"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const server = getServerSupabase()
  const admin = getSupabaseAdmin()
  if (!server || !admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const {
    data: { user },
    error: userErr,
  } = await server.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await server
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const note: string | null = body?.note || null

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("email")
    .eq("id", params.id)
    .single()
  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message || "Order not found" }, { status: 404 })
  }

  const { error: updErr } = await admin
    .from("orders")
    .update({
      status: "rejected",
      approval_note: note,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq("id", params.id)
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  await sendOrderRejectedEmail(order.email, params.id, note || undefined)
  return NextResponse.json({ status: "rejected" })
}
