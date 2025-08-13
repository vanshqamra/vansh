// app/api/me/addresses/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { z } from "zod"

const MAX_ADDRESSES_PER_USER = 20

// Accept both camelCase and snake_case payloads from clients
function pick<T = string>(obj: any, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k] as T
  }
  return undefined
}

const AddressCreateSchema = z.object({
  label: z.string().trim().max(80).optional(),
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  gst: z.string().trim().optional().nullable(),
  phone: z.string().trim().min(5, "Phone is required"),
  line1: z.string().trim().min(1, "Address line is required"),
  line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z.string().trim().min(3, "PIN code is required"),
  country: z.string().trim().default("India").optional(),
  notes: z.string().trim().optional().nullable(),
  is_default: z.boolean().optional(),
})

function coerceAddressBody(body: any) {
  const first_name = pick(body, "first_name", "firstName")
  const last_name = pick(body, "last_name", "lastName")
  const company = pick(body, "company")
  const gst = pick(body, "gst")
  const phone = pick(body, "phone")
  const line1 = pick(body, "line1", "address")
  const line2 = pick(body, "line2", "address2")
  const city = pick(body, "city")
  const state = pick(body, "state")
  const pincode = pick(body, "pincode", "pinCode", "postalCode", "zip")
  const country = pick(body, "country") ?? "India"
  const notes = pick(body, "notes")
  const label = pick(body, "label")
  const is_default = Boolean(pick(body, "is_default", "isDefault"))

  return {
    label,
    first_name,
    last_name: last_name ?? null,
    company: company ?? null,
    gst: gst ?? null,
    phone,
    line1,
    line2: line2 ?? null,
    city,
    state,
    pincode,
    country,
    notes: notes ?? null,
    is_default,
  }
}

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

  const raw = await req.json().catch(() => null)
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Map camelCase/snake_case to a consistent shape
  const candidate = coerceAddressBody(raw)

  // Validate
  const parsed = AddressCreateSchema.safeParse(candidate)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const payload = parsed.data

  // Optional: enforce a per-user limit
  const countResp = await supabase
    .from("addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
  const currentCount = countResp.count ?? 0
  if (currentCount >= MAX_ADDRESSES_PER_USER) {
    return NextResponse.json(
      { error: `Address limit reached (${MAX_ADDRESSES_PER_USER}). Delete one before adding another.` },
      { status: 409 }
    )
  }

  // Optional: prevent near-duplicates (same line1 + city + pincode)
  const { data: dup } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("line1", payload.line1)
    .eq("city", payload.city)
    .eq("pincode", payload.pincode)
    .limit(1)
  if (dup && dup.length > 0) {
    return NextResponse.json(
      { error: "A similar address already exists (same address/city/PIN)." },
      { status: 409 }
    )
  }

  // If this is the new default, unset prior defaults for this user
  if (payload.is_default === true) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", auth.user.id)
  }

  // Auto-label if missing
  const label =
    payload.label ||
    (payload.company
      ? `${payload.company}${payload.city ? ` (${payload.city})` : ""}`
      : [payload.first_name, payload.last_name].filter(Boolean).join(" ")) ||
    "Address"

  const insertBody = {
    ...payload,
    label,
    user_id: auth.user.id,
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert(insertBody)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ address: data }, { status: 201 })
}
