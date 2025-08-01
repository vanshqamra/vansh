import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const fileName = formData.get("fileName") as string | null
    const description = formData.get("description") as string | null

    if (!file || !fileName) {
      return NextResponse.json({ error: "File and file name are required" }, { status: 400 })
    }

    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase.storage.from("quote-uploads").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Optionally, save metadata about the upload to a database table
    const { error: dbError } = await supabase.from("user_uploads").insert([
      {
        user_id: user.id,
        file_path: data.path,
        file_name: fileName,
        description: description,
        uploaded_at: new Date().toISOString(),
      },
    ])

    if (dbError) {
      console.error("Supabase DB insert error:", dbError)
      // Consider deleting the uploaded file if DB insert fails
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "File uploaded successfully", filePath: data.path })
  } catch (error) {
    console.error("Unexpected error during file upload:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
