import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const term = searchParams.get("q")

        if (!term || !term.trim()) {
            return NextResponse.json({ data: [] })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data, error } = await supabase
            .from("produtos")
            .select("*")
            .or(`sku.ilike.%${term}%,descricao.ilike.%${term}%,codigo_barras.ilike.%${term}%`)
            .order("sku")

        if (error) {
            console.error("Search error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data: data || [] })
    } catch (error) {
        console.error("Search API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
