'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, User } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Premium Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 shadow-2xl flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Stärke</h1>
              <p className="text-xs text-slate-400">Inventory</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-800">
          <Link href="/dashboard/profile">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          <Link href="/dashboard" className="block">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/products" className="block">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <Package className="w-4 h-4 mr-3" />
              Products
            </Button>
          </Link>
          <Link href="/dashboard/sales" className="block">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <ShoppingCart className="w-4 h-4 mr-3" />
              Sales
            </Button>
          </Link>
          <Link href="/dashboard/reports" className="block">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Reports
            </Button>
          </Link>
          <Link href="/dashboard/profile" className="block">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <User className="w-4 h-4 mr-3" />
              Profile
            </Button>
          </Link>
        </nav>

        {/* Sign Out Section */}
        <div className="p-4 border-t border-slate-800">
          <form action={signOut} className="w-full">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-slate-950 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
