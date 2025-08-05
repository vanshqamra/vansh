"use server"

export async function signup(prevState: any, formData: FormData) {
  const name = formData.get("name")
  const email = formData.get("email")
  const password = formData.get("password")
  const company = formData.get("company")
  const gst = formData.get("gst")
  const phone = formData.get("phone")
  const address = formData.get("address")

  // Simulate saving or validating the data
  console.log("✅ New registration:", {
    name,
    email,
    password,
    company,
    gst,
    phone,
    address,
  })

  return {
    success: "Thank you! Your registration has been submitted for approval."
  }

  // If needed:
  // return { error: "Something went wrong." }
}
