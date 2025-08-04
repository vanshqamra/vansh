"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const data = {
    email: email as string,
    password: password as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: "Could not authenticate user. Please check your credentials." }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email")
  const password = formData.get("password")
  const name = formData.get("name")
  const company = formData.get("company")
  const gst = formData.get("gst")
  const phone = formData.get("phone")
  const address = formData.get("address")

  if (!email || !password || !name || !company || !gst || !phone || !address) {
    return { error: "All fields are required." }
  }

  const data = {
    email: email as string,
    password: password as string,
    options: {
      data: {
        full_name: name as string,
        company_name: company as string,
        gst_no: gst as string,
        contact_number: phone as string,
        address: address as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Sign up error:", error)
    return { error: "Could not authenticate user. An account with this email may already exist." }
  }

  return { success: "Please check your email to confirm your account." }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
