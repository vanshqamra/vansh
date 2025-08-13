// app/api/me/orders/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"

export async function GET() {
  const supabase = getServerSupabase()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Let RLS restrict to this user; just filter by user_id for speed.
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, status, grand_total, checkout_snapshot, company_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ uid: user.id, orders: data ?? [] })
}
