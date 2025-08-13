// app/api/me/addresses/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"

export async function GET() {
  const supabase = getServerSupabase()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ addresses: data ?? [] })
}

export async function POST(req: Request) {
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
    .insert({ ...body, user_id: auth.user.id })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ address: data }, { status: 201 })
}
