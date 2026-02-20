"use client"

import { ProductSearch } from "@/components/product-search"
import { ProtectedRoute } from "@/components/protected-route"
import { Package, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: "#16537E" }}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-sans">Sistema de Produtos</h1>
                  <p className="text-sm text-muted-foreground">Busca rápida por SKU e código de barras</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Bem-vindo, {user?.nome || user?.username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <ProductSearch />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
