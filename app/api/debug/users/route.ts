import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if users table exists and get all users
    const { data: users, error } = await supabase.from("users").select("*")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      users: users || [],
      count: users?.length || 0,
      message: "Users retrieved successfully",
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create admin user
    const { data, error } = await supabase
      .from("users")
      .upsert({
        username: "admin",
        password: "admin2025",
      })
      .select()

    if (error) {
      console.error("Error creating admin user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      user: data,
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

