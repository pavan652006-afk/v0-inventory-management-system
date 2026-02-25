import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Inventory</h1>
          <p className="text-sm text-gray-600 mt-1">Management System</p>
        </div>

        <nav className="px-4 py-6 space-y-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/products">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Products
            </Button>
          </Link>
          <Link href="/dashboard/sales">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Sales
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Reports
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-4 right-6 space-y-3">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-3">
              {user.email}
            </p>
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
