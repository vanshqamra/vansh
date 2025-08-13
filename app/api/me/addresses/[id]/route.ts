// app/api/me/addresses/[id]/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (body.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", auth.user.id)
  }

  const { data, error } = await supabase
    .from("addresses")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("user_id", auth.user.id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ address: data })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", params.id)
    .eq("user_id", auth.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
