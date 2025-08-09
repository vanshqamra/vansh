import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin" // server-only client

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(data)
}
