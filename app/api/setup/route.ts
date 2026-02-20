import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if admin user already exists
    const { data: existingUser } = await supabase.from("users").select("username").eq("username", "admin").single()

    if (existingUser) {
      return NextResponse.json({ message: "Admin user already exists" })
    }

    // Create admin user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: "admin",
          password: "admin2025",
        },
      ])
      .select()

    if (error) {
      console.error("Error creating admin user:", error)
      return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      credentials: {
        username: "admin",
        password: "admin2025",
      },
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

