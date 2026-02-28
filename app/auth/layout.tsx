export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Inventory Manager</h1>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
