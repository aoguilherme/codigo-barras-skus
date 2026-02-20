import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("=== LOGIN ATTEMPT ===")
    console.log("Username:", username)

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Query the users table
    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    console.log("Query result:", users)
    console.log("Query error:", queryError)

    if (queryError || !users) {
      console.log("=== LOGIN FAILED - No user found ===")
      console.log("Error details:", queryError)
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    console.log("User found:", users)

    const userData = {
      id: users.id,
      username: users.username,
      nome: users.nome,
      loginTime: Date.now(),
    }

    // Create response with success
    const response = NextResponse.json({
      success: true,
      user: { id: users.id, username: users.username, nome: users.nome },
    })

    response.cookies.set("auth-token", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("=== LOGIN SUCCESSFUL ===")
    return response
  } catch (error) {
    console.error("=== LOGIN ERROR ===", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
