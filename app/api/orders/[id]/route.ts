// app/api/admin/orders/[id]/route.ts
import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1) Verify the caller is logged in and is an admin
    const supabase = getServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2) Use the service role to read everything safely
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    )

    const { data: order, error: orderErr } = await service
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .single()

    if (orderErr || !order) {
      return NextResponse.json(
        { error: orderErr?.message || "Order not found" },
        { status: 404 }
      )
    }

    const { data: items, error: itemsErr } = await service
      .from("order_items")
      .select("*")
      .eq("order_id", params.id)
      .order("created_at", { ascending: true })

    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    return NextResponse.json({ order, items: items || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
