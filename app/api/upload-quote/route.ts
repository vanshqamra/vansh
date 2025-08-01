import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" // Assuming a server-side Supabase client

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { items } = await request.json()

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items provided for quote" }, { status: 400 })
  }

  try {
    // Insert the quote request into a 'quotes' table
    const { data, error } = await supabase.from("quotes").insert([
      {
        user_id: user.id,
        items: items, // Store items as JSONB
        status: "pending", // Initial status
        requested_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error inserting quote:", error)
      return NextResponse.json({ error: "Failed to submit quote" }, { status: 500 })
    }

    return NextResponse.json({ message: "Quote submitted successfully", data }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error submitting quote:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
