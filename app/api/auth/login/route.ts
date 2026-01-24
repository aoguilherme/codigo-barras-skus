import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Create Supabase client directly with env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Query user from database - use maybeSingle to avoid error when no rows found
    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle()

    if (queryError) {
      console.error("[v0] Database query error:", queryError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const userData = {
      id: user.id,
      username: user.username,
      nome: user.nome, // Include nome field
      loginTime: Date.now(),
    }

    // Create response with success
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, nome: user.nome }, // Include nome in response
    })

    response.cookies.set("auth-token", JSON.stringify(userData), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("=== LOGIN ERROR ===", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
